import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface HealthCheckResult {
  configured: boolean;
  connected: boolean;
  authenticated: boolean;
  rlsWorking: boolean;
  details: string[];
  errors: string[];
}

export const runSupabaseHealthCheck = async (): Promise<HealthCheckResult> => {
  const result: HealthCheckResult = {
    configured: false,
    connected: false,
    authenticated: false,
    rlsWorking: false,
    details: [],
    errors: []
  };

  try {
    // Check 1: Configuration
    result.configured = isSupabaseConfigured;
    if (result.configured) {
      result.details.push('✅ Supabase credentials configured');
    } else {
      result.errors.push('❌ Supabase not configured');
      return result;
    }

    // Check 2: Basic Connection
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        if (error.message.includes('JWT') || error.message.includes('auth')) {
          result.connected = true;
          result.rlsWorking = true;
          result.details.push('✅ Connection successful');
          result.details.push('✅ RLS security active (requires authentication)');
        } else {
          result.errors.push(`❌ Connection error: ${error.message}`);
        }
      } else {
        result.connected = true;
        result.details.push('✅ Connection successful');
        if (data?.length === 0) {
          result.details.push('⚠️ Empty profiles table (new database)');
        }
      }
    } catch (e: any) {
      result.errors.push(`❌ Connection failed: ${e.message}`);
    }

    // Check 3: Authentication Status
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        result.errors.push(`��� Auth check failed: ${error.message}`);
      } else if (session?.user) {
        result.authenticated = true;
        result.details.push(`✅ User authenticated: ${session.user.email}`);
        
        // Check 4: Authenticated Data Access
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, name')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            result.errors.push(`❌ Profile access error: ${profileError.message}`);
          } else if (profileData) {
            result.details.push(`✅ Profile data accessible: ${profileData.name}`);
          }
        } catch (e: any) {
          result.errors.push(`❌ Profile check failed: ${e.message}`);
        }
      } else {
        result.details.push('ℹ️ No active session (user not logged in)');
      }
    } catch (e: any) {
      result.errors.push(`❌ Auth status check failed: ${e.message}`);
    }

    // Check 5: Database Write Test (if authenticated)
    if (result.authenticated) {
      try {
        const testTime = new Date().toISOString();
        const { error: writeError } = await supabase
          .from('user_stats')
          .upsert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            last_activity: testTime,
            updated_at: testTime
          }, {
            onConflict: 'user_id'
          });
          
        if (writeError) {
          result.errors.push(`❌ Write test failed: ${writeError.message}`);
        } else {
          result.details.push('✅ Database write test successful');
        }
      } catch (e: any) {
        result.errors.push(`❌ Write test error: ${e.message}`);
      }
    }

  } catch (e: any) {
    result.errors.push(`❌ Health check failed: ${e.message}`);
  }

  return result;
};

export const formatHealthCheckResults = (result: HealthCheckResult): string => {
  const lines: string[] = [];
  
  lines.push('🔧 Supabase Health Check Report');
  lines.push('================================');
  lines.push(`Configuration: ${result.configured ? '✅ Ready' : '❌ Not Configured'}`);
  lines.push(`Connection: ${result.connected ? '✅ Active' : '❌ Failed'}`);
  lines.push(`Authentication: ${result.authenticated ? '✅ Logged In' : 'ℹ️ Not Logged In'}`);
  lines.push(`Security (RLS): ${result.rlsWorking ? '✅ Active' : '❌ Not Working'}`);
  lines.push('');
  
  if (result.details.length > 0) {
    lines.push('📋 Details:');
    result.details.forEach(detail => lines.push(`  ${detail}`));
    lines.push('');
  }
  
  if (result.errors.length > 0) {
    lines.push('⚠️ Issues:');
    result.errors.forEach(error => lines.push(`  ${error}`));
    lines.push('');
  }
  
  const overall = result.configured && result.connected ? 
    (result.errors.length === 0 ? '🎉 DEPLOYMENT READY' : '⚠️ NEEDS ATTENTION') : 
    '❌ NOT READY';
    
  lines.push(`Overall Status: ${overall}`);
  
  return lines.join('\n');
};

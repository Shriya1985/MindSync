import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface HealthCheckResult {
  configured: boolean;
  connected: boolean;
  authenticated: boolean;
  rlsWorking: boolean;
  details: string[];
  errors: string[];
}

// Helper function to add timeout to promises
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

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
    // Check 1: Configuration (immediate)
    result.configured = isSupabaseConfigured;
    if (result.configured) {
      result.details.push('✅ Supabase credentials configured');
    } else {
      result.errors.push('❌ Supabase not configured');
      return result;
    }

    // Check 2: Basic Connection (with 3 second timeout)
    try {
      console.log('🔍 Testing basic connection...');
      const connectionTest = supabase
        .from('profiles')
        .select('id')
        .limit(1);

      const { data, error } = await withTimeout(connectionTest, 3000);

      if (error) {
        console.log('Connection error:', error.message);
        if (error.message.includes('JWT') || error.message.includes('auth') || error.message.includes('RLS')) {
          result.connected = true;
          result.rlsWorking = true;
          result.details.push('✅ Connection successful');
          result.details.push('✅ RLS security active (requires authentication)');
        } else {
          result.connected = false;
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
      console.error('Connection test failed:', e);
      if (e.message.includes('timed out')) {
        result.errors.push(`❌ Connection timeout: Database unreachable`);
      } else {
        result.errors.push(`❌ Connection failed: ${e.message}`);
      }
    }

    // Check 3: Authentication Status (with 2 second timeout)
    try {
      console.log('🔐 Testing authentication...');
      const authTest = supabase.auth.getSession();
      const { data: { session }, error } = await withTimeout(authTest, 2000);

      if (error) {
        result.errors.push(`❌ Auth check failed: ${error.message}`);
      } else if (session?.user) {
        result.authenticated = true;
        result.details.push(`✅ User authenticated: ${session.user.email}`);

        // Check 4: Authenticated Data Access (with timeout)
        try {
          console.log('👤 Testing profile access...');
          const profileTest = supabase
            .from('profiles')
            .select('id, name')
            .eq('id', session.user.id)
            .single();

          const { data: profileData, error: profileError } = await withTimeout(profileTest, 2000);

          if (profileError) {
            if (profileError.message.includes('PGRST116')) {
              result.details.push('ℹ️ Profile not found (new user)');
            } else {
              result.errors.push(`❌ Profile access error: ${profileError.message}`);
            }
          } else if (profileData) {
            result.details.push(`✅ Profile data accessible: ${profileData.name}`);
          }
        } catch (e: any) {
          if (e.message.includes('timed out')) {
            result.errors.push(`❌ Profile check timeout`);
          } else {
            result.errors.push(`❌ Profile check failed: ${e.message}`);
          }
        }
      } else {
        result.details.push('ℹ️ No active session (user not logged in)');
      }
    } catch (e: any) {
      if (e.message.includes('timed out')) {
        result.errors.push(`❌ Auth check timeout`);
      } else {
        result.errors.push(`❌ Auth status check failed: ${e.message}`);
      }
    }

    // Check 5: Database Write Test (if authenticated, with timeout)
    if (result.authenticated) {
      try {
        console.log('💾 Testing database write...');
        const testTime = new Date().toISOString();
        const userResponse = await withTimeout(supabase.auth.getUser(), 1000);

        const writeTest = supabase
          .from('user_stats')
          .upsert({
            user_id: userResponse.data.user?.id,
            last_activity: testTime,
            updated_at: testTime
          }, {
            onConflict: 'user_id'
          });

        const { error: writeError } = await withTimeout(writeTest, 3000);

        if (writeError) {
          result.errors.push(`❌ Write test failed: ${writeError.message}`);
        } else {
          result.details.push('✅ Database write test successful');
        }
      } catch (e: any) {
        if (e.message.includes('timed out')) {
          result.errors.push(`❌ Write test timeout`);
        } else {
          result.errors.push(`❌ Write test error: ${e.message}`);
        }
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
  lines.push(`Authentication: ${result.authenticated ? '✅ Logged In' : '���️ Not Logged In'}`);
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

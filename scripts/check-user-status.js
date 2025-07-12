// Quick check for user authentication status
// Run this in browser console to debug

console.log("🔍 Checking authentication status...");

// Check if Supabase is configured
const isConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

console.log("Supabase configured:", isConfigured);

if (isConfigured) {
  // Import and check session
  import("@supabase/supabase-js").then(({ createClient }) => {
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    );

    supabase.auth.getSession().then(({ data, error }) => {
      console.log("Current session:", data.session);
      console.log("Session error:", error);

      if (data.session?.user) {
        console.log("User confirmed:", data.session.user.email_confirmed_at);
        console.log("User details:", data.session.user);
      }
    });
  });
}

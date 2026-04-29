// Centralized environment access. Throws clear errors at startup if misconfigured.

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.local.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export const env = {
  supabaseUrl: required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ),
  supabaseAnonKey: required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
  supabaseServiceRoleKey: required(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  ),
  supabaseBucket: process.env.SUPABASE_STORAGE_BUCKET || "items",
  appPasscode: required("APP_PASSCODE", process.env.APP_PASSCODE),
  sessionSecret: required("SESSION_SECRET", process.env.SESSION_SECRET),
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Stash",
};

// Public env safe to import in client components.
export const publicEnv = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Stash",
};

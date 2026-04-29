// Centralized environment access. Lazy: a missing variable does NOT crash
// the build; it only throws when a request actually tries to use it.

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(
      `Missing environment variable ${name}. ` +
        `Locally: copy .env.local.example to .env.local and fill it in. ` +
        `On Vercel: Project Settings -> Environment Variables.`,
    );
  }
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.length > 0 ? value : fallback;
}

export const env = {
  get supabaseUrl()             { return required("NEXT_PUBLIC_SUPABASE_URL"); },
  get supabaseAnonKey()         { return required("NEXT_PUBLIC_SUPABASE_ANON_KEY"); },
  get supabaseServiceRoleKey()  { return required("SUPABASE_SERVICE_ROLE_KEY"); },
  get supabaseBucket()          { return optional("SUPABASE_STORAGE_BUCKET", "items"); },
  get appPasscode()             { return required("APP_PASSCODE"); },
  get sessionSecret()           { return required("SESSION_SECRET"); },
  get appName()                 { return optional("NEXT_PUBLIC_APP_NAME", "Stash"); },
};

export const publicEnv = {
  get appName() { return optional("NEXT_PUBLIC_APP_NAME", "Stash"); },
};

import { createClient } from "@supabase/supabase-js";

type AdminClient = ReturnType<typeof buildClient>;

const buildClient = (url: string, key: string) =>
  createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "concerts" },
  });

let cached: AdminClient | null = null;

export const getSupabaseAdminClient = (): AdminClient => {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment"
    );
  }

  cached = buildClient(url, key);
  return cached;
};

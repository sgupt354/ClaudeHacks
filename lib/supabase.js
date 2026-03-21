import { createClient } from "@insforge/sdk";

const insforgeBaseUrl =
  process.env.NEXT_PUBLIC_INSFORGE_BASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;
const insforgeAnonKey =
  process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const insforge = createClient({
  baseUrl: insforgeBaseUrl,
  anonKey: insforgeAnonKey,
});

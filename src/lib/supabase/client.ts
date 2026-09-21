/**
 * @deprecated Do not use in the browser. All data and auth go through `/api/v1/*`
 * with the server Supabase client (anon + user JWT / RLS). Kept only so accidental
 * imports fail the "no front Supabase" convention at review time.
 */
export function createClient(): null {
  return null;
}

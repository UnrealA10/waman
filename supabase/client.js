import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.okfqijmdovoihmglbjbs.supabase.co;
const supabaseAnonKey = import.meta.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
  .eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZnFpam1kb3ZvaWhtZ2xiamJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NzA5MzgsImV4cCI6MjA2NzQ0NjkzOH0
  .pP0QNrANYogdBBztoOrlcHLf6go79w6EQfZVhTn4rGs;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

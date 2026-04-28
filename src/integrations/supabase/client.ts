import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

if (!isSupabaseConfigured) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL и/или VITE_SUPABASE_PUBLISHABLE_KEY не заданы. " +
      "Публичная часть сайта будет работать, но админка (вход / запросы) недоступна."
  );
}

// Если переменных нет — создаём клиента с плейсхолдерами, чтобы импорт модуля не падал и не ронял весь сайт.
// Реальные auth-/db-запросы при отсутствии конфига упадут только в момент вызова, а не на этапе загрузки.
export const supabase = createClient<Database>(
  SUPABASE_URL ?? "https://placeholder.supabase.co",
  SUPABASE_PUBLISHABLE_KEY ?? "placeholder-anon-key",
  {
    auth: {
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
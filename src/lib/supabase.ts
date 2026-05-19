import { createClient } from '@supabase/supabase-js';

// 환경변수에 잘못된 값이 들어있을 수 있으므로 하드코딩된 값을 명시적으로 사용합니다.
const supabaseUrl = 'https://agakwbrzzaraocpenxes.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnYWt3YnJ6emFyYW9jcGVueGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNDI4MDYsImV4cCI6MjA3MzgxODgwNn0.yBHLrbfFw6-_L0YHxyaBXemYpxBYpGG0iYWC6PlJwok';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = true;


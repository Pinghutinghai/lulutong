import { createClient } from '@supabase/supabase-js'

// 在下面引号里，替换成你自己的Supabase项目URL
const supabaseUrl = 'https://dchbwcjshhgvlcyoajxr.supabase.co'
// 在下面引号里，替换成你自己的Supabase anon public key
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjaGJ3Y2pzaGhndmxjeW9hanhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MzYxNTAsImV4cCI6MjA3NTQxMjE1MH0.jVuugNXjQkbZn56lpM3x5qjfdxcan6o_tyPyezFGbRQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 我们的第一个窃听器
console.log('Supabase Client Initializing with URL:', supabaseUrl);
// 为了安全，我们不直接打印Key，只确认它是否存在
console.log('Is Supabase Key Loaded:', !!supabaseAnonKey); 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
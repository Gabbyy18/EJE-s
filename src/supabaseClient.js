import { createClient } from '@supabase/supabase-js'

// Aquí pondrás tus datos reales de Supabase después
const supabaseUrl = 'https://xqycsyipynrfhfxwcbkw.supabase.co'
const supabaseAnonKey = 'sb_publishable_A78EIDJEccI0Qkx-UQR_yQ_tRCQTeSY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
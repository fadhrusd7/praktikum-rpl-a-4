import { createClient } from 
'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://lxjprimpzxzexaowbist.supabase.co'

const supabaseKey = 'sb_publishable_nDNvpujHcYP-4Lt8cBILMg_oHRXIIaH'

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
)
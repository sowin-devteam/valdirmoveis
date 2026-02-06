import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qpcqzadgwndetumeftnz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwY3F6YWRnd25kZXR1bWVmdG56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NTM0MTAsImV4cCI6MjA4MjAyOTQxMH0.Xw-Y8XMqeaMSBFUuefMvtwupz4M65rB0sxG6X4S0VCM'

export const supabase = createClient(supabaseUrl, supabaseKey)

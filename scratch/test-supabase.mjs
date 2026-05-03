import { createClient } from '@supabase/supabase-js'

async function testConnection() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('Testing connection to:', url)
  
  if (!url || !key) {
    console.error('Error: Missing environment variables in .env.local')
    process.exit(1)
  }

  const supabase = createClient(url, key)

  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('Connection failed:', error.message)
    } else {
      console.log('✅ Connection successful!')
      console.log('Total profiles in DB:', data || 0)
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

testConnection()

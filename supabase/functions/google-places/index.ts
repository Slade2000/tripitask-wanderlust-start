
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// Define CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Supabase client initialization function
const getSupabaseClient = (req: Request) => {
  // Get Auth token from request headers
  const authHeader = req.headers.get('Authorization')
  
  if (!authHeader) {
    throw new Error('Missing Authorization header')
  }

  // Instantiate Supabase client with environment variables and auth header
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    }
  )

  return supabase
}

// Handle autocomplete requests
async function handlePlaceAutocomplete(input: string) {
  try {
    // Use the Google Places API with secure API key
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    
    if (!apiKey) {
      throw new Error('Google Maps API key not configured')
    }
    
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=geocode&key=${apiKey}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    return new Response(JSON.stringify({ 
      predictions: data.predictions.map((p: any) => ({
        description: p.description,
        place_id: p.place_id
      }))
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Places Autocomplete error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
}

// Handle geocode requests (for getting address from lat/lng)
async function handleGeocodeRequest(latitude: number, longitude: number) {
  try {
    // Use the Google Maps API with secure API key
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    
    if (!apiKey) {
      throw new Error('Google Maps API key not configured')
    }
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    return new Response(JSON.stringify({ 
      results: data.results,
      status: data.status
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Geocode error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
}

// Main handler for the function
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Validate that request is POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      })
    }

    // Get the request body
    const { action, input, latitude, longitude } = await req.json()
    
    // Initialize Supabase client to validate auth
    const supabase = getSupabaseClient(req)
    
    // Check user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }
    
    // Route to appropriate handler based on action
    if (action === 'autocomplete' && input) {
      return handlePlaceAutocomplete(input)
    } else if (action === 'geocode' && latitude && longitude) {
      return handleGeocodeRequest(latitude, longitude)
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action or missing parameters' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
  } catch (error) {
    console.error('Error in google-places function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

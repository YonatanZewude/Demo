const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type BookingPayload = {
  bookingId: string
}

type BookingRecord = {
  booking_date: string
  customer_email: string
  customer_name: string
  customer_phone: string
  customer_message: string | null
  end_time: string
  start_time: string
  status: string
  services: {
    duration_minutes: number
    name: string
    price: number
  } | null
}

async function sendEmail({
  apiKey,
  from,
  to,
  subject,
  html,
}: {
  apiKey: string
  from: string
  to: string
  subject: string
  html: string
}) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text)
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { bookingId } = (await request.json()) as BookingPayload

    if (!bookingId) {
      return new Response(JSON.stringify({ error: 'bookingId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const adminEmail = Deno.env.get('ADMIN_NOTIFICATION_EMAIL')
    const salonName = Deno.env.get('SALON_NAME') ?? 'Studio Lumi'
    const emailFromName = Deno.env.get('EMAIL_FROM_NAME') ?? salonName
    const emailFromAddress = Deno.env.get('EMAIL_FROM_ADDRESS') ?? 'onboarding@resend.dev'
    const from = `${emailFromName} <${emailFromAddress}>`

    if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !adminEmail) {
      return new Response(JSON.stringify({ error: 'Missing function secrets' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data, error } = await supabase
      .from('bookings')
      .select('booking_date, customer_email, customer_name, customer_phone, customer_message, end_time, start_time, status, services(name, duration_minutes, price)')
      .eq('id', bookingId)
      .single()

    if (error || !data) {
      throw error ?? new Error('Booking not found')
    }

    const booking = data as BookingRecord
    const service = booking.services

    await sendEmail({
      apiKey: resendApiKey,
      from,
      to: booking.customer_email,
      subject: `Din bokning hos ${salonName}`,
      html: `
        <h1>Tack for din bokning</h1>
        <p>Hej ${booking.customer_name},</p>
        <p>Vi har tagit emot din bokning hos ${salonName}.</p>
        <ul>
          <li>Behandling: ${service?.name ?? 'Vald behandling'}</li>
          <li>Datum: ${booking.booking_date}</li>
          <li>Tid: ${booking.start_time} - ${booking.end_time}</li>
          <li>Status: ${booking.status}</li>
        </ul>
        <p>Vi kontaktar dig om nagot behover justeras.</p>
      `,
    })

    await sendEmail({
      apiKey: resendApiKey,
      from,
      to: adminEmail,
      subject: `Ny bokning hos ${salonName}`,
      html: `
        <h1>Ny bokning inkom</h1>
        <ul>
          <li>Namn: ${booking.customer_name}</li>
          <li>Telefon: ${booking.customer_phone}</li>
          <li>E-post: ${booking.customer_email}</li>
          <li>Behandling: ${service?.name ?? 'Vald behandling'}</li>
          <li>Datum: ${booking.booking_date}</li>
          <li>Tid: ${booking.start_time} - ${booking.end_time}</li>
          <li>Meddelande: ${booking.customer_message ?? 'Inget meddelande'}</li>
        </ul>
      `,
    })

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
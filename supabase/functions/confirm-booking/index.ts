declare const Deno: {
  env: {
    get(key: string): string | undefined
  }
  serve(handler: (request: Request) => Response | Promise<Response>): void
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'PATCH, POST, OPTIONS',
}

type BookingRecord = {
  booking_date: string
  customer_email: string | null
  customer_name: string
  end_time: string
  start_time: string
  status: string
  services: {
    name: string
    price: number
  } | null
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatTime(time: string) {
  return time.slice(0, 5)
}

function getBookingId(request: Request, body: { bookingId?: string }) {
  const pathname = new URL(request.url).pathname
  const match = pathname.match(/\/confirm-booking\/([^/]+)$/)
  return match?.[1] ?? body.bookingId
}

function buildConfirmationEmail({ booking, salonName }: { booking: BookingRecord; salonName: string }) {
  const serviceName = booking.services?.name ?? 'Vald behandling'
  const price = booking.services?.price ?? 0
  const time = `${formatTime(booking.start_time)}-${formatTime(booking.end_time)}`

  return `
    <!doctype html>
    <html>
      <body style="margin:0;background:#f7f2ea;font-family:Arial,sans-serif;color:#171717;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f2ea;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #eadfce;border-radius:24px;overflow:hidden;">
                <tr>
                  <td style="background:#111111;padding:28px 30px;color:#ffffff;">
                    <p style="margin:0 0 10px;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#ead7a1;">Bokning bekraftad</p>
                    <h1 style="margin:0;font-size:28px;line-height:1.2;">Din bokning ar bekraftad</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px;">
                    <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Hej ${escapeHtml(booking.customer_name)},</p>
                    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;">Din bokning hos ${escapeHtml(salonName)} är bekräftad.</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 10px;">
                      <tr>
                        <td style="padding:14px 16px;background:#faf7f2;border-radius:14px;font-weight:700;">Behandling</td>
                        <td style="padding:14px 16px;background:#faf7f2;border-radius:14px;text-align:right;">${escapeHtml(serviceName)}</td>
                      </tr>
                      <tr>
                        <td style="padding:14px 16px;background:#faf7f2;border-radius:14px;font-weight:700;">Datum</td>
                        <td style="padding:14px 16px;background:#faf7f2;border-radius:14px;text-align:right;">${escapeHtml(booking.booking_date)}</td>
                      </tr>
                      <tr>
                        <td style="padding:14px 16px;background:#faf7f2;border-radius:14px;font-weight:700;">Tid</td>
                        <td style="padding:14px 16px;background:#faf7f2;border-radius:14px;text-align:right;">${escapeHtml(time)}</td>
                      </tr>
                      <tr>
                        <td style="padding:14px 16px;background:#faf7f2;border-radius:14px;font-weight:700;">Pris</td>
                        <td style="padding:14px 16px;background:#faf7f2;border-radius:14px;text-align:right;">${escapeHtml(price)} kr</td>
                      </tr>
                    </table>
                    <p style="margin:24px 0 0;font-size:15px;line-height:1.7;color:#555;">Om du behöver ändra eller avboka tiden, kontakta salongen i god tid.</p>
                    <p style="margin:24px 0 0;font-size:16px;line-height:1.7;">Välkommen!<br>${escapeHtml(salonName)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

async function sendConfirmationEmail({
  apiKey,
  from,
  to,
  html,
}: {
  apiKey: string
  from: string
  to: string
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
      subject: 'Din bokning är bekräftad',
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

  if (request.method !== 'PATCH' && request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const salonName = Deno.env.get('SALON_NAME') ?? 'Studio Lumi'
    const emailFromName = Deno.env.get('EMAIL_FROM_NAME') ?? salonName
    const emailFromAddress = Deno.env.get('EMAIL_FROM_ADDRESS') ?? 'onboarding@resend.dev'

    if (!supabaseUrl || !serviceRoleKey || !anonKey || !resendApiKey) {
      return jsonResponse({ error: 'Missing function secrets' }, 500)
    }

    const body = await request.json().catch(() => ({}))
    const bookingId = getBookingId(request, body)

    if (!bookingId) {
      return jsonResponse({ error: 'bookingId is required' }, 400)
    }

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    // Supabase Edge Functions run in Deno and support URL imports at runtime.
    // The Vite/Node TypeScript server in this repo cannot resolve this URL locally.
    // @ts-expect-error Deno URL import
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    // Keep the privileged update server-side, bu first require the caller to be an admin.
    const { data: isAdmin, error: adminError } = await userClient.rpc('is_admin')
    if (adminError || !isAdmin) {
      return jsonResponse({ error: 'Forbidden' }, 403)
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const { data, error: fetchError } = await adminClient
      .from('bookings')
      .select('booking_date, customer_email, customer_name, end_time, start_time, status, services(name, price)')
      .eq('id', bookingId)
      .maybeSingle()

    if (fetchError) {
      console.error('Failed to fetch booking before confirmation:', fetchError)
      return jsonResponse({ error: 'Could not fetch booking' }, 500)
    }

    if (!data) {
      return jsonResponse({ error: 'Booking not found' }, 404)
    }

    const booking = data as BookingRecord
    const { error: updateError } = await adminClient
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Failed to confirm booking:', updateError)
      return jsonResponse({ error: 'Could not confirm booking' }, 500)
    }

    if (!booking.customer_email) {
      return jsonResponse({
        ok: true,
        warning: 'Booking was confirmed, but customer_email is missing so no email was sent.',
      })
    }

    try {
      await sendConfirmationEmail({
        apiKey: resendApiKey,
        from: `${emailFromName} <${emailFromAddress}>`,
        to: booking.customer_email,
        html: buildConfirmationEmail({ booking, salonName }),
      })
    } catch (emailError) {
      console.error('Resend failed while sending booking confirmation email:', emailError)
      return jsonResponse({
        error: 'Booking was confirmed, but the confirmation email could not be sent.',
      }, 502)
    }

    return jsonResponse({ ok: true, emailSent: true })
  } catch (error) {
    console.error('Unexpected confirm-booking error:', error)
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unknown error' }, 500)
  }
})

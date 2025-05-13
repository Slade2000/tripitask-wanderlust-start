
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  message: string;
  recipient: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message, recipient }: ContactFormRequest = await req.json();

    if (!name || !email || !message || !recipient) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send email to the recipient (website admin)
    const emailToAdmin = await resend.emails.send({
      from: "TripiTask Contact <onboarding@resend.dev>",
      to: [recipient],
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    // Send confirmation email to the user
    const emailToUser = await resend.emails.send({
      from: "TripiTask <onboarding@resend.dev>",
      to: [email],
      subject: "We've received your message",
      html: `
        <h1>Thank you for contacting TripiTask!</h1>
        <p>Hello ${name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>For your records, here is a copy of your message:</p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <p>Best regards,<br>The TripiTask Team</p>
      `,
    });

    return new Response(
      JSON.stringify({
        success: true,
        adminEmail: emailToAdmin,
        userEmail: emailToUser,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in contact-form function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

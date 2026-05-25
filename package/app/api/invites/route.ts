import { createInvite, readInvites } from "@/lib/invites";
import type { CaregiverInvite } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

async function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || apiKey === "undefined" || apiKey === "null" || !apiKey.startsWith("re_")) {
    return null;
  }

  try {
    const { Resend } = await import("resend");
    return new Resend(apiKey);
  } catch (error) {
    console.warn("Invalid RESEND_API_KEY. Invite email skipped.", error);
    return null;
  }
}

export async function GET() {
  try {
    const invites = await readInvites();
    return Response.json({ invites, success: true });
  } catch (error) {
    console.error("Error reading invites:", error);
    return Response.json(
      { error: "Failed to read invites" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, relationship, access } = body;

    // Validate required fields
    if (!name || !email || !relationship || !access) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the invite in storage
    const invite = await createInvite({
      name,
      email,
      relationship,
      access
    });

    const resend = await getResendClient();
    if (!resend) {
      console.warn("RESEND_API_KEY is not set. Invite email skipped.");
    } else {
      try {
        await resend.emails.send({
          from: "noreply@survivingmymultiples.com",
          to: email,
          subject: "You're invited to join Surviving My Multiples",
          html: generateInviteEmail(name)
        });
      } catch (emailError) {
        console.warn("Email send failed (invite still created):", emailError);
      }
    }

    return Response.json({ invite, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating invite:", error);
    return Response.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }
}

function generateInviteEmail(invitedName: string): string {
  return `
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; line-height: 1.6; color: #2c2622;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="font-size: 28px; color: #ef6c3e; margin-bottom: 16px;">
            Welcome to Surviving My Multiples
          </h1>
          
          <p style="font-size: 16px; margin-bottom: 16px;">
            Hi ${invitedName},
          </p>
          
          <p style="font-size: 16px; color: #76695f; margin-bottom: 16px;">
            You've been invited to join a family on <strong>Surviving My Multiples</strong>, a platform designed to keep families with twins, triplets, and caregivers synchronized and stress-free.
          </p>
          
          <p style="font-size: 16px; color: #76695f; margin-bottom: 24px;">
            With this invite, you'll be able to:
          </p>
          
          <ul style="font-size: 14px; color: #76695f; margin-bottom: 24px;">
            <li style="margin-bottom: 8px;">View and manage family schedules</li>
            <li style="margin-bottom: 8px;">Track routines and tasks for each child</li>
            <li style="margin-bottom: 8px;">Receive real-time notifications</li>
            <li style="margin-bottom: 8px;">Collaborate with other caregivers</li>
          </ul>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://survivingmymultiples.com/accept-invite" style="
              display: inline-block;
              padding: 12px 28px;
              background-color: #ef6c3e;
              color: white;
              text-decoration: none;
              border-radius: 999px;
              font-weight: bold;
              font-size: 16px;
            ">
              Accept Invite
            </a>
          </div>
          
          <p style="font-size: 14px; color: #2c2622; margin-top: 32px; border-top: 1px solid #f1d8bd; padding-top: 16px;">
            Questions? Reply to this email or contact support@survivingmymultiples.com
          </p>
          
          <p style="font-size: 12px; color: #76695f; margin-top: 16px;">
            © 2026 Surviving My Multiples. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;
}

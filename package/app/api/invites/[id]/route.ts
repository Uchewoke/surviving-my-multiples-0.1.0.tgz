import { readInvites, updateInviteStatus } from "@/lib/invites";
import { addTeamMemberFromInvite, readTeamMembers } from "@/lib/team";

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
    console.warn("Invalid RESEND_API_KEY. Re-invite email skipped.", error);
    return null;
  }
}

type InviteActionPayload = {
  action?: "accept" | "reinvite";
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as InviteActionPayload;

    if (!body.action) {
      return Response.json({ error: "Action is required" }, { status: 400 });
    }

    const invites = await readInvites();
    const invite = invites.find((item) => item.id === id);

    if (!invite) {
      return Response.json({ error: "Invite not found" }, { status: 404 });
    }

    if (body.action === "accept") {
      const updatedInvite = await updateInviteStatus(id, "Accepted");
      if (!updatedInvite) {
        return Response.json({ error: "Invite not found" }, { status: 404 });
      }

      await addTeamMemberFromInvite(updatedInvite);
      const members = await readTeamMembers();
      return Response.json({ invite: updatedInvite, members, success: true });
    }

    const pendingInvite = await updateInviteStatus(id, "Pending");
    if (!pendingInvite) {
      return Response.json({ error: "Invite not found" }, { status: 404 });
    }

    const resend = await getResendClient();
    if (!resend) {
      console.warn("RESEND_API_KEY is not set. Re-invite email skipped.");
    } else {
      try {
        await resend.emails.send({
          from: "noreply@survivingmymultiples.com",
          to: pendingInvite.email,
          subject: "Reminder: your Surviving My Multiples invite",
          html: `<p>Hi ${pendingInvite.name}, your caregiver invite is waiting for you. Please check your dashboard invite link to join the family team.</p>`
        });
      } catch (emailError) {
        console.warn("Re-invite email failed:", emailError);
      }
    }

    return Response.json({ invite: pendingInvite, success: true });
  } catch (error) {
    console.error("Error updating invite:", error);
    return Response.json({ error: "Failed to update invite" }, { status: 500 });
  }
}

import { removeTeamMember, updateTeamMemberAccess } from "@/lib/team";
import type { CaregiverAccess } from "@/lib/mock-data";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { access?: CaregiverAccess };

    if (!body.access) {
      return Response.json({ error: "Access level is required" }, { status: 400 });
    }

    const updated = await updateTeamMemberAccess(id, body.access);

    if (!updated) {
      return Response.json({ error: "Team member not found" }, { status: 404 });
    }

    return Response.json({ member: updated, success: true });
  } catch (error) {
    console.error("Error updating team member:", error);
    return Response.json({ error: "Failed to update team member" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const removed = await removeTeamMember(id);

    if (!removed) {
      return Response.json({ error: "Team member not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error removing team member:", error);
    return Response.json({ error: "Failed to remove team member" }, { status: 500 });
  }
}

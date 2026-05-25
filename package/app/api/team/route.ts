import { readTeamMembers } from "@/lib/team";

export async function GET() {
  try {
    const members = await readTeamMembers();
    return Response.json({ members, success: true });
  } catch (error) {
    console.error("Error reading team members:", error);
    return Response.json({ error: "Failed to read team members" }, { status: 500 });
  }
}

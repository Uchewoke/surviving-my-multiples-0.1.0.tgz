import { readPreferences, updatePreferences } from "@/lib/notification-preferences";
import type { NotificationPreference } from "@/lib/mock-data";

export async function GET() {
  try {
    const preferences = await readPreferences();
    return Response.json({ preferences, success: true });
  } catch (error) {
    console.error("Error reading preferences:", error);
    return Response.json(
      { error: "Failed to read preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const preferences = await updatePreferences(body as Partial<NotificationPreference>);
    return Response.json({ preferences, success: true });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return Response.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}

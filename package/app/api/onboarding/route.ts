import { readOnboardingData, writeOnboardingData, type OnboardingData } from "@/lib/onboarding";

export async function GET() {
  try {
    const data = await readOnboardingData();
    return Response.json({ data, success: true });
  } catch (error) {
    console.error("Error reading onboarding data:", error);
    return Response.json({ error: "Failed to read onboarding data" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as OnboardingData;

    if (!body.familyName.trim()) {
      return Response.json({ error: "Family Name is required" }, { status: 400 });
    }

    await writeOnboardingData({
      familyName: body.familyName.trim(),
      role: body.role,
      childrenCount: body.childrenCount,
      timezone: body.timezone.trim(),
      goals: body.goals.trim()
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error saving onboarding data:", error);
    return Response.json({ error: "Failed to save onboarding data" }, { status: 500 });
  }
}

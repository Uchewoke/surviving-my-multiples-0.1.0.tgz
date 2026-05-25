import { readQuickTip, writeQuickTip, type QuickTipSettings } from "@/lib/quick-tip";
import { QUICK_TIP_MAX_LENGTH } from "@/lib/quick-tip-constants";

export async function GET() {
  try {
    const quickTip = await readQuickTip();
    return Response.json({ quickTip, success: true });
  } catch (error) {
    console.error("Error reading quick tip:", error);
    return Response.json({ error: "Failed to read quick tip" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as QuickTipSettings;
    const normalizedText = body.text?.trim() || "";

    if (!normalizedText) {
      return Response.json({ error: "Quick tip text is required" }, { status: 400 });
    }

    if (normalizedText.length > QUICK_TIP_MAX_LENGTH) {
      return Response.json(
        { error: `Quick tip must be ${QUICK_TIP_MAX_LENGTH} characters or fewer` },
        { status: 400 }
      );
    }

    await writeQuickTip({ text: normalizedText });
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating quick tip:", error);
    return Response.json({ error: "Failed to update quick tip" }, { status: 500 });
  }
}

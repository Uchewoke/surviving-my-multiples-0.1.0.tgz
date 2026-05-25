import { readAccountPlan, writeAccountPlan } from "@/lib/account-plan";
import type { AccountPlanSettings } from "@/lib/mock-data";

export async function GET() {
  try {
    const plan = await readAccountPlan();
    return Response.json({ plan, success: true });
  } catch (error) {
    console.error("Error reading account plan:", error);
    return Response.json({ error: "Failed to read account plan" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as AccountPlanSettings;

    if (!body.billingEmail.trim()) {
      return Response.json({ error: "Billing email is required" }, { status: 400 });
    }

    if (body.trialDaysLeft < 0) {
      return Response.json({ error: "Trial days cannot be negative" }, { status: 400 });
    }

    if (!body.nextBillingDate) {
      return Response.json({ error: "Next billing date is required" }, { status: 400 });
    }

    if (!body.plan || !body.billingCycle || !body.paymentMethod) {
      return Response.json({ error: "Plan, billing cycle, and payment method are required" }, { status: 400 });
    }

    await writeAccountPlan({
      ...body,
      billingEmail: body.billingEmail.trim()
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating account plan:", error);
    return Response.json({ error: "Failed to update account plan" }, { status: 500 });
  }
}

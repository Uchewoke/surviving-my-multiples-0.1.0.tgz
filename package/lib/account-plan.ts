import { promises as fs } from "fs";
import path from "path";
import type { AccountPlanSettings } from "@/lib/mock-data";

const DATA_DIR = path.join(process.cwd(), ".data");
const PLAN_FILE = path.join(DATA_DIR, "account-plan.json");

const DEFAULT_PLAN: AccountPlanSettings = {
  plan: "Growth",
  trialDaysLeft: 10,
  billingEmail: "family@example.com",
  autoRenew: true,
  billingCycle: "Monthly",
  paymentMethod: "Card",
  nextBillingDate: "2026-06-15"
};

function normalizePlanSettings(raw: Partial<AccountPlanSettings>): AccountPlanSettings {
  return {
    plan: raw.plan || DEFAULT_PLAN.plan,
    trialDaysLeft: typeof raw.trialDaysLeft === "number" ? raw.trialDaysLeft : DEFAULT_PLAN.trialDaysLeft,
    billingEmail: raw.billingEmail || DEFAULT_PLAN.billingEmail,
    autoRenew: typeof raw.autoRenew === "boolean" ? raw.autoRenew : DEFAULT_PLAN.autoRenew,
    billingCycle: raw.billingCycle || DEFAULT_PLAN.billingCycle,
    paymentMethod: raw.paymentMethod || DEFAULT_PLAN.paymentMethod,
    nextBillingDate: raw.nextBillingDate || DEFAULT_PLAN.nextBillingDate
  };
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readAccountPlan(): Promise<AccountPlanSettings> {
  await ensureDataDir();

  try {
    const data = await fs.readFile(PLAN_FILE, "utf-8");
    return normalizePlanSettings(JSON.parse(data) as Partial<AccountPlanSettings>);
  } catch {
    return DEFAULT_PLAN;
  }
}

export async function writeAccountPlan(plan: AccountPlanSettings): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(PLAN_FILE, JSON.stringify(normalizePlanSettings(plan), null, 2), "utf-8");
}

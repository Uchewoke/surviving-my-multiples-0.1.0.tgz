import { promises as fs } from "fs";
import path from "path";

export type OnboardingData = {
  familyName: string;
  role: "parent" | "caregiver" | "support";
  childrenCount: "2" | "3" | "4";
  timezone: string;
  goals: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const ONBOARDING_FILE = path.join(DATA_DIR, "onboarding.json");

const DEFAULT_ONBOARDING_DATA: OnboardingData = {
  familyName: "",
  role: "parent",
  childrenCount: "3",
  timezone: "",
  goals: ""
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readOnboardingData(): Promise<OnboardingData> {
  await ensureDataDir();

  try {
    const data = await fs.readFile(ONBOARDING_FILE, "utf-8");
    return JSON.parse(data) as OnboardingData;
  } catch {
    return DEFAULT_ONBOARDING_DATA;
  }
}

export async function writeOnboardingData(data: OnboardingData): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(ONBOARDING_FILE, JSON.stringify(data, null, 2), "utf-8");
}

import { promises as fs } from "fs";
import path from "path";
import { QUICK_TIP_MAX_LENGTH } from "@/lib/quick-tip-constants";

export type QuickTipSettings = {
  text: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const QUICK_TIP_FILE = path.join(DATA_DIR, "quick-tip.json");

const DEFAULT_QUICK_TIP: QuickTipSettings = {
  text: "Batch similar tasks for each child to reduce context switching."
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readQuickTip(): Promise<QuickTipSettings> {
  await ensureDataDir();

  try {
    const data = await fs.readFile(QUICK_TIP_FILE, "utf-8");
    const parsed = JSON.parse(data) as Partial<QuickTipSettings>;
    return {
      text: parsed.text?.trim().slice(0, QUICK_TIP_MAX_LENGTH) || DEFAULT_QUICK_TIP.text
    };
  } catch {
    return DEFAULT_QUICK_TIP;
  }
}

export async function writeQuickTip(payload: QuickTipSettings): Promise<void> {
  await ensureDataDir();
  const normalizedText = payload.text.trim();
  const nextPayload: QuickTipSettings = {
    text: normalizedText ? normalizedText.slice(0, QUICK_TIP_MAX_LENGTH) : DEFAULT_QUICK_TIP.text
  };

  await fs.writeFile(QUICK_TIP_FILE, JSON.stringify(nextPayload, null, 2), "utf-8");
}

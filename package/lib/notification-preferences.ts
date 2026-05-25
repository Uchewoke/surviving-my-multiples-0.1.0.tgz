import { promises as fs } from "fs";
import path from "path";
import type { NotificationPreference } from "./mock-data";

const DATA_DIR = path.join(process.cwd(), ".data");
const PREFERENCES_FILE = path.join(DATA_DIR, "notification-preferences.json");

// Default preferences
const DEFAULT_PREFERENCES: NotificationPreference = {
  id: "default",
  scheduleChanges: {
    enabled: true,
    channels: ["push", "email"]
  },
  dailySummary: {
    enabled: true,
    channels: ["email"]
  },
  budgetAlert: {
    enabled: false,
    channels: ["email"]
  }
};

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Directory may already exist
  }
}

// Read notification preferences
export async function readPreferences(): Promise<NotificationPreference> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(PREFERENCES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    // File doesn't exist yet, return defaults
    return DEFAULT_PREFERENCES;
  }
}

// Write notification preferences
export async function writePreferences(
  preferences: NotificationPreference
): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(PREFERENCES_FILE, JSON.stringify(preferences, null, 2));
}

// Update notification preferences
export async function updatePreferences(
  updates: Partial<NotificationPreference>
): Promise<NotificationPreference> {
  const current = await readPreferences();
  const updated = { ...current, ...updates, id: current.id };
  await writePreferences(updated);
  return updated;
}

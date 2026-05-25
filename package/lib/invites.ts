import { promises as fs } from "fs";
import path from "path";
import type { CaregiverInvite } from "./mock-data";

const DATA_DIR = path.join(process.cwd(), ".data");
const INVITES_FILE = path.join(DATA_DIR, "invites.json");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Directory may already exist
  }
}

// Read all invites from file
export async function readInvites(): Promise<CaregiverInvite[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(INVITES_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    // File doesn't exist yet, return empty array
    return [];
  }
}

// Write invites to file
export async function writeInvites(invites: CaregiverInvite[]) {
  await ensureDataDir();
  await fs.writeFile(INVITES_FILE, JSON.stringify(invites, null, 2));
}

// Add a new invite
export async function createInvite(
  invite: Omit<CaregiverInvite, "id" | "status">
): Promise<CaregiverInvite> {
  const invites = await readInvites();
  const newInvite: CaregiverInvite = {
    ...invite,
    id: `inv-${Date.now()}`,
    status: "Pending"
  };
  invites.unshift(newInvite);
  await writeInvites(invites);
  return newInvite;
}

// Update invite status (e.g., when caregiver accepts)
export async function updateInviteStatus(
  id: string,
  status: "Pending" | "Accepted"
): Promise<CaregiverInvite | null> {
  const invites = await readInvites();
  const invite = invites.find((inv) => inv.id === id);
  if (!invite) return null;
  invite.status = status;
  await writeInvites(invites);
  return invite;
}

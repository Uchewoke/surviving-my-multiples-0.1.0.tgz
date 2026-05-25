import { promises as fs } from "fs";
import path from "path";
import { caregivers, type Caregiver, type CaregiverAccess, type CaregiverInvite } from "@/lib/mock-data";

const DATA_DIR = path.join(process.cwd(), ".data");
const TEAM_FILE = path.join(DATA_DIR, "team.json");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readTeamMembers(): Promise<Caregiver[]> {
  await ensureDataDir();

  try {
    const data = await fs.readFile(TEAM_FILE, "utf-8");
    return JSON.parse(data) as Caregiver[];
  } catch {
    return caregivers;
  }
}

export async function writeTeamMembers(team: Caregiver[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(TEAM_FILE, JSON.stringify(team, null, 2), "utf-8");
}

export async function updateTeamMemberAccess(id: string, access: CaregiverAccess): Promise<Caregiver | null> {
  const team = await readTeamMembers();
  const member = team.find((item) => item.id === id);

  if (!member) {
    return null;
  }

  member.access = access;
  await writeTeamMembers(team);
  return member;
}

export async function removeTeamMember(id: string): Promise<boolean> {
  const team = await readTeamMembers();
  const nextTeam = team.filter((member) => member.id !== id);

  if (nextTeam.length === team.length) {
    return false;
  }

  await writeTeamMembers(nextTeam);
  return true;
}

export async function addTeamMemberFromInvite(invite: CaregiverInvite): Promise<Caregiver> {
  const team = await readTeamMembers();
  const existing = team.find(
    (member) => member.name.toLowerCase() === invite.name.toLowerCase() && member.relationship === invite.relationship
  );

  if (existing) {
    return existing;
  }

  const newMember: Caregiver = {
    id: `cg-${Date.now()}`,
    name: invite.name,
    email: invite.email,
    relationship: invite.relationship,
    access: invite.access,
    coverage: "Flexible support"
  };

  const nextTeam = [newMember, ...team];
  await writeTeamMembers(nextTeam);
  return newMember;
}

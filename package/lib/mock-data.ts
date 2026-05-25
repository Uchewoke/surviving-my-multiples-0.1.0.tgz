export type ChildProfile = {
  id: string;
  name: string;
  ageMonths: number;
  personality: string;
};

export type ScheduleItem = {
  id: string;
  title: string;
  time: string;
  assignedTo: string;
  status: "ready" | "due" | "done";
};

export type CaregiverAccess = "Admin" | "Scheduler" | "Viewer";

export type Caregiver = {
  id: string;
  name: string;
  email?: string;
  relationship: string;
  access: CaregiverAccess;
  coverage: string;
};

export type CaregiverInvite = {
  id: string;
  name: string;
  email: string;
  relationship: string;
  access: CaregiverAccess;
  status: "Pending" | "Accepted";
};

export type NotificationChannel = "push" | "email" | "sms";

export type NotificationPreference = {
  id: string;
  scheduleChanges: {
    enabled: boolean;
    channels: NotificationChannel[];
  };
  dailySummary: {
    enabled: boolean;
    channels: NotificationChannel[];
  };
  budgetAlert: {
    enabled: boolean;
    channels: NotificationChannel[];
  };
};

export type PlanTier = "Starter" | "Growth" | "Premium";

export type AccountPlanSettings = {
  plan: PlanTier;
  trialDaysLeft: number;
  billingEmail: string;
  autoRenew: boolean;
  billingCycle: "Monthly" | "Yearly";
  paymentMethod: "Card" | "Bank" | "PayPal";
  nextBillingDate: string;
};

export type InvoiceEntry = {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending";
  description: string;
};

export const household = {
  familyName: "The Johnson Crew",
  plan: "Growth",
  trialDaysLeft: 10,
  membersOnline: 4,
  children: [
    { id: "c1", name: "Mila", ageMonths: 18, personality: "Curious Explorer" },
    { id: "c2", name: "Mason", ageMonths: 18, personality: "Snack Negotiator" },
    { id: "c3", name: "Mia", ageMonths: 18, personality: "Nap Strategist" }
  ] as ChildProfile[]
};

export const schedules: ScheduleItem[] = [
  { id: "s1", title: "Bottle + meds", time: "08:00", assignedTo: "Mom", status: "done" },
  { id: "s2", title: "Park walk", time: "11:30", assignedTo: "Grandma", status: "ready" },
  { id: "s3", title: "Nap rotation", time: "13:00", assignedTo: "Dad", status: "due" },
  { id: "s4", title: "Dinner prep", time: "17:45", assignedTo: "Caregiver", status: "ready" }
];

export const insights = {
  sleepHoursAvg: 9.2,
  feedingCompletion: 87,
  monthlyCosts: 1260,
  supportTasksOpen: 6
};

export const notifications = [
  "Mason's nap started 12 minutes late.",
  "Shared grocery list updated by Grandma.",
  "Pediatrician reminder tomorrow at 9:00 AM."
];

export const caregivers: Caregiver[] = [
  {
    id: "cg1",
    name: "Grandma Linda",
    email: "linda@example.com",
    relationship: "Grandparent",
    access: "Scheduler",
    coverage: "Weekday mornings"
  },
  {
    id: "cg2",
    name: "Uncle Reggie",
    email: "reggie@example.com",
    relationship: "Family",
    access: "Viewer",
    coverage: "Backup evenings"
  }
];

export const caregiverInvites: CaregiverInvite[] = [
  {
    id: "inv1",
    name: "Nina Patel",
    email: "nina.patel@example.com",
    relationship: "Nanny",
    access: "Scheduler",
    status: "Pending"
  }
];

export const mockInvoices: InvoiceEntry[] = [
  {
    id: "inv-2026-001",
    invoiceNumber: "SM-2026-001",
    date: "2026-05-01",
    amount: "$39.00",
    status: "Paid",
    description: "Growth Plan - Monthly"
  },
  {
    id: "inv-2026-002",
    invoiceNumber: "SM-2026-002",
    date: "2026-04-01",
    amount: "$39.00",
    status: "Paid",
    description: "Growth Plan - Monthly"
  },
  {
    id: "inv-2026-003",
    invoiceNumber: "SM-2026-003",
    date: "2026-06-01",
    amount: "$39.00",
    status: "Pending",
    description: "Growth Plan - Upcoming Renewal"
  }
];

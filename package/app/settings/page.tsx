"use client";

import { useMemo, useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { QUICK_TIP_MAX_LENGTH } from "@/lib/quick-tip-constants";
import {
  household,
  type AccountPlanSettings,
  type CaregiverAccess,
  type Caregiver,
  type CaregiverInvite,
  mockInvoices,
  type NotificationChannel,
  type NotificationPreference,
  type PlanTier
} from "@/lib/mock-data";

type NotificationKey = "scheduleChanges" | "dailySummary" | "budgetAlert";
type InvoiceStatusFilter = "All" | "Paid" | "Pending";

export default function SettingsPage() {
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    relationship: "Caregiver",
    access: "Scheduler" as CaregiverAccess
  });
  const [planForm, setPlanForm] = useState<AccountPlanSettings | null>(null);
  const [initialPlan, setInitialPlan] = useState<AccountPlanSettings | null>(null);
  const [invites, setInvites] = useState<CaregiverInvite[]>([]);
  const [teamMembers, setTeamMembers] = useState<Caregiver[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planMessage, setPlanMessage] = useState<string | null>(null);
  const [quickTipText, setQuickTipText] = useState("");
  const [quickTipInitial, setQuickTipInitial] = useState("");
  const [quickTipMessage, setQuickTipMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [savingQuickTip, setSavingQuickTip] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [inviteActionId, setInviteActionId] = useState<string | null>(null);
  const [reinvitingMemberId, setReinvitingMemberId] = useState<string | null>(null);
  const [billingDrawerOpen, setBillingDrawerOpen] = useState(false);
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<InvoiceStatusFilter>("All");
  const [invoiceDateFrom, setInvoiceDateFrom] = useState("");
  const [invoiceDateTo, setInvoiceDateTo] = useState("");

  // Load settings data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [planRes, invitesRes, teamRes, prefsRes, quickTipRes] = await Promise.all([
        fetch("/api/account/plan"),
        fetch("/api/invites"),
        fetch("/api/team"),
        fetch("/api/notifications/preferences"),
        fetch("/api/quick-tip")
      ]);
      
      if (!planRes.ok || !invitesRes.ok || !teamRes.ok || !prefsRes.ok || !quickTipRes.ok) {
        throw new Error("Failed to load data");
      }
      
      const planData = await planRes.json();
      const invitesData = await invitesRes.json();
      const teamData = await teamRes.json();
      const prefsData = await prefsRes.json();
      const quickTipData = await quickTipRes.json();
      
      setPlanForm(planData.plan);
      setInitialPlan(planData.plan);
      setInvites(invitesData.invites);
      setTeamMembers(teamData.members);
      setPreferences(prefsData.preferences);
      setQuickTipText(quickTipData.quickTip.text);
      setQuickTipInitial(quickTipData.quickTip.text);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = useMemo(
    () => invites.filter((invite) => invite.status === "Pending").length,
    [invites]
  );

  const filteredInvoices = useMemo(() => {
    return mockInvoices.filter((invoice) => {
      const statusMatch = invoiceStatusFilter === "All" || invoice.status === invoiceStatusFilter;
      const fromMatch = !invoiceDateFrom || invoice.date >= invoiceDateFrom;
      const toMatch = !invoiceDateTo || invoice.date <= invoiceDateTo;
      return statusMatch && fromMatch && toMatch;
    });
  }, [invoiceDateFrom, invoiceDateTo, invoiceStatusFilter]);

  const planIsDirty = useMemo(() => {
    if (!planForm || !initialPlan) {
      return false;
    }

    return JSON.stringify(planForm) !== JSON.stringify(initialPlan);
  }, [initialPlan, planForm]);

  const planPrice = useMemo(() => {
    if (!planForm) {
      return "-";
    }

    const baseMonthly: Record<PlanTier, number> = {
      Starter: 19,
      Growth: 39,
      Premium: 79
    };

    if (planForm.billingCycle === "Yearly") {
      const yearly = Math.round(baseMonthly[planForm.plan] * 12 * 0.9);
      return `$${yearly}/year`;
    }

    return `$${baseMonthly[planForm.plan]}/month`;
  }, [planForm]);

  const quickTipDirty = useMemo(() => quickTipText.trim() !== quickTipInitial.trim(), [quickTipInitial, quickTipText]);
  const quickTipCharacterCount = quickTipText.length;

  const handleSavePlan = async () => {
    if (!planForm) {
      return;
    }

    try {
      setSavingPlan(true);
      setPlanMessage(null);
      setError(null);

      const response = await fetch("/api/account/plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planForm)
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to save plan settings");
      }

      setInitialPlan(planForm);
      setPlanMessage(`Plan settings saved at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save plan settings");
    } finally {
      setSavingPlan(false);
    }
  };

  const handleSaveQuickTip = async () => {
    const normalized = quickTipText.trim();

    if (!normalized) {
      setError("Quick tip cannot be empty.");
      return;
    }

    if (normalized.length > QUICK_TIP_MAX_LENGTH) {
      setError(`Quick tip must be ${QUICK_TIP_MAX_LENGTH} characters or fewer.`);
      return;
    }

    try {
      setSavingQuickTip(true);
      setQuickTipMessage(null);
      setError(null);

      const response = await fetch("/api/quick-tip", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: normalized })
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to save quick tip");
      }

      setQuickTipText(normalized);
      setQuickTipInitial(normalized);
      window.dispatchEvent(new CustomEvent("quick-tip-updated", { detail: { text: normalized } }));
      setQuickTipMessage("Quick tip saved and applied across the app.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save quick tip");
    } finally {
      setSavingQuickTip(false);
    }
  };

  const handleUpgradePlan = () => {
    if (!planForm) {
      return;
    }

    const nextPlan: Record<PlanTier, PlanTier> = {
      Starter: "Growth",
      Growth: "Premium",
      Premium: "Premium"
    };

    setPlanForm((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        plan: nextPlan[current.plan]
      };
    });
    setPlanMessage("Plan upgraded in form. Click Save Plan to apply.");
  };

  const handleInvite = async () => {
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteForm.name.trim(),
          email: inviteForm.email.trim(),
          relationship: inviteForm.relationship,
          access: inviteForm.access
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create invite");
      }

      const data = await response.json();
      setInvites((current) => [data.invite, ...current]);
      
      setInviteForm({
        name: "",
        email: "",
        relationship: "Caregiver",
        access: "Scheduler"
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInviteAction = async (id: string, action: "accept" | "reinvite") => {
    const previousInvites = invites;

    try {
      setInviteActionId(id);
      setError(null);

      const response = await fetch(`/api/invites/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to update invite");
      }

      const payload = await response.json();
      setInvites((current) => current.map((invite) => (invite.id === id ? payload.invite : invite)));

      if (action === "accept" && payload.members) {
        setTeamMembers(payload.members);
      }
    } catch (err) {
      setInvites(previousInvites);
      setError(err instanceof Error ? err.message : "Failed to update invite");
    } finally {
      setInviteActionId(null);
    }
  };

  const handleReinviteTeamMember = async (member: Caregiver) => {
    if (!member.email) {
      setError(`No email available for ${member.name}`);
      return;
    }

    try {
      setReinvitingMemberId(member.id);
      setError(null);

      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: member.name,
          email: member.email,
          relationship: member.relationship,
          access: member.access
        })
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to re-invite team member");
      }

      const payload = await response.json();
      setInvites((current) => [payload.invite, ...current]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to re-invite team member");
    } finally {
      setReinvitingMemberId(null);
    }
  };

  const toggleNotification = async (key: NotificationKey, channel?: NotificationChannel) => {
    if (!preferences) return;

    try {
      setSavingPrefs(true);
      setError(null);

      const currentPref = preferences[key];
      const nextPreference = channel
        ? {
            ...currentPref,
            channels: currentPref.channels.includes(channel)
              ? currentPref.channels.filter((item) => item !== channel)
              : [...currentPref.channels, channel]
          }
        : {
            ...currentPref,
            enabled: !currentPref.enabled
          };

      const nextPreferences: NotificationPreference = {
        ...preferences,
        [key]: nextPreference
      };
      
      setPreferences(nextPreferences);

      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextPreferences)
      });

      if (!response.ok) {
        setPreferences(preferences);
        throw new Error("Failed to save preferences");
      }

      const data = await response.json();
      setPreferences(data.preferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleUpdateTeamAccess = async (id: string, access: CaregiverAccess) => {
    const previous = teamMembers;
    const optimistic = teamMembers.map((member) =>
      member.id === id
        ? {
            ...member,
            access
          }
        : member
    );

    try {
      setEditingMemberId(id);
      setError(null);
      setTeamMembers(optimistic);

      const response = await fetch(`/api/team/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access })
      });

      if (!response.ok) {
        setTeamMembers(previous);
        const payload = await response.json();
        throw new Error(payload.error || "Failed to update team role");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update team role");
    } finally {
      setEditingMemberId(null);
    }
  };

  const handleRemoveTeamMember = async (id: string) => {
    const previous = teamMembers;
    const optimistic = teamMembers.filter((member) => member.id !== id);

    try {
      setRemovingMemberId(id);
      setError(null);
      setTeamMembers(optimistic);

      const response = await fetch(`/api/team/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        setTeamMembers(previous);
        const payload = await response.json();
        throw new Error(payload.error || "Failed to remove team member");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove team member");
    } finally {
      setRemovingMemberId(null);
    }
  };

  return (
    <AppShell title="Settings" subtitle="Manage your plan, alerts, and team access.">
      <section className="dashboard-grid">
        <article className="card span-6">
          <h3>Account Plan</h3>
          <p>{planForm?.plan || household.plan} plan active</p>
          <div className="metric">{planForm?.trialDaysLeft ?? household.trialDaysLeft} days left in trial</div>
          <p className="save-note">Current price: {planPrice}</p>

          <div className="form-grid invite-grid">
            <div className="field">
              <label htmlFor="plan-tier">Plan Tier</label>
              <select
                id="plan-tier"
                value={planForm?.plan || "Growth"}
                onChange={(event) =>
                  setPlanForm((current) =>
                    current
                      ? {
                          ...current,
                          plan: event.target.value as PlanTier
                        }
                      : current
                  )
                }
                disabled={loading || savingPlan}
              >
                <option value="Starter">Starter</option>
                <option value="Growth">Growth</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="billing-email">Billing Email</label>
              <input
                id="billing-email"
                type="email"
                value={planForm?.billingEmail || ""}
                onChange={(event) =>
                  setPlanForm((current) =>
                    current
                      ? {
                          ...current,
                          billingEmail: event.target.value
                        }
                      : current
                  )
                }
                disabled={loading || savingPlan}
              />
            </div>

            <div className="field">
              <label htmlFor="billing-cycle">Billing Cycle</label>
              <select
                id="billing-cycle"
                value={planForm?.billingCycle || "Monthly"}
                onChange={(event) =>
                  setPlanForm((current) =>
                    current
                      ? {
                          ...current,
                          billingCycle: event.target.value as AccountPlanSettings["billingCycle"]
                        }
                      : current
                  )
                }
                disabled={loading || savingPlan}
              >
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="payment-method">Payment Method</label>
              <select
                id="payment-method"
                value={planForm?.paymentMethod || "Card"}
                onChange={(event) =>
                  setPlanForm((current) =>
                    current
                      ? {
                          ...current,
                          paymentMethod: event.target.value as AccountPlanSettings["paymentMethod"]
                        }
                      : current
                  )
                }
                disabled={loading || savingPlan}
              >
                <option value="Card">Card</option>
                <option value="Bank">Bank</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>
          </div>

          <div className="list invite-grid">
            <div className="list-item">
              <span>Auto renew</span>
              <input
                type="checkbox"
                checked={planForm?.autoRenew || false}
                onChange={(event) =>
                  setPlanForm((current) =>
                    current
                      ? {
                          ...current,
                          autoRenew: event.target.checked
                        }
                      : current
                  )
                }
                disabled={loading || savingPlan}
              />
            </div>
            <div className="list-item">
              <span>Next billing date</span>
              <input
                type="date"
                value={planForm?.nextBillingDate || ""}
                onChange={(event) =>
                  setPlanForm((current) =>
                    current
                      ? {
                          ...current,
                          nextBillingDate: event.target.value
                        }
                      : current
                  )
                }
                disabled={loading || savingPlan}
              />
            </div>
            <div className="list-item">
              <span>Trial days</span>
              <input
                type="number"
                min={0}
                value={planForm?.trialDaysLeft ?? 0}
                onChange={(event) =>
                  setPlanForm((current) =>
                    current
                      ? {
                          ...current,
                          trialDaysLeft: Number(event.target.value)
                        }
                      : current
                  )
                }
                disabled={loading || savingPlan}
              />
            </div>
          </div>

          <div className="actions-row">
            <button className="accent-btn" type="button" onClick={handleUpgradePlan} disabled={loading || savingPlan}>
              Upgrade Plan
            </button>
            <button className="ghost-btn" type="button" onClick={handleSavePlan} disabled={loading || savingPlan || !planIsDirty}>
              {savingPlan ? "Saving..." : "Save Plan"}
            </button>
            <button className="ghost-btn" type="button" onClick={() => setBillingDrawerOpen(true)}>
              Billing History
            </button>
          </div>

          {planIsDirty && <p className="save-note">You have unsaved account plan changes.</p>}
          {planMessage && <p className="save-note">{planMessage}</p>}
        </article>

        <article className="card span-6">
          <h3>Alerts and Reminders</h3>
          <p>Choose how your family receives updates.</p>
          
          {loading ? (
            <div className="list-item">Loading preferences...</div>
          ) : preferences ? (
            <div className="notification-prefs">
              {/* Schedule Changes */}
              <div className="pref-section">
                <div className="pref-header">
                  <div>
                    <h4>Schedule Changes</h4>
                    <p className="pref-desc">When routines are updated or adjusted</p>
                  </div>
                  <button
                    className="toggle-btn"
                    onClick={() => toggleNotification("scheduleChanges")}
                    disabled={savingPrefs}
                    aria-pressed={preferences.scheduleChanges.enabled}
                  >
                    {preferences.scheduleChanges.enabled ? "On" : "Off"}
                  </button>
                </div>
                {preferences.scheduleChanges.enabled && (
                  <div className="channels">
                    {(["push", "email", "sms"] as NotificationChannel[]).map((channel) => (
                      <label key={channel} className="channel-checkbox">
                        <input
                          type="checkbox"
                          checked={preferences.scheduleChanges.channels.includes(channel)}
                          onChange={() => toggleNotification("scheduleChanges", channel)}
                          disabled={savingPrefs}
                        />
                        <span>{channel.charAt(0).toUpperCase() + channel.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Daily Summary */}
              <div className="pref-section">
                <div className="pref-header">
                  <div>
                    <h4>Daily Summary</h4>
                    <p className="pref-desc">End-of-day recap of activities and events</p>
                  </div>
                  <button
                    className="toggle-btn"
                    onClick={() => toggleNotification("dailySummary")}
                    disabled={savingPrefs}
                    aria-pressed={preferences.dailySummary.enabled}
                  >
                    {preferences.dailySummary.enabled ? "On" : "Off"}
                  </button>
                </div>
                {preferences.dailySummary.enabled && (
                  <div className="channels">
                    {(["push", "email", "sms"] as NotificationChannel[]).map((channel) => (
                      <label key={channel} className="channel-checkbox">
                        <input
                          type="checkbox"
                          checked={preferences.dailySummary.channels.includes(channel)}
                          onChange={() => toggleNotification("dailySummary", channel)}
                          disabled={savingPrefs}
                        />
                        <span>{channel.charAt(0).toUpperCase() + channel.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Budget Alert */}
              <div className="pref-section">
                <div className="pref-header">
                  <div>
                    <h4>Budget Alert</h4>
                    <p className="pref-desc">When spending approaches budget limit</p>
                  </div>
                  <button
                    className="toggle-btn"
                    onClick={() => toggleNotification("budgetAlert")}
                    disabled={savingPrefs}
                    aria-pressed={preferences.budgetAlert.enabled}
                  >
                    {preferences.budgetAlert.enabled ? "On" : "Off"}
                  </button>
                </div>
                {preferences.budgetAlert.enabled && (
                  <div className="channels">
                    {(["push", "email", "sms"] as NotificationChannel[]).map((channel) => (
                      <label key={channel} className="channel-checkbox">
                        <input
                          type="checkbox"
                          checked={preferences.budgetAlert.channels.includes(channel)}
                          onChange={() => toggleNotification("budgetAlert", channel)}
                          disabled={savingPrefs}
                        />
                        <span>{channel.charAt(0).toUpperCase() + channel.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </article>

        <article className="card span-12">
          <h3>Quick Tip</h3>
          <p>Customize the guidance shown in the left sidebar for your whole team.</p>

          <div className="field invite-grid">
            <label htmlFor="quick-tip-text">Tip text</label>
            <textarea
              id="quick-tip-text"
              rows={3}
              value={quickTipText}
              maxLength={QUICK_TIP_MAX_LENGTH}
              onChange={(event) => {
                setQuickTipMessage(null);
                setQuickTipText(event.target.value);
              }}
              placeholder="Share a daily coordination tip for caregivers."
              disabled={loading || savingQuickTip}
            />
            <p className="save-note" aria-live="polite">
              {quickTipCharacterCount}/{QUICK_TIP_MAX_LENGTH} characters
            </p>
          </div>

          <div className="actions-row">
            <button className="ghost-btn" type="button" onClick={handleSaveQuickTip} disabled={loading || savingQuickTip || !quickTipDirty}>
              {savingQuickTip ? "Saving..." : "Save Quick Tip"}
            </button>
          </div>

          {quickTipDirty && <p className="save-note">You have unsaved quick tip changes.</p>}
          {quickTipMessage && <p className="save-note">{quickTipMessage}</p>}
        </article>

        <article className="card span-12">
          <h3>Invite Caregiver</h3>
          <p>Configure who can support routines, tasks, and updates.</p>
          <div className="form-grid invite-grid">
            <div className="field">
              <label htmlFor="caregiver-name">Full name</label>
              <input
                id="caregiver-name"
                value={inviteForm.name}
                onChange={(event) => setInviteForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Jordan Lee"
              />
            </div>

            <div className="field">
              <label htmlFor="caregiver-email">Email</label>
              <input
                id="caregiver-email"
                type="email"
                value={inviteForm.email}
                onChange={(event) => setInviteForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="jordan@example.com"
              />
            </div>

            <div className="field">
              <label htmlFor="caregiver-relationship">Relationship</label>
              <select
                id="caregiver-relationship"
                value={inviteForm.relationship}
                onChange={(event) =>
                  setInviteForm((current) => ({ ...current, relationship: event.target.value }))
                }
              >
                <option>Caregiver</option>
                <option>Family</option>
                <option>Nanny</option>
                <option>Grandparent</option>
                <option>Other</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="caregiver-access">Access level</label>
              <select
                id="caregiver-access"
                value={inviteForm.access}
                onChange={(event) =>
                  setInviteForm((current) => ({
                    ...current,
                    access: event.target.value as CaregiverAccess
                  }))
                }
              >
                <option value="Admin">Admin</option>
                <option value="Scheduler">Scheduler</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
          </div>

          <div className="actions-row">
            <button 
              className="accent-btn" 
              type="button" 
              onClick={handleInvite}
              disabled={submitting}
            >
              {submitting ? "Sending..." : "Send Invite"}
            </button>
            <span className="status-pill ready">{pendingCount} pending</span>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading ? (
            <div className="list-item">Loading invites...</div>
          ) : (
            <>
              <div className="list">
                {invites.map((invite) => (
                  <div className="list-item" key={invite.id}>
                    <span>
                      {invite.name} · {invite.email}
                    </span>
                    <div className="invite-actions">
                      <span className={`status-pill ${invite.status === "Accepted" ? "done" : "due"}`}>
                        {invite.status} · {invite.access}
                      </span>
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => handleInviteAction(invite.id, "accept")}
                        disabled={inviteActionId === invite.id || invite.status === "Accepted"}
                      >
                        {invite.status === "Accepted" ? "Accepted" : inviteActionId === invite.id ? "Working..." : "Accept"}
                      </button>
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => handleInviteAction(invite.id, "reinvite")}
                        disabled={inviteActionId === invite.id}
                      >
                        Re-invite
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {invites.length === 0 && (
                <div className="list-item">
                  No invites yet. Send one above to get started.
                </div>
              )}
            </>
          )}

          <h3 className="subsection-title">Active Care Team</h3>
          <div className="list">
            {teamMembers.map((caregiver) => (
              <div className="list-item" key={caregiver.id}>
                <span>
                  {caregiver.name} · {caregiver.relationship} · {caregiver.coverage}
                </span>
                <div className="team-actions">
                  <select
                    aria-label={`Access level for ${caregiver.name}`}
                    value={caregiver.access}
                    onChange={(event) => handleUpdateTeamAccess(caregiver.id, event.target.value as CaregiverAccess)}
                    disabled={editingMemberId === caregiver.id || removingMemberId === caregiver.id}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Scheduler">Scheduler</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => handleReinviteTeamMember(caregiver)}
                    disabled={reinvitingMemberId === caregiver.id}
                  >
                    {reinvitingMemberId === caregiver.id ? "Re-inviting..." : "Re-invite"}
                  </button>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => handleRemoveTeamMember(caregiver.id)}
                    disabled={removingMemberId === caregiver.id}
                  >
                    {removingMemberId === caregiver.id ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            ))}

            {teamMembers.length === 0 && <div className="list-item">No active caregivers in your team yet.</div>}
          </div>
        </article>
      </section>

      {billingDrawerOpen && (
        <div className="drawer-overlay" role="presentation" onClick={() => setBillingDrawerOpen(false)}>
          <aside className="billing-drawer" role="dialog" aria-label="Billing history" onClick={(event) => event.stopPropagation()}>
            <div className="billing-drawer-head">
              <h3>Billing History</h3>
              <button className="ghost-btn" type="button" onClick={() => setBillingDrawerOpen(false)}>
                Close
              </button>
            </div>

            <div className="billing-filters">
              <div className="field">
                <label htmlFor="invoice-status-filter">Status</label>
                <select
                  id="invoice-status-filter"
                  value={invoiceStatusFilter}
                  onChange={(event) => setInvoiceStatusFilter(event.target.value as InvoiceStatusFilter)}
                >
                  <option value="All">All</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="invoice-from">From</label>
                <input
                  id="invoice-from"
                  type="date"
                  value={invoiceDateFrom}
                  onChange={(event) => setInvoiceDateFrom(event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="invoice-to">To</label>
                <input
                  id="invoice-to"
                  type="date"
                  value={invoiceDateTo}
                  onChange={(event) => setInvoiceDateTo(event.target.value)}
                />
              </div>
            </div>

            <div className="list">
              {filteredInvoices.map((invoice) => (
                <div className="list-item" key={invoice.id}>
                  <div>
                    <strong>{invoice.invoiceNumber}</strong>
                    <p>{invoice.description}</p>
                    <p>{invoice.date}</p>
                    <a
                      className="invoice-download-link"
                      href={`/mock-pdf/${invoice.invoiceNumber}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download PDF (mock)
                    </a>
                  </div>
                  <div className="invoice-meta">
                    <strong>{invoice.amount}</strong>
                    <span className={`status-pill ${invoice.status === "Paid" ? "done" : "due"}`}>{invoice.status}</span>
                  </div>
                </div>
              ))}

              {filteredInvoices.length === 0 && <div className="list-item">No invoices match this filter.</div>}
            </div>
          </aside>
        </div>
      )}
    </AppShell>
  );
}

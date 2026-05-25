"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";

type OnboardingFormState = {
  familyName: string;
  role: "parent" | "caregiver" | "support";
  childrenCount: "2" | "3" | "4";
  timezone: string;
  goals: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState<OnboardingFormState>({
    familyName: "",
    role: "parent",
    childrenCount: "3",
    timezone: "",
    goals: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isContinuing, setIsContinuing] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateForm = <K extends keyof OnboardingFormState>(key: K, value: OnboardingFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setHasPendingChanges(true);
  };

  const formatSavedTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  };

  const persistOnboarding = async (payload: OnboardingFormState) => {
    const response = await fetch("/api/onboarding", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Failed to save onboarding details");
    }
  };

  useEffect(() => {
    const loadOnboarding = async () => {
      try {
        const response = await fetch("/api/onboarding");
        if (!response.ok) {
          throw new Error("Failed to load onboarding details");
        }

        const payload = await response.json();
        if (payload?.data) {
          setForm(payload.data);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load onboarding details");
      } finally {
        setHasLoadedInitial(true);
        setIsLoading(false);
      }
    };

    loadOnboarding();
  }, []);

  useEffect(() => {
    if (!hasLoadedInitial || !hasPendingChanges || !form.familyName.trim()) {
      return;
    }

    const autosaveTimer = setTimeout(async () => {
      try {
        setIsAutoSaving(true);
        setError(null);
        await persistOnboarding(form);
        setHasPendingChanges(false);
        setLastSavedAt(formatSavedTime(new Date()));
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Autosave failed");
      } finally {
        setIsAutoSaving(false);
      }
    }, 3000);

    return () => clearTimeout(autosaveTimer);
  }, [form, hasLoadedInitial, hasPendingChanges]);

  const handleSaveAndContinue = async () => {
    if (!form.familyName.trim()) {
      setError("Family Name is required before continuing.");
      return;
    }

    try {
      setIsContinuing(true);
      setError(null);

      await persistOnboarding(form);
      setHasPendingChanges(false);
      setLastSavedAt(formatSavedTime(new Date()));

      router.push("/dashboard");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save onboarding details");
    } finally {
      setIsContinuing(false);
    }
  };

  return (
    <AppShell title="Onboarding" subtitle="Get set up in 5 minutes.">
      <section className="card span-12">
        <h3>Family Setup</h3>
        <p>Tell us about your home so we can personalize your workspace.</p>
        <form className="form-grid" style={{ marginTop: "1rem" }}>
          <div className="field">
            <label htmlFor="family-name">Family Name</label>
            <input
              id="family-name"
              name="family-name"
              placeholder="The Smith Family"
              value={form.familyName}
              onChange={(event) => updateForm("familyName", event.target.value)}
              disabled={isLoading || isContinuing}
            />
          </div>

          <div className="field">
            <label htmlFor="role">Your Role</label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={(event) => updateForm("role", event.target.value as OnboardingFormState["role"])}
              disabled={isLoading || isContinuing}
            >
              <option value="parent">Parent</option>
              <option value="caregiver">Caregiver</option>
              <option value="support">Support Circle Member</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="children-count">Number of Children</label>
            <select
              id="children-count"
              name="children-count"
              value={form.childrenCount}
              onChange={(event) => updateForm("childrenCount", event.target.value as OnboardingFormState["childrenCount"])}
              disabled={isLoading || isContinuing}
            >
              <option value="2">2 (Twins)</option>
              <option value="3">3 (Triplets)</option>
              <option value="4">4+</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="timezone">Timezone</label>
            <input
              id="timezone"
              name="timezone"
              placeholder="America/New_York"
              value={form.timezone}
              onChange={(event) => updateForm("timezone", event.target.value)}
              disabled={isLoading || isContinuing}
            />
          </div>

          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="goals">Top Goals</label>
            <textarea
              id="goals"
              name="goals"
              rows={4}
              placeholder="Example: smoother bedtime routine, fewer handoff mistakes, shared shopping plan"
              value={form.goals}
              onChange={(event) => updateForm("goals", event.target.value)}
              disabled={isLoading || isContinuing}
            />
          </div>

          {error && (
            <div className="error-message" style={{ gridColumn: "1 / -1" }}>
              {error}
            </div>
          )}

          <div style={{ gridColumn: "1 / -1" }}>
            <button className="accent-btn" type="button" onClick={handleSaveAndContinue} disabled={isLoading || isContinuing}>
              {isContinuing ? "Saving..." : "Save and Continue"}
            </button>
            <p className="save-note">
              {isAutoSaving ? "Autosaving..." : lastSavedAt ? `Saved at ${lastSavedAt}` : ""}
            </p>
          </div>
        </form>
      </section>
    </AppShell>
  );
}

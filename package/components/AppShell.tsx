"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/settings", label: "Settings" }
];

type AppShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const [quickTip, setQuickTip] = useState("Batch similar tasks for each child to reduce context switching.");

  useEffect(() => {
    const loadQuickTip = async () => {
      try {
        const response = await fetch("/api/quick-tip");
        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        if (payload?.quickTip?.text) {
          setQuickTip(payload.quickTip.text);
        }
      } catch {
        // Keep default tip if request fails.
      }
    };

    loadQuickTip();
  }, []);

  useEffect(() => {
    const onQuickTipUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ text: string }>).detail;
      if (detail?.text) {
        setQuickTip(detail.text);
      }
    };

    window.addEventListener("quick-tip-updated", onQuickTipUpdated);
    return () => window.removeEventListener("quick-tip-updated", onQuickTipUpdated);
  }, []);

  return (
    <div className="shell-layout">
      <aside className="sidebar">
        <div className="logo-block">
          <p className="logo-kicker">Surviving My Multiples</p>
          <h1>NestBoard</h1>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="sidebar-link">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-tip">
          <strong>Quick tip</strong>
          <p>{quickTip}</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <div className="topbar-actions">
            <button className="ghost-btn" type="button">
              Invite Caregiver
            </button>
            <button className="accent-btn" type="button">
              Notifications
              <span className="badge">3</span>
            </button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

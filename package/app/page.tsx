import Link from "next/link";
import Image from "next/image";
import { household, notifications } from "@/lib/mock-data";

export default function Home() {
  return (
    <main className="container landing-root">
      <section className="hero landing-hero">
        <div className="hero-copy-block">
          <p className="logo-kicker landing-kicker">SurvivingMyMultiples</p>
          <h1 className="hero-title">Premium care coordination for families raising multiples.</h1>
          <p>
            Keep routines calm, handoffs clear, and every caregiver aligned with an intentionally simple family-care
            experience.
          </p>
          <div className="actions-row landing-actions landing-cta-row">
            <Link href="/dashboard" className="cta-btn landing-primary-btn">
              Open Family Dashboard
            </Link>
            <Link href="/onboarding" className="ghost-btn landing-secondary-btn">
              Start Family Setup
            </Link>
          </div>

          <div className="landing-stats-row" aria-label="Family dashboard highlights">
            <article className="landing-stat-card">
              <strong>{household.children.length}</strong>
              <span>Children profiles</span>
            </article>
            <article className="landing-stat-card">
              <strong>{household.membersOnline}</strong>
              <span>Caregivers online</span>
            </article>
            <article className="landing-stat-card">
              <strong>24/7</strong>
              <span>Shared visibility</span>
            </article>
          </div>
        </div>

        <div className="hero-visuals">
          <article className="hero-photo-frame">
            <Image
              src="/images/family-multiples-hero.svg"
              alt="Parents and family members lovingly engaging with multiple babies in a caring home setting"
              width={1200}
              height={760}
              priority
            />
          </article>
        </div>
      </section>

      <section className="landing-story-grid">
        <article className="card span-6 landing-soft-card">
          <h3>Care Circle Snapshot</h3>
          <p>{household.familyName} is active with coordinated updates across your support team.</p>
          <div className="list">
            {notifications.slice(0, 3).map((note) => (
              <div key={note} className="list-item">
                <span>{note}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card span-6 landing-values landing-soft-card">
          <h3>Designed for Family Engagement</h3>
          <p>A minimalist interface that keeps attention on babies, routines, and meaningful support moments.</p>
          <div className="list">
            <div className="list-item">
              <span>Calm, family-friendly color system</span>
            </div>
            <div className="list-item">
              <span>Sleep, feeding, and diaper care in one rhythm</span>
            </div>
            <div className="list-item">
              <span>Shared engagement for parents and family helpers</span>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

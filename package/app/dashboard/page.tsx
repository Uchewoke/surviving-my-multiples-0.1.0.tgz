import { AppShell } from "@/components/AppShell";
import { SupportTaskQueueCard } from "@/components/SupportTaskQueueCard";
import { household, insights, notifications, schedules } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <AppShell title="Family Dashboard" subtitle="A clear view of your day across all little ones.">
      <section className="dashboard-grid">
        <article className="card span-4">
          <h3>Sleep Average</h3>
          <p>Last 7 days across all children</p>
          <div className="metric">{insights.sleepHoursAvg} hrs</div>
        </article>

        <article className="card span-4">
          <h3>Feeding Completion</h3>
          <p>Completed feeding tasks today</p>
          <div className="metric">{insights.feedingCompletion}%</div>
        </article>

        <article className="card span-4">
          <h3>Monthly Costs</h3>
          <p>Formula, diapers, supplies</p>
          <div className="metric">${insights.monthlyCosts}</div>
        </article>

        <article className="card span-8">
          <h3>Today&apos;s Coordination Plan</h3>
          <p>Who is doing what, and when</p>
          <div className="list">
            {schedules.map((item) => (
              <div key={item.id} className="list-item">
                <div>
                  <strong>{item.time}</strong> - {item.title}
                  <p>Assigned to {item.assignedTo}</p>
                </div>
                <span className={`status-pill ${item.status}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card span-4">
          <h3>Children Profiles</h3>
          <p>Personalized insights by child</p>
          <div className="list">
            {household.children.map((child) => (
              <div key={child.id} className="list-item">
                <span>
                  <strong>{child.name}</strong>
                  <p>
                    {child.ageMonths} months - {child.personality}
                  </p>
                </span>
              </div>
            ))}
          </div>
        </article>

        <SupportTaskQueueCard />

        <article className="card span-6">
          <h3>Notification Center</h3>
          <p>Recent activity and reminders</p>
          <div className="list">
            {notifications.map((note) => (
              <div key={note} className="list-item">
                <span>{note}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}

"use client";

import { useMemo, useState } from "react";

type TaskStatus = "ready" | "due" | "done";
type TaskType = "Sleep time" | "Feeding time" | "Diaper change";
type DiaperDetail = "With urine" | "With feaces" | "Without urine or feaces";

type QueueTask = {
  id: string;
  label: string;
  status: TaskStatus;
};

const DIAPER_OPTIONS: DiaperDetail[] = ["With urine", "With feaces", "Without urine or feaces"];

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  ready: "due",
  due: "done",
  done: "ready"
};

export function SupportTaskQueueCard() {
  const [taskType, setTaskType] = useState<TaskType>("Sleep time");
  const [taskTime, setTaskTime] = useState("08:00");
  const [diaperDetail, setDiaperDetail] = useState<DiaperDetail>("With urine");
  const [tasks, setTasks] = useState<QueueTask[]>([
    { id: "q1", label: "Sleep time - 08:00", status: "ready" },
    { id: "q2", label: "Feeding time - 10:30", status: "due" },
    { id: "q3", label: "Diaper change - With urine - 11:15", status: "done" }
  ]);

  const openTasks = useMemo(() => tasks.filter((task) => task.status !== "done").length, [tasks]);

  const taskLabel = taskType === "Diaper change" ? `${taskType} - ${diaperDetail} - ${taskTime}` : `${taskType} - ${taskTime}`;

  const addTaskToQueue = () => {
    setTasks((current) => [
      {
        id: `q-${Date.now()}`,
        label: taskLabel,
        status: "ready"
      },
      ...current
    ]);
  };

  const cycleStatus = (id: string) => {
    setTasks((current) =>
      current.map((task) => task.id === id ? { ...task, status: STATUS_CYCLE[task.status] } : task)
    );
  };

  const removeTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  return (
    <article className="card span-6">
      <h3>Support Task Queue</h3>
      <p>{openTasks} open tasks for your support circle</p>

      <div className="form-grid invite-grid">
        <div className="field">
          <label htmlFor="support-task-type">Task type</label>
          <select id="support-task-type" value={taskType} onChange={(event) => setTaskType(event.target.value as TaskType)}>
            <option value="Sleep time">Sleep time</option>
            <option value="Feeding time">Feeding time</option>
            <option value="Diaper change">Diaper change</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="support-task-time">Time</label>
          <input id="support-task-time" type="time" value={taskTime} onChange={(event) => setTaskTime(event.target.value)} />
        </div>

        {taskType === "Diaper change" && (
          <div className="field span-2-field">
            <label htmlFor="diaper-detail">Diaper detail</label>
            <select id="diaper-detail" value={diaperDetail} onChange={(event) => setDiaperDetail(event.target.value as DiaperDetail)}>
              {DIAPER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="actions-row">
        <button className="accent-btn" type="button" onClick={addTaskToQueue}>
          Add to Queue
        </button>
      </div>

      <div className="list">
        {tasks.map((task) => (
          <div key={task.id} className="list-item">
            <span>{task.label}</span>
            <div className="invite-actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => cycleStatus(task.id)}
                aria-label={`Advance status of ${task.label}`}
              >
                <span className={`status-pill ${task.status}`}>{task.status}</span>
              </button>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => removeTask(task.id)}
                aria-label={`Remove ${task.label}`}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="list-item">No tasks in queue. Add one above.</div>
        )}
      </div>
    </article>
  );
}
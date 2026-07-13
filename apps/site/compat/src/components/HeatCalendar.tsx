import "react-activity-calendar/tooltips.css";
import React from "react";
import { ActivityCalendar, type Activity } from "react-activity-calendar";

interface HistoryEntry {
  date: string;
  status: string;
}

interface Category {
  key: string;
  label: string;
}

interface Row {
  name: string;
  category: string;
}

interface HeatCalendarProps {
  history: Record<string, HistoryEntry[]>;
  categories: Category[];
  rows: Row[];
}

const STATUS_LEVEL = {
  pass: 3,
  partial: 2,
  fail: 1,
  unknown: 0,
} as const;

const THEME = {
  light: ["#27272a", "#ef4444", "#f59e0b", "#10b981"],
  dark: ["#27272a", "#ef4444", "#f59e0b", "#10b981"],
};

function toActivity(entry: HistoryEntry): Activity {
  const level = STATUS_LEVEL[entry.status as keyof typeof STATUS_LEVEL] ?? 0;
  return {
    date: entry.date,
    count: level === 0 ? 0 : 1,
    level,
  };
}

export function HeatCalendar({ history, categories, rows }: HeatCalendarProps) {
  const grouped = categories.map((cat) => ({
    ...cat,
    rows: rows.filter((r) => r.category === cat.key),
  }));

  return (
    <div className="heat-calendar">
      {grouped.map((group) => (
        <section key={group.key} className="heat-calendar-category" data-category={group.key}>
          <h2 className="heat-calendar-heading">{group.label}</h2>
          <div className="heat-calendar-grid">
            {group.rows.map((row) => {
              const entries = history[row.name] ?? [];
              const data = entries.map(toActivity);
              return (
                <div key={row.name} className="heat-calendar-package" data-name={row.name}>
                  <h3 className="heat-calendar-package-name">{row.name}</h3>
                  <ActivityCalendar
                    data={data}
                    theme={THEME}
                    minLevel={0}
                    maxLevel={3}
                    blockSize={12}
                    blockMargin={2}
                    blockRadius={2}
                    fontSize={12}
                    showColorLegend={false}
                    showMonthLabels={false}
                    showTotalCount={false}
                    showWeekdayLabels={false}
                  />
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

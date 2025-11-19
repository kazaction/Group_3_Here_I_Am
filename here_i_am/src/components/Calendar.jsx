// Calendar.jsx
import React, { useState, useMemo } from "react";
import { LuCalendar, LuChevronLeft, LuChevronRight } from "react-icons/lu";

// Helper: turn Date -> "YYYY-MM-DD"
function formatDateKey(date) {
  if (!(date instanceof Date)) date = new Date(date);
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Calendar({
  events = [],              // [{ id, date: "YYYY-MM-DD", ... }]
  selectedDate,            // "YYYY-MM-DD" (optional controlled)
  onDateSelect,            // (dateKey: "YYYY-MM-DD") => void
}) {
  // internal selected state, used if parent doesn't control selection
  const [internalSelected, setInternalSelected] = useState(
    selectedDate || formatDateKey(new Date())
  );

  const effectiveSelected = selectedDate || internalSelected;

  // Which month is currently visible
  const [visibleMonth, setVisibleMonth] = useState(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  });

  // Map events by date for quick lookup
  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      if (!e.date) return;
      const key = e.date.slice(0, 10); // assume "YYYY-MM-DD" or ISO
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  // Derived info for the month grid
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth(); // 0–11

  const firstOfMonth = new Date(year, month, 1);
  const firstDayOfWeek = firstOfMonth.getDay(); // 0–6 (Sun–Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // We’ll render a simple 6x7 grid (up to 42 cells)
  const cells = useMemo(() => {
    const arr = [];

    // Days from previous month to pad the grid
    const prevMonthDays = firstDayOfWeek; // number of leading blanks
    const prevMonthDate = new Date(year, month, 0).getDate(); // last day of previous month

    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const dayNum = prevMonthDate - i;
      const dateObj = new Date(year, month - 1, dayNum);
      arr.push({ date: dateObj, inCurrentMonth: false });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      arr.push({ date: dateObj, inCurrentMonth: true });
    }

    // Fill the rest with next month days
    while (arr.length < 42) {
      const last = arr[arr.length - 1].date;
      const next = new Date(last);
      next.setDate(last.getDate() + 1);
      arr.push({ date: next, inCurrentMonth: false });
    }

    return arr;
  }, [year, month, firstDayOfWeek, daysInMonth]);

  const todayKey = formatDateKey(new Date());

  const handlePrevMonth = () => {
    setVisibleMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setVisibleMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const handleDayClick = (date) => {
    const key = formatDateKey(date);
    setInternalSelected(key);
    if (onDateSelect) onDateSelect(key);
  };

  const legend = [
    { color: "var(--accent)", label: "Selected" },
    { color: "var(--accent-2)", label: "Today" },
    { color: "var(--muted)", label: "Events" },
  ];

  const monthLabel = visibleMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="card">
      <div className="card-head">
        <h2>Calendar</h2>
        <div className="card-actions">
          <button
            type="button"
            className="icon-btn"
            aria-label="Previous month"
            onClick={handlePrevMonth}
          >
            <LuChevronLeft />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="Next month"
            onClick={handleNextMonth}
          >
            <LuChevronRight />
          </button>
          <span className="calendar-month-label">
            <LuCalendar size={16} />
            <span>{monthLabel}</span>
          </span>
        </div>
      </div>

      <div className="calendar-body">
        {/* Weekday header */}
        <div className="calendar-row calendar-weekdays">
          {WEEKDAYS.map((day) => (
            <div key={day} className="calendar-cell calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="calendar-grid">
          {cells.map(({ date, inCurrentMonth }) => {
            const key = formatDateKey(date);
            const isToday = key === todayKey;
            const isSelected = key === effectiveSelected;
            const hasEvents = !!eventsByDate[key];

            const cellClasses = [
              "calendar-cell",
              "calendar-day",
              !inCurrentMonth && "calendar-day--outside",
              isToday && "calendar-day--today",
              isSelected && "calendar-day--selected",
              hasEvents && "calendar-day--has-events",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={key}
                type="button"
                className={cellClasses}
                onClick={() => handleDayClick(date)}
              >
                <span className="calendar-day-number">{date.getDate()}</span>
                {hasEvents && <span className="calendar-day-dot" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="legend">
        {legend.map((l) => (
          <div key={l.label} className="legend-item">
            <span className="dot" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;
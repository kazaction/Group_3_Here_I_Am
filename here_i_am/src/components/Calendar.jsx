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
  events = [],
  selectedDate,             // ✅ NEW: selected date comes from parent
  onDateSelect,             // ✅ NEW: callback to tell parent which day was clicked
}) {
  // ✅ NEW: internal fallback selected date (used if parent doesn't control it)
  const [internalSelected, setInternalSelected] = useState(
    selectedDate || formatDateKey(new Date())
  );

  // ✅ NEW: this is the date we consider "selected" in the UI
  const effectiveSelected = selectedDate || internalSelected;

  // visible month
  const [visibleMonth, setVisibleMonth] = useState(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  });

  // Map events by date for quick lookup
  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      if (!e.date) return;
      const key = e.date.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const firstDayOfWeek = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = useMemo(() => {
    const arr = [];

    const prevMonthDays = firstDayOfWeek;
    const prevMonthDate = new Date(year, month, 0).getDate();

    // leading days (previous month)
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const dayNum = prevMonthDate - i;
      const dateObj = new Date(year, month - 1, dayNum);
      arr.push({ date: dateObj, inCurrentMonth: false });
    }

    // current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      arr.push({ date: dateObj, inCurrentMonth: true });
    }

    // trailing days (next month)
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

  // ✅ NEW: when a day is clicked, update internal selection AND notify parent
  const handleDayClick = (date) => {
    const key = formatDateKey(date);
    setInternalSelected(key);     // internal
    if (onDateSelect) onDateSelect(key);  // 🔴 send selected date to parent
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

            // ✅ UPDATED: use effectiveSelected (which can come from parent)
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
                onClick={() => handleDayClick(date)}   // ✅ UPDATED: calls new handler
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
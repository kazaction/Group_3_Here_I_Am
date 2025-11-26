
import React, { useMemo } from "react";
import AddEvent from "./addEvent";
import { LuClock3, LuMapPin, LuPlus } from "react-icons/lu";

// (optional) helper, reused if you want
function formatDateKey(date) {
  if (!(date instanceof Date)) date = new Date(date);
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function EventList({
  selectedDate,          // ✅ NEW: this comes from the parent (same value Calendar sends)
  events = [],
  onAddEventClick,
}) {
  // ✅ NEW: use selectedDate to build a pretty header
  const dateObj = selectedDate ? new Date(selectedDate) : new Date();

  const headerLabel = dateObj.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const selectedKey = selectedDate || formatDateKey(dateObj); // small safety

  // ✅ NEW: filter only the events that belong to the selected day
  const eventsForDay = useMemo(
    () =>
      events.filter(
        (e) => e.date && e.date.slice(0, 10) === selectedKey
      ),
    [events, selectedKey]
  );

  return (
    <div className="card">
      <div className="card-head">
        {/* ✅ UPDATED: the title now reflects the selected date */}
        <h2>{headerLabel}</h2>

        <button
          type="button"
          className="pill-btn"
          onClick={onAddEventClick}
        >
          <LuPlus size={16} />
          <span>Add Event</span>
        </button>
      </div>

      <div className="event-list">
        {eventsForDay.length === 0 && (
          // ✅ NEW: message when no events on that day
          <div className="event-empty">
            No events for this day yet.
          </div>
        )}

        {eventsForDay.map((e) => (
          <div key={e.id} className="event-item">
            <div className="event-icon">
              <div className="icon-circle" />
            </div>
            <div className="event-content">
              <div className="event-title">{e.title}</div>
              <div className="event-meta">
                {e.time && (
                  <span className="meta">
                    <LuClock3 size={14} /> {e.time}
                  </span>
                )}
                {e.location && (
                  <span className="meta">
                    <LuMapPin size={14} /> {e.location}
                  </span>
                )}
              </div>
              {e.note && <div className="event-note">{e.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventList;
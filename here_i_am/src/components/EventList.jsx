
import React, { useMemo } from "react";
import AddEvent from "./addEvent";
import { LuClock3, LuMapPin, LuPlus } from "react-icons/lu";
import {FiFile} from "react-icons/fi"

// to check if an event is in the past 
  function isEventInPast(event) {
  if (!event.date) return false;
  const dateTimeStr = event.date; // e.g. "2025-11-25T10:00:00"
  const eventTime = new Date(dateTimeStr);
  const now = new Date();
  return eventTime < now;
}

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
  onDeleteEvent,
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
   const eventsForDay = events; //useMemo(
  //   () =>
  //     events.filter(
  //       (e) => e.date && e.date.slice(0, 10) === selectedKey
  //     ),
  //   [events, selectedKey]
  // );




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
          <LuPlus size={10} />
          <span> Add Event</span>
        </button>
      </div>

      <div className="event-list">
        {eventsForDay.length === 0 && (
          
          <div className="event-empty">
            No events for this day yet.
          </div>
        )}

       

    
          
      {eventsForDay.map((e) => {
              const past = isEventInPast(e);

              return (
                <div
                  key={e.id}
                  className={`event-item ${past ? "event-item-past" : "event-item-future"}`}
                >
                    
                  <div className="event-icon">
                    
                    {/* <div
                      className={`icon-circle ${
                        past ? "icon-circle-past" : "icon-circle-future"
                      }`}
                    /> */}
                  </div>

                 

                  <div className="event-content">
                    
                    <div className="event-title">{e.title}</div>
                    <div className="event-meta">
                      {e.time && (
                        <span className="meta">
                          <LuClock3 size={14} /> {e.time}
                        </span>
                      )}
                      {e.hasFile && (
                        <span className="meta file-meta">
                          <FiFile size={14} />
                        </span>
                      )}
                    </div>
                    {e.note && <div className="event-note">{e.note}</div>}

                    <div className="event-importance">
                          Importance: {e.importance === "high"
                            ? "High"
                            : e.importance === "low"
                            ? "Low"
                            : "Normal"}
                    </div>

                    <div className="file-icon">

                    </div>
                    
                    {/* adding delete button */}

                     {/* small delete button on the right */}

                        {onDeleteEvent && (
                          <button
                            type="button"
                            className="event-delete-btn"
                            onClick={() => onDeleteEvent(e.id)}
                          >
                            ✕
                          </button>
                        )}

                    {/* adding delete button */}

                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}

export default EventList;
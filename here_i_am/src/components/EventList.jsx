
import React from "react";
import { LuClock3, LuMapPin, LuPlus } from "react-icons/lu";

const sample = [
  { id: 1, title: "Team Meeting", time: "9:00 AM – 10:00 AM", location: "Conference Room A", note: "Weekly project status update" },
  { id: 2, title: "Lunch Break",  time: "12:00 PM – 1:00 PM", location: "", note: "" },
  { id: 3, title: "Client Call",  time: "2:30 PM – 3:30 PM",  location: "", note: "Discuss new requirements" },
];

function EventList() {
  return (
    <div className="card">
      <div className="card-head">
        <h2>Friday, May 16, 2025</h2>
        <button className="pill-btn">
          <LuPlus size={16} />
          <span>Add Event</span>
        </button>
      </div>

      <div className="event-list">
        {sample.map((e) => (
          <div key={e.id} className="event-item">
            <div className="event-index">{e.id}</div>
            <div className="event-body">
              <div className="event-title">{e.title}</div>
              <div className="event-meta">
                <span className="meta"><LuClock3 size={14} /> {e.time}</span>
                {e.location && <span className="meta"><LuMapPin size={14} /> {e.location}</span>}
              </div>
              {e.note && <div className="event-note">{e.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventList
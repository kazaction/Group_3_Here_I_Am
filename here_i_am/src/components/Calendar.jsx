import React from "react";
import { LuCalendar, LuChevronLeft, LuChevronRight } from "react-icons/lu";

function Calendar() {
  const legend = [
    { color: "var(--accent)",  label: "Selected" },
    { color: "var(--accent-2)", label: "Today" },
    { color: "var(--muted)",   label: "Events" },
  ];

  return (
    <div className="card">
      <div className="card-head">
        <h2>Calendar</h2>
        <div className="card-actions">
          <button className="icon-btn"><LuCalendar size={16} /></button>
          <button className="icon-btn"><LuChevronLeft size={16} /></button>
          <button className="icon-btn"><LuChevronRight size={16} /></button>
        </div>
      </div>

      <div className="mini-calendar">
        <div className="mini-cal-header">
          <button className="text-btn">&lt;</button>
          <div className="month">May 2025</div>
          <button className="text-btn">&gt;</button>
        </div>

        <div className="mini-cal-weekdays">Su Mo Tu We Th Fr Sa</div>
        
        {/* error here make it look correct  */}


        <div className="mini-cal-grid">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className={`mini-cal-cell ${i === 19 ? "is-selected": ""}`}>
              {i < 4 ? "" : i - 3}
            </div>
          ))}
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

export default Calendar
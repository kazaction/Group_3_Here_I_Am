// CalendarWithEvents.jsx  (or whatever name you use)
import React, { useState } from "react";
import Calendar from "./Calendar";
import EventList from "./EventList";

// helper to get today's "YYYY-MM-DD"
function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function Schedule() {
  // 👉 will be populated later from a form / backend
  const [events, setEvents] = useState([]); // ⬅️ EMPTY, no example data

  const [selectedDate, setSelectedDate] = useState(todayKey());

  const handleAddEventClick = () => {
    // later: open modal / form and call setEvents(...)
    console.log("Open add-event form for", selectedDate);
  };

  return (
    <div className="calendar-layout">
      {/* LEFT: calendar */}
      <Calendar
        events={events}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />

      {/* RIGHT: event list */}
      <EventList
        events={events}
        selectedDate={selectedDate}
        onAddEventClick={handleAddEventClick}
      />
    </div>
  );
}

export default Schedule;
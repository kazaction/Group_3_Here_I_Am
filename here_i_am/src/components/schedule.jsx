// CalendarWithEvents.jsx  (or whatever name you use)
import React, { useState } from "react";
import Calendar from "./Calendar";
import EventList from "./EventList";
import AddEvent from "./addEvent";


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

  const [isAddOpen, setIsAddOpen] = useState(false); //controls window open and close 

  const handleAddEventClick = () => {
    setIsAddOpen(true);
  };

  const handleClosedAddEvent = () => {
    setIsAddOpen(false);
  }

  const handleSaveEvent = (data) => {
    const newEvent = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now(),
        date: selectedDate, 
        title: data.title,
        time: data.time,
        decription: data.description,
    };

    setEvents((prev)=> [...prev, newEvent]);
    setIsAddOpen(false);
  };


//   const handleAddEventClick = () => {
//     // later: open modal / form and call setEvents(...)
//     console.log("Open add-event form for", selectedDate);
//   };

  return (
    <>
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
        onAddEventClick= {() => setIsAddOpen(true)}
      />

      
    </div>

    {isAddOpen && ( <AddEvent selectedDate={selectedDate} onSave={handleSaveEvent} onClose={() => setIsAddOpen(false)}/>)}

    
    </>
  );
}

export default Schedule;
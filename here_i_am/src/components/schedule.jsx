// CalendarWithEvents.jsx  (or whatever name you use)
import React, { useState } from "react";
import Calendar from "./Calendar";
import EventList from "./EventList";
import AddEvent from "./addEvent";


// This is how we get today's date , so that today's date is displayed to the users initialy 
function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function Schedule() {
  
  const [events, setEvents] = useState([]); 

  const [selectedDate, setSelectedDate] = useState(todayKey()); //default is the today's date 

  const [isAddOpen, setIsAddOpen] = useState(false); //controls window open and close default is closed ofcourse 

  const handleAddEventClick = () => {
    setIsAddOpen(true); //updates the isAddOpen variable above to true ( show the window )
  };

  const handleClosedAddEvent = () => {
    setIsAddOpen(false); // closes the window when exiting the form used 
  }

  const handleSaveEvent = (data) => { // the data contains the variables in the onSave function title time and description
    const newEvent = { //creating a new event object so that we can use it to ouput events in the eventList 
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now(), // the crypto.randomUUID creates a unique Id but some browser dont allow it so the Date.now is our plan b 
        date: selectedDate, //since the way the form is used is in colaboration with the calendar we use the date selected in the calendar using this selectedDate variable 
        title: data.title, 
        time: data.time,  
        description: data.description, 
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
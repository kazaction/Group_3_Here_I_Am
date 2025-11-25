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
        title: data.title, // -------------\
        time: data.time,  //------------------> these variable come directly from the form 
        description: data.description, //--/
    };

    setEvents((prev)=> [...prev, newEvent]); // ...prev is the array of events previously(none when no events are dded) 
                                             // and copies all the events of the previous array to the new one (need to add some filtering so that time of events )
                                             //time of events matter in how they are displayed but thats for latter on ...
    setIsAddOpen(false); //close the pop up
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
        events={events} // all datre in the webapp , used to show the dots in the calendar 
        selectedDate={selectedDate} // the selected date --------------- > these help re-render the event list with that date 
        onDateSelect={setSelectedDate} //update to selected date ---/
      />

      {/* RIGHT: event list */}
      <EventList
        events={events} // all the events , will be needed below 
        selectedDate={selectedDate} // so it can filter that days events only and not output the entirety of the events in the webapp
        onAddEventClick= {() => setIsAddOpen(true)} // this is for the add event button ,
                                                    //  change the dfault value of it to true so the add form is displayed
      />

      
    </div>

    {isAddOpen && ( <AddEvent selectedDate={selectedDate} onSave={handleSaveEvent} onClose={() => setIsAddOpen(false)}/>)} 
      {/*this how you create popup windows in react , the variables are used to know the date for the form and close the popup*/}

    
    </>
  );
}

export default Schedule;
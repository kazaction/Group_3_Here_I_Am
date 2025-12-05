// CalendarWithEvents.jsx  (or whatever name you use)
import React, { useState, useEffect } from "react";
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

// function Schedule() {
  
//   const [events, setEvents] = useState([]); 

//   const [selectedDate, setSelectedDate] = useState(todayKey()); //default is the today's date 

//   const [isAddOpen, setIsAddOpen] = useState(false); //controls window open and close default is closed ofcourse 


 

  // const handleSaveEvent = (data) => { // the data contains the variables in the onSave function title time and description
  //   const newEvent = { //creating a new event object so that we can use it to ouput events in the eventList 
  //       id: crypto.randomUUID ? crypto.randomUUID() : Date.now(), // the crypto.randomUUID creates a unique Id but some browser dont allow it so the Date.now is our plan b 
  //       date: selectedDate, //since the way the form is used is in colaboration with the calendar we use the date selected in the calendar using this selectedDate variable 
  //       title: data.title, // -------------\
  //       time: data.time,  //------------------> these variable come directly from the form 
  //       description: data.description, //--/
  //   };

  //   setEvents((prev)=> [...prev, newEvent]); // ...prev is the array of events previously(none when no events are dded) 
  //                                            // and copies all the events of the previous array to the new one (need to add some filtering so that time of events )
  //                                            //time of events matter in how they are displayed but thats for latter on ...
  //   setIsAddOpen(false); //close the pop up
  // };


//   const handleAddEventClick = () => {
//     // later: open modal / form and call setEvents(...)
//     console.log("Open add-event form for", selectedDate);
//   };


//connect to db

// get events whenever date changes

function Schedule() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [isAddOpen, setIsAddOpen] = useState(false);

  //Load events from backend whenever the selected day changes
  useEffect(() => {
      async function fetchEventsForDay() {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          console.warn("No user in localStorage, not loading events");
          return;
        }

        let user;
        try {
          user = JSON.parse(storedUser);
        } catch (err) {
          console.error("Failed to parse stored user:", err);
          return;
        }

        const userId = user.user_id;
        if (!userId) {
          console.warn("User object has no user_id");
          return;
        }

        try {
          const res = await fetch(
            `http://localhost:3001/events?date=${selectedDate}&user_id=${userId}`
          );

          if (!res.ok) {
            console.error("Failed to fetch events:", await res.text());
            return;
          }

          const data = await res.json();

          const mapped = data.map((e) => ({
            id: e.id,
            title: e.title,
            date: e.start_time_utc,                  // full datetime string
            time: e.start_time_utc
              ? e.start_time_utc.slice(11, 16)       // "HH:MM"
              : "",
            note: e.description,
            importance: e.importance,
          }));

          setEvents(mapped);
        } catch (err) {
          console.error("Error loading events:", err);
        }
      }

      fetchEventsForDay();
    }, [selectedDate]);

 

  // Called when form is submitted
  const handleSaveEvent = async (data) => {
  // data: { title, time, description, importance, file }

    // 1️⃣ Read current user from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("You must be logged in to create an event.");
      return;
    }

    let user;
    try {
      user = JSON.parse(storedUser);
    } catch (err) {
      console.error("Failed to parse stored user:", err);
      alert("Login information is corrupted. Please log in again.");
      localStorage.removeItem("user");
      return;
    }

    const userId = user.user_id;
    if (!userId) {
      alert("Missing user id. Please log in again.");
      return;
    }

  // 2️⃣ Build FormData (NOTE: capital F in FormData)
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("time", data.time);        // 👈 use data.time from AddEvent
    formData.append("date", selectedDate);     // 👈 send the selected date
    formData.append("importance", data.importance);
    formData.append("user_id", userId);        // 👈 use userId from localStorage

    if (data.file) {
      formData.append("file", data.file);      // name must be "file" for request.files["file"]
    }

  // 3️⃣ POST to backend
  try {
      const res = await fetch("http://localhost:3001/events", {
        method: "POST",
        body: formData, 
      });

      if (!res.ok) {
        console.error("Failed to save event:", await res.text());
        alert("Could not save event.");
        return;
      }

    const saved = await res.json();

    // 4️⃣ Map to EventList shape
      const newEvent = {
        id: saved.id,
        title: saved.title,
        date: saved.start_time_utc,
        time: saved.start_time_utc
          ? saved.start_time_utc.slice(11, 16)
          : "",
        note: saved.description,
        importance: saved.importance,
      };

    setEvents((prev) => [...prev, newEvent]);
    setIsAddOpen(false);
    } catch (err) {
    console.error("Error saving event:", err);
    alert("Network error while saving event.");
  }
};

//connect to db 

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
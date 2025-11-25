// AddEvent.jsx
import React, { useState } from "react";



////////////////////////////////////////////////////////////////////
function AddEvent({ selectedDate, onSave, onClose }) {
  const [title, setTitle] = useState(""); //these store the date the user types into the form 
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("")

  const dateObj = new Date(selectedDate); //formats it to date object to so that we can use on the calendar 
  const readable = dateObj.toLocaleDateString(undefined, { // this format shte date into weekday, month dayofmonth , year 
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  //////////////////////////////////////////////////////////////////
  const handleSubmit = async (e) => { // function declaration for the e. = event our button guys 
    e.preventDefault();         // the arrow functions have bvecome a standard in react ,
                                //  previous methods were not working correctly 

                                
    const trimmedTitle = title.trim();
    const trimmedTime = time.trim();
    const trimmedDescription = description.trim();

    if (!title.trim()) return;

   

    onSave({ //On save is declared in schedule.jsx ,when save trim the spaces from starting and end points 
      title: trimmedTitle,
      time: trimmedTime,
      description: trimmedDescription,
    });

    try {
      const res = await fetch("http://localhost:3001/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          time: trimmedTime,
          description: trimmedDescription,
          date: selectedDate, // important: tell backend which day this is for
        }),
      });

      if (!res.ok) {
        console.error("Failed to save event:", await res.text());
      }
    } catch (err) {
      console.error("Error calling backend:", err);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Add Event</h2>
        <p className="modal-date">{readable}</p> {/*the constant we previously created that has the date stored*/}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Event Name</label>
            <input
              type="text"
              value={title} //input for the title of the event 
              onChange={(e) => setTitle(e.target.value)} //using the onChange function and setTitle so the user can input a title for the event
            />
          </div>

          <div className="field">
            <label>Time</label>
            <input
              id="event-time"
              type="time"   // this allows for the rolldown time chooser to be the input type                   
              value={time}
              onChange={(e) => setTime(e.target.value)} // same as previously 
            />  
          </div>

          <div className="field">
            <label htmlFor="event-description">Description</label>
            <textarea
              id="event-description"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Optional details about this event" //place holder for the description box imo makes it look better, maybe we should as some for the others as well 
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button> {/*cancel button used to exit the pop-up*/}
            <button type="submit" className="btn-primary">Save</button> {/*Save button used to save the event in the pop-up, also closes the window and sends the submited form*/}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEvent;
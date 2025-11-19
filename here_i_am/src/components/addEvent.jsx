// AddEvent.jsx
import React, { useState } from "react";

function AddEvent({ selectedDate, onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("")

  const dateObj = new Date(selectedDate);
  const readable = dateObj.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      time: time.trim(),
      description: description.trim()
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Add Event</h2>
        <p className="modal-date">{readable}</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Event Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Time</label>
            <input
              id="event-time"
              type="time"                     
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />  
          </div>

          <div className="field">
            <label htmlFor="event-description">Description</label>
            <textarea
              id="event-description"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details about this event"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEvent;
// EventList.jsx
import React, { useMemo } from "react"; 
import { LuClock3, LuMapPin, LuPlus } from "react-icons/lu"; //some icons 

//explained in schedule.jsx , basicaly how we get the date 
function formatDateKey(date) {
  if (!(date instanceof Date)) date = new Date(date);
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function EventList({
  selectedDate,   //this is used in the calendar to know the current date 
  events = [],
  onAddEventClick,
}) {
  
  const dateObj = selectedDate ? new Date(selectedDate) : new Date(); //used to create the header 

  const headerLabel = dateObj.toLocaleDateString(undefined, {     // IMPORTANT !!!: Undefined sets the users browser language 
                                                                  // we need to add them to other features as well
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const selectedKey = selectedDate || formatDateKey(dateObj); // this is a safeguard in case the date from string
                                                              // isnt correct and so it used the formatdatekey function to make it a date 

  
  const eventsForDay = useMemo( // function to view/filter the events of the date selected 
    () =>
      events.filter( //filter function to show the events of that day 
        (e) => e.date && e.date.slice(0, 10) === selectedKey //slice function removes the last ten charactes so that in case the 
                                                             // date function uses hours minutes and seconds it will ignore them 
                                                             //e.date compare the time without the 
      ),
    [events, selectedKey]
  );

  return (
    <div className="card">
      <div className="card-head">
        {/*the title now is the selected date */}
        <h2>{headerLabel}</h2>

        <button //add event button 
          type="button"
          className="pill-btn"
          onClick={onAddEventClick}
        >
          <LuPlus size={16} />
          <span>Add Event</span>
        </button>
      </div>

      <div className="event-list"> {/* this the list , there is a placeholder for when no events are placed */}
        {eventsForDay.length === 0 && (
          
          <div className="event-empty"> 
            No events for this day yet. 
          </div>
        )}

        {eventsForDay.map((e) => ( //for when there are events so that it displays the events 
          <div key={e.id} className="event-item">
            <div className="event-icon">
              <div className="icon-circle" />
            </div>
            <div className="event-content">
              <div className="event-title">{e.title}</div> {/*gets the title from the form input , this and description and time will change later , they will be grabbed from the database events table */}
              <div className="event-meta">
                {e.time && (
                  <span className="meta">
                    <LuClock3 size={14} /> {e.time}
                  </span>
                )}
                {e.location && (
                  <span className="meta">
                    <LuMapPin size={14} /> {e.location} {/** we might ad location as well later on but for now the location isnt displaeyed  */}
                  </span>
                )}
              </div>
              {e.note && <div className="event-note">{e.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventList;
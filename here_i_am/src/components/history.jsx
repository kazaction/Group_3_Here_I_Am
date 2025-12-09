import React, { useState, useEffect } from "react";
import "../css/history.css";

const History = () => {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");

    const [importanceFilter, setImportanceFilter] = useState({
        high: true,
        normal: true,
        low: true,
    });

    const [dateFilter, setDateFilter] = useState("");
    const [startTimeFilter, setStartTimeFilter] = useState("");
    const [endTimeFilter, setEndTimeFilter] = useState("");

    const fetchEvents = async () => {
        try {
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
        const res = await fetch(`http://localhost:3001/history?user_id=${userId}`);
        if (!res.ok) {
            console.error("Failed fetching events:", await res.text());
            return;
        }

        const data = await res.json();
        console.log(data)
        setEvents(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    function splitDateTime(utcString) {
        const d = new Date(utcString);
        const date = d.toISOString().slice(0, 10);
        const time = d.toISOString().slice(11, 16);
        return { date, time };
    }


    // ----------- Client-side filtering --------------
    const filteredEvents = events.filter((event) => {
        const { date, time: startTime } = splitDateTime(event.start_time_utc);
        const { time: endTime } = splitDateTime(event.end_time_utc);
        const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase());
        const matchesImportance = !importanceFilter.high && !importanceFilter.normal && !importanceFilter.low ? true : importanceFilter[event.importance];
        const matchesDate = dateFilter ? date === dateFilter : true;
        const matchesStart = startTimeFilter ? startTime >= startTimeFilter : true;
        const matchesEnd = endTimeFilter ? endTime <= endTimeFilter : true;
        return ( matchesSearch && matchesImportance && matchesDate && matchesStart && matchesEnd );
    }); // Toggle importance checkbox

    const handleImportanceToggle = (level) => {
        setImportanceFilter((prev) => ({
            ...prev, [level]: !prev[level],
        }));
    };

    return(
        <div className="history-wrapper">
            <aside className="card">
                <h2>Filters</h2>

                <div className="filter-section">
                    <label>Search</label>
                    <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                <div className="filter-section">
                    <label>Importance</label>
                    <div className="checkbox-row">
                        <input type="checkbox" checked={importanceFilter.high} onChange={() => handleImportanceToggle("high")} />
                        <span>High</span>
                    </div>

                    <div className="checkbox-row">
                        <input type="checkbox" checked={importanceFilter.normal} onChange={() => handleImportanceToggle("normal")} />
                        <span>Normal</span>
                    </div>

                    <div className="checkbox-row">
                        <input type="checkbox" checked={importanceFilter.low} onChange={() => handleImportanceToggle("low")} />
                        <span>Low</span>
                    </div>

                </div>

                <div className="filter-section">
                    <label>Date</label>
                    <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                </div>

                <div className="filter-section">
                    <label>Start Time</label>
                    <input type="time" value={startTimeFilter} onChange={(e) => setStartTimeFilter(e.target.value)} />
                    <label>End Time</label>
                    <input type="time" value={endTimeFilter} onChange={(e) => setEndTimeFilter(e.target.value)} />
                </div>
            </aside>

            <div className="marginrm">
                <div className="card">
                    {/* ---------------- EVENT LIST ---------------- */}
                    <main className="event-list">
                        <h1>Event History</h1>

                        {filteredEvents.length === 0 ? (
                            <p>No events found.</p>
                        ) : (
                            filteredEvents.map((event) => (
                                <div className="event-row" key={event.id}>
                                    <div className="event-title">{event.title}</div>
                                    <div>{event.importance.toUpperCase()}</div>
                                    <div>{event.date}</div>
                                    <div>Starts: {event.startTime}</div>
                                </div>
                            ))
                        )}

                    </main>
                </div>
            </div>
        </div>
    );
};

export default History;
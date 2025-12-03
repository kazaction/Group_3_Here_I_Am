import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/history.css";

const History = () => {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");

    const [importanceFilter, setImportanceFilter] = useState({
        high: true,
        medium: true,
        low: true,
    });

    const [dateFilter, setDateFilter] = useState("");
    const [startTimeFilter, setStartTimeFilter] = useState("");
    const [endTimeFilter, setEndTimeFilter] = useState("");

    const fetchEvents = async () => {
        try {
            const res = await axios.get("http://localhost:3001/history", {
            params: {
                user_id: 1
            }
            });
            setEvents(res.data);
        } catch (err) {
            console.error(err);
        }
    };


    useEffect(() => {
        const userObj = localStorage.getItem("user");
        const userId = userObj.user_id;

        if (!userId) {
            console.error("User ID missing!");
            return;
        }


        axios
        .get(`http://localhost:3001/users/${userId}/history`)
        .then((res) => setEvents(res.data))
        .catch((err) => console.error(err));
    }, []);

    // ----------- Client-side filtering --------------
    const filteredEvents = events.filter((event) => {
        const matchesSearch =
            event.title.toLowerCase().includes(search.toLowerCase());

        const matchesImportance = !importanceFilter.high && !importanceFilter.medium && !importanceFilter.low ? true : importanceFilter[event.importance];

        const matchesDate = dateFilter ? event.date === dateFilter : true;

        const matchesStart =
          startTimeFilter ? event.start_time >= startTimeFilter : true;

        const matchesEnd = endTimeFilter ? event.end_time <= endTimeFilter : true;

        return (
            matchesSearch &&
            matchesImportance &&
            matchesDate &&
            matchesStart &&
            matchesEnd
        );
    });

    // Toggle importance checkbox
    const handleImportanceToggle = (level) => {
        setImportanceFilter((prev) => ({
            ...prev,
            [level]: !prev[level],
        }));
    };


    return(
        <div className="history-wrapper">
            <aside className="card">
                <h2>Filters</h2>

                {/* Search */}
                <div className="filter-section">
                    <label>Search</label>
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Importance */}
                <div className="filter-section">
                    <label>Importance</label>

                    <div className="checkbox-row">
                        <input
                            type="checkbox"
                            checked={importanceFilter.high}
                            onChange={() => handleImportanceToggle("high")}
                        />
                        <span>High</span>
                    </div>

                    <div className="checkbox-row">
                        <input
                            type="checkbox"
                            checked={importanceFilter.medium}
                            onChange={() => handleImportanceToggle("medium")}
                        />
                        <span>Medium</span>
                    </div>

                    <div className="checkbox-row">
                        <input
                            type="checkbox"
                            checked={importanceFilter.low}
                            onChange={() => handleImportanceToggle("low")}
                            />
                        <span>Low</span>
                    </div>
                </div>


                {/* Date */}
                <div className="filter-section">
                    <label>Date</label>
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        />
                </div>

                {/* Time Range */}
                <div className="filter-section">
                    <label>Start Time</label>
                    <input
                        type="time"
                        value={startTimeFilter}
                        onChange={(e) => setStartTimeFilter(e.target.value)}
                    />

                    <label>End Time</label>
                    <input
                        type="time"
                        value={endTimeFilter}
                        onChange={(e) => setEndTimeFilter(e.target.value)}
                    />
                </div>
            </aside>

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
                                    <div>{event.start_time} → {event.end_time}</div>
                                </div>
                            )
                        )
                    )}
                </main>
            </div>
        </div>
    );
};

export default History;

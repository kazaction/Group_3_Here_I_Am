import React from "react";
import Calendar from "./Calendar.jsx";

function Schedule(){

    return(
        <main className="main">
            <header className="page-header">
                <h1>Schedule</h1>
            </header>

            <section className="content-grid">
                <Calendar/>
            </section>
        </main>
    );
}

export default Schedule
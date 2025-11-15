import React, { useState } from "react";
import "../css/cvGeneration.css";

const QUESTIONS = [
  { field: "name",         question: "What is your full name?" },
  { field: "surname",      question: "What is your surname?" },
  { field: "birthdate",    question: "What is your birthdate (DD/MM/YYYY)?" },
  { field: "degree",       question: "What degree do you have?" },
  { field: "job_count",    question: "How many jobs have you had?" },
  { field: "phone",        question: "What is your phone number?" },
  { field: "email",        question: "What is your email?" },
  { field: "picture_path", question: "Please provide a path to a picture of yourself" },
  { field: "skill_count",  question: "How many skills do you have?" },
];

const CvGeneration = () => {
  const [step, setStep] = useState(0);           // which question we are on
  const [input, setInput] = useState("");        // current input value
  const [error, setError] = useState("");        // error from backend
  const [answers, setAnswers] = useState({});    // collected data
  const [loading, setLoading] = useState(false); // optional

  const current = QUESTIONS[step];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!current) return; // no more questions

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:3001/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          field: current.field,
          value: input,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        // backend validation failed
        setError(data.error || "Unknown error");
      } else {
        // validation passed, save answer and go next
        setAnswers((prev) => ({
          ...prev,
          [current.field]: data.value,
        }));
        setInput("");
        setError("");
        setStep((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Is Flask running on port 3001?");
    } finally {
      setLoading(false);
    }
  };

  // All questions done
  if (step >= QUESTIONS.length) {
    return (
      <div className="cv-container">
        <h1>CV Generation</h1>
        <p>All questions completed. Here is your data:</p>
        <pre>{JSON.stringify(answers, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="cv-container">
      <h1>CV Generation</h1>

      <div className="text-bar">
        <form onSubmit={handleSubmit}>
          <p>{current.question}</p>

        <div className="input-row">
    <input
    placeholder="Enter your answer here"
    className="input"
    name={current.field}
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}
  />

  <button type="submit" disabled={loading} className="submit-btn">
    {loading ? "..." : "Enter"}
  </button>
</div>

{error && <p className="error">{error}</p>}

        </form>
      </div>
    </div>
  );
};

export default CvGeneration;

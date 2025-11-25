import React, { useState } from "react";
import "../css/cvGeneration.css";

const QUESTIONS = [
  { field: "name", question: "What is your first name?" },
  { field: "surname", question: "What is your surname?" },
  { field: "birthdate", question: "What is your birthdate (DD/MM/YYYY)?" },
  { field: "degree", question: "What degree do you have?" },
  { field: "job_count", question: "How many jobs have you had?" },
  { field: "phone", question: "What is your phone number?" },
  { field: "email", question: "What is your email?" },
  { field: "picture_path", question: "Please upload a picture of yourself" },
  { field: "skill_count", question: "How many skills do you have?" },
];

const CvGeneration = () => {
 
  const [step, setStep] = useState(0); 
  const [input, setInput] = useState(""); 
  const [file, setFile] = useState(null); 
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({}); 
  const [loading, setLoading] = useState(false);

  const current = QUESTIONS[step];

  const handleNextStep = async (e) => {
    e.preventDefault();
    if (!current) return;

    setLoading(true);
    setError("");

    try {
      
      if (current.field === "picture_path") {
        if (!file) {
          setError("Please choose an image first");
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("http://127.0.0.1:3001/upload-picture", {
          method: "POST",
          body: formData, 
        });

        const data = await res.json();

        if (!data.ok) {
          setError(data.error || "Upload failed");
        } else {
          setAnswers((prev) => ({
            ...prev,
            
            picture_path: `/uploads/${file.name}`,
          }));
          setFile(null);
          setError("");
          setStep((prev) => prev + 1);
        }
      } else {
        
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
          setError(data.error || "Unknown error");
        } else {
          setAnswers((prev) => ({
            ...prev,
            [current.field]: data.value,
          }));
          setInput("");
          setError("");
          setStep((prev) => prev + 1);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Is Flask running on port 3001?");
    } finally {
      setLoading(false);
    }
  };

  
  const handleDownloadCv = async () => {
    try {
      const res = await fetch("http://127.0.0.1:3001/generate-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(answers),
      });

      if (!res.ok) {
        console.error("Failed to generate CV");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cv.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  
  if (step >= QUESTIONS.length) {
    return (
      <div className="cv-container">
        <h1>CV Generation</h1>
        <p>All questions completed. You can now download your CV.</p>
        <button className="primary-btn" onClick={handleDownloadCv}>
          Download CV as PDF
        </button>
      </div>
    );
  }

  return (
    <div className="cv-container">
      <h1>CV Generation</h1>

      <div className="text-bar">
        <form onSubmit={handleNextStep}>
          <p>{current.question}</p>

          {current.field === "picture_path" ? (
            <div className="input-row">
              <input
                id="file-input"
                type="file"
                accept="image/*"
                className="file-input-hidden"
                onChange={(e) => {
                  setFile(e.target.files[0] || null);
                  setError("");
                }}
              />
              <label htmlFor="file-input" className="choose-file-btn">
                {file ? file.name : "Choose Picture"}
              </label>
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "..." : "Upload"}
              </button>
            </div>
          ) : (
            <div className="input-row">
              <input
                placeholder="Enter your answer here"
                className="input"
                name={current.field}
                type="text"
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "..." : "Enter"}
              </button>
            </div>
          )}

          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default CvGeneration;

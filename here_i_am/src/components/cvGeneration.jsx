import React, { useState } from "react";
import "../css/cvGeneration.css";




const CvGeneration = () => {

   const [form, setForm] = useState({
    name: "",
    surname: "",
    birthdate: "",
    degree: "",
    job_count: "",
    phone: "",
    email: "",
    skill_count: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
     setForm((prev) => ({
    ...prev,
    [name]: value,
  }));
};

  return (
    <div className="cv-container">
      <h1>CV Generation</h1>

      <div className="cv-layout">
        {/* LEFT SIDE – FORM */}
        <form className="cv-form">
           <label>First name </label>
           <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="First Name"
            />
          
                    {/* TODO: add your inputs here
              - first name
              - surname
              - birthdate
              - degree
              - job_count
              - phone
              - email
              - skill_count
              - picture upload
          */}
        </form>

        {/* RIGHT SIDE – PREVIEW */}
        <div className="cv-preview">
          {/* TODO: show live preview of what the CV will look like */}
        </div>
      </div>
    </div>
  );
};

export default CvGeneration;

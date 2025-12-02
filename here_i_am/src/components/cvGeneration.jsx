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

  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0] || null;
    setFile(selectedFile);
    setErrors((prev) => ({ ...prev, picture_path: "" }));

    // Clean up previous preview URL to prevent memory leaks
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    if (selectedFile) {
      setImagePreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setImagePreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage("");

    try {
      const validated = {};

      
      const fieldsToCheck = [
        "name",
        "surname",
        "birthdate",
        "degree",
        "job_count",
        "phone",
        "email",
        "skill_count",
      ];

      for (const field of fieldsToCheck) {
        const res = await fetch("http://localhost:3001/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            field,
            value: form[field],
          }),
        });

        const data = await res.json();

        if (!data.ok) {
          setErrors((prev) => ({
            ...prev,
            [field]: data.error || "Invalid value",
          }));
          setLoading(false);
          return; 
        }

        validated[field] = data.value;
      }


     
if (file) {
  const fd = new FormData();
  fd.append("file", file);

  const uploadRes = await fetch("http://localhost:3001/upload-picture", {
    method: "POST",
    body: fd,
  });

  const uploadData = await uploadRes.json();

  if (!uploadData.ok) {
    setErrors((prev) => ({
      ...prev,
      picture_path: uploadData.error || "Upload failed",
    }));
    setLoading(false);
    return;
  }

  validated.picture_path = uploadData.path;
} else {
  validated.picture_path = ""; 
}


      const cvRes = await fetch("http://localhost:3001/generate-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validated),
      });

      if (!cvRes.ok) {
        setMessage("Failed to generate CV");
        setLoading(false);
        return;
      }

      const blob = await cvRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cv.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setMessage("CV downloaded successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Server error. Is Flask running on port 3001?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cv-container">
      <h1>CV Generation</h1>

      <div className="cv-layout">
        
        <form className="cv-form" onSubmit={handleSubmit}>
          <h2>Personal details</h2>

          <div className="form-row">
            <label>First name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="George"
            />
            {errors.name && <p className="error">{errors.name}</p>}
          </div>

          <div className="form-row">
            <label>Surname</label>
            <input
              type="text"
              name="surname"
              value={form.surname}
              onChange={handleChange}
              placeholder="Jordan"
            />
            {errors.surname && <p className="error">{errors.surname}</p>}
          </div>

          <div className="form-row">
            <label>Birthdate</label>
            <input
              type="text"
              name="birthdate"
              value={form.birthdate}
              onChange={handleChange}
              placeholder="DD/MM/YYYY"
            />
            {errors.birthdate && <p className="error">{errors.birthdate}</p>}
          </div>

          <div className="form-row">
            <label>Degree</label>
            <input
              type="text"
              name="degree"
              value={form.degree}
              onChange={handleChange}
              placeholder="BSc Computer Science"
            />
            {errors.degree && <p className="error">{errors.degree}</p>}
          </div>

          <div className="form-row">
            <label>Number of jobs</label>
            <input
              type="number"
              name="job_count"
              value={form.job_count}
              onChange={handleChange}
              min="0"
              max="10"
              placeholder="0-10"
            />
            {errors.job_count && <p className="error">{errors.job_count}</p>}
          </div>

          <div className="form-row">
            <label>Phone number</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+357..."
            />
            {errors.phone && <p className="error">{errors.phone}</p>}
          </div>

          <div className="form-row">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          <div className="form-row">
            <label>Number of skills</label>
            <input
              type="number"
              name="skill_count"
              value={form.skill_count}
              onChange={handleChange}
              min ="0"
              max="20"
              placeholder="0-20"
            />
            {errors.skill_count && <p className="error">{errors.skill_count}</p>}
          </div>

          <div className="form-row">
            <label>Profile picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {errors.picture_path && (
              <p className="error">{errors.picture_path}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="primary-btn submit-btn"
          >
            {loading ? "Generating..." : "Generate CV"}
          </button>

          {message && <p className="info-text">{message}</p>}
        </form>

       
        <div
          className="cv-preview"
          style={{ position: "sticky", top: "20px" }}
        >
          <div
            className="cv-preview-header"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "15px",
            }}
          >
            {imagePreviewUrl && (
              <div className="cv-preview-picture">
                <img
                  src={imagePreviewUrl}
                  alt="Profile Preview"
                  className="profile-pic-preview"
                />
              </div>
            )}
            <h2>
              {form.name} {form.surname}
            </h2>
          </div>
          <div className="cv-preview-body">
            <p>
              <strong>Email:</strong> {form.email || "example@email.com"}
            </p>
            <p>
              <strong>Phone:</strong> {form.phone || "+357 ..."}
            </p>
            <p>
              <strong>Degree:</strong> {form.degree || "Your degree here"}
            </p>
            <p>
              <strong>Birthdate:</strong>{" "}
              {form.birthdate || "DD/MM/YYYY"}
            </p>
            <p>
              <strong>Jobs:</strong> {form.job_count || "0"}
            </p>
            <p>
              <strong>Skills count:</strong> {form.skill_count || "0"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CvGeneration;
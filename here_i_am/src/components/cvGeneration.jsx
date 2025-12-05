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
    portfolio: "",
    english_level: "",
    job_history: "",
    skill_history: "",
  });

  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRemoveFile = (e) => {
    e.preventDefault(); // stop label click from reopening dialog
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setFile(null);
    setImagePreviewUrl(null);

    const fileInput = document.getElementById("file-upload-input");
    if (fileInput) fileInput.value = "";
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0] || null;
    setFile(selectedFile);
    setErrors((prev) => ({ ...prev, picture_path: "" }));

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    if (selectedFile) {
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (selectedFile.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          picture_path: "Image size must be less than 5MB",
        }));
        setFile(null);
        const fileInput = document.getElementById("file-upload-input");
        if (fileInput) fileInput.value = "";
        return;
      }

      // Validate file type
      if (!selectedFile.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          picture_path: "Please upload an image file",
        }));
        setFile(null);
        const fileInput = document.getElementById("file-upload-input");
        if (fileInput) fileInput.value = "";
        return;
      }

      setImagePreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setImagePreviewUrl(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("drag-over");

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const fakeEvent = { target: { files: droppedFiles } };
      handleFileChange(fakeEvent);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage("");
    setMessageType("");

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
        "portfolio",
        "english_level",
        "job_history",
        "skill_history",
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
          const errorObj = {
            [field]: data.error || "Invalid value",
          };
          setErrors(errorObj);
          setLoading(false);
          // Focus the error field without scrolling
          setTimeout(() => {
            const firstErrorField = document.querySelector(`[name="${field}"]`);
            if (firstErrorField) {
              firstErrorField.focus();
            }
          }, 100);
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
        const errorText = await cvRes.text();
        setMessage("Failed to generate CV. Please try again.");
        setMessageType("error");
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

      setMessage("CV downloaded successfully!");
      setMessageType("success");
      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    } catch (err) {
      console.error(err);
      setMessage("Server error. Is Flask running on port 3001?");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cv-container">
      <h1>CV Generation</h1>

      <div className="cv-layout">
        {/* ===== FORM ===== */}
        <form className="cv-form" onSubmit={handleSubmit}>
          <h2>Personal Details</h2>

          {/* BASIC INFORMATION SECTION */}
          <div className="form-section">
            <h3 className="form-section-title">Basic Information</h3>
            
            <div className="top-row">
              <div className="image-column">
                <label className="field-label">Profile picture</label>

                <label
                  className="upload-box"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {imagePreviewUrl ? (
                    <div className="upload-preview-wrapper">
                      <img
                        src={imagePreviewUrl}
                        alt="preview"
                        className="upload-preview"
                      />
                      <button
                        onClick={handleRemoveFile}
                        className="upload-remove-btn"
                        aria-label="Remove image"
                      >
                        &times;
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📷</span>
                      <p>Click or drag & drop to upload a photo</p>
                    </div>
                  )}
                  <input
                    id="file-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </label>

                {errors.picture_path && (
                  <p className="error">{errors.picture_path}</p>
                )}
              </div>

              <div className="fields-column">
                <div className="form-row-group">
                  <div className="form-row">
                    <label>First name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="George"
                      maxLength={15}
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
                      maxLength={15}
                    />
                    {errors.surname && <p className="error">{errors.surname}</p>}
                  </div>
                </div>

                <div className="form-row-group">
                  <div className="form-row">
                    <label>Degree</label>
                    <input
                      type="text"
                      name="degree"
                      value={form.degree}
                      onChange={handleChange}
                      placeholder="BSc Computer Science"
                      maxLength={40}
                    />
                    {errors.degree && <p className="error">{errors.degree}</p>}
                  </div>

                  <div className="form-row">
                    <label>Birthdate</label>
                    <input
                      type="text"
                      name="birthdate"
                      value={form.birthdate}
                      onChange={handleChange}
                      placeholder="DD/MM/YYYY"
                      maxLength={10}
                    />
                    {errors.birthdate && (
                      <p className="error">{errors.birthdate}</p>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <label>English level</label>
                  <select
                    name="english_level"
                    value={form.english_level}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Select level</option>
                    <option value="A1">A1 - Beginner</option>
                    <option value="A2">A2 - Elementary</option>
                    <option value="B1">B1 - Intermediate</option>
                    <option value="B2">B2 - Upper Intermediate</option>
                    <option value="C1">C1 - Advanced</option>
                    <option value="C2">C2 - Proficient</option>
                    <option value="Native">Native</option>
                  </select>
                  {errors.english_level && (
                    <p className="error">{errors.english_level}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CONTACT INFORMATION SECTION */}
          <div className="form-section">
            <h3 className="form-section-title">Contact Information</h3>
            
            <div className="form-row-group">
              <div className="form-row">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  maxLength={60}
                />
                {errors.email && <p className="error">{errors.email}</p>}
              </div>

              <div className="form-row">
                <label>Phone number</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+357..."
                  maxLength={15}
                />
                {errors.phone && <p className="error">{errors.phone}</p>}
              </div>
            </div>

            <div className="form-row">
              <label>Portfolio / Website</label>
              <input
                type="text"
                name="portfolio"
                value={form.portfolio}
                onChange={handleChange}
                placeholder="https://github.com/yourname or your personal website"
                maxLength={60}
              />
              {errors.portfolio && (
                <p className="error">{errors.portfolio}</p>
              )}
            </div>
          </div>

          {/* EXPERIENCE SECTION */}
          <div className="form-section">
            <h3 className="form-section-title">Work Experience</h3>
            
            <div className="form-row">
              <label>Number of jobs (0-10)</label>
              <input
                type="text"
                name="job_count"
                value={form.job_count}
                placeholder="0-10"
                onChange={(e) => {
                  let v = e.target.value;
                  if (v === "") {
                    handleChange(e);
                    return;
                  }
                  if (!/^\d+$/.test(v)) return;
                  if (v.length > 2) return;
                  let num = Number(v);
                  if (num > 10) return;
                  handleChange(e);
                }}
              />
              {errors.job_count && <p className="error">{errors.job_count}</p>}
            </div>

            <div className="form-row">
              <label>Job history</label>
              <textarea
                name="job_history"
                value={form.job_history}
                onChange={handleChange}
                placeholder="Describe your previous jobs, positions, dates..."
                rows={3}
                maxLength={200}
              />
              <span
                className={`char-counter ${
                  form.job_history.length >= 180
                    ? "error"
                    : form.job_history.length >= 150
                    ? "warning"
                    : ""
                }`}
              >
                {form.job_history.length}/200
              </span>
              {errors.job_history && (
                <p className="error">{errors.job_history}</p>
              )}
            </div>
          </div>

          {/* SKILLS SECTION */}
          <div className="form-section">
            <h3 className="form-section-title">Skills</h3>
            
            <div className="form-row">
              <label>Number of skills (0-20)</label>
              <input
                type="text"
                name="skill_count"
                value={form.skill_count}
                placeholder="0-20"
                onChange={(e) => {
                  let v = e.target.value;
                  if (v === "") {
                    handleChange(e);
                    return;
                  }
                  if (!/^\d+$/.test(v)) return;
                  if (v.length > 2) return;
                  let num = Number(v);
                  if (num > 20) return;
                  handleChange(e);
                }}
              />
              {errors.skill_count && (
                <p className="error">{errors.skill_count}</p>
              )}
            </div>

            <div className="form-row">
              <label>Skill history</label>
              <textarea
                name="skill_history"
                value={form.skill_history}
                onChange={handleChange}
                placeholder="List or describe your key skills, technologies, tools..."
                rows={3}
                maxLength={200}
              />
              <span
                className={`char-counter ${
                  form.skill_history.length >= 180
                    ? "error"
                    : form.skill_history.length >= 150
                    ? "warning"
                    : ""
                }`}
              >
                {form.skill_history.length}/200
              </span>
              {errors.skill_history && (
                <p className="error">{errors.skill_history}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="primary-btn submit-btn"
          >
            {loading ? "Generating..." : "Generate CV"}
          </button>

          {message && (
            <p className={messageType === "success" ? "success-message" : "error"}>
              {message}
            </p>
          )}
        </form>

        {/* ===== PREVIEW ===== */}
        <div className="cv-preview">
          <div className="cv-page">
            <div className="cv-page-inner">
              <div className="cv-left">
                <h1 className="cv-name">
                  {(form.name + " " + form.surname).trim() || "Your Name"}
                </h1>
                <p className="cv-degree">
                  {form.degree || "Your degree here"}
                </p>

                <section className="cv-section">
                  <h3 className="cv-section-title">EXPERIENCE</h3>
                  <p className="cv-text">
                    Previous job(s):{" "}
                    {form.job_count !== "" ? form.job_count : "0"}
                  </p>
                  {form.job_history && (
                    <p className="cv-text">Job history: {form.job_history}</p>
                  )}
                  <p className="cv-text">
                    Number of skills entered:{" "}
                    {form.skill_count !== "" ? form.skill_count : "0"}
                  </p>
                  {form.skill_history && (
                    <p className="cv-text">Skill history: {form.skill_history}</p>
                  )}
                </section>

                <section className="cv-section">
                  <h3 className="cv-section-title">EDUCATION</h3>
                  <p className="cv-text">
                    Degree: {form.degree || "Your degree here"}
                  </p>
                </section>
              </div>

              <div className="cv-right">
                <div className="cv-avatar-wrapper">
                  <div className="cv-avatar-circle">
                    {imagePreviewUrl ? (
                      <img
                        src={imagePreviewUrl}
                        alt="Profile Preview"
                        className="cv-avatar-img"
                      />
                    ) : (
                      <span className="cv-avatar-initials">
                        {(
                          (form.name?.trim()[0] || "") +
                          (form.surname?.trim()[0] || "")
                        ).toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="cv-contact">
                  <p>
                    <span className="cv-contact-label">email:</span>
                    <span className="cv-contact-value">
                      {form.email || "example@email.com"}
                    </span>
                  </p>
                  <p>
                    <span className="cv-contact-label">phone:</span>
                    <span className="cv-contact-value">
                      {form.phone || "+357..."}
                    </span>
                  </p>
                  <p>
                    <span className="cv-contact-label">Birthdate:</span>
                    <span className="cv-contact-value">
                      {form.birthdate || "DD/MM/YYYY"}
                    </span>
                  </p>
                  <p>
                    <span className="cv-contact-label">portfolio:</span>
                    <span className="cv-contact-value">
                      {form.portfolio || "https://..."}
                    </span>
                  </p>
                  <p>
                    <span className="cv-contact-label">English:</span>
                    <span className="cv-contact-value">
                      {form.english_level || "B2 / C1 etc."}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CvGeneration;

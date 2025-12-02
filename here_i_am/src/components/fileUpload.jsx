function FileUpload({ onFileSelect }) {
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div>
      <label>Upload file</label>
      <input type="file" onChange={handleChange} />
    </div>
  );
}

export default FileUpload;

import React, { useState, useEffect } from "react";
import axios from "axios";

export default function UploadImages({ uploadedImages = [], onUploadComplete }) {
  const [images, setImages] = useState([]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const handleFileChange = (e) => setImages([...e.target.files]);

  const handleUpload = async () => {
    if (!images.length) return alert("Please select images");

    const formData = new FormData();
    images.forEach(img => formData.append("images", img));

    try {
      const res = await axios.post(
        "https://qwikko.onrender.com/api/products/upload",
        formData,
        { headers: getAuthHeaders(), withCredentials: true }
      );

      const newUrls = res.data.imageUrls;
      if (onUploadComplete) onUploadComplete([...uploadedImages, ...newUrls]);

      setImages([]); // مسح الملفات بعد رفعها
      alert("Images uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Error uploading images");
    }
  };

  useEffect(() => {
    if (!uploadedImages || uploadedImages.length === 0) {
      setImages([]);
    }
  }, [uploadedImages]);

  return (
    <div className="flex flex-col gap-2">
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleUpload} className="px-3 py-1 bg-green-600 text-white rounded">
        Upload Images
      </button>

      {uploadedImages.length > 0 && (
        <div>
          <p>Uploaded Images:</p>
          <ul>
            {uploadedImages.map((url, idx) => <li key={idx}>{url}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

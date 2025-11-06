import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ProductForm({ initialData, categories, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    images: [],
    category_id: "",
    variants: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

  // توحيد الصور عند initialData
  useEffect(() => {
    if (initialData) {
      const normalizedImages = (initialData.images || []).map((img) => {
        if (typeof img === "string") {
          return img.startsWith("http") ? img : `${import.meta.env.VITE_API_URL}/${img}`;
        } else if (img?.image_url) {
          return img.image_url.startsWith("http") ? img.image_url : `${import.meta.env.VITE_API_URL}/${img.image_url}`;
        }
        return null;
      }).filter(Boolean);

      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price || "",
        stock_quantity: initialData.stock_quantity || "",
        images: normalizedImages,
        category_id: initialData.category_id || "",
        variants: initialData.variants || "",
      });
    }

    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [initialData]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => setSelectedFiles([...e.target.files]);

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return [];
    setIsUploading(true);
    const formDataImages = new FormData();
    selectedFiles.forEach((img) => formDataImages.append("images", img));

    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "http://localhost:3000/api/products/upload",
        formDataImages,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          withCredentials: true,
        }
      );
      setIsUploading(false);
      setSelectedFiles([]);

      // توحيد URLs الصور الجديدة
      const normalizedUploaded = (res.data.imageUrls || []).map(url =>
        url.startsWith("http") ? url : `${import.meta.env.VITE_API_URL}/${url}`
      );
      return normalizedUploaded;
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      alert("Error uploading images");
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const uploadedUrls = await uploadImages();

    let variantsData = null;
    if (formData.variants) {
      try {
        variantsData =
          typeof formData.variants === "string"
            ? JSON.parse(formData.variants)
            : formData.variants;
      } catch {
        variantsData = formData.variants;
      }
    }

    const preparedData = {
      ...formData,
      images: [...formData.images, ...uploadedUrls],
      variants: variantsData,
    };

    onSubmit(preparedData);

    if (!initialData?.id) {
      setFormData({
        name: "",
        description: "",
        price: "",
        stock_quantity: "",
        images: [],
        category_id: "",
        variants: "",
      });
      setSelectedFiles([]);
    }
  };

  const bgColor = isDarkMode ? "#313131" : "#ffffff";
  const textColor = isDarkMode ? "#f5f5f5" : "#242625";
  const inputBg = isDarkMode ? "#313131" : "#ffffff";
  const inputBorder = isDarkMode ? "#777777" : "#ccc";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full p-0"
      style={{ color: textColor }}
    >
      {/* Name & Category */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col p-2 rounded-lg" style={{ backgroundColor: bgColor }}>
          <label className="text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-gray-300 outline-none"
            style={{ color: textColor, backgroundColor: inputBg, borderColor: inputBorder }}
            required
          />
        </div>

        <div className="flex flex-col p-2 rounded-lg" style={{ backgroundColor: bgColor }}>
          <label className="text-sm font-medium mb-1">Category</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-gray-300 outline-none"
            style={{ color: textColor, backgroundColor: inputBg, borderColor: inputBorder }}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col p-2 rounded-lg" style={{ backgroundColor: bgColor }}>
        <label className="text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="border rounded-lg p-2 focus:ring-2 focus:ring-gray-300 outline-none resize-none"
          rows="3"
          style={{ color: textColor, backgroundColor: inputBg, borderColor: inputBorder }}
          required
        />
      </div>

      {/* Price & Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col p-2 rounded-lg" style={{ backgroundColor: bgColor }}>
          <label className="text-sm font-medium mb-1">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-gray-300 outline-none"
            style={{ color: textColor, backgroundColor: inputBg, borderColor: inputBorder }}
            required
          />
        </div>

        <div className="flex flex-col p-2 rounded-lg" style={{ backgroundColor: bgColor }}>
          <label className="text-sm font-medium mb-1">Stock Quantity</label>
          <input
            type="number"
            name="stock_quantity"
            value={formData.stock_quantity}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-gray-300 outline-none"
            style={{ color: textColor, backgroundColor: inputBg, borderColor: inputBorder }}
            required
          />
        </div>
      </div>

      {/* Images & Variants */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col p-2 rounded-lg" style={{ backgroundColor: bgColor }}>
          <label className="text-sm font-medium mb-1">Images</label>
          <input type="file" multiple onChange={handleFileChange} />

          {/* عرض الصور المحددة قبل الرفع */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedFiles.map((file, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-20 h-20 object-cover rounded border"
                />
              ))}
            </div>
          )}

          {/* عرض الصور المرفوعة مسبقًا أو بعد التحديث */}
          {formData.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20">
                  <img
                    src={img}
                    alt={`uploaded-${idx}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                  {/* زر الحذف */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        images: formData.images.filter((_, i) => i !== idx)
                      });
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col p-2 rounded-lg" style={{ backgroundColor: bgColor }}>
          <label className="text-sm font-medium mb-1">Variants</label>
          <input
            type="text"
            name="variants"
            placeholder='e.g. {"size":"M"}'
            value={formData.variants}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-gray-300 outline-none"
            style={{ color: textColor, backgroundColor: inputBg, borderColor: inputBorder }}
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isUploading}
        className="px-4 py-2 rounded-lg hover:opacity-90 transition"
        style={{ backgroundColor: "#307A59", color: "#ffffff" }}
      >
        {isUploading ? "Uploading..." : initialData?.id ? "Update Product" : "Add Product"}
      </button>
    </form>
  );
}

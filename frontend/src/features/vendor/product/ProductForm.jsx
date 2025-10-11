import React, { useState, useEffect } from "react";

export default function ProductForm({ initialData, categories, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    images: "",
    category_id: "",
    variants: "",
  });

  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price || "",
        stock_quantity: initialData.stock_quantity || "",
        images: initialData.images || "",
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

  const handleSubmit = (e) => {
    e.preventDefault();

    let imagesArray = [];
    if (formData.images) {
      try {
        const parsed = JSON.parse(formData.images);
        imagesArray = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        imagesArray = [formData.images];
      }
    }

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
      images: imagesArray,
      variants: variantsData,
    };

    onSubmit(preparedData);

    if (!initialData?.id) {
      setFormData({
        name: "",
        description: "",
        price: "",
        stock_quantity: "",
        images: "",
        category_id: "",
        variants: "",
      });
    }
  };

  // 🎨 هنا غيّرنا اللون الرمادي للخلفية في الوضع الداكن
  const bgColor = isDarkMode ? "#666666" : "#ffffff";
  const textColor = isDarkMode ? "#f5f5f5" : "#242625";
  const inputBg = isDarkMode ? "#555555" : "#ffffff";
  const inputBorder = isDarkMode ? "#777777" : "#ccc";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full p-0"
      style={{ color: textColor }}
    >
      {/* Name & Category */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="flex flex-col p-2 rounded-lg"
          style={{ backgroundColor: bgColor }}
        >
          <label className="text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-gray-300 outline-none"
            style={{
              color: textColor,
              backgroundColor: inputBg,
              borderColor: inputBorder,
            }}
            required
          />
        </div>

        <div
          className="flex flex-col p-2 rounded-lg"
          style={{ backgroundColor: bgColor }}
        >
          <label className="text-sm font-medium mb-1">Category</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-gray-300 outline-none"
            style={{
              color: textColor,
              backgroundColor: inputBg,
              borderColor: inputBorder,
            }}
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
      <div
        className="flex flex-col p-2 rounded-lg"
        style={{ backgroundColor: bgColor }}
      >
        <label className="text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="border rounded-lg p-2 focus:ring-2 focus:ring-gray-300 outline-none resize-none"
          rows="3"
          style={{
            color: textColor,
            backgroundColor: inputBg,
            borderColor: inputBorder,
          }}
          required
        />
      </div>

      {/* Price & Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="flex flex-col p-2 rounded-lg"
          style={{ backgroundColor: bgColor }}
        >
          <label className="text-sm font-medium mb-1">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-gray-300 outline-none"
            style={{
              color: textColor,
              backgroundColor: inputBg,
              borderColor: inputBorder,
            }}
            required
          />
        </div>

        <div
          className="flex flex-col p-2 rounded-lg"
          style={{ backgroundColor: bgColor }}
        >
          <label className="text-sm font-medium mb-1">Stock Quantity</label>
          <input
            type="number"
            name="stock_quantity"
            value={formData.stock_quantity}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-gray-300 outline-none"
            style={{
              color: textColor,
              backgroundColor: inputBg,
              borderColor: inputBorder,
            }}
            required
          />
        </div>
      </div>

      {/* Images & Variants */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="flex flex-col p-2 rounded-lg"
          style={{ backgroundColor: bgColor }}
        >
          <label className="text-sm font-medium mb-1">Image URLs</label>
          <input
            type="text"
            name="images"
            value={formData.images}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-gray-300 outline-none"
            style={{
              color: textColor,
              backgroundColor: inputBg,
              borderColor: inputBorder,
            }}
          />
        </div>

        <div
          className="flex flex-col p-2 rounded-lg"
          style={{ backgroundColor: bgColor }}
        >
          <label className="text-sm font-medium mb-1">Variants</label>
          <input
            type="text"
            name="variants"
            placeholder='e.g. {"size":"M"}'
            value={formData.variants}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-gray-300 outline-none"
            style={{
              color: textColor,
              backgroundColor: inputBg,
              borderColor: inputBorder,
            }}
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="px-4 py-2 rounded-lg hover:opacity-90 transition"
        style={{ backgroundColor: "#307A59", color: "#ffffff" }}
      >
        {initialData?.id ? "Update Product" : "Add Product"}
      </button>
    </form>
  );
}

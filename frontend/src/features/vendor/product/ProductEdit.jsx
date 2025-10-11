import React, { useState, useEffect } from "react";
import ProductForm from "./ProductForm";

export default function ProductEdit({ product, categories, onUpdate, onCancel }) {
  const [initialData, setInitialData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    images: [],
    category_id: "",
    variants: {},
  });

  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (product) {
      setInitialData({
        ...product,
        images: Array.isArray(product.images) ? product.images : [],
        variants: product.variants ? product.variants : {},
      });
    }

    // تحديث الثيم تلقائياً عند تغييره
    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [product]);

  const handleSubmit = (updatedData) => {
    const dataToSend = {
      ...updatedData,
      images: updatedData.images || [],
      variants: updatedData.variants || {},
      price: Number(updatedData.price),
      stock_quantity: Number(updatedData.stock_quantity),
      category_id: updatedData.category_id || null,
    };

    onUpdate(dataToSend);
  };

  const bgColor = isDarkMode ? "#1f1f1f" : "#ffffff";
  const textColor = isDarkMode ? "#f5f5f5" : "#242625";
  const buttonBg = isDarkMode ? "#333" : "#f0f0f0";
  const buttonHover = isDarkMode ? "#444" : "#e0e0e0";
  const buttonText = isDarkMode ? "#f5f5f5" : "#242625";

  return (
    <div className="mb-6" style={{ color: textColor }}>
      <ProductForm
        initialData={initialData}
        categories={categories}
        onSubmit={handleSubmit}
      />

      <div className="flex gap-4 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg transition"
          style={{
            backgroundColor: buttonBg,
            color: buttonText,
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = buttonHover)}
          onMouseLeave={(e) => (e.target.style.backgroundColor = buttonBg)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

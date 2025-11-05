import React, { useState, useEffect } from "react";
import ProductForm from "./ProductForm";
import { X } from "lucide-react";

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

  const colors = {
    text: isDarkMode ? "#f5f5f5" : "#242625",
    cardBg: isDarkMode ? "#1f1f1f" : "#ffffff",
  };

  return (
    <div
      className="relative p-4 rounded-2xl  mb-6"
      style={{  color: colors.text }}
    >
      {/* زر X لإغلاق التعديل */}
      <button
        onClick={onCancel}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-300 transition"
        style={{ color: colors.text }}
      >
        <X size={18} />
      </button>

      <ProductForm
        initialData={initialData}
        categories={categories}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import ProductForm from "./ProductForm";

export default function ProductEdit({ product, categories, onUpdate, onCancel }) {
  const [initialData, setInitialData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    images: [], // الآن مصفوفة مباشرة
    category_id: "",
    variants: {},
  });

  useEffect(() => {
    if (product) {
      setInitialData({
        ...product,
        images: Array.isArray(product.images) ? product.images : [],
        variants: product.variants ? product.variants : {},
      });
    }
  }, [product]);

  const handleSubmit = (updatedData) => {
    const dataToSend = {
      ...updatedData,
      images: updatedData.images || [], // تأكد أنها مصفوفة
      variants: updatedData.variants || {},
      price: Number(updatedData.price),
      stock_quantity: Number(updatedData.stock_quantity),
      category_id: updatedData.category_id || null,
    };

    onUpdate(dataToSend);
  };

  return (
    <div className="mb-6">
      <ProductForm
        initialData={initialData}
        categories={categories}
        onSubmit={handleSubmit}
      />

      <div className="flex gap-4 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

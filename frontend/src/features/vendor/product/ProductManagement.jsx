import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  fetchProducts,
  addProduct,
  deleteProduct,
  fetchCategories,
  updateProduct,
} from "../VendorAPI2";
import ProductForm from "./ProductForm";
import ProductEdit from "./ProductEdit";
import { Edit, Trash2, X } from "lucide-react"; // أيقونات

export default function ProductManagement() {
  const { isDarkMode } = useOutletContext(); // ✅ استقبال حالة الدارك مود من الـ Layout

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false); // ✅ حالة إظهار الفورم عند الضغط على الزر
  const [status, setStatus] = useState("loading"); // ✅ حالة اللودينغ

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setStatus("loading");
    const prods = await fetchProducts();
    setProducts(prods);
    setStatus("loaded");
  };
  const loadCategories = async () => setCategories(await fetchCategories());

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
      loadProducts();
    }
  };

  const handleFormSubmit = async (formData) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, formData);
      setEditingProduct(null);
    } else {
      await addProduct(formData);
      setShowAddForm(false); // ✅ إخفاء الفورم بعد إضافة المنتج
    }
    loadProducts();
  };

  const handleEditClick = (product) => setEditingProduct(product);
  const handleCancelEdit = () => setEditingProduct(null);

  // 🎨 تعريف ألوان الثيم
  const colors = {
    background: isDarkMode ? "#242625" : "#f0f2f1",
    cardBg: isDarkMode ? "#313131" : "#ffffff",
    text: isDarkMode ? "#ffffff" : "#242625",
    button: "#307A59",
    inputBg: "#f9f9f9",
    line: isDarkMode ? "#f9f9f9" : "#ccc",
  };

  // ✅ حالة اللودينغ
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
  <div
    className="min-h-screen w-full"
    style={{
      backgroundColor: isDarkMode ? "var(--bg-dark)" : "var(--bg)",
      color: "var(--text)",
      padding: "3rem",
    }}
  >
    {/* ✅ حاوية متجاوبة */}
    <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
      
      {/* ✅ العنوان والزر بنفس السطر ومتجاوب */}
      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 mb-10 sm:mb-16">
        <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
          Product Management
        </h1>

        {!showAddForm && !editingProduct && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 rounded-lg font-semibold text-sm sm:text-base"
            style={{ backgroundColor: colors.button, color: "#ffffff" }}
          >
            Add New Product
          </button>
        )}
      </div>

      {/* ✅ كارد الفورم يظهر عند الضغط على الزر أو عند التعديل */}
      {(showAddForm || editingProduct) && (
        <div
          className="p-4 sm:p-6 rounded-2xl shadow-md transition-colors duration-300 mb-6 relative"
          style={{ backgroundColor: colors.cardBg }}
        >
          {!editingProduct && (
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-300 transition"
              style={{ color: colors.text }}
            >
              <X size={18} />
            </button>
          )}

          <h2 className="text-base sm:text-lg font-semibold mb-4">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h2>

          <div className="space-y-4">
            {editingProduct ? (
              <ProductEdit
                product={editingProduct}
                categories={categories}
                onUpdate={handleFormSubmit}
                onCancel={handleCancelEdit}
              />
            ) : (
              <ProductForm
                initialData={editingProduct || {}}
                categories={categories}
                onSubmit={handleFormSubmit}
                buttonStyle={{
                  backgroundColor: colors.button,
                  color: "#ffffff",
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* ✅ جدول المنتجات */}
      <div
        className="p-4 sm:p-6 rounded-2xl shadow-md transition-colors duration-300 overflow-x-auto"
        style={{ backgroundColor: colors.cardBg }}
      >
        <h2 className="text-base sm:text-lg font-semibold mb-4">
          Product List
        </h2>

        <table className="w-full border-collapse text-sm sm:text-base">
          <thead>
            <tr
              className="text-left border-b"
              style={{
                color: colors.text,
                borderBottom: `1px solid ${colors.line}`,
              }}
            >
              <th className="p-2">Image</th>
              <th className="p-2">Name</th>
              <th className="p-2">Price</th>
              <th className="p-2">Stock</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {(products || []).slice(0, visibleCount).map((p) => (
              <tr
                key={p.id}
                className="border-b text-sm transition-colors duration-300"
                style={{
                  borderBottom: `1px solid ${colors.line}`,
                  color: colors.text,
                }}
              >
                <td className="p-2">
                  {p.images && p.images.length > 0 ? (
                    <img
                      src={
                        p.images[0]?.image_url?.startsWith("http")
                          ? p.images[0].image_url
                          : `${import.meta.env.VITE_API_URL || ""}/${
                              p.images[0].image_url
                            }`
                      }
                      alt={p.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md"
                    />
                  ) : (
                    <span
                      style={{
                        color: isDarkMode ? "#ccc" : "#999",
                      }}
                    >
                      No Image
                    </span>
                  )}
                </td>
                <td className="p-2">{p.name}</td>
                <td className="p-2">${p.price}</td>
                <td className="p-2">{p.stock_quantity}</td>
                <td className="p-2 flex gap-3 justify-center">
                  <button
                    onClick={() => handleEditClick(p)}
                    style={{ color: colors.text }}
                    className="hover:opacity-80 transition"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    style={{ color: colors.text }}
                    className="hover:opacity-80 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="p-4 text-center italic"
                  style={{ color: "#999" }}
                >
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {visibleCount < products.length && (
          <div className="text-center mt-4">
            <button
              onClick={() => setVisibleCount(visibleCount + 5)}
              className="px-4 py-2 rounded-lg text-sm sm:text-base"
              style={{
                backgroundColor: colors.button,
                color: "#ffffff",
              }}
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

}

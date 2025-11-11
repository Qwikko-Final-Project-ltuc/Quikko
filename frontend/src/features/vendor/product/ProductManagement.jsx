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
import { FaExclamationTriangle } from "react-icons/fa";
import Footer from "../../customer/customer/components/layout/Footer";

export default function ProductManagement() {
  const { isDarkMode } = useOutletContext();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [status, setStatus] = useState("loading");
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, productId: null });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const colors = {
    background: isDarkMode ? "#242625" : "#ffffff",
    cardBg: isDarkMode ? "#313131" : "#ffffff",
    text: isDarkMode ? "#ffffff" : "#242625",
    button: "#307A59",
    inputBg: "#f9f9f9",
    line: isDarkMode ? "#f9f9f9" : "#ccc",
    error: "#D9534F",
    border: isDarkMode ? "#555" : "#ccc",
  };

  const loadProducts = async () => {
    setStatus("loading");
    const prods = await fetchProducts();
    setProducts(prods);
    setStatus("loaded");
  };

  const loadCategories = async () => setCategories(await fetchCategories());

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id) => {
    await deleteProduct(id);
    loadProducts();
    showToast("Product deleted successfully!", "success");
    setDeleteModal({ show: false, productId: null });
  };

  const handleFormSubmit = async (formData) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, formData);
      setEditingProduct(null);
      showToast("Product updated successfully!", "success");
    } else {
      await addProduct(formData);
      setShowAddForm(false);
      showToast("Product added successfully!", "success");
    }
    loadProducts();
  };

  const handleEditClick = (product) => setEditingProduct(product);
  const handleCancelEdit = () => setEditingProduct(null);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.button }}></div>
          <p className="text-lg" style={{ color: colors.text }}>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
      <main className="flex-grow">
        <div className="max-w-screen-xl mx-4 sm:mx-8 lg:mx-12 mt-18 mb-18 px-4 sm:px-6 md:px-10 lg:px-12 py-6 md:py-10 space-y-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 mb-10 sm:mb-16">
            <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left " style={{ color: isDarkMode ? "#ffffff" : "#307A59" }}>Product Management</h1>
            {!showAddForm && !editingProduct && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 rounded-lg font-semibold text-sm sm:text-base"
                style={{ backgroundColor: colors.button, color: "#fff" }}
              >
                Add New Product
              </button>
            )}
          </div>

          {/* Form Card */}
          {(showAddForm || editingProduct) && (
            <div className="p-4 sm:p-6 border border-[var(--border)] rounded-2xl shadow-md transition-colors duration-300 mb-6 relative" style={{ backgroundColor: colors.cardBg }}>
              {!editingProduct && (
                <button
                  onClick={() => setShowAddForm(false)}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-300 transition"
                  style={{ color: colors.text }}
                >
                  <X size={18} />
                </button>
              )}
              <h2 className="text-base sm:text-lg font-semibold mb-4">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <div className="space-y-4">
                {editingProduct ? (
                  <ProductEdit product={editingProduct} categories={categories} onUpdate={handleFormSubmit} onCancel={handleCancelEdit} />
                ) : (
                  <ProductForm
                    initialData={editingProduct || {}}
                    categories={categories}
                    onSubmit={handleFormSubmit}
                    buttonStyle={{ backgroundColor: colors.button, color: "#fff" }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Product Table */}
          <div className="p-4 sm:p-6 border border-[var(--border)] rounded-2xl shadow-md transition-colors duration-300 overflow-x-auto" style={{ backgroundColor: colors.cardBg }}>
            <h2 className="text-base sm:text-lg font-semibold mb-4">Product List</h2>
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead>
                <tr className="text-left border-b" style={{ color: colors.text, borderBottom: `1px solid ${colors.line}` }}>
                  <th className="p-2">Image</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Stock</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(products || []).slice(0, visibleCount).map((p) => (
                  <tr key={p.id} className="border-b text-sm transition-colors duration-300" style={{ borderBottom: `1px solid ${colors.line}`, color: colors.text }}>
                    <td className="p-2">
                      {p.images && p.images.length > 0 ? (
                        <img
                          src={p.images[0]?.image_url?.startsWith("http") ? p.images[0].image_url : `${import.meta.env.VITE_API_URL || ""}/${p.images[0].image_url}`}
                          alt={p.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md"
                        />
                      ) : (
                        <span style={{ color: isDarkMode ? "#ccc" : "#999" }}>No Image</span>
                      )}
                    </td>
                    <td className="p-2">{p.name}</td>
                    <td className="p-2">${p.price}</td>
                    <td className="p-2">{p.stock_quantity}</td>
                    <td className="p-2 flex gap-3 justify-center">
                      <button onClick={() => handleEditClick(p)} style={{ color: colors.text }} className="hover:opacity-80 transition">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => setDeleteModal({ show: true, productId: p.id })} style={{ color: colors.text }} className="hover:opacity-80 transition">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-4 text-center italic" style={{ color: "#999" }}>No products found</td>
                  </tr>
                )}
              </tbody>
            </table>

            {visibleCount < products.length && (
              <div className="text-center mt-4">
                <button onClick={() => setVisibleCount(visibleCount + 5)} className="px-4 py-2 rounded-lg text-sm sm:text-base" style={{ backgroundColor: colors.button, color: "#fff" }}>
                  Show More
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full bg-[var(--footer-bg)] mt-auto">
        <Footer />
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-white ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          <span className="text-lg">{toast.type === "success" ? "✅" : "⚠️"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[var(--bg)] p-6 rounded-xl shadow-lg max-w-sm w-full" style={{ backgroundColor: colors.cardBg }}>
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle className="text-yellow-500 text-2xl" />
              <h3 className="text-lg font-semibold" style={{ color: colors.text }}>Confirm Delete</h3>
            </div>
            <p className="mb-6" style={{ color: colors.text }}>
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, productId: null })}
                className="px-4 py-2 rounded-md border"
                style={{ color: colors.text, borderColor: colors.border, backgroundColor: colors.background }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.productId)}
                className="px-4 py-2 rounded-md text-white"
                style={{ backgroundColor: colors.button }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

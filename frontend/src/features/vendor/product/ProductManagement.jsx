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
import { Edit, Trash2, X, Plus } from "lucide-react";
import { FaExclamationTriangle } from "react-icons/fa";
import Footer from "../Footer";

export default function ProductManagement() {
  const { isDarkMode } = useOutletContext();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [status, setStatus] = useState("loading");
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, productId: null, productName: "" });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const colors = {
    background: isDarkMode ? "#242625" : "#ffffff",
    cardBg: isDarkMode ? "#313131" : "#ffffff",
    text: isDarkMode ? "#ffffff" : "#242625",
    button: "#307A59",
    inputBg: isDarkMode ? "#424242" : "#f9f9f9",
    line: isDarkMode ? "#f9f9f9" : "#ccc",
    error: "#D9534F",
    border: isDarkMode ? "#555" : "#e5e5e5",
    secondaryText: isDarkMode ? "#cccccc" : "#666666",
  };

  const loadProducts = async () => {
    setStatus("loading");
    try {
      const prods = await fetchProducts();
      setProducts(prods);
      setStatus("loaded");
    } catch (error) {
      console.error("Error loading products:", error);
      setStatus("error");
      showToast("Failed to load products", "error");
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (error) {
      console.error("Error loading categories:", error);
      showToast("Failed to load categories", "error");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      loadProducts();
      showToast("Product deleted successfully!", "success");
      setDeleteModal({ show: false, productId: null, productName: "" });
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast("Failed to delete product", "error");
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
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
    } catch (error) {
      console.error("Error saving product:", error);
      showToast("Failed to save product", "error");
    }
  };

  const handleEditClick = (product) => setEditingProduct(product);
  const handleCancelEdit = () => setEditingProduct(null);

  if (status === "loading") {
    return (
      <div 
        className="min-h-screen flex items-center justify-center" 
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
            style={{ borderColor: colors.button }}
          ></div>
          <p className="text-lg" style={{ color: colors.text }}>Loading products...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div 
        className="min-h-screen flex items-center justify-center" 
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-lg mb-4" style={{ color: colors.text }}>Failed to load products</p>
          <button
            onClick={loadProducts}
            className="px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.button, color: "#fff" }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col min-h-screen" 
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <main className="flex-grow">
        <div className="max-w-screen-xl mx-4 sm:mx-8 lg:mx-12 mt-18 mb-18 px-4 sm:px-6 md:px-10 lg:px-12 py-6 md:py-10 space-y-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 sm:mb-16">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: "#307A59" }}>
                Product Management
              </h1>
              <p className="text-sm" style={{ color: colors.secondaryText }}>
                {products.length} product{products.length !== 1 ? 's' : ''} available
              </p>
            </div>
            
            {!showAddForm && !editingProduct && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:opacity-90 transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: colors.button, color: "#fff" }}
              >
                <Plus size={18} />
                <span>Add New Product</span>
              </button>
            )}
          </div>

          {/* Form Card */}
          {(showAddForm || editingProduct) && (
            <div 
              className="p-4 sm:p-6 border rounded-2xl shadow-lg transition-all duration-300 mb-6 relative"
              style={{ 
                backgroundColor: colors.cardBg, 
                borderColor: colors.border 
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={editingProduct ? handleCancelEdit : () => setShowAddForm(false)}
                  className="p-2 rounded-full hover:bg-opacity-20 transition-colors"
                  style={{ 
                    color: colors.text,
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                {editingProduct ? (
                  <ProductEdit 
                    product={editingProduct} 
                    categories={categories} 
                    onUpdate={handleFormSubmit} 
                    onCancel={handleCancelEdit} 
                    colors={colors}
                  />
                ) : (
                  <ProductForm
                    initialData={editingProduct || {}}
                    categories={categories}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowAddForm(false)}
                    buttonStyle={{ backgroundColor: colors.button, color: "#fff" }}
                    colors={colors}
                  />
                )}
              </div>
            </div>
          )}

          {/* Product Cards Grid */}
          <div 
            className="p-4 sm:p-6 border rounded-2xl shadow-sm transition-colors duration-300"
            style={{ 
              backgroundColor: colors.cardBg, 
              borderColor: colors.border 
            }}
          >
            {products.length === 0 ? (
              <div className="text-center py-12" style={{ color: colors.secondaryText }}>
                <div className="text-6xl mb-4">📦</div>
                <p className="text-lg mb-2">No products found</p>
                <p className="text-sm mb-6">Get started by adding your first product</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity mx-auto"
                  style={{ backgroundColor: colors.button, color: "#fff" }}
                >
                  <Plus size={18} />
                  <span>Add Your First Product</span>
                </button>
              </div>
            ) : (
              <>
                {/* Grid Container - متجاوب لثلاثة أحجام شاشات */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {products.slice(0, visibleCount).map((product) => (
                    <div 
                      key={product.id} 
                      className="border rounded-xl p-4 transition-all duration-300 hover:shadow-lg group"
                      style={{ 
                        borderColor: colors.border, 
                        backgroundColor: colors.background,
                        transform: 'translateY(0)'
                      }}
                    >
                      {/* Product Image */}
                      <div className="relative mb-4 overflow-hidden rounded-lg">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]?.image_url?.startsWith("http") 
                              ? product.images[0].image_url 
                              : `${import.meta.env.VITE_API_URL || ""}/${product.images[0].image_url}`
                            }
                            alt={product.name}
                            className="w-full h-48 sm:h-40 lg:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div 
                            className="w-full h-48 sm:h-40 lg:h-48 flex items-center justify-center rounded-lg"
                            style={{ backgroundColor: isDarkMode ? "#444" : "#f5f5f5" }}
                          >
                            <span style={{ color: isDarkMode ? "#ccc" : "#999" }}>No Image</span>
                          </div>
                        )}
                        
                        {/* Stock Badge */}
                        <div 
                          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                            product.stock_quantity > 0 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="space-y-3">
                        <h3 
                          className="font-semibold text-lg line-clamp-2 h-14 overflow-hidden"
                          style={{ color: colors.text }}
                          title={product.name}
                        >
                          {product.name}
                        </h3>
                        
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xl" style={{ color: "#307A59" }}>
                            ${parseFloat(product.price).toFixed(2)}
                          </span>
                          {product.category && (
                            <span 
                              className="px-2 py-1 rounded text-xs"
                              style={{ 
                                backgroundColor: isDarkMode ? '#444' : '#f5f5f5',
                                color: colors.secondaryText
                              }}
                            >
                              {product.category}
                            </span>
                          )}
                        </div>

                        {/* Description Preview */}
                        {product.description && (
                          <p 
                            className="text-sm line-clamp-2 h-10 overflow-hidden"
                            style={{ color: colors.secondaryText }}
                            title={product.description}
                          >
                            {product.description}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: colors.border }}>
                          <button 
                            onClick={() => handleEditClick(product)} 
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:opacity-80 transition-all duration-200 hover:scale-105"
                            style={{ 
                              backgroundColor: isDarkMode ? '#444' : '#f5f5f5',
                              color: colors.text
                            }}
                            title="Edit product"
                          >
                            <Edit size={16} />
                            <span className="text-sm">Edit</span>
                          </button>
                          
                          <button 
                            onClick={() => setDeleteModal({ 
                              show: true, 
                              productId: product.id, 
                              productName: product.name 
                            })} 
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:opacity-80 transition-all duration-200 hover:scale-105"
                            style={{ 
                              backgroundColor: isDarkMode ? '#444' : '#f5f5f5',
                              color: colors.error
                            }}
                            title="Delete product"
                          >
                            <Trash2 size={16} />
                            <span className="text-sm">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show More Button */}
                {visibleCount < products.length && (
                  <div className="text-center mt-8">
                    <button 
                      onClick={() => setVisibleCount(prev => prev + 6)} 
                      className="px-8 py-3 rounded-lg font-semibold text-base hover:opacity-90 transition-all duration-300 hover:scale-105"
                      style={{ 
                        backgroundColor: colors.button, 
                        color: "#fff",
                        border: `2px solid ${colors.button}`
                      }}
                    >
                      Show More Products ({products.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full bg-[var(--footer-bg)] mt-auto">
        <Footer />
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 text-white transition-all duration-300 ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          <span className="text-lg">
            {toast.type === "success" ? "✅" : "⚠️"}
          </span>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div 
            className="bg-[var(--bg)] p-6 rounded-2xl shadow-xl max-w-md w-full"
            style={{ backgroundColor: colors.cardBg }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle className="text-yellow-500 text-2xl" />
              <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                Confirm Delete
              </h3>
            </div>
            
            <p className="mb-6" style={{ color: colors.text }}>
              Are you sure you want to delete <strong>"{deleteModal.productName}"</strong>? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, productId: null, productName: "" })}
                className="px-4 py-2 rounded-lg border hover:opacity-80 transition-opacity font-medium"
                style={{ 
                  color: colors.text, 
                  borderColor: colors.border, 
                  backgroundColor: colors.background 
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.productId)}
                className="px-4 py-2 rounded-lg text-white hover:opacity-80 transition-opacity font-medium"
                style={{ backgroundColor: colors.error }}
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
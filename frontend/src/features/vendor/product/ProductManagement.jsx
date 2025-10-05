// src/pages/vendor/product/ProductManagement.jsx
import React, { useState, useEffect } from "react";
import {
  fetchProducts,
  addProduct,
  deleteProduct,
  fetchCategories,
  updateProduct,
} from "../VendorAPI";
import ProductForm from "./ProductForm";
import ProductEdit from "./ProductEdit";
import { Edit, Trash2 } from "lucide-react"; // أيقونات

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => setProducts(await fetchProducts());
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
    }
    loadProducts();
  };

  const handleEditClick = (product) => setEditingProduct(product);
  const handleCancelEdit = () => setEditingProduct(null);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>

      {/* كارد الفورم */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
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
              initialData={{}}
              categories={categories}
              onSubmit={handleFormSubmit}
            />
          )}
        </div>
      </div>

      {/* جدول المنتجات */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Product List
        </h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-gray-600 border-b">
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
                className="border-b hover:bg-gray-50 transition text-sm"
              >
                <td className="p-2">
                  {p.images && p.images.length > 0 ? (
                    <img
  src={p.images[0]?.image_url?.startsWith("http") 
    ? p.images[0].image_url 
    : `${process.env.REACT_APP_API_URL || ""}/${p.images[0].image_url}`
  }
  alt={p.name}
  className="w-12 h-12 object-cover rounded-md"
/>

                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </td>
                <td className="p-2">{p.name}</td>
                <td className="p-2">${p.price}</td>
                <td className="p-2">{p.stock_quantity}</td>
                <td className="p-2 flex gap-3 justify-center">
                  <button
                    onClick={() => handleEditClick(p)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-600 hover:text-red-800"
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
                  className="p-4 text-center text-gray-500 italic"
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
              className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition"
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

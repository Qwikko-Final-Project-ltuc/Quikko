import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  allCategory,
  addCategory,
  editCategory,
  deleteCategory,
} from "./categorySlice";
import { IoIosSearch } from "react-icons/io";
import { FaPlus } from "react-icons/fa";

export default function CategoryForm() {
  const dispatch = useDispatch();
  const { categoryList, loading, error } = useSelector(
    (state) => state.categories
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [form, setForm] = useState({ name: "", parent_id: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    dispatch(allCategory());
  }, [dispatch]);

  const filteredCategories = categoryList.filter((category) => {
    return (
      (category.id &&
        category.id
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (category.name &&
        category.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleAdd = (e) => {
    e.preventDefault();
    const categoryData = {
      ...form,
      parent_id: form.parent_id === "" ? null : form.parent_id,
    };
    dispatch(addCategory(categoryData)).then(() => {
      dispatch(allCategory());
      setForm({ name: "", parent_id: "" });
      setShowAddModal(false);
    });
  };

  const handleEdit = (e) => {
    e.preventDefault();
    const categoryData = {
      ...form,
      parent_id: form.parent_id === "" ? null : form.parent_id,
    };
    dispatch(editCategory({ id: editingId, categoryData })).then(() => {
      dispatch(allCategory());
    });
    setEditingId(null);
    setShowEditModal(false);
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setForm({ name: category.name, parent_id: category.parent_id });
    setShowEditModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this Category?")) {
      dispatch(deleteCategory(id)).then(() => {
        dispatch(allCategory());
      });
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-6 space-x-4">
        <div className="relative flex-1">
          <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <FaPlus />
          <span>Add Category</span>
        </button>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Category Items</h2>
        {filteredCategories.length === 0 ? (
          <p>No Category items found.</p>
        ) : (
          <ul className="space-y-4">
            {filteredCategories.map((category) => (
              <li
                key={category.id}
                className="flex justify-between items-center border p-3 rounded"
              >
                <div>
                  <h3 className="font-semibold">
                    <span className="text-gray-500 text-sm">
                      (id:{category.id}){" "}
                    </span>
                    {category.name}{" "}
                  </h3>
                  {category.parent_id && (
                    <p className="text-sm text-gray-600">
                      Parent ID: {category.parent_id}
                    </p>
                  )}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => startEdit(category)}
                    className="px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Category</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <input
                type="text"
                placeholder="Category Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Parent ID"
                value={form.parent_id}
                onChange={(e) =>
                  setForm({ ...form, parent_id: e.target.value })
                }
                className="w-full border p-2 rounded"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Category</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border p-2 rounded"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

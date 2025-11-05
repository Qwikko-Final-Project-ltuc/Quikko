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
    (state) => state.categoriesAdmin
  );
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [form, setForm] = useState({ name: "", parent_id: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    dispatch(allCategory());
  }, [dispatch]);

  const filteredCategories = (categoryList || []).filter((category) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Loading Categories...</p>
        </div>
      </div>
    );
  }
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div
      className={`p-6 ${
        isDark
          ? "bg-[var(--bg)] text-[var(--text)]"
          : "bg-[var(--bg)] text-[var(--text)]"
      }`}
    >
      <div
        className={`p-6 rounded-2xl shadow-md transition-colors duration-300 border ${
          isDark
            ? "bg-[var(--bg)] border-[var(--border)]"
            : "bg-[var(--bg)] border-[var(--border)]"
        }`}
      >
        {/* Filter + Add */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <IoIosSearch
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                isDark ? "text-[var(--text)]" : "text-[var(--text)]"
              }`}
            />
            <input
              type="text"
              placeholder="Search by ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full p-3 pl-10 rounded-lg border transition-colors duration-300 focus:outline-none focus:ring-2 ${
                isDark
                  ? "bg-[var(--div)] border-[var(--border)] text-[var(--text)] focus:ring-[#307A59]"
                  : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-[#307A59]"
              }`}
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded hover:opacity-90 transition-colors bg-[var(--button)] text-white hover:bg-[#265e46] cursor-pointer"
          >
            <FaPlus /> <span>Add Category</span>
          </button>
        </div>

        {/* Category List */}
        <ul className="mt-4 space-y-3">
          {filteredCategories.length === 0 ? (
            <p>No Category items found.</p>
          ) : (
            filteredCategories.map((cat) => (
              <li
                key={cat.id}
                className={`flex justify-between items-center border p-3 rounded transition-colors ${
                  isDark
                    ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                    : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                }`}
              >
                <div>
                  <h3 className="font-semibold">
                    <span
                      className="text-sm"
                      style={{ color: isDark ? "#dddddd9c" : "#555" }}
                    >
                      (id:{cat.id}){" "}
                    </span>
                    {cat.name}
                  </h3>
                  {cat.parent_id && (
                    <p
                      className="text-sm"
                      style={{ color: isDark ? "#dddddd9c" : "#666" }}
                    >
                      Parent ID: {cat.parent_id}
                    </p>
                  )}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => startEdit(cat)}
                    className="px-3 py-1 rounded hover:opacity-90 bg-[var(--button)] text-white hover:bg-[#265e46] cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    style={{ backgroundColor: "#e53e3e", color: "#fff" }}
                    className="px-3 py-1 rounded hover:opacity-90 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>

        {/* -------------------- ADD MODAL -------------------- */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
            <style>{`
              input.add-placeholder::placeholder {
                color: ${isDark ? "#636262ff" : "#777"};
                opacity: 1;
              }
            `}</style>
            <div
              className={`rounded-lg shadow-lg p-6 w-full max-w-md transition-colors duration-300 ${
                isDark
                  ? "bg-[var(--bg)] text-[var(--text)]"
                  : "bg-[var(--bg)] text-[var(--text)]"
              }`}
            >
              <h2 className="text-xl font-semibold mb-4">Add Category</h2>
              <form onSubmit={handleAdd} className="space-y-4">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`add-placeholder w-full p-3 rounded border focus:outline-none focus:ring-2 ${
                    isDark
                      ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                      : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                  }`}
                  required
                />
                <input
                  type="text"
                  placeholder="Parent ID"
                  value={form.parent_id}
                  onChange={(e) =>
                    setForm({ ...form, parent_id: e.target.value })
                  }
                  className={`add-placeholder w-full p-3 rounded border focus:outline-none focus:ring-2 ${
                    isDark
                      ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                      : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                  }`}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{
                      backgroundColor: isDark ? "#555" : "#aaa",
                      color: "#fff",
                    }}
                    className="px-4 py-2 rounded hover:opacity-90 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded hover:opacity-90 bg-[var(--button)] text-white hover:bg-[#265e46] cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* -------------------- EDIT MODAL -------------------- */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
            <style>{`
              input.edit-placeholder::placeholder {
                color: ${isDark ? "#636262ff" : "#777"};
                opacity: 1;
              }
            `}</style>
            <div
              className={`rounded-lg shadow-lg p-6 w-full max-w-md transition-colors duration-300 ${
                isDark
                  ? "bg-[var(--bg)] text-[var(--text)]"
                  : "bg-[var(--bg)] text-[var(--text)]"
              }`}
            >
              <h2 className="text-xl font-semibold mb-4">Edit Category</h2>
              <form onSubmit={handleEdit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`edit-placeholder w-full p-3 rounded border focus:outline-none focus:ring-2 ${
                    isDark
                      ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                      : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                  }`}
                  required
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    style={{
                      backgroundColor: isDark ? "#555" : "#aaa",
                      color: "#fff",
                    }}
                    className="px-4 py-2 rounded hover:opacity-90 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded hover:opacity-90 bg-[var(--button)] text-white hover:bg-[#265e46] cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

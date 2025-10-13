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
import { colors } from "../../dark-lightMode/colors";

export default function CategoryForm() {
  const dispatch = useDispatch();
  const { categoryList, loading, error } = useSelector(
    (state) => state.categoriesAdmin
  );
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";
  const c = colors[isDark ? "dark" : "light"];

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div
      style={{ backgroundColor: c.pageBg, color: c.text }}
      className="min-h-screen p-6 transition-colors duration-300"
    >
      <div
        style={{ backgroundColor: c.cardBg }}
        className="p-4 rounded-2xl shadow-md mb-6 max-w-3xl mx-auto transition-colors duration-300"
      >
        {/* Filter + Add */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <IoIosSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: isDark ? "#6f6c6cff" : "#999" }}
            />
            <input
              type="text"
              placeholder="Search by ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                backgroundColor: c.inputBg,
                color: isDark ? "#514e4eff" : "#111",
                borderColor: isDark ? "#666666" : "#ccc",
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 placeholder:text-gray-500 dark:placeholder:text-gray-300"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{ backgroundColor: c.button, color: "#fff" }}
            className="flex items-center space-x-2 px-4 py-2 rounded hover:opacity-90 transition-colors"
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
                style={{
                  backgroundColor: c.cardBg,
                  borderColor: c.line,
                }}
                className="flex justify-between items-center border p-3 rounded transition-colors"
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
                    style={{ backgroundColor: c.button, color: "#fff" }}
                    className="px-3 py-1 rounded hover:opacity-90"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    style={{ backgroundColor: "#e53e3e", color: "#fff" }}
                    className="px-3 py-1 rounded hover:opacity-90"
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
              style={{ backgroundColor: c.cardBg, color: c.text }}
              className="rounded-lg shadow-lg p-6 w-full max-w-md transition-colors duration-300"
            >
              <h2 className="text-xl font-semibold mb-4">Add Category</h2>
              <form onSubmit={handleAdd} className="space-y-4">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{
                    backgroundColor: c.inputBg,
                    color: isDark ? "#514e4eff" : "#111",
                    borderColor: isDark ? "#666666" : "#ccc",
                  }}
                  className="add-placeholder w-full p-3 rounded border focus:outline-none focus:ring-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Parent ID"
                  value={form.parent_id}
                  onChange={(e) =>
                    setForm({ ...form, parent_id: e.target.value })
                  }
                  style={{
                    backgroundColor: c.inputBg,
                    color: isDark ? "#514e4eff" : "#111",
                    borderColor: isDark ? "#666666" : "#ccc",
                  }}
                  className="add-placeholder w-full p-3 rounded border focus:outline-none focus:ring-2"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{
                      backgroundColor: isDark ? "#555" : "#aaa",
                      color: "#fff",
                    }}
                    className="px-4 py-2 rounded hover:opacity-90"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ backgroundColor: c.button, color: "#fff" }}
                    className="px-4 py-2 rounded hover:opacity-90"
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
              style={{ backgroundColor: c.cardBg, color: c.text }}
              className="rounded-lg shadow-lg p-6 w-full max-w-md transition-colors duration-300"
            >
              <h2 className="text-xl font-semibold mb-4">Edit Category</h2>
              <form onSubmit={handleEdit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{
                    backgroundColor: c.inputBg,
                    color: isDark ? "#514e4eff" : "#111",
                    borderColor: isDark ? "#666666" : "#ccc",
                  }}
                  className="edit-placeholder w-full p-3 rounded border focus:outline-none focus:ring-2"
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
                    className="px-4 py-2 rounded hover:opacity-90"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ backgroundColor: c.button, color: "#fff" }}
                    className="px-4 py-2 rounded hover:opacity-90"
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

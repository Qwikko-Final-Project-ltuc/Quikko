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
import { LiaWindowCloseSolid } from "react-icons/lia";

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
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
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
      className={`p-4 sm:p-6 ${
        isDark
          ? "bg-[var(--bg)] text-[var(--text)]"
          : "bg-[var(--bg)] text-[var(--text)]"
      }`}
    >
      <div
        className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md transition-colors duration-300 border ${
          isDark
            ? "bg-[var(--bg)] border-[var(--border)]"
            : "bg-[var(--bg)] border-[var(--border)]"
        }`}
      >
        {/* Filter + Add */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative flex-1 w-full">
            <IoIosSearch
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${
                isDark ? "text-[var(--text)]" : "text-[var(--text)]"
              }`}
            />
            <input
              type="text"
              placeholder="Search by ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full p-2 sm:p-3 pl-8 sm:pl-10 rounded-lg border transition-colors duration-300 focus:outline-none focus:ring-2 text-sm sm:text-base ${
                isDark
                  ? "bg-[var(--div)] border-[var(--border)] text-[var(--text)] focus:ring-[#307A59]"
                  : "bg-[var(--textbox)] border-[var(--border)] text-[var(--text)] focus:ring-[#307A59]"
              }`}
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg hover:opacity-90 transition-colors bg-[var(--button)] text-white hover:bg-[#265e46] cursor-pointer text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <FaPlus className="w-4 h-4" /> <span>Add Category</span>
          </button>
        </div>

        {/* Category List */}
        <ul className="space-y-2 sm:space-y-3">
          {filteredCategories.length === 0 ? (
            <li className="text-center py-4">
              <p
                className={`text-lg ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No categories found
              </p>
            </li>
          ) : (
            filteredCategories.map((cat) => (
              <li
                key={cat.id}
                className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 border p-3 sm:p-4 rounded-lg transition-colors ${
                  isDark
                    ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--hover)]"
                    : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--hover)]"
                }`}
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-base sm:text-lg">
                    <span
                      className={`text-xs sm:text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      (id:{cat.id}){" "}
                    </span>
                    {cat.name}
                  </h3>
                  {cat.parent_id && (
                    <p
                      className={`text-xs sm:text-sm mt-1 ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Parent ID: {cat.parent_id}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => startEdit(cat)}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-lg hover:opacity-90 bg-[var(--button)] text-white hover:bg-[#265e46] cursor-pointer text-sm sm:text-base"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-lg hover:opacity-90 bg-red-500 text-white hover:bg-red-600 cursor-pointer text-sm sm:text-base"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div
              className={`rounded-xl sm:rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md transition-colors duration-300 border ${
                isDark
                  ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                  : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Add Category
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`p-1 rounded cursor-pointer`}
                >
                  <LiaWindowCloseSolid
                    size={20}
                    className={
                      isDark
                        ? "text-[var(--text)] hover:text-[var(--error)]"
                        : "text-[var(--text)] hover:text-[var(--error)]"
                    }
                  />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-3 sm:space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Category Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`w-full p-2 sm:p-3 rounded-lg border placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 transition-colors duration-300 ${
                      isDark
                        ? "bg-[var(--div)] text-[var(--text)] border-[var(--border)] focus:ring-[#307A59]"
                        : "bg-white text-gray-800 border-gray-300 focus:ring-[#307A59]"
                    }`}
                    required
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Parent ID (optional)"
                    value={form.parent_id}
                    onChange={(e) =>
                      setForm({ ...form, parent_id: e.target.value })
                    }
                    className={`w-full p-2 sm:p-3 rounded-lg border placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 transition-colors duration-300 ${
                      isDark
                        ? "bg-[var(--div)] text-[var(--text)] border-[var(--border)] focus:ring-[#307A59]"
                        : "bg-white text-gray-800 border-gray-300 focus:ring-[#307A59]"
                    }`}
                  />
                </div>

                <div className="flex justify-end gap-2 sm:gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 sm:px-4 py-2 rounded-lg hover:opacity-90 bg-gray-500 text-white hover:bg-gray-600 cursor-pointer text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 sm:px-4 py-2 rounded-lg hover:opacity-90 bg-[var(--button)] text-white hover:bg-[#265e46] cursor-pointer text-sm sm:text-base"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div
              className={`rounded-xl sm:rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md transition-colors duration-300 border ${
                isDark
                  ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                  : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Edit Category
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className={`p-1 rounded cursor-pointer`}
                >
                  <LiaWindowCloseSolid
                    size={20}
                    className={
                      isDark
                        ? "text-[var(--text)] hover:text-[var(--error)]"
                        : "text-[var(--text)] hover:text-[var(--error)]"
                    }
                  />
                </button>
              </div>

              <form onSubmit={handleEdit} className="space-y-3 sm:space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Category Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`w-full p-2 sm:p-3 rounded-lg border placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 transition-colors duration-300 ${
                      isDark
                        ? "bg-[var(--div)] text-[var(--text)] border-[var(--border)] focus:ring-[#307A59]"
                        : "bg-white text-gray-800 border-gray-300 focus:ring-[#307A59]"
                    }`}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 sm:gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-3 sm:px-4 py-2 rounded-lg hover:opacity-90 bg-gray-500 text-white hover:bg-gray-600 cursor-pointer text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 sm:px-4 py-2 rounded-lg hover:opacity-90 bg-[var(--button)] text-white hover:bg-[#265e46] cursor-pointer text-sm sm:text-base"
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

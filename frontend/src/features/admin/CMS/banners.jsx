import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { allCMSForAdmin, editCMS, deleteCMS } from "./cmsSlice";
import { FaPlus } from "react-icons/fa";
import PagesForm from "../CMS/pages";
import { LiaWindowCloseSolid } from "react-icons/lia";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";

export default function BannersForm() {
  const dispatch = useDispatch();
  const { cmsList, loading, error } = useSelector((state) => state.cms);
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "",
    image_url: "",
    status: "active",
  });
  const [activeFilter, setActiveFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    itemId: null,
    itemTitle: "",
  });

  useEffect(() => {
    dispatch(allCMSForAdmin());
  }, [dispatch]);

  const startEdit = (cms) => {
    setEditingId(cms.id);
    setForm({
      title: cms.title,
      content: cms.content,
      type: cms.type,
      image_url: cms.image_url || "",
      status: cms.status || "active",
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editingId) return;
    dispatch(editCMS({ id: editingId, cmsData: form })).then(() => {
      dispatch(allCMSForAdmin());
    });
    setEditingId(null);
  };

  const handleDelete = (id, title = "") => {
    setDeleteModal({
      isOpen: true,
      itemId: id,
      itemTitle: title,
    });
  };

  const confirmDelete = () => {
    if (deleteModal.itemId) {
      dispatch(deleteCMS(deleteModal.itemId)).then(() => {
        dispatch(allCMSForAdmin());
        setDeleteModal({ isOpen: false, itemId: null, itemTitle: "" });
      });
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, itemId: null, itemTitle: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Loading CMS items...</p>
        </div>
      </div>
    );
  }
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div
      className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md transition-colors duration-300 border ${
        isDark ? "border-[var(--border)]" : "border-[var(--border)]"
      }`}
    >
      {/* Filter Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm font-medium w-full sm:w-auto">
          {["all", "customer", "vendor", "delivery", "user"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                activeFilter === filter
                  ? "bg-[#307A59] text-white"
                  : isDark
                  ? "hover:bg-[var(--hover)] text-white"
                  : "hover:bg-[var(--hover)] text-gray-800"
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg hover:opacity-90 transition-colors bg-[var(--button)] text-white hover:bg-[#265e46] cursor-pointer text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <FaPlus className="w-4 h-4" /> <span>Add Pages</span>
        </button>

        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
            <div
              className={`rounded-xl sm:rounded-lg p-4 sm:p-6 shadow-lg w-full max-w-md sm:max-w-lg relative max-h-[90vh] overflow-y-auto ${
                isDark
                  ? "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]"
                  : "bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]"
              }`}
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: isDark
                  ? "#036f4dff #1c222d83"
                  : "#0b7c56ff #f1f5f9",
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 6px;
                }
                div::-webkit-scrollbar-track {
                  background: ${isDark ? "#1c222d83" : "#f1f5f9"};
                  border-radius: 10px;
                }
                div::-webkit-scrollbar-thumb {
                  background: ${isDark ? "#036f4dff" : "#0b7c56ff"};
                  border-radius: 10px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: ${isDark ? "#0e8462d8" : "#0a664aff"};
                }
              `}</style>

              <button
                onClick={() => setShowForm(false)}
                className="absolute top-3 right-3 text-[var(--text)] hover:text-red-500 transition-colors cursor-pointer p-1"
              >
                <LiaWindowCloseSolid size={20} className="sm:w-6 sm:h-6" />
              </button>

              <PagesForm isDark={isDark} />
            </div>
          </div>
        )}
      </div>

      {/* CMS List */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {(activeFilter === "all"
          ? cmsList
          : cmsList.filter((cms) => cms.type === activeFilter)
        )?.map(
          (cms) =>
            cms && (
              <div
                key={cms.id}
                className={`border rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow transition-colors duration-300 flex flex-col ${
                  isDark
                    ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                    : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                }`}
              >
                {editingId === cms.id ? (
                  <form onSubmit={handleSave} className="space-y-3 flex-1">
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      placeholder="Title"
                      required
                      className={`w-full p-2 rounded-lg border text-sm sm:text-base placeholder-gray-500 ${
                        isDark
                          ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-2 focus:ring-[#307A59]"
                          : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-2 focus:ring-[#307A59]"
                      }`}
                    />
                    <textarea
                      value={form.content}
                      onChange={(e) =>
                        setForm({ ...form, content: e.target.value })
                      }
                      placeholder="Content"
                      rows="3"
                      required
                      className={`w-full p-2 rounded-lg border text-sm sm:text-base placeholder-gray-500 ${
                        isDark
                          ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-2 focus:ring-[#307A59]"
                          : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-2 focus:ring-[#307A59]"
                      }`}
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: isDark
                          ? "#036f4dff #1c222d83"
                          : "#0b7c56ff #f1f5f9",
                      }}
                    />
                    <style jsx>{`
                      div::-webkit-scrollbar {
                        width: 6px;
                      }
                      div::-webkit-scrollbar-track {
                        background: ${isDark ? "#1c222d83" : "#f1f5f9"};
                        border-radius: 10px;
                      }
                      div::-webkit-scrollbar-thumb {
                        background: ${isDark ? "#036f4dff" : "#0b7c56ff"};
                        border-radius: 10px;
                      }
                      div::-webkit-scrollbar-thumb:hover {
                        background: ${isDark ? "#0e8462d8" : "#0a664aff"};
                      }
                    `}</style>

                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                      className={`w-full p-2 rounded-lg border cursor-pointer text-sm sm:text-base ${
                        isDark
                          ? "bg-[var(--div)] text-[var(--text)] border-[var(--border)] focus:ring-2 focus:ring-[#307A59]"
                          : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-2 focus:ring-[#307A59]"
                      }`}
                    >
                      <option value="" disabled hidden>
                        Select type
                      </option>
                      {["customer", "vendor", "delivery", "user"].map(
                        (type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        )
                      )}
                    </select>
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={form.image_url}
                      onChange={(e) =>
                        setForm({ ...form, image_url: e.target.value })
                      }
                      className={`w-full p-2 rounded-lg border text-sm sm:text-base placeholder-gray-500 ${
                        isDark
                          ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-2 focus:ring-[#307A59]"
                          : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-2 focus:ring-[#307A59]"
                      }`}
                    />
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                      className={`w-full p-2 rounded-lg border cursor-pointer text-sm sm:text-base ${
                        isDark
                          ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-2 focus:ring-[#307A59]"
                          : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-2 focus:ring-[#307A59]"
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>

                    <div className="flex space-x-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 rounded-lg hover:opacity-90 bg-[var(--button)] text-white hover:bg-[#265e46] cursor-pointer text-sm sm:text-base"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="flex-1 py-2 rounded-lg hover:opacity-90 bg-gray-500 text-white hover:bg-gray-600 cursor-pointer text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {cms.image_url && (
                      <img
                        src={cms.image_url}
                        alt={cms.title}
                        className="w-full h-32 sm:h-40 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-1">
                      {cms.title}
                    </h3>
                    <p
                      className={`text-xs sm:text-sm mb-2 line-clamp-2 flex-1 ${
                        isDark ? "text-[var(--text)]" : "text-[var(--text)]"
                      }`}
                    >
                      {cms.content}
                    </p>
                    <div
                      className={`flex justify-between text-xs mb-3 ${
                        isDark ? "text-[var(--text)]" : "text-[var(--text)]"
                      }`}
                    >
                      <span className="capitalize">Type: {cms.type}</span>
                      <span className="capitalize">Status: {cms.status}</span>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => startEdit(cms)}
                        className="flex-1 py-2 rounded-lg hover:opacity-90 bg-[var(--button)] text-white hover:bg-[#265e46] cursor-pointer text-sm sm:text-base flex items-center justify-center gap-2"
                      >
                        <FiEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cms.id, cms.title)}
                        className="flex-1 py-2 rounded-lg hover:opacity-90 cursor-pointer bg-red-600 text-white hover:bg-red-700 cursor-pointer text-sm sm:text-base flex items-center justify-center gap-2"
                      >
                        <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                        Delete
                      </button>
                    </div>

                    {deleteModal.isOpen && (
                      <div className="fixed inset-0 bg-black/5 flex items-center justify-center z-50 p-4">
                        <div
                          className={`rounded-lg shadow-lg w-full max-w-sm p-8 ${
                            isDark ? "bg-[var(--bg)]" : "bg-[var(--bg)]"
                          }`}
                        >
                          <p className="text-[var(--text)] text-center text-sm sm:text-base mb-4 sm:mb-6">
                            Are you sure you want to delete this{" "}
                            {deleteModal.itemTitle && (
                              <span className="font-semibold">
                                {" "}
                                "{deleteModal.itemTitle}"
                              </span>
                            )}
                            ?
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={cancelDelete}
                              className="flex-1 px-3 sm:px-4 py-2 border border-[var(--border)] rounded-lg text-[var(--text)] hover:bg-[var(--hover)] cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={confirmDelete}
                              className="flex-1 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
        )}
      </div>

      {cmsList.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <p
            className={`text-lg sm:text-xl ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No CMS items found
          </p>
          <p
            className={`text-sm sm:text-base mt-2 ${
              isDark ? "text-gray-500" : "text-gray-600"
            }`}
          >
            {activeFilter !== "all"
              ? `No items found for ${activeFilter} filter`
              : "Add your first CMS item using the button above"}
          </p>
        </div>
      )}
    </div>
  );
}

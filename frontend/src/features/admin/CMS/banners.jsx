import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { allCMSForAdmin, editCMS, deleteCMS } from "./cmsSlice";
import { FaPlus } from "react-icons/fa";
import PagesForm from "../CMS/pages";
import { LiaWindowCloseSolid } from "react-icons/lia";

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

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this CMS item?")) {
      dispatch(deleteCMS(id)).then(() => {
        dispatch(allCMSForAdmin());
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
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
      className={`p-6 rounded-2xl shadow-md transition-colors duration-300 border ${
        isDark ? "border-[var(--border)]" : "border-[var(--border)]"
      }`}
    >
      {/* Filter Buttons */}
      <div className="flex justify-between items-center mb-6 text-sm font-medium">
        <div className="flex flex-wrap gap-3 text-sm font-medium">
          {["all", "customer", "vendor", "delivery", "user"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-full transition-colors duration-200 cursor-pointer ${
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
          className="flex items-center space-x-2 px-4 py-2 rounded hover:opacity-90 transition-colors bg-[var(--button)] text-white hover:bg-[#265e46] cursor-pointer"
        >
          <FaPlus /> <span>Add Pages</span>
        </button>

        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div
              className={` rounded-lg p-6 shadow-lg w-[500px] relative ${
                isDark
                  ? "bg-[var(--bg)] text-[var(--text)]"
                  : "bg-[var(--bg)] text-[var(--text)]"
              }`}
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 text-[var(--text)] hover:text-red-500 transition-colors cursor-pointer"
              >
                <LiaWindowCloseSolid size={22} />
              </button>

              <PagesForm />
            </div>
          </div>
        )}
      </div>

      {/* CMS List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeFilter === "all"
          ? cmsList
          : cmsList.filter((cms) => cms.type === activeFilter)
        )?.map(
          (cms) =>
            cms && (
              <div
                key={cms.id}
                className={`border rounded-2xl p-4 shadow transition-colors duration-300 ${
                  isDark
                    ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                    : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                }`}
              >
                {editingId === cms.id ? (
                  <form onSubmit={handleSave} className="space-y-3">
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      placeholder="Title"
                      required
                      className={`w-full p-2 rounded border placeholder- ${
                        isDark
                          ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                          : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
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
                      className={`w-full p-2 rounded border placeholder- ${
                        isDark
                          ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                          : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                      }`}
                    />
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                      className={`w-full p-2 rounded border cursor-pointer placeholder- ${
                        isDark
                          ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                          : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                      }`}
                    >
                      <option value="" disabled hidden>
                        Select type
                      </option>
                      <option
                        style={{
                          backgroundColor: isDark ? "#2d2d2d" : "#fff",
                          color: isDark ? "#f1f1f1" : "#222",
                        }}
                        value="customer"
                      >
                        Customer
                      </option>
                      <option
                        style={{
                          backgroundColor: isDark ? "#2d2d2d" : "#fff",
                          color: isDark ? "#f1f1f1" : "#222",
                        }}
                        value="vendor"
                      >
                        Vendor
                      </option>
                      <option
                        style={{
                          backgroundColor: isDark ? "#2d2d2d" : "#fff",
                          color: isDark ? "#f1f1f1" : "#222",
                        }}
                        value="delivery"
                      >
                        Delivery
                      </option>
                      <option
                        style={{
                          backgroundColor: isDark ? "#2d2d2d" : "#fff",
                          color: isDark ? "#f1f1f1" : "#222",
                        }}
                        value="user"
                      >
                        User
                      </option>
                    </select>
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={form.image_url}
                      onChange={(e) =>
                        setForm({ ...form, image_url: e.target.value })
                      }
                      className={`w-full p-2 rounded border placeholder- ${
                        isDark
                          ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                          : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                      }`}
                    />
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                      className={`w-full p-2 rounded border cursor-pointer placeholder- ${
                        isDark
                          ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                          : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>

                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="flex-1 py-1 rounded hover:opacity-90 bg-[var(--button)] text-white hover:bg-[#265e46] cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        style={{
                          backgroundColor: isDark ? "#555" : "#aaa",
                          color: "#fff",
                        }}
                        className="flex-1 py-1 rounded hover:opacity-90 cursor-pointer"
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
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-lg mb-1">{cms.title}</h3>
                    <p
                      className={`text-sm mb-2 line-clamp-2 ${
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
                      <span>Type: {cms.type}</span>
                      <span>Status: {cms.status}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(cms)}
                        className="flex-1 py-1 rounded hover:opacity-90 bg-[var(--button)] text-white hover:bg-[#265e46] cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cms.id)}
                        style={{ backgroundColor: "#e53e3e", color: "#fff" }}
                        className="flex-1 py-1 rounded hover:opacity-90 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
        )}
      </div>
    </div>
  );
}

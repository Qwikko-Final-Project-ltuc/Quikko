import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { allCMSForAdmin, editCMS, deleteCMS } from "./cmsSlice";
import { colors } from "../dark-lightMode/colors";

export default function BannersForm() {
  const dispatch = useDispatch();
  const { cmsList, loading, error } = useSelector((state) => state.cms);
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";
  const c = colors[isDark ? "dark" : "light"];

  const [editingId, setEditingId] = useState(null);
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

  if (loading) return <p>Loading CMS items...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div
      style={{ backgroundColor: c.cardBg, color: c.text }}
      className="p-6 rounded-2xl shadow-md transition-colors duration-300"
    >
      <h2 className="text-2xl font-bold mb-6">Edit Pages</h2>

      {/* Filter Buttons */}
      <div className="flex space-x-3 text-sm font-medium mb-6">
        {["all", "customer", "vendor", "delivery", "user"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={{
              backgroundColor:
                activeFilter === filter
                  ? c.button
                  : isDark
                  ? "#333333"
                  : "#f5f5f5",

              color: activeFilter === filter ? "#ffffff" : c.text,
              border: `1px solid ${
                activeFilter === filter ? c.button : isDark ? "#666666" : "#ccc"
              }`,
            }}
            className="px-4 py-1.5 rounded-full transition-all duration-300 hover:opacity-90 shadow-sm"
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
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
                style={{
                  backgroundColor: c.pageBg,
                  borderColor: c.line,
                  color: c.text,
                }}
                className="border rounded-2xl p-4 shadow transition-colors duration-300"
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
                      style={{
                        backgroundColor: c.inputBg,
                        color: isDark ? "#514e4eff" : "#111",
                        borderColor: c.line,
                        "::placeholder": { color: isDark ? "#aaa" : "#777" },
                      }}
                      className={`w-full p-2 rounded border placeholder-${
                        isDark ? "gray-400" : "gray-600"
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
                      style={{
                        backgroundColor: c.inputBg,
                        color: isDark ? "#514e4eff" : "#111",
                        borderColor: c.line,
                      }}
                      className={`w-full p-2 rounded border placeholder-${
                        isDark ? "gray-400" : "gray-600"
                      }`}
                    />
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                      style={{
                        backgroundColor: c.inputBg,
                        color: isDark ? "#514e4eff" : "#111",
                        borderColor: c.line,
                      }}
                      className={`w-full p-2 rounded border ${
                        form.type === ""
                          ? isDark
                            ? "text-gray-400"
                            : "text-gray-600"
                          : "text-current"
                      }`}
                    >
                      <option value="" disabled hidden>
                        Select type
                      </option>
                      <option value="customer">Customer</option>
                      <option value="vendor">Vendor</option>
                      <option value="delivery">Delivery</option>
                      <option value="user">User</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={form.image_url}
                      onChange={(e) =>
                        setForm({ ...form, image_url: e.target.value })
                      }
                      style={{
                        backgroundColor: c.inputBg,
                        color: isDark ? "#514e4eff" : "#111",
                        borderColor: c.line,
                      }}
                      className={`w-full p-2 rounded border placeholder-gray-400 ${
                        isDark ? "placeholder-gray-400" : "placeholder-gray-600"
                      }`}
                    />
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                      style={{
                        backgroundColor: c.inputBg,
                        color: isDark ? "#514e4eff" : "#111",
                        borderColor: c.line,
                      }}
                      className={`w-full p-2 rounded border text-current`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>

                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        style={{
                          backgroundColor: c.button,
                          color: "#fff",
                        }}
                        className="flex-1 py-1 rounded hover:opacity-90"
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
                        className="flex-1 py-1 rounded hover:opacity-90"
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
                      className="text-sm mb-2 line-clamp-2"
                      style={{
                        color: isDark ? "#e5e5e5b3" : "#555",
                      }}
                    >
                      {cms.content}
                    </p>
                    <div
                      className="flex justify-between text-xs mb-3"
                      style={{
                        color: isDark ? "#cccccc8e" : "#666",
                      }}
                    >
                      <span>Type: {cms.type}</span>
                      <span>Status: {cms.status}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(cms)}
                        style={{ backgroundColor: c.button, color: "#fff" }}
                        className="flex-1 py-1 rounded hover:opacity-90"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cms.id)}
                        style={{ backgroundColor: "#e53e3e", color: "#fff" }}
                        className="flex-1 py-1 rounded hover:opacity-90"
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

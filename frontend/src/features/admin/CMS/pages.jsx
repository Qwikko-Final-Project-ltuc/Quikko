import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCMS } from "./cmsSlice";

export default function PagesForm() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.cms);
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "",
    image_url: "",
    status: "active",
  });

  const [successMsg, setSuccessMsg] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    dispatch(addCMS(form))
      .unwrap()
      .then(() => {
        setSuccessMsg("Page added successfully!");
        setForm({
          title: "",
          content: "",
          type: "",
          image_url: "",
          status: "active",
        });
        setTimeout(() => setSuccessMsg(""), 3000);
      })
      .catch((err) => {
        setSuccessMsg(`Failed to add page: ${err}`);
        setTimeout(() => setSuccessMsg(""), 3000);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--button)] mx-auto mb-4"></div>
          <p className="text-[var(--text)] text-lg">Loading Pages...</p>
        </div>
      </div>
    );
  }
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div
      className={`p-4 sm:p-6 transition-colors duration-300 ${
        isDark ? "text-[var(--text)]" : "text-[var(--text)]"
      }`}
    >
      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center sm:text-left">
        Add New Page
      </h2>

      <form onSubmit={handleAdd} className="space-y-3 sm:space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={`w-full p-2 sm:p-3 rounded-lg border placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 transition-colors duration-300 ${
            isDark
              ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-[#307A59]"
              : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-[#307A59]"
          }`}
          required
        />

        <textarea
          placeholder="Content"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className={`w-full p-2 sm:p-3 rounded-lg border placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 transition-colors duration-300 resize-vertical ${
            isDark
              ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-[#307A59]"
              : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-[#307A59]"
          }`}
          rows={3}
          required
        />
        <div>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className={`w-full p-2 sm:p-3 rounded-lg border text-sm sm:text-base focus:outline-none focus:ring-2 transition-colors duration-300 cursor-pointer ${
              isDark
                ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-[#307A59]"
                : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-[#307A59]"
            }`}
            required
          >
            <option value="" disabled hidden>
              Select type
            </option>
            {["customer", "vendor", "delivery", "user"].map((type) => (
              <option
                key={type}
                value={type}
                className={
                  isDark
                    ? "bg-[var(--bg)] text-[var(--text)]"
                    : "bg-white text-gray-800"
                }
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="text"
            placeholder="Image URL"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className={`w-full p-2 sm:p-3 rounded-lg border placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 transition-colors duration-300 ${
              isDark
                ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-[#307A59]"
                : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-[#307A59]"
            }`}
          />
        </div>

        {form.image_url && (
          <div className="flex flex-col items-center">
            <p
              className={`text-sm mb-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Image Preview:
            </p>
            <img
              src={form.image_url}
              alt="Preview"
              className="w-32 h-20 object-cover rounded-lg border border-[var(--border)]"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}

        <div className="flex justify-center pt-2">
          <button
            type="submit"
            className={`flex justify-center items-center w-full sm:w-48 py-2 sm:py-3 text-white rounded-lg text-white hover:opacity-90 transition-colors cursor-pointer text-sm sm:text-base font-medium ${
              isDark
                ? "bg-[var(--button)] hover:bg-[#265e46]"
                : "bg-[var(--button)] hover:bg-[#265e46]"
            }`}
          >
            Add CMS Page
          </button>
        </div>

        {successMsg && (
          <div className="text-center">
            <p
              className={`mt-2 p-2 rounded-lg text-sm sm:text-base ${
                isDark
                  ? "bg-green-900/20 text-green-400"
                  : "bg-green-100 text-green-800"
              }`}
            >
              ✓ {successMsg}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

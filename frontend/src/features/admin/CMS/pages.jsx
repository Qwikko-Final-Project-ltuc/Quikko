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
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
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
      className={`p-6 transition-colors duration-300 ${
        isDark ? "text-[var(--text)]" : "text-[var(--text)]"
      }`}
    >
      <h2 className="text-xl font-bold mb-6">Add New Page</h2>

      <form onSubmit={handleAdd} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={`w-full p-3 rounded border placeholder-opacity-50 ${
            isDark
              ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
              : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
          }`}
          required
        />

        <textarea
          placeholder="Content"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className={`w-full p-3 rounded border placeholder-opacity-50 ${
            isDark
              ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
              : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
          }`}
          rows={4}
          required
        />

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className={`w-full p-3 rounded border focus:outline-none focus:ring-2 transition-colors duration-300 cursor-pointer ${
            isDark
              ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
              : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
          }`}
          required
        >
          <option value="" disabled hidden>
            Select type
          </option>
          <option
            value="customer"
            style={{
              backgroundColor: isDark ? "#2d2d2d" : "#fff",
              color: isDark ? "#f1f1f1" : "#222",
            }}
          >
            Customer
          </option>
          <option
            value="vendor"
            style={{
              backgroundColor: isDark ? "#2d2d2d" : "#fff",
              color: isDark ? "#f1f1f1" : "#222",
            }}
          >
            Vendor
          </option>
          <option
            value="delivery"
            style={{
              backgroundColor: isDark ? "#2d2d2d" : "#fff",
              color: isDark ? "#f1f1f1" : "#222",
            }}
          >
            Delivery
          </option>
          <option
            value="user"
            style={{
              backgroundColor: isDark ? "#2d2d2d" : "#fff",
              color: isDark ? "#f1f1f1" : "#222",
            }}
          >
            User
          </option>
        </select>

        <input
          type="text"
          placeholder="Image URL"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          className={`w-full p-3 rounded border placeholder-opacity-50 ${
            isDark
              ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
              : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
          }`}
        />

        <div className="flex justify-center">
          <button
            type="submit"
            className={`flex justify-center items-center w-60 py-3 text-white rounded hover:opacity-90 transition-colors cursor-pointer ${
              isDark ? "bg-[var(--button)]" : "bg-[var(--button)]"
            }`}
          >
            Add CMS
          </button>
        </div>

        {successMsg && (
          <p
            className="mt-2"
            style={{ color: isDark ? "#589458ff" : "#307A59" }}
          >
            {successMsg}
          </p>
        )}
      </form>
    </div>
  );
}

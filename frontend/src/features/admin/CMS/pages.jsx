import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCMS } from "./cmsSlice";
import { colors } from "../dark-lightMode/colors";

export default function PagesForm() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.cms);
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";
  const c = colors[isDark ? "dark" : "light"];

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

  if (loading) return <p>Loading pages...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div
      style={{ backgroundColor: c.cardBg, color: c.text, borderColor: c.line }}
      className="p-6 rounded-2xl shadow-md max-w-lg mx-auto transition-colors duration-300"
    >
      <h2 className="text-xl font-bold mb-6">Add New Page</h2>

      <form onSubmit={handleAdd} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          style={{
            backgroundColor: c.inputBg,
            color: isDark ? "#514e4eff" : "#111",
            borderColor: c.line,
          }}
          className={`w-full p-3 rounded border placeholder-opacity-50 ${
            isDark ? "placeholder-gray-400" : "placeholder-gray-500"
          }`}
          required
        />

        <textarea
          placeholder="Content"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          style={{
            backgroundColor: c.inputBg,
            color: isDark ? "#514e4eff" : "#111",
            borderColor: c.line,
          }}
          className={`w-full p-3 rounded border placeholder-opacity-50 ${
            isDark ? "placeholder-gray-400" : "placeholder-gray-500"
          }`}
          rows={4}
          required
        />

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          style={{
            backgroundColor: c.inputBg,
            color: form.type === "" ? (isDark ? "#aaa" : "#777") : c.text,
            borderColor: c.line,
          }}
          className="w-full p-3 rounded border focus:outline-none focus:ring-2 transition-colors duration-300"
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
          style={{
            backgroundColor: c.inputBg,
            color: isDark ? "#514e4eff" : "#111",
            borderColor: c.line,
          }}
          className={`w-full p-3 rounded border placeholder-opacity-50 ${
            isDark ? "placeholder-gray-400" : "placeholder-gray-500"
          }`}
        />

        <button
          type="submit"
          style={{ backgroundColor: c.button }}
          className="w-full py-3 text-white rounded hover:opacity-90 transition-colors"
        >
          Add CMS
        </button>
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

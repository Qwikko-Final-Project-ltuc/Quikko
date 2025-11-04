import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "./notificationSlice";

export default function NotificationsForm() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  const [form, setForm] = useState({
    userId: "",
    role: "",
    title: "",
    message: "",
    type: "",
  });

  const [successMsg, setSuccessMsg] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();

    const payload = form.userId
      ? {
          userId: form.userId,
          title: form.title,
          message: form.message,
          type: form.type,
        }
      : {
          role: form.role,
          title: form.title,
          message: form.message,
          type: form.type,
        };

    dispatch(addNotification(form))
      .unwrap()
      .then(() => {
        setSuccessMsg("Notification sent successfully!");
        setForm({ userId: "", role: "", title: "", message: "", type: "" });

        setTimeout(() => setSuccessMsg(""), 3000);
      })
      .catch((err) => {
        setSuccessMsg(`Failed to send: ${err}`);
        setTimeout(() => setSuccessMsg(""), 3000);
      });
  };

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
        <h2 className="text-xl font-bold mb-6">Send Notification</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          {["userId", "title", "type"].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={
                field === "userId"
                  ? "User ID (optional)"
                  : field.charAt(0).toUpperCase() + field.slice(1)
              }
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className={`w-full p-3 rounded placeholder-opacity-50 border ${
                isDark
                  ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                  : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
              }`}
            />
          ))}

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            disabled={!!form.userId}
            className={`w-full p-3 rounded border focus:outline-none focus:ring-2 transition-colors duration-300 cursor-pointer ${
              isDark
                ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
            }`}
          >
            <option value="" disabled hidden>
              Select Role
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
          </select>

          <textarea
            placeholder="Message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className={`w-full p-3 rounded placeholder-opacity-50 border  ${
              isDark
                ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
                : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)]"
            }`}
            rows={4}
            required
          />

          <div className="flex justify-center">
            <button
              type="submit"
              className={`flex justify-center items-center w-100 py-3 text-white rounded hover:opacity-90 transition-colors cursor-pointer ${
                isDark ? "bg-[var(--button)]" : "bg-[var(--button)]"
              }`}
            >
              Send Notification
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
    </div>
  );
}

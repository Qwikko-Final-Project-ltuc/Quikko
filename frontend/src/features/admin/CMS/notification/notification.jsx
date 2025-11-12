import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "./notificationSlice";

export default function NotificationsForm() {
  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.notifications);
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
  const [localError, setLocalError] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    setLocalError("");

    if (!form.message.trim()) {
      setLocalError("Message is required");
      return;
    }

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

    dispatch(addNotification(payload))
      .unwrap()
      .then(() => {
        setSuccessMsg("Notification sent successfully!");
        setForm({ userId: "", role: "", title: "", message: "", type: "" });

        setTimeout(() => setSuccessMsg(""), 3000);
      })
      .catch((err) => {
        const errorMessage = err?.message || "Failed to send notification";
        setLocalError(errorMessage);
        setTimeout(() => setLocalError(""), 3000);
      });
  };

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
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center sm:text-left">
          Send Notification
        </h2>
        <form onSubmit={handleAdd} className="space-y-3 sm:space-y-4">
          {["userId", "title", "type"].map((field) => (
            <div key={field}>
              <input
                type="text"
                placeholder={
                  field === "userId"
                    ? "User ID (optional)"
                    : field === "type"
                    ? "Notification Type (e.g., order, system, promotion)"
                    : field.charAt(0).toUpperCase() + field.slice(1)
                }
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className={`w-full p-2 sm:p-3 rounded-lg placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 transition-colors duration-300 border ${
                  isDark
                    ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-[#307A59]"
                    : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-[#307A59]"
                }`}
              />
            </div>
          ))}

          <div>
            <label
              className={`block text-sm sm:text-base mb-2 ${
                isDark ? "text-[var(--text)]" : "text-[var(--text)]"
              }`}
            >
              Target Audience
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              disabled={!!form.userId}
              required
              className={`w-full p-2 sm:p-3 rounded-lg border text-sm sm:text-base focus:outline-none focus:ring-2 transition-colors duration-300 ${
                !!form.userId
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              } ${
                isDark
                  ? "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-[#307A59]"
                  : "bg-[var(--bg)] text-[var(--text)] border-[var(--border)] focus:ring-[#307A59]"
              }`}
            >
              <option
                value=""
                disabled
                hidden
                className={
                  isDark
                    ? "bg-[var(--bg)] text-[var(--text)]"
                    : "bg-[var(--bg)] text-[var(--text)]"
                }
              >
                {!!form.userId ? "Select specific user instead" : "Select Role"}
              </option>
              {["customer", "vendor", "delivery"].map((role) => (
                <option
                  key={role}
                  value={role}
                  className={
                    isDark
                      ? "bg-[var(--bg)] text-[var(--text)]"
                      : "bg-[var(--bg)] text-[var(--text)]"
                  }
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
            {!!form.userId && (
              <p
                className={`text-xs mt-1 ${
                  isDark
                    ? "text-[var(--text)] opacity-70"
                    : "text-[var(--text)] opacity-70"
                }`}
              >
                Role selection is disabled when targeting specific user
              </p>
            )}
          </div>

          <div>
            <label
              className={`block text-sm sm:text-base mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Message *
            </label>
            <textarea
              placeholder="Enter your notification message here..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={`w-full p-2 sm:p-3 rounded-lg border placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 transition-colors duration-300 resize-vertical ${
                isDark
                  ? "bg-[var(--div)] text-[var(--text)] border-[var(--border)] focus:ring-[#307A59]"
                  : "bg-white text-gray-800 border-gray-300 focus:ring-[#307A59]"
              }`}
              rows={3}
              required
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
          </div>

          {/* معلومات الإشعار */}
          <div
            className={`p-3 rounded-lg border text-xs sm:text-sm ${
              isDark
                ? "bg-[var(--div)] border-[var(--border)] text-gray-300"
                : "bg-gray-50 border-gray-200 text-gray-600"
            }`}
          >
            <p>
              <strong>Notification Info:</strong>
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Set User ID for specific user, or Role for group</li>
              <li>Type helps categorize the notification</li>
              <li>Title, Role and Message are required and will be sent immediately</li>
            </ul>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={
                !form.title.trim() && !form.message.trim() && !form.role
              }
              className={`flex justify-center items-center w-full sm:w-64 py-2 sm:py-3 text-white rounded-lg transition-colors cursor-pointer text-sm sm:text-base font-medium ${
                !form.title.trim() || !form.message.trim() || !form.role
                  ? "bg-gray-400 cursor-not-allowed"
                  : isDark
                  ? "bg-[var(--button)] hover:bg-[#265e46]"
                  : "bg-[var(--button)] hover:bg-[#265e46]"
              }`}
            >
              {!form.title.trim() || !form.message.trim() || !form.role
                ? "Fill Required Fields"
                : "Send Notification"}
            </button>
          </div>

          {successMsg && (
            <div className="text-center">
              <p
                className={`mt-2 p-2 rounded-lg text-sm sm:text-base ${
                  isDark
                    ? "bg-green-900/20 text-green-400 border border-green-800"
                    : "bg-green-100 text-green-800 border border-green-200"
                }`}
              >
                ✓ {successMsg}
              </p>
            </div>
          )}

          {(localError || error) && (
            <div className="text-center">
              <p
                className={`mt-2 p-2 rounded-lg text-sm sm:text-base ${
                  isDark
                    ? "bg-red-900/20 text-red-400 border border-red-800"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                ✗ {localError || error}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

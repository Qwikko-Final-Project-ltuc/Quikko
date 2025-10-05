import { useState } from "react";
import { useDispatch } from "react-redux";
import { addNotification } from "./notificationSlice";

export default function NotificationsForm() {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    userId: "",
    role: "role",
    title: "",
    message: "",
    type: "",
  });

  const [successMsg, setSuccessMsg] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();

    const payload = form.userId
      ? { userId: form.userId, title: form.title, message: form.message, type: form.type }
      : { role: form.role, title: form.title, message: form.message, type: form.type };

    dispatch(addNotification(form))
      .unwrap()
      .then(() => {
        setSuccessMsg("Notification sent successfully!");
        setForm({ userId: "", role: "role", title: "", message: "", type: "" });

        setTimeout(() => setSuccessMsg(""), 3000);
      })
      .catch((err) => {
        setSuccessMsg(`Failed to send: ${err}`);
        setTimeout(() => setSuccessMsg(""), 3000);
      });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Send Notification</h2>
      <div className="flex items-center mb-6 space-x-4">
        <form onSubmit={handleAdd} className="space-y-4 max-w-lg">
          <input
          type="text"
          placeholder="User ID (optional)"
          value={form.userId}
          onChange={(e) => setForm({ ...form, userId: e.target.value })}
          className="w-full border p-2"
        />

          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full border p-2"
            disabled={!!form.userId}
          >
            <option value="role">Role</option>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="delivery">Delivery</option>
          </select>

          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border p-2"
            required
          />
          <textarea
            placeholder="Message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full border p-2"
            required
          />

          <input
            type="text"
            placeholder="type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full border p-2"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Send Notification
          </button>
          {successMsg && <p className="text-green-600 mt-2">{successMsg}</p>}
        </form>
      </div>
    </div>
  );
}

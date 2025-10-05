import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCMS } from "./cmsSlice";

export default function PagesForm() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.cms);

  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "",
    image_url: "",
    status: "active",
  });

  const handleAdd = (e) => {
    e.preventDefault();
    dispatch(addCMS(form)).then(() => {
      setForm({
        title: "",
        content: "",
        type: "",
        image_url: "",
        status: "active",
      });
    });
  };

  if (loading) return <p>Loading pages...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Add New Pages</h2>
      <div className="flex items-center mb-6 space-x-4">
        <form onSubmit={handleAdd} className="space-y-4 max-w-lg">
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border p-2"
            required
          />
          <textarea
            placeholder="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full border p-2"
            required
          />

          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full border p-2"
            required
          >
            <option value="" disabled>Select type</option>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
            <option value="delivery">Delivery</option>
            <option value="user">User</option>
          </select>

          <input
            type="text"
            placeholder="Image URL"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className="w-full border p-2"
          />

          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Add CMS
          </button>
        </form>
      </div>
    </div>
  );
}

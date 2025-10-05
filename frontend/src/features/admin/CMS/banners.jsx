import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { allCMSForAdmin, editCMS, deleteCMS } from "./cmsSlice";

export default function BannersForm() {
  const dispatch = useDispatch();
  const { cmsList, loading, error } = useSelector((state) => state.cms);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "",
    image_url: "",
    status: "active",
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
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Edit Pages</h2>
      {cmsList.length === 0 ? (
        <p>No CMS items found.</p>
      ) : (
        <ul className="space-y-4">
          {cmsList.map((cms) => (
            <li key={cms.id} className="border p-3 rounded">
              {editingId === cms.id ? (
                <form onSubmit={handleSave} className="space-y-2">
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full border p-2"
                    placeholder="Title"
                    required
                  />
                  <textarea
                    value={form.content}
                    onChange={(e) =>
                      setForm({ ...form, content: e.target.value })
                    }
                    className="w-full border p-2"
                    required
                  />
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border p-2"
                  >
                    <option value="" disabled>
                      Select type
                    </option>
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                    <option value="delivery">Delivery</option>
                    <option value="user">User</option>
                  </select>
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={(e) =>
                      setForm({ ...form, image_url: e.target.value })
                    }
                    className="w-full border p-2"
                    placeholder="Image URL"
                  />
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full border p-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-green-500 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-gray-400 text-white rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">Title: {cms.title}</h3>
                    <p className="text-sm">Content: {cms.content}</p>
                    <div className="flex space-x-4 text-xs">
                      <p>Type: {cms.type}</p>
                      <p>Status: {cms.status}</p>
                    </div>
                    {cms.image_url && (
                      <img
                        src={cms.image_url}
                        alt="CMS"
                        className="w-32 h-auto mt-2 rounded"
                      />
                    )}
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => startEdit(cms)}
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cms.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export async function GetAllCategory() {
  const token = localStorage.getItem("token");

  const response = await fetch("https://qwikko.onrender.com/api/categories", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "category data failed. Please try again.");
  }

  return data.data || data;
}

export async function AddCategory(categoryData) {
  const token = localStorage.getItem("token");

  const response = await fetch("https://qwikko.onrender.com/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(categoryData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add category");
  }

  return data;
}

export async function EditCategory(id, categoryData) {
  const token = localStorage.getItem("token");

  const response = await fetch(`https://qwikko.onrender.com/api/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(categoryData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to edit category");
  }

  return data;
}

export async function DeleteCategory(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(`https://qwikko.onrender.com/api/categories/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete category");
  }

  return { id }; 
}
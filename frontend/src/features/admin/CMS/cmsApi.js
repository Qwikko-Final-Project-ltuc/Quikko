export async function GetAllCMSForAdmin() {
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:3000/api/cms/admin`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch CMS for admin");
  }

  return data;
}


export async function AddCMS(cmsData) {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:3000/api/cms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cmsData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add cms");
  }

  return data;
}

export async function EditCMS(id, cmsData) {
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:3000/api/cms/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cmsData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to edit cms");
  }

  return data;
}

export async function DeleteCMS(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:3000/api/cms/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete cms");
  }

  return { id }; 
}
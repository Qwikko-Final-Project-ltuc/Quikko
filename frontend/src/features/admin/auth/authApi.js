export async function loginAdmin({ email, password }) {
  const response = await fetch("https://qwikko.onrender.com/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed. Please try again.");
  }

  return data; 
}

export async function profile() {
  const token = localStorage.getItem("token");

  const response = await fetch("https://qwikko.onrender.com/api/admin/profile", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "profile data failed. Please try again.");
  }

  return data; 
}

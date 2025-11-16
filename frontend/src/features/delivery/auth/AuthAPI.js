export const registerDeliveryAPI = async (formData) => {
  const res = await fetch("https://qwikko.onrender.com/api/auth/register/delivery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Registration failed");

  return data;
};

export const loginAPI = async (formData) => {
  const res = await fetch("https://qwikko.onrender.com/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
};

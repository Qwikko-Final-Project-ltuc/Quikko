export async function AddNotification(notificationsData) {
  const token = localStorage.getItem("token");

  const response = await fetch("https://qwikko.onrender.com/api/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(notificationsData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add notification");
  }

  return data;
}
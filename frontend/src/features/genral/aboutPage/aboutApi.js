export async function GetAllCMS(type = "user", title) {
  if (!title) throw new Error("Title is required");

  const response = await fetch(`http://localhost:3000/api/cms?type=${type}&title=${encodeURIComponent(title)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch CMS for admin");
  }

  return data;
}

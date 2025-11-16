// src/api/cms.js أو ./Api/LandingAPI.js حسب ملفّك
export async function fetchLandingCMS(type, title) {
  try {
    const query = `https://qwikko.onrender.com/api/cms?type=${encodeURIComponent(
      type
    )}&title=${encodeURIComponent(title)}&_=${Date.now()}`;
    const res = await fetch(query, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch CMS content");
    const data = await res.json();
    return data?.[0] || {};
  } catch (err) {
    console.error("❌ Error fetching CMS:", err);
    return {};
  }
}

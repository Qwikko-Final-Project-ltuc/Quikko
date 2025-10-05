export const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // decode base64
    return payload.id || payload.userId || null;
  } catch (err) {
    console.error("Failed to parse token:", err);
    return null;
  }
};
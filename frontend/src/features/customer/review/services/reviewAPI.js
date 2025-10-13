import axios from "axios";

const API_URL = "http://localhost:3000/api/reviews"; 

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});
export const addReview = async ({ vendor_id, rating }) => {
  const token = localStorage.getItem("token");
  const res = await api.post(
    "/",
    { vendor_id, rating },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const getReviewsByVendor = async (vendor_id) => {
  const res = await api.get(`/vendor/${vendor_id}`);
  return res.data;
};

export const getVendorAverageRating = async (vendor_id) => {
  const res = await api.get(`/vendor/${vendor_id}/average`);
  return res.data.average_rating; 
};

export const getUserReview = async (vendor_id) => {
  const token = localStorage.getItem("token");
  const res = await api.get(`/vendor/${vendor_id}/me`, {
    headers: { Authorization: `Bearer ${token}` },
    
  });
  return res.data.rating || 0;
};

export const fetchVendorsWithReviews = async () => {
  const res = await axios.get(`${API_URL}/reviews`);
  return res.data;
};

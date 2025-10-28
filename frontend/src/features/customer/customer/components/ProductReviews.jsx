import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductReviews = ({ productId, user }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`/api/review/${productId}`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "/api/review",
        { product_id: productId, rating, comment, sentiment: null },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setReviews([res.data.review, ...reviews]);
      setComment("");
      setRating(5);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error adding review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-reviews">
      <h3>Reviews</h3>

      {user && (
        <form onSubmit={handleAddReview} className="add-review-form">
          <label>
            Rating:
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} ⭐
                </option>
              ))}
            </select>
          </label>
          <label>
            Comment:
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Review"}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      )}

      <div className="reviews-list">
        {reviews.length === 0 && <p>No reviews yet.</p>}
        {reviews.map((rev) => (
          <div key={rev.id} className="review-card">
            <p>
              <strong>{rev.user_name}</strong> - {rev.rating} ⭐
            </p>
            <p>{rev.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;

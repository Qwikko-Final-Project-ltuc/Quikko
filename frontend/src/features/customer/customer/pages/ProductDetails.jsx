import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useSelector } from "react-redux";
import customerAPI from "../services/customerAPI"; // تأكد من وجودها

const ProductDetails = () => {
  const { id } = useParams(); // product_id من الرابط
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const user = useSelector((state) => state.cart.user); // للوصول إلى user.id

  useEffect(() => {
    let hasLoggedView = false; // 🔒 متغير محلي لمنع التكرار

    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/products/${id}`);
        setProduct(res.data);

        // تسجيل تفاعل "view" مرة واحدة فقط
        if (user?.id && !hasLoggedView) {
          hasLoggedView = true;
          await customerAPI.logInteraction(user.id, id, "view");
          console.log("✅ View interaction logged once");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/products/review/${id}`);
        setReviews(res.data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    fetchProduct();
    fetchReviews();

    // cleanup: يمنع تكرار تسجيل التفاعل عند unmount/remount السريع
    return () => {
      hasLoggedView = true;
    };
  }, [id, user?.id]); // يعيد التشغيل فقط عند تغير المنتج أو المستخدم

  // إرسال مراجعة جديدة
  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token"); // توكن المستخدم المسجل
      await axios.post(
        "http://localhost:3000/api/products/review",
        {
          product_id: id,
          rating,
          comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Review added successfully!");
      setRating(0);
      setComment("");

      // إعادة تحميل التعليقات بعد الإضافة
      const res = await axios.get(`http://localhost:3000/api/products/review/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Error adding review:", err);
      alert(err.response?.data?.message || "Failed to add review");
    }
  };

  if (!product) return <div className="p-8 text-center">Loading...</div>;

  const images = Array.isArray(product.images) ? product.images : [];

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* تفاصيل المنتج */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="relative w-full md:w-1/2">
          {images.length > 0 && (
            <>
              <img
                src={images[currentImage]}
                alt={product.name}
                className="w-full h-80 object-contain rounded cursor-pointer"
                onClick={() => setIsOpen(true)}
              />
            </>
          )}
          <Lightbox
            open={isOpen}
            close={() => setIsOpen(false)}
            slides={images.map((img) => ({ src: img }))}
            index={currentImage}
            onIndexChange={setCurrentImage}
          />
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-700 mb-4">{product.description}</p>
          <p className="text-xl font-semibold text-blue-600 mb-4">
            ${product.price}
          </p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Add to Cart
          </button>
        </div>
      </div>

      {/* قسم الريفيوز */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>

        {/* عرض التعليقات */}
        {reviews.length === 0 ? (
          <p className="text-gray-600">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border-b pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{r.user_name}</span>
                  <span>{"⭐".repeat(r.rating)}</span>
                </div>
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* إضافة مراجعة جديدة */}
        <form onSubmit={handleAddReview} className="mt-8 border-t pt-4">
          <h3 className="text-xl font-bold mb-2">Add your review</h3>
          <label className="block mb-2">
            Rating:
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="ml-2 border rounded px-2 py-1"
              required
            >
              <option value="">Select...</option>
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} Star{num > 1 && "s"}
                </option>
              ))}
            </select>
          </label>
          <textarea
            placeholder="Write your comment..."
            className="w-full border rounded p-2 mb-3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductDetails;

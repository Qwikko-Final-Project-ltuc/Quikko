// // src/features/customer/customer/components/ProductList.jsx
// import React from "react";
// import ProductCard from "./ProductCard";

// const ProductList = ({ products, onAddToCart }) => {
//   if (!products || products.length === 0) return <p className="text-gray-500">No products found</p>;

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//       {products.map((product) => (
//         <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
//       ))}
//     </div>
//   );
// };

// export default ProductList;

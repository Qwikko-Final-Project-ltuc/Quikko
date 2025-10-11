import React from "react";

const CategoryList = ({ categories, selectedCategories, onToggle }) => {
  if (!categories || categories.length === 0)
    return <p className="text-gray-500 text-center">No categories found</p>;

  return (
    <div className="flex flex-wrap gap-3 mb-6 justify-center">
      {/* All */}
      <button
        key="all"
        onClick={() => onToggle({ id: "all" })}
        className={`px-4 py-2 rounded-full border transition ${
          selectedCategories.length === 0
            ? "bg-blue-500 text-white border-blue-500"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
        }`}
      >
        All
      </button>

      {categories.map((cat) => (
      <button
        key={cat.id}
        onClick={() => onToggle(cat)}
        className={`px-4 py-2 rounded-full border transition ${
          selectedCategories.includes(cat.id)
            ? "bg-blue-500 text-white border-blue-500"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
        }`}
      >
        {cat.name}
      </button>
    ))}

    </div>
  );
};

export default CategoryList;

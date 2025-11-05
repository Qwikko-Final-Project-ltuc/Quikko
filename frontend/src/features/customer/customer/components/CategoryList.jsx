import React from "react";
import { useSelector } from "react-redux";

const CategoryList = ({ categories, selectedCategories, onToggle }) => {
  // جلب الثيم مباشرة من الـ Redux
  const themeMode = useSelector((state) => state.customerTheme.mode);

  // دالة لتحديد الكلاسات حسب الثيم
  const getCategoryClasses = (isSelected) => {
    if (isSelected) {
      return "bg-[var(--button)] text-white border-[var(--button)] shadow-md";
    }
    
    // حسب الثيم الحالي
    if (themeMode === 'light') {
      return "bg-[var(--textbox)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--hover)] hover:border-[var(--button)]";
    } else {
      return "bg-[var(--div)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--hover)] hover:border-[var(--button)]";
    }
  };

  if (!categories || categories.length === 0)
    return (
      <div className="text-center py-4">
        <p className="text-[var(--light-gray)] text-sm">No categories found</p>
      </div>
    );

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {/* All Categories Button */}
      <button
        key="all"
        onClick={() => onToggle({ id: "all" })}
        className={`px-4 py-2 rounded-full border font-medium transition-all duration-200 hover:scale-102 relative z-10 ${getCategoryClasses(selectedCategories.length === 0)}`}
      >
        All
      </button>

      {/* Category Buttons */}
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onToggle(cat)}
          className={`px-4 py-2 rounded-full  font-medium transition-all duration-200 hover:scale-102 relative z-10 ${getCategoryClasses(selectedCategories.includes(cat.id))}`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryList;
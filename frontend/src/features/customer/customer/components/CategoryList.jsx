import React from "react";
import { useSelector } from "react-redux";

const CategoryList = ({ categories, selectedCategories, onToggle }) => {
  const themeMode = useSelector((state) => state.customerTheme.mode);

  const getCategoryClasses = (isSelected) => {
    if (isSelected) {
      return "px-3 py-1.5 bg-[var(--button)] text-white rounded-md text-sm font-medium transition-colors border border-[var(--button)]";
    }
    
    return `px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
      themeMode === 'light' 
        ? 'bg-white text-gray-700 border-gray-300 hover:border-[var(--button)] hover:bg-gray-50' 
        : 'bg-[var(--div)] text-[var(--text)] border-[var(--border)] hover:border-[var(--button)] hover:bg-[var(--hover)]'
    }`;
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      <button
        key="all"
        onClick={() => onToggle({ id: "all" })}
        className={getCategoryClasses(selectedCategories.length === 0)}
      >
        All
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onToggle(cat)}
          className={getCategoryClasses(selectedCategories.includes(cat.id))}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryList;
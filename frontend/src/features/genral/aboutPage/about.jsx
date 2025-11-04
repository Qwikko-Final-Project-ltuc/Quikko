import { useEffect, useState } from "react";
import { GetAllCMS } from "./aboutApi";
import { useSelector } from "react-redux";

export default function AboutPage() {
  const [sections, setSections] = useState([]);
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  useEffect(() => {
    const fetchCms = async () => {
      try {
        const cmsPages = await Promise.all([
          GetAllCMS("user", "About Page 1"),
          GetAllCMS("user", "About Page 2"),
          GetAllCMS("user", "About Page 3"),
          GetAllCMS("user", "About Page 4"),
        ]);

        const formatted = cmsPages
          .flat()
          .filter(Boolean)
          .map((page) => {
            if (!page.content) return null;
            const [titlePart, contentPart] = page.content.split("@");
            return {
              ...page,
              title: titlePart?.trim() || "",
              content: contentPart?.trim() || "",
            };
          })
          .filter(Boolean);

        setSections(formatted);
      } catch (err) {
        console.error("Failed to fetch CMS:", err);
      }
    };

    fetchCms();
  }, []);

  return (
    <div
      className={` mx-auto px-6 py-16 space-y-24 ${
        isDark
          ? "bg-[var(--bg)] text-[var(--text)]"
          : "bg-[var(--bg)] text-[var(--text)]"
      }`}
    >
      <h1
        className={`text-4xl font-extrabold text-center mb-16 ${
          isDark
            ? "bg-[var(--bg)] text-[var(--text)]"
            : "bg-[var(--bg)] text-[var(--text)]"
        }`}
      >
        About Us
      </h1>

      {sections.map((section, index) => {
        const isList = section.content.includes("*");
        const listItems = isList
          ? section.content
              .split("*")
              .map((item) => item.trim())
              .filter((item) => item.length > 0)
          : [];

        return (
          <section
            key={index}
            className={`flex flex-col md:flex-row items-center gap-15 ${
              index % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
          >
            <div className="md:w-1/2 text-center md:text-left space-y-4 p-15">
              <h2
                className={`text-3xl font-bold ${
                  isDark ? "text-[var(--button)]" : "text-[var(--button)]"
                }`}
              >
                {section.title || "Section Title"}
              </h2>

              {isList ? (
                <ul
                  className={`list-disc list-inside space-y-2 ${
                    isDark ? "text-[var(--text)]" : "text-[var(--text)]"
                  }`}
                >
                  {listItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p
                  className={`text-xl leading-relaxed ${
                    isDark ? "text-[var(--text)]" : "text-[var(--text)]"
                  }`}
                >
                  {section.content}
                </p>
              )}
            </div>

            <div className="md:w-1/2 flex justify-center">
              {section.image_url ? (
                <img
                  src={section.image_url}
                  alt={section.title || "About image"}
                  className="w-150 h-80 object-cover rounded-2xl shadow-lg"
                />
              ) : (
                <div className="w-80 h-60 flex items-center justify-center bg-gray-200 rounded-2xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5h18M3 19h18M3 9h18M3 15h18"
                    />
                  </svg>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

import React, { useEffect, useState, useRef } from "react";
import { GetAllCMS } from "./aboutApi";
import { useSelector } from "react-redux";
import { Sparkles, Zap } from "lucide-react";

export default function AboutPage() {
  const [sections, setSections] = useState([]);
  const [visibleSections, setVisibleSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sectionRefs = useRef([]);
  const mode = useSelector((state) => state.theme.mode);
  const isDark = mode === "dark";

  useEffect(() => {
    const fetchCms = async () => {
      try {
        setLoading(true);
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
        sectionRefs.current = formatted.map((_, index) => sectionRefs.current[index] || { current: null });
      } catch (err) {
        console.error("Failed to fetch CMS:", err);
        setError("Failed to load content. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCms();
  }, []);

  useEffect(() => {
    if (sections.length === 0 || loading) return;

    const observers = [];
    
    sectionRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => [...new Set([...prev, index])]);
          }
        },
        { threshold: 0.3, rootMargin: "-50px" }
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => observers.forEach(observer => observer.disconnect());
  }, [sections, loading]);

  // Loading State
  if (loading) {
  return (
    <div className={`min-h-screen ${isDark === 'dark' ? 'bg-[var(--bg)]' : 'bg-white'} relative overflow-hidden`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--button)]/2 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-[var(--primary)]/2 rounded-full blur-xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl flex items-center justify-center mx-auto mb-4 animate-spin">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-xl blur-sm opacity-15 animate-ping"></div>
          </div>
          <p className="text-[var(--text)] text-lg font-medium">
            Loading Abote...
          </p>
        </div>
      </div>
    </div>
  );

  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-[var(--error)]/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-[var(--button)]/5 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="text-center max-w-md relative z-10">
          <div className="w-28 h-28 bg-[var(--error)]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-all duration-300">
            <Zap className="w-14 h-14 text-[var(--error)]" />
          </div>
          <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-[var(--error)] to-red-600 bg-clip-text text-transparent">
            Oops! Error Loading
          </h3>
          <p className="text-[var(--text)]/80 text-lg mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[var(--button)] text-white px-8 py-4 rounded-xl hover:bg-[#015c40] transition-all duration-300 font-semibold hover:scale-105 hover:shadow-2xl"
          >
            Try Again
          </button>
        </div>

        <style jsx>{`
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.1); }
          }
          .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--button)]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[var(--primary)]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-8 sm:space-y-10 lg:space-y-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-8 left-8 w-8 h-8 bg-[var(--button)]/30 rounded-full animate-float lg:top-12 lg:left-12 lg:w-10 lg:h-10"></div>
            <div className="absolute top-12 right-12 w-7 h-7 bg-[var(--primary)]/30 rounded-full animate-float" style={{animationDelay: '1.5s'}}></div>
            <div className="absolute bottom-16 left-16 w-5 h-5 bg-[var(--success)]/30 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-8 right-8 w-6 h-6 bg-[var(--warning)]/30 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          </div>

          <div className="relative inline-block">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 sm:mb-6 relative">
              <span className="bg-gradient-to-r from-[var(--button)] via-[var(--primary)] to-[var(--button)] bg-clip-text text-transparent">
                ABOUT
              </span>
            </h1>
            <div className="absolute -bottom-2 sm:-bottom-3 lg:-bottom-4 left-1/2 transform -translate-x-1/2 w-32 sm:w-40 lg:w-48 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-[var(--button)] to-transparent rounded-full"></div>
            <div className="absolute -bottom-4 sm:-bottom-5 lg:-bottom-6 left-1/2 transform -translate-x-1/2 w-24 sm:w-28 lg:w-32 h-0.5 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent rounded-full"></div>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-[var(--light-gray)] max-w-xs sm:max-w-md lg:max-w-2xl mx-auto mt-4 sm:mt-6 lg:mt-8 px-4">
            Crafting extraordinary experiences through innovation and passion
          </p>
        </div>

        {sections.map((section, index) => {
          const isList = section.content.includes("*");
          const listItems = isList
            ? section.content
                .split("*")
                .map((item) => item.trim())
                .filter((item) => item.length > 0)
            : [];
          
          const isVisible = visibleSections.includes(index);

          return (
            <section
              key={index}
              ref={el => sectionRefs.current[index] = el}
              className={`min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center relative px-2 sm:px-4`}
            >
              <div className={`flex flex-col lg:flex-row items-center gap-4 sm:gap-6 lg:gap-8 xl:gap-10 w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto ${
                index % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}>
                
                {/* Text Content - DROPDOWN ANIMATION */}
                <div className={`w-full lg:w-1/2 relative ${
                  isVisible 
                    ? "animate-slide-down" 
                    : "opacity-0 -translate-y-20"
                }`}>
                  
                  <div className="relative bg-[var(--bg)]/80 backdrop-blur-sm border border-[var(--border)] rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 xl:p-8 shadow-lg sm:shadow-xl lg:shadow-2xl">
                    
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[var(--button)] to-[var(--primary)] rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-sm sm:text-base lg:text-lg shadow-lg">
                        0{index + 1}
                      </div>
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-[var(--button)] to-transparent rounded-full"></div>
                    </div>

                    <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 sm:mb-4 lg:mb-5 leading-tight bg-gradient-to-r from-[var(--text)] to-[var(--light-gray)] bg-clip-text text-transparent">
                      {section.title || "Section Title"}
                    </h2>

                    {isList ? (
                      <ul className="space-y-1 sm:space-y-2 lg:space-y-3">
                        {listItems.map((item, i) => (
                          <li 
                            key={i}
                            className="flex items-start gap-2 sm:gap-3 text-sm sm:text-base lg:text-lg leading-relaxed"
                          >
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                            <span className="text-[var(--text)] flex-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed text-[var(--light-gray)]">
                        {section.content}
                      </p>
                    )}
                  </div>
                </div>

                {/* Image Content - DROPDOWN ANIMATION */}
                <div className={`w-full lg:w-1/2 flex justify-center mt-4 lg:mt-0 ${
                  isVisible 
                    ? "animate-slide-down" 
                    : "opacity-0 -translate-y-20"
                }`}>
                  
                  {section.image_url ? (
                    <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg">
                      {/* Main Image */}
                      <div className="relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg sm:shadow-xl lg:shadow-2xl">
                        <img
                          src={section.image_url}
                          alt={section.title || "About image"}
                          className="w-full h-56 sm:h-64 lg:h-72 xl:h-80 object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg">
                      <div className="w-full h-56 sm:h-64 lg:h-72 xl:h-80 bg-gradient-to-br from-[var(--div)] to-[var(--mid-dark)] rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg sm:shadow-xl lg:shadow-2xl flex items-center justify-center">
                        <div className="text-center space-y-3 sm:space-y-4">
                          <div className="relative">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-[var(--button)] to-[var(--primary)] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9m0 0v12"
                                />
                              </svg>
                            </div>
                          </div>
                          <p className="text-[var(--light-gray)] font-medium text-sm sm:text-base lg:text-lg">Visual Storytelling</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Navigation Dots */}
      <div className="fixed right-4 sm:right-6 lg:right-8 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block">
        <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4">
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded-full transition-all duration-300 ${
                visibleSections.includes(index)
                  ? 'bg-[var(--button)] scale-110 sm:scale-125'
                  : 'bg-[var(--light-gray)] scale-100'
              }`}
            ></button>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
            opacity: 0.7;
          }
          33% { 
            transform: translateY(-15px) translateX(8px) rotate(120deg); 
            opacity: 1;
          }
          66% { 
            transform: translateY(8px) translateX(-12px) rotate(240deg); 
            opacity: 0.8;
          }
        }

        /* SLIDE DOWN ANIMATION */
        @keyframes slide-down {
          0% {
            opacity: 0;
            transform: translateY(-50px);
          }
          70% {
            opacity: 1;
            transform: translateY(5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        // .animate-float { animation: float 8s ease-in-out infinite; }
        // .animate-slide-down { 
        //   animation: slide-down 0.8s ease-out forwards; 
        // }
      `}</style>
    </div>
  );
}
import React, { useState, useRef, useEffect } from "react";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import ChatBot from "./ChatBot";
import { Bot, X } from "lucide-react";
import { useSelector } from "react-redux";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const MainLayout = ({ hideFooter = false }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatModalRef = useRef();

  const currentUser = useSelector((state) => state.customerAuth.user);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleChat = () => setIsChatOpen(!isChatOpen);
  const closeChat = () => setIsChatOpen(false);

  // إغلاق الشات عند الضغط خارج النافذة
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatModalRef.current && !chatModalRef.current.contains(event.target)) {
        // تحقق إذا كان الضغط ليس على زر فتح الشات
        const chatButton = document.querySelector('.chat-button');
        if (!chatButton?.contains(event.target)) {
          closeChat();
        }
      }
    };

    if (isChatOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isChatOpen]);

  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <main className="flex-grow transition-all duration-300">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}


      <button
        onClick={toggleChat}
        className="chat-button fixed bottom-8 right-6 bg-[var(--button)] text-white p-4 rounded-full shadow-lg hover:bg-green-900 transition flex items-center justify-center z-40"
      >
        <Bot size={28} />
      </button>

      {/* المودال */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            ref={chatModalRef}
            className="fixed bottom-4 right-4 z-50" // نفس الموقع كما في ChatBot الأصلي
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="relative">
              <ChatBot userId={currentUser?.id || "guest"} onClose={closeChat} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;
import React, { useState } from "react";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import ChatBot from "./ChatBot";
import { Bot, X } from "lucide-react";
import { useSelector } from "react-redux";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const currentUser = useSelector((state) => state.customerAuth.user);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleChat = () => setIsChatOpen(!isChatOpen);

  return (
    <div className="relative min-h-screen flex flex-col">
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <main className="flex-grow transition-all duration-300">
        <Outlet />
      </main>

      <Footer />

      <button
        onClick={toggleChat}
        className="fixed bottom-8 right-6 bg-[var(--button)] text-white p-4 rounded-full shadow-lg hover:bg-green-900 transition flex items-center justify-center z-50"
      >
        <Bot size={28} />
      </button>

      {/* المودال */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="fixed top-4 right-4 sm:right-6 z-50 w-full sm:w-96 h-[90vh] sm:h-[90vh]  rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* زر الإغلاق كأيقونة */}
            <button
              onClick={toggleChat}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
            >
              <X size={24} />
            </button>


            <div className="flex-grow overflow-auto p-2">
              <ChatBot userId={currentUser?.id || "guest"} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;

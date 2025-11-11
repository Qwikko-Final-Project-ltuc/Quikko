import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [themeMode, setThemeMode] = useState(localStorage.getItem("theme") === "dark" ? "dark" : "light");

  useEffect(() => {
    const handleStorageChange = () => {
      setThemeMode(localStorage.getItem("theme") === "dark" ? "dark" : "light");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");
    if (oobCode) {
      setStatus("verifying");
      axios
        .post("http://localhost:3000/api/auth/verify-email", { oobCode })
        .then(() => setStatus("success"))
        .catch(() => setStatus("error"));
    }
  }, [searchParams]);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      themeMode === "dark" ? "bg-[var(--bg)] text-[var(--text)]" : "bg-gray-50 text-gray-800"
    }`}>
      
      <div className={`max-w-md w-full rounded-2xl overflow-hidden transform transition-all duration-500 ${
        themeMode === "dark" ? "bg-[var(--div)] border border-[var(--border)]" : "bg-white border border-gray-200 shadow-xl"
      }`}>
        
        {/* Header */}
        <div className={`p-8 text-center border-b ${
          themeMode === "dark" ? "border-[var(--border)]" : "border-gray-200"
        }`}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-[var(--button)] border border-[var(--primary)]">
            {/* يمكن إضافة أي أيقونة هنا */}
            <span className="text-white font-bold text-2xl">✔</span>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-[var(--text)]">
            Verify Email
          </h2>
          <p className={`text-lg leading-relaxed ${
            themeMode === "dark" ? "text-[var(--light-gray)]" : "text-gray-600"
          }`}>
            {status === "verifying" && "Verifying your email..."}
            {status === "success" && "Your email has been verified successfully!"}
            {status === "error" && "Email verification failed. Please try again."}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="p-6">
          <div className="relative pt-1">
            <div className={`overflow-hidden h-2 mb-4 text-xs flex rounded ${
              themeMode === "dark" ? "bg-gray-700" : "bg-gray-200"
            }`}>
              <div
                style={{
                  width: status === "verifying" ? "60%" : status === "success" ? "100%" : "100%",
                  backgroundColor: 
                    status === "verifying" ? "var(--button)" :
                    status === "success" ? "#10B981" : "#EF4444"
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ease-out"
              ></div>
            </div>

            {/* Loading Dots for verifying state */}
            {status === "verifying" && (
              <div className="flex justify-center space-x-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-[var(--button)] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-[var(--button)] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-[var(--button)] animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}

            {/* Countdown / Status Text */}
            <div className="text-center mt-4">
              <p className={`text-sm ${themeMode === "dark" ? "text-[var(--light-gray)]" : "text-gray-500"}`}>
                {status === "verifying" 
                  ? "This may take a few seconds..." 
                  : status === "success" 
                  ? "Redirecting you to login page..." 
                  : "Please try again or contact support"}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className={`p-6 border-t ${themeMode === "dark" ? "border-[var(--border)]" : "border-gray-200"}`}>
          <div className={`p-4 rounded-lg text-center ${themeMode === "dark" ? "bg-[var(--bg)]" : "bg-gray-50"}`}>
            <p className={`text-sm ${themeMode === "dark" ? "text-[var(--light-gray)]" : "text-gray-600"}`}>
              {status === "verifying" && "⏳ Please don't close this window"}
              {status === "success" && "✅ You're all set! Ready to explore Qwikko"}
              {status === "error" && "❌ Verification failed."}
            </p>
          </div>
        </div>

        {/* Manual Navigation */}
        <div className="p-6 text-center">
          <button
            onClick={() => navigate("/vendor/login")}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
              themeMode === "dark" 
                ? "bg-[var(--button)] text-white hover:bg-opacity-90" 
                : "bg-[var(--button)] text-white hover:bg-opacity-90"
            }`}
          >
            Go to Login
          </button>
        </div>
      </div>

      {/* Background Animation */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className={`absolute -inset-10 opacity-10 ${
          status === "verifying" ? "bg-[var(--button)]" :
          status === "success" ? "bg-green-500" :
          "bg-red-500"
        }`}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5"></div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

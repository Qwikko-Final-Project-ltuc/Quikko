import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { FaCheckCircle, FaExclamationTriangle, FaEnvelope, FaSpinner } from "react-icons/fa";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const themeMode = useSelector((state) => state.customerTheme.mode);

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");
    if (!oobCode) {
      setStatus("error");
      setTimeout(() => {
        navigate("/customer/login", {
          state: { message: "Invalid verification link.", error: true },
        });
      }, 3000);
      return;
    }

    axios
      .post("http://localhost:3000/api/auth/verify-email", { oobCode })
      .then(() => {
        setStatus("success");
        setTimeout(() => {
          navigate("/customer/login", {
            state: { message: "Email verified successfully! Please log in." },
          });
        }, 3000);
      })
      .catch(() => {
        setStatus("error");
        setTimeout(() => {
          navigate("/customer/login", {
            state: { message: "Email verification failed.", error: true },
          });
        }, 3000);
      });
  }, [searchParams, navigate]);

  const getStatusContent = () => {
    switch (status) {
      case "verifying":
        return {
          icon: <FaSpinner className="animate-spin text-4xl text-[var(--button)]" />,
          title: "Verifying Your Email",
          message: "Please wait while we verify your email address...",
          bgColor: themeMode === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50',
          borderColor: themeMode === 'dark' ? 'border-blue-700' : 'border-blue-200',
          textColor: "text-[var(--button)]"
        };
      case "success":
        return {
          icon: <FaCheckCircle className="text-4xl text-green-500" />,
          title: "Email Verified Successfully!",
          message: "Your email has been verified. Redirecting to login...",
          bgColor: themeMode === 'dark' ? 'bg-green-900/20' : 'bg-green-50',
          borderColor: themeMode === 'dark' ? 'border-green-700' : 'border-green-200',
          textColor: "text-green-600"
        };
      case "error":
        return {
          icon: <FaExclamationTriangle className="text-4xl text-red-500" />,
          title: "Verification Failed",
          message: "The verification link is invalid or has expired.",
          bgColor: themeMode === 'dark' ? 'bg-red-900/20' : 'bg-red-50',
          borderColor: themeMode === 'dark' ? 'border-red-700' : 'border-red-200',
          textColor: "text-red-600"
        };
      default:
        return {
          icon: <FaEnvelope className="text-4xl text-[var(--button)]" />,
          title: "Email Verification",
          message: "Processing your request...",
          bgColor: themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-gray-50',
          borderColor: themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200',
          textColor: "text-[var(--text)]"
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      themeMode === 'dark' 
        ? 'bg-[var(--bg)] text-[var(--text)]' 
        : 'bg-gray-50 text-gray-800'
    }`}>
      <div className={`max-w-md w-full rounded-2xl overflow-hidden transform transition-all duration-500 ${
        themeMode === 'dark' 
          ? 'bg-[var(--div)] border border-[var(--border)]' 
          : 'bg-white border border-gray-200 shadow-xl'
      }`}>
        
        {/* Header */}
        <div className={`p-8 text-center border-b ${
          themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'
        }`}>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${content.bgColor} border ${content.borderColor}`}>
            {content.icon}
          </div>
          <h2 className={`text-2xl font-bold mb-3 ${content.textColor}`}>
            {content.title}
          </h2>
          <p className={`text-lg leading-relaxed ${
            themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'
          }`}>
            {content.message}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="p-6">
          <div className="relative pt-1">
            <div className={`overflow-hidden h-2 mb-4 text-xs flex rounded ${
              themeMode === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div
                style={{
                  width: status === 'verifying' ? '60%' : status === 'success' ? '100%' : '100%',
                  backgroundColor: 
                    status === 'verifying' ? 'var(--button)' :
                    status === 'success' ? '#10B981' : '#EF4444'
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ease-out"
              ></div>
            </div>
            
            {/* Loading Dots for verifying state */}
            {status === "verifying" && (
              <div className="flex justify-center space-x-2 mt-4">
                <div 
                  className="w-2 h-2 rounded-full bg-[var(--button)] animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></div>
                <div 
                  className="w-2 h-2 rounded-full bg-[var(--button)] animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></div>
                <div 
                  className="w-2 h-2 rounded-full bg-[var(--button)] animate-bounce"
                  style={{ animationDelay: '300ms' }}
                ></div>
              </div>
            )}

            {/* Countdown for redirect */}
            <div className="text-center mt-4">
              <p className={`text-sm ${
                themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-500'
              }`}>
                {status === "verifying" 
                  ? "This may take a few seconds..." 
                  : "Redirecting you to login page..."}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className={`p-6 border-t ${
          themeMode === 'dark' ? 'border-[var(--border)]' : 'border-gray-200'
        }`}>
          <div className={`p-4 rounded-lg text-center ${
            themeMode === 'dark' ? 'bg-[var(--bg)]' : 'bg-gray-50'
          }`}>
            <p className={`text-sm ${
              themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'
            }`}>
              {status === "verifying" && "⏳ Please don't close this window"}
              {status === "success" && "✅ You're all set! Ready to explore Qwikko"}
              {status === "error" && "❌ Please try signing up again or contact support"}
            </p>
          </div>
        </div>

        {/* Manual Navigation */}
        <div className="p-6 text-center">
          <button
            onClick={() => navigate("/customer/login")}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
              themeMode === 'dark' 
                ? 'bg-[var(--button)] text-white hover:bg-opacity-90' 
                : 'bg-[var(--button)] text-white hover:bg-opacity-90'
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
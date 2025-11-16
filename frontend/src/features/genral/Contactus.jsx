import React, { useState } from "react";
import axios from "axios";

const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ success: null, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: null, message: "" });
    setIsLoading(true);

    if (!form.name || !form.email || !form.subject || !form.message) {
      setStatus({ success: false, message: "Please fill all fields." });
      setIsLoading(false);
      return;
    }

    try {
      await axios.post("https://qwikko.onrender.com/api/customers/contactUs", form);
      setStatus({ success: true, message: "Message sent successfully! 🎉" });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setStatus({
        success: false,
        message: error.response?.data?.message || "Failed to send message.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] relative overflow-hidden">
      {/* Empty div from top */}
      <div className="h-18"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12">
          
          {/* Left Section - Creative Design */}
          <div className="w-full lg:w-2/5 flex flex-col justify-center text-center lg:text-left">
            {/* Main Title with Effects */}
            <div className="relative mb-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text)] mb-4 leading-tight">
                <span className="text-gradient-animate">Let's Connect</span>
              </h1>
              
              {/* Animated Underline */}
              <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                <div className="w-12 h-1 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-full"></div>
                <div className="w-6 h-1 bg-[var(--button)] rounded-full"></div>
                <div className="w-3 h-1 bg-[var(--primary)] rounded-full"></div>
              </div>
            </div>

            {/* Description with larger width */}
            <div className="mb-6">
              <p className="text-lg sm:text-xl text-[var(--text)] font-semibold leading-relaxed max-w-2xl">
                Ready to bring your ideas to life? 
                <span className="block text-gradient-animate text-base sm:text-lg mt-2">
                  Let's start the conversation!
                </span>
              </p>
            </div>

            {/* Feature List - items side by side */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                "✓ 24/7 Support Response",
                "✓ Expert Team Ready", 
                "✓ Creative Solutions",
                "✓ Fast & Reliable"
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 text-[var(--light-gray)] group hover:text-[var(--button)] transition-all duration-300 text-sm sm:text-base"
                >
                  <div className="w-1.5 h-1.5 bg-[var(--button)] rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                  <span className="whitespace-nowrap">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section - Compact Form */}
          <div className="w-full lg:w-3/5 max-w-md lg:max-w-lg">
            <div className="relative group">
              {/* Form Container with Glass Effect */}
              <div className="relative bg-[var(--bg)]/80 backdrop-blur-lg border border-[var(--border)]/50 rounded-2xl p-6 sm:p-8 shadow-xl transform transition-all duration-500 hover:shadow-2xl">
                
                {/* Animated Border */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--button)] to-[var(--primary)] rounded-2xl opacity-0 group-hover:opacity-20 blur transition-all duration-500"></div>
                
                <form onSubmit={handleSubmit} className="relative space-y-4">
                  {/* Status Message */}
                  {status.message && (
                    <div className={`p-3 rounded-xl text-center font-semibold transform transition-all duration-500 text-sm ${
                      status.success 
                        ? "bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30" 
                        : "bg-[var(--error)]/20 text-[var(--error)] border border-[var(--error)]/30"
                    }`}>
                      {status.message}
                    </div>
                  )}

                  {/* Name & Email Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative group/input">
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder=" "
                        className="w-full bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--button)] focus:ring-2 focus:ring-[var(--button)]/20 outline-none transition-all duration-300 peer text-sm"
                      />
                      <label className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--light-gray)] pointer-events-none transition-all duration-300 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[var(--button)] peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs">
                        Your Name
                      </label>
                    </div>

                    <div className="relative group/input">
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder=" "
                        className="w-full bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--button)] focus:ring-2 focus:ring-[var(--button)]/20 outline-none transition-all duration-300 peer text-sm"
                      />
                      <label className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--light-gray)] pointer-events-none transition-all duration-300 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[var(--button)] peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs">
                        Your Email
                      </label>
                    </div>
                  </div>

                  {/* Subject Field */}
                  <div className="relative group/input">
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder=" "
                      className="w-full bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--button)] focus:ring-2 focus:ring-[var(--button)]/20 outline-none transition-all duration-300 peer text-sm"
                    />
                    <label className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--light-gray)] pointer-events-none transition-all duration-300 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[var(--button)] peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs">
                      Subject
                    </label>
                  </div>

                  {/* Message Textarea */}
                  <div className="relative group/input">
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder=" "
                      rows={4}
                      className="w-full bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-xl px-4 py-3 focus:border-[var(--button)] focus:ring-2 focus:ring-[var(--button)]/20 outline-none transition-all duration-300 resize-none peer text-sm"
                    />
                    <label className="absolute left-4 top-4 transform -translate-y-1/2 text-[var(--light-gray)] pointer-events-none transition-all duration-300 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[var(--button)] peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs">
                      Your Message
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="text-center pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="relative w-full px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[var(--button)] to-[var(--primary)] border-0 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group/btn overflow-hidden text-sm"
                    >
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                      
                      {/* Button Text */}
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Send Message
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty div from bottom */}
      <div className="h-10"></div>

      {/* Magical Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 border-2 border-[var(--button)]/20 rounded-lg animate-float-slow rotate-45"></div>
        <div className="absolute bottom-32 right-16 w-16 h-16 border-2 border-[var(--primary)]/20 rounded-full animate-float-medium"></div>
        <div className="absolute top-1/3 right-1/4 w-12 h-12 border border-[var(--success)]/15 rotate-12 animate-float-slow"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-60 h-60 bg-gradient-to-r from-[var(--button)]/10 to-[var(--primary)]/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-to-br from-[var(--primary)]/8 to-[var(--success)]/8 rounded-full blur-3xl animate-pulse-medium"></div>
        <div className="absolute top-2/3 left-1/3 w-40 h-40 bg-gradient-to-l from-[var(--button)]/12 to-[var(--primary)]/12 rounded-full blur-2xl animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>

        {/* Animated Lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--button)]/30 to-transparent animate-line-sweep"></div>
        <div className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-[var(--primary)]/25 to-transparent animate-line-sweep-vertical" style={{animationDelay: '2s'}}></div>

        {/* Floating Dots Pattern */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[var(--button)]/20 rounded-full animate-float-dots"
            style={{
              left: `${10 + (i * 6)}%`,
              top: `${20 + (i * 3)}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${4 + Math.random() * 3}s`
            }}
          />
        ))}

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>

        {/* Floating Icons */}
        <div className="absolute top-16 right-20 text-[var(--button)]/10 animate-float-very-slow">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>
        <div className="absolute bottom-20 left-20 text-[var(--primary)]/10 animate-float-very-slow" style={{animationDelay: '1s'}}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes color-rotate {
          0% { color: var(--button); }
          50% { color: var(--primary); }
          100% { color: var(--button); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(-2deg); }
        }
        @keyframes float-very-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes float-dots {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.2; }
          50% { transform: translateY(-30px) scale(1.1); opacity: 0.4; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.05); }
        }
        @keyframes pulse-medium {
          0%, 100% { opacity: 0.08; transform: scale(1); }
          50% { opacity: 0.12; transform: scale(1.03); }
        }
        @keyframes line-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100vw); }
        }
        @keyframes line-sweep-vertical {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        .animate-gradient-x { 
          background-size: 200% 200%; 
          animation: gradient-x 3s ease infinite; 
        }
        .text-gradient-animate {
          animation: color-rotate 3s ease-in-out infinite;
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 3.5s ease-in-out infinite; }
        .animate-float-very-slow { animation: float-very-slow 5s ease-in-out infinite; }
        .animate-float-dots { animation: float-dots 4s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
        .animate-pulse-medium { animation: pulse-medium 5s ease-in-out infinite; }
        .animate-line-sweep { animation: line-sweep 8s linear infinite; }
        .animate-line-sweep-vertical { animation: line-sweep-vertical 10s linear infinite; }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, var(--button) 1px, transparent 1px),
            linear-gradient(to bottom, var(--button) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
};

export default ContactUs;
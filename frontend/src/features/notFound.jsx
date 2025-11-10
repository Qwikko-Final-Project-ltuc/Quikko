import { Link } from "react-router-dom";
import { BiError } from "react-icons/bi";
import { IoArrowBackSharp } from "react-icons/io5";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] overflow-hidden relative">
      {/* Animated Background Elements */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, var(--button) 0%, transparent 80%),
            repeating-linear-gradient(45deg, var(--div) 0px, var(--div) 1px, transparent 1px, transparent 10px)
          `
        }}
      />

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-[var(--button)] rounded-full opacity-20 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        />
      ))}

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Empty Space */}
        <div className="flex-1" />

        <div className="flex justify-center items-center px-4">
          <div className="text-center max-w-2xl mx-auto">
            
            {/* Interactive 404 Number */}
            <div className="relative mb-8">
              <div className="text-8xl font-bold mb-4">
                <span className="inline-block animate-float bg-gradient-to-br from-[var(--mid-dark)] to-[var(--text)] bg-clip-text text-transparent">
                  4
                </span>
                <span 
                  className="inline-block animate-float mx-2"
                  style={{ animationDelay: '0.2s' }}
                >
                  <div className="w-6 h-6 bg-[var(--button)] rounded-full mx-auto"></div>
                </span>
                <span 
                  className="inline-block animate-float bg-gradient-to-br from-[var(--mid-dark)] to-[var(--text)] bg-clip-text text-transparent"
                  style={{ animationDelay: '0.4s' }}
                >
                  4
                </span>
              </div>
              
              {/* Rotating Error Icon */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="animate-spin-slow">
                  <BiError className="text-4xl text-[var(--button)]" />
                </div>
              </div>
            </div>

            {/* Glitch Text Effect */}
            <div className="relative mb-8">
              <h2 className="text-3xl font-bold text-[var(--text)] relative inline-block">
                <span className="relative z-10">Lost in Space</span>
                <span className="absolute top-0 left-0 text-[var(--button)] animate-glitch opacity-70" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 35%, 0 35%)' }}>
                  Lost in Space
                </span>
                <span className="absolute top-0 left-0 text-[var(--primary)] animate-glitch opacity-70" style={{ clipPath: 'polygon(0 65%, 100% 65%, 100% 100%, 0 100%)', animationDelay: '0.1s' }}>
                  Lost in Space
                </span>
              </h2>
            </div>

            {/* Animated Message */}
            <p className="text-lg text-[var(--light-gray)] max-w-md mx-auto mb-8 leading-relaxed animate-typewriter overflow-hidden border-r-2 border-[var(--button)] whitespace-nowrap">
              The page you're looking for has drifted into the unknown...
            </p>

            {/* Holographic Button */}
            <Link 
              to="/customer/home" 
              className="
                inline-flex items-center gap-3 
                relative
                bg-transparent 
                text-[var(--button)] font-medium py-4 px-8 
                rounded-xl
                transform hover:-translate-y-1
                transition-all duration-300 
                group
                border-2 border-[var(--button)]
                overflow-hidden
              "
            >
              {/* Holographic Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--button)] to-transparent opacity-20 group-hover:animate-shine" />
              
              <IoArrowBackSharp className="text-xl group-hover:-translate-x-1 transition-transform relative z-10" />
              <span className="relative z-10">Beam Me Home</span>
              
              {/* Particle Effect on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-[var(--button)] rounded-full animate-particle"
                    style={{
                      left: '50%',
                      top: '50%',
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom Empty Space */}
        <div className="flex-1" />

        {/* Scanning Line */}
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--button)] to-transparent animate-scan" />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes particle {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx, 100px), var(--ty, -100px)) scale(0); opacity: 0; }
        }
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-glitch { animation: glitch 0.5s ease-in-out infinite; }
        .animate-typewriter { 
          animation: typewriter 3s steps(40) 1s both;
          border-right-color: var(--button);
        }
        .animate-shine { animation: shine 1.5s ease-in-out infinite; }
        .animate-particle { 
          animation: particle 1s ease-out forwards;
          --tx: ${Math.random() * 100 - 50}px;
          --ty: ${Math.random() * 100 - 50}px;
        }
        .animate-scan { 
          animation: scan 3s linear infinite;
          background: linear-gradient(90deg, transparent, var(--button), transparent);
        }
        .animate-spin-slow { animation: spin 8s linear infinite; }
      `}</style>
    </div>
  );
}
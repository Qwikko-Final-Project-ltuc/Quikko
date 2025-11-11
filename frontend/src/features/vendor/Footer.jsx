import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Footer() {
    const themeMode = useSelector((state) => state.customerTheme.mode);

    return (
        <footer className={`py-6 px-4 border-t ${
            themeMode === 'dark' 
                ? 'bg-[var(--div)] border-[var(--border)] text-[var(--text)]' 
                : 'bg-gradient-to-br from-[var(--button)] to-gray-700 border-[var(--button)] text-white'
        }`}>
            <div className="max-w-7xl mx-auto">
                {/* الصف الأول: اللوغو واللينكات */}
                <div className="flex flex-col lg:flex-row items-center gap-4 mb-4">
                    {/* Logo على اليسار */}
                    <div className="lg:flex-1 flex justify-start">
                        <img 
                            src="/LogoDark.png" 
                            alt="Qwikko Logo" 
                            className="h-7" 
                        />
                    </div>

                    {/* Links في المنتصف */}
                    <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-xs md:text-sm lg:flex-1">
                        <Link
                            to="/vendor/contact"
                            className={`hover:underline transition-colors duration-200 font-medium ${
                                themeMode === 'dark' 
                                    ? 'hover:text-[var(--primary)]' 
                                    : 'hover:text-white/80'
                            }`}
                        >
                            Contact
                        </Link>
                        <Link
                            to="/vendor/about"
                            className={`hover:underline transition-colors duration-200 font-medium ${
                                themeMode === 'dark' 
                                    ? 'hover:text-[var(--primary)]' 
                                    : 'hover:text-white/80'
                            }`}
                        >
                            About
                        </Link>
                        <Link
                            to="/vendor/privacy"
                            className={`hover:underline transition-colors duration-200 font-medium ${
                                themeMode === 'dark' 
                                    ? 'hover:text-[var(--primary)]' 
                                    : 'hover:text-white/80'
                            }`}
                        >
                            Privacy
                        </Link>
                        <Link
                            to="/vendor/terms"
                            className={`hover:underline transition-colors duration-200 font-medium ${
                                themeMode === 'dark' 
                                    ? 'hover:text-[var(--primary)]' 
                                    : 'hover:text-white/80'
                            }`}
                        >
                            Terms
                        </Link>
                    </div>

                    {/* مساحة فارغة على اليمين لتوسيط اللينكات */}
                    <div className="lg:flex-1 hidden lg:block"></div>
                </div>

                {/* الصف الثاني: حقوق النشر دائماً في الأسفل */}
                <div className="text-center border-t pt-2 border-gray-300/30">
                    <p className={`text-xs ${
                        themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-white/80'
                    }`}>
                        © 2025 Qwikko. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
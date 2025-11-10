// TermsOfService.jsx
import { useSelector } from "react-redux";

export default function TermsOfService() {
  const themeMode = useSelector((state) => state.customerTheme.mode);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      themeMode === 'dark' 
        ? 'bg-[var(--bg)] text-[var(--text)]' 
        : 'bg-gray-50 text-gray-800'
    }`}>
      {/* Empty padding div */}
      <div className="h-8 bg-transparent"></div>
      
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-4 ${
            themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'
          }`}>
            Terms of Service
          </h1>
          <p className={`text-lg ${
            themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'
          }`}>
            Effective Date: November 2025
          </p>
        </div>

        {/* Content directly on page */}
        <div className="space-y-8">
          {/* Introduction */}
          <section>
            <p className={`text-lg leading-relaxed ${
              themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-700'
            }`}>
              Welcome to <span className="font-semibold">Qwikko</span>. By accessing or using our services, 
              you agree to be bound by these Terms of Service. Please read them carefully.
            </p>
          </section>

          {/* Account Terms */}
          <section>
            <h2 className={`text-2xl font-bold mb-6 pb-3 border-b ${
              themeMode === 'dark' 
                ? 'text-[var(--text)] border-[var(--border)]' 
                : 'text-[var(--button)] border-gray-200'
            }`}>
              Account Terms
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className={`text-xl font-semibold mb-4 flex items-center ${
                  themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'
                }`}>
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                  Eligibility
                </h3>
                <ul className={`list-disc list-inside space-y-2 ${
                  themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'
                }`}>
                  <li>You must be at least 18 years old to create an account</li>
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>One account per individual unless explicitly authorized</li>
                </ul>
              </div>

              <div>
                <h3 className={`text-xl font-semibold mb-4 flex items-center ${
                  themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'
                }`}>
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                  </svg>
                  Account Security
                </h3>
                <ul className={`list-disc list-inside space-y-2 ${
                  themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'
                }`}>
                  <li>Keep your login credentials confidential</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>We reserve the right to suspend accounts violating terms</li>
                  <li>You are responsible for all activities under your account</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Orders & Payments */}
          <section>
            <h2 className={`text-2xl font-bold mb-6 pb-3 border-b ${
              themeMode === 'dark' 
                ? 'text-[var(--text)] border-[var(--border)]' 
                : 'text-[var(--button)] border-gray-200'
            }`}>
              Orders & Payments
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  themeMode === 'dark' ? 'bg-[var(--button)]' : 'bg-[var(--button)]'
                }`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3">Pricing & Payment</h3>
                <p className={`text-sm ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
                  All prices are in USD. We accept major credit cards and secure payment methods. 
                  Prices are subject to change without notice.
                </p>
              </div>

              <div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  themeMode === 'dark' ? 'bg-[var(--button)]' : 'bg-[var(--button)]'
                }`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3">Order Processing</h3>
                <p className={`text-sm ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
                  Orders are processed within 1-2 business days. Shipping times vary by location. 
                  We are not responsible for customs delays.
                </p>
              </div>

              <div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  themeMode === 'dark' ? 'bg-[var(--button)]' : 'bg-[var(--button)]'
                }`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm-1 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3">Returns & Refunds</h3>
                <p className={`text-sm ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
                  Returns accepted within 30 days of delivery. Items must be unused and in original packaging. 
                  Refunds processed within 5-10 business days.
                </p>
              </div>

              <div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  themeMode === 'dark' ? 'bg-[var(--button)]' : 'bg-[var(--button)]'
                }`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3">Order Cancellation</h3>
                <p className={`text-sm ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
                  Orders can be cancelled within 1 hour of placement. Once processing begins, 
                  cancellation may not be possible. Contact support immediately.
                </p>
              </div>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className={`text-2xl font-bold mb-6 pb-3 border-b ${
              themeMode === 'dark' 
                ? 'text-[var(--text)] border-[var(--border)]' 
                : 'text-[var(--button)] border-gray-200'
            }`}>
              User Responsibilities
            </h2>
            
            <div>
              <div className="grid gap-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[var(--success)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Permitted Uses
                  </h4>
                  <p className={`text-sm ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
                    Personal shopping, legitimate business purposes, and authorized commercial use
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-[var(--error)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                    Prohibited Activities
                  </h4>
                  <p className={`text-sm ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
                    Fraud, spam, hacking attempts, illegal activities, and violation of intellectual property rights
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className={`text-2xl font-bold mb-6 pb-3 border-b ${
              themeMode === 'dark' 
                ? 'text-[var(--text)] border-[var(--border)]' 
                : 'text-[var(--button)] border-gray-200'
            }`}>
              Limitation of Liability
            </h2>
            
            <div>
              <p className={`mb-4 ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
                Qwikko shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages resulting from your use of or inability to use the service.
              </p>
              <p className={`${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
                Our total liability shall not exceed the amount paid by you for the services in the past six months.
              </p>
            </div>
          </section>

          {/* Contact & Support */}
          <section className={`p-8 rounded-xl ${
            themeMode === 'dark' 
              ? 'bg-[var(--div)] border border-[var(--border)]' 
              : 'bg-gray-100 border border-gray-200'
          }`}>
            <h3 className={`text-2xl font-bold mb-4 ${
              themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'
            }`}>
              Need Help?
            </h3>
            <p className={`mb-6 text-lg ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-700'}`}>
              Our support team is here to help you with any questions about our terms of service
            </p>
            <div className="flex flex-wrap gap-4">
              <span className={`px-6 py-3 rounded-full font-semibold flex items-center ${
                themeMode === 'dark' 
                  ? 'bg-[var(--button)] text-white' 
                  : 'bg-[var(--button)] text-white'
              }`}>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                qwikko@gmail.com
              </span>
              <span className={`px-6 py-3 rounded-full font-semibold flex items-center ${
                themeMode === 'dark' 
                  ? 'bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]' 
                  : 'bg-white text-gray-800 border border-gray-300'
              }`}>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                +962-777-544-625
              </span>
            </div>
          </section>
        </div>
      </div>

      {/* Empty padding div */}
      <div className="h-25 bg-transparent"></div>
    </div>
  );
}
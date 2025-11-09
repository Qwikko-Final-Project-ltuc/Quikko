// PrivacyPolicy.jsx
import { useSelector } from "react-redux";

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className={`text-lg ${
            themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'
          }`}>
            Last Updated: November 2025
          </p>
        </div>

        {/* Content directly on page */}
        <div className="space-y-8">
          {/* Introduction */}
          <section>
            <p className={`text-lg leading-relaxed ${
              themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-700'
            }`}>
              At <span className="font-semibold">Qwikko</span>, we are committed to protecting your privacy and personal data. 
              This policy explains how we collect, use, and safeguard your information.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className={`text-2xl font-bold mb-6 pb-3 border-b ${
              themeMode === 'dark' 
                ? 'text-[var(--text)] border-[var(--border)]' 
                : 'text-[var(--button)] border-gray-200'
            }`}>
              Information We Collect
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className={`text-xl font-semibold mb-4 flex items-center ${
                  themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'
                }`}>
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                  Personal Information
                </h3>
                <ul className={`list-disc list-inside space-y-2 ${
                  themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'
                }`}>
                  <li>Full name and contact details</li>
                  <li>Email address and phone number</li>
                  <li>Shipping and billing addresses</li>
                  <li>Account preferences and settings</li>
                </ul>
              </div>

              <div>
                <h3 className={`text-xl font-semibold mb-4 flex items-center ${
                  themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'
                }`}>
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                  </svg>
                  Order & Payment Information
                </h3>
                <ul className={`list-disc list-inside space-y-2 ${
                  themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'
                }`}>
                  <li>Order details and shopping cart information</li>
                  <li>Encrypted payment information</li>
                  <li>Transaction history and receipts</li>
                  <li>Shipping preferences and tracking</li>
                </ul>
              </div>

              <div>
                <h3 className={`text-xl font-semibold mb-4 flex items-center ${
                  themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'
                }`}>
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                  </svg>
                  Technical Information
                </h3>
                <ul className={`list-disc list-inside space-y-2 ${
                  themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'
                }`}>
                  <li>IP address and browser type</li>
                  <li>Cookies and tracking signals</li>
                  <li>Device information and operating system</li>
                  <li>Usage patterns and browsing history</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className={`text-2xl font-bold mb-6 pb-3 border-b ${
              themeMode === 'dark' 
                ? 'text-[var(--text)] border-[var(--border)]' 
                : 'text-[var(--button)] border-gray-200'
            }`}>
              How We Use Your Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  themeMode === 'dark' ? 'bg-[var(--button)]' : 'bg-[var(--button)]'
                }`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3">Service Delivery</h3>
                <p className={`text-sm ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
                  Process orders, manage your account, and provide customer support
                </p>
              </div>

              <div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  themeMode === 'dark' ? 'bg-[var(--button)]' : 'bg-[var(--button)]'
                }`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3">Experience Improvement</h3>
                <p className={`text-sm ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
                  Enhance our services, personalize content, and optimize user interface
                </p>
              </div>

              <div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  themeMode === 'dark' ? 'bg-[var(--button)]' : 'bg-[var(--button)]'
                }`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3">Communication</h3>
                <p className={`text-sm ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
                  Send updates, offers, and respond to your inquiries
                </p>
              </div>

              <div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  themeMode === 'dark' ? 'bg-[var(--button)]' : 'bg-[var(--button)]'
                }`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-3">Security & Compliance</h3>
                <p className={`text-sm ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
                  Prevent fraud, protect system security, and comply with legal obligations
                </p>
              </div>
            </div>
          </section>

          {/* Data Protection */}
          <section>
            <h2 className={`text-2xl font-bold mb-6 pb-3 border-b ${
              themeMode === 'dark' 
                ? 'text-[var(--text)] border-[var(--border)]' 
                : 'text-[var(--button)] border-gray-200'
            }`}>
              Data Protection & Security
            </h2>
            
            <div>
              <p className={`mb-6 text-lg ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-700'}`}>
                We implement robust security measures to protect your data:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    themeMode === 'dark' ? 'bg-[var(--button)]' : 'bg-[var(--button)]'
                  }`}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">SSL Encryption</h4>
                  <p className={`text-sm ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
                    256-bit encryption for all data transfers
                  </p>
                </div>
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    themeMode === 'dark' ? 'bg-[var(--button)]' : 'bg-[var(--button)]'
                  }`}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">Secure Servers</h4>
                  <p className={`text-sm ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
                    Protected servers with regular security audits
                  </p>
                </div>
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    themeMode === 'dark' ? 'bg-[var(--button)]' : 'bg-[var(--button)]'
                  }`}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                    </svg>
                  </div>
                  <h4 className="font-semibold mb-2">Regular Monitoring</h4>
                  <p className={`text-sm ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-600'}`}>
                    Continuous monitoring and threat detection
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className={`p-8 rounded-xl ${
            themeMode === 'dark' 
              ? 'bg-[var(--div)] border border-[var(--border)]' 
              : 'bg-gray-100 border border-gray-200'
          }`}>
            <h3 className={`text-2xl font-bold mb-4 ${
              themeMode === 'dark' ? 'text-[var(--text)]' : 'text-[var(--button)]'
            }`}>
              Questions About Privacy?
            </h3>
            <p className={`mb-6 text-lg ${themeMode === 'dark' ? 'text-[var(--light-gray)]' : 'text-gray-700'}`}>
              Contact our privacy team for any questions or concerns about your data
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
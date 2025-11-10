import { Routes, Route } from "react-router-dom";
import MainLanding from "./MainLanding";
import AboutPage from "./aboutPage/about";
import ContactUs from "../customer/customer/pages/ContactUs";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsOfService from "./TermsOfService";


export default function GenralRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLanding />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
    </Routes>
  );
}

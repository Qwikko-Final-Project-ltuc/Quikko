import { Routes, Route } from "react-router-dom";
import MainLanding from "./MainLanding";
 import About from "./aboutPage/about";

export default function GenralRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLanding />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}

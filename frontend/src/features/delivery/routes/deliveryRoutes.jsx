import { Routes, Route } from "react-router-dom";
import LandingPage from "../delivery/Landing";
import RegisterDelivery from "../auth/RegisterDelivery";
import LoginDelivery from "../auth/Login";
import DeliveryProfile from "../delivery/DeliveryProfile";
import EditProfile from "../delivery/EditProfile";
import Settings from "../delivery/Settings";
import Dashboard from "../delivery/Dashboard";
import Orders from "../delivery/Orders";
import TrackingOrders from "../delivery/Tracking";
import Reports from "../delivery/ReportsPage";
import Home from "../delivery/Home";
import Chat from "../delivery/DeliveryChatPage";
import NotFound from "../../notFound";
export default function DeliveryRoutes() {
  return (
    <Routes>
      <Route path="delivery/" element={<LandingPage />} />
      <Route path="delivery/login" element={<LoginDelivery />} />
      <Route path="delivery/register" element={<RegisterDelivery />} />

      <Route path="delivery/dashboard" element={<Dashboard />}>
        <Route index element={<Home />} />
        <Route path="home" element={<Home />} />
        <Route path="getProfile" element={<DeliveryProfile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="orders" element={<Orders />} />
        <Route path="tracking/:orderId" element={<TrackingOrders />} />
        <Route path="reports" element={<Reports />} />
        <Route path="edit" element={<EditProfile />} />
        <Route path="chat" element={<Chat />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

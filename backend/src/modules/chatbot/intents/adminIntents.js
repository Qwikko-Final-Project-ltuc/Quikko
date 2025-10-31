// src/modules/chatbot/adminIntents.js
const axios = require("axios");

exports.handleAdminIntent = async (intent, message, token) => {
  try {
    switch (intent) {
      case "orders": {
        const res = await axios.get("http://localhost:3000/api/admin/orders", {
          headers: { Authorization: `Bearer ${token || ""}` },
        });
        const orders = res.data.data || [];
        if (!orders.length) return "No orders found.";

        const totalOrders = orders.length;
        const pending = orders.filter((o) => o.status === "pending").length;
        const accepted = orders.filter((o) => o.status === "accepted").length;
        const delivered = orders.filter((o) => o.status === "delivered").length;

        let summary = `**Order Summary**\nTotal Orders: ${totalOrders}\nPending: ${pending}\nAccepted: ${accepted}\nDelivered: ${delivered}`;
        return summary;
      }

      case "pending_vendors": {
        const res = await axios.get(
          "http://localhost:3000/api/admin/vendors/pending",
          { headers: { Authorization: `Bearer ${token || ""}` } }
        );
        const pending = res.data.data || [];
        if (!pending.length) return "No pending vendors.";
        return pending
          .map(
            (v, i) =>
              `${i + 1}. ${v.store_name} (ID: ${v.id}) - Owner: ${v.owner_name}`
          )
          .join("\n");
      }

      case "delivery_companies": {
        const res = await axios.get(
          "http://localhost:3000/api/admin/delivery-companies",
          { headers: { Authorization: `Bearer ${token || ""}` } }
        );
        const companies = res.data.data || [];
        if (!companies.length) return "No delivery companies.";
        return companies
          .map((c, i) => `${i + 1}. ${c.company_name} (ID: ${c.company_id})`)
          .join("\n");
      }
      case "pending_deliveries": {
        const res = await axios.get(
          "http://localhost:3000/api/admin/deliveries/pending",
          { headers: { Authorization: `Bearer ${token || ""}` } }
        );
        const pending = res.data.data || [];
        if (!pending.length) return "No pending delivery companies.";

        return pending
          .map(
            (c, i) =>
              `${i + 1}. ${c.company_name} (ID: ${c.company_id}) - Status: ${
                c.status
              }`
          )
          .join("\n");
      }
      case "vendors": {
        const res = await axios.get("http://localhost:3000/api/admin/vendors", {
          headers: { Authorization: `Bearer ${token || ""}` },
        });
        const vendors = res.data.data || [];
        if (!vendors.length) return "No vendors found.";

        return vendors
          .map(
            (v, i) =>
              `${i + 1}. ${v.store_name} (ID: ${v.vendor_id}) - Status: ${
                v.status
              } - Owner ID: ${v.user_id}`
          )
          .join("\n");
      }

      case "go_to_profile": {
        const frontendUrl = process.env.FRONTEND_URL;
        return ` Sure! Here's your profile page:\n${frontendUrl}/adminProfile`;
      }

      case "go_to_dashboard":
      case "go_to_home": {
        const frontendUrl = process.env.FRONTEND_URL;
        return ` Here's your main dashboard:\n${frontendUrl}/adminHome`;
      }

      case "go_to_vendors_mangment": {
        const frontendUrl = process.env.FRONTEND_URL;
        return ` Manage all vendor accounts and stores here:\n${frontendUrl}/adminVendors`;
      }

      case "go_to_delivery_companies_mangment": {
        const frontendUrl = process.env.FRONTEND_URL;
        return ` Access and manage delivery companies here:\n${frontendUrl}/adminDelivery`;
      }

      case "go_to_orders_mangment": {
        const frontendUrl = process.env.FRONTEND_URL;
        return ` Manage and track all orders from here:\n${frontendUrl}/adminOrders`;
      }

      case "go_to_cms": {
        const frontendUrl = process.env.FRONTEND_URL;
        return `🖋️ Access the content management system (CMS) here:\n${frontendUrl}/adminCms`;
      }
      case "go_to_pages_mangment": {
        const frontendUrl = process.env.FRONTEND_URL;
        return `🗂️ You can manage all website pages here:\n${frontendUrl}/adminCms`;
      }

      case "go_to_notification_mangment": {
        const frontendUrl = process.env.FRONTEND_URL;
        return `🔔 You can manage and send notifications to users here:\n${frontendUrl}/adminCms/`;
      }

      case "go_to_category_mangment": {
        const frontendUrl = process.env.FRONTEND_URL;
        return `🏷️ You can manage all product categories here:\n${frontendUrl}/adminCms`;
      }

      default:
        return "";
    }
  } catch (err) {
    console.error("Error in adminIntents:", err);
    return "⚠️ Failed to fetch admin data.";
  }
};

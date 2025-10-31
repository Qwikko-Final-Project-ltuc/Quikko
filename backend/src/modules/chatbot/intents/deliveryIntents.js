// src/modules/chatbot/intents/deliveryIntents.js
const axios = require("axios");

exports.handleDeliveryIntent = async (intent, message, token) => {
  try {
    switch (intent) {
      case "orders": {
        const res = await axios.get(
          "http://localhost:3000/api/delivery/orders",
          {
            headers: { Authorization: `Bearer ${token || ""}` },
          }
        );

        const orders = res.data.orders || [];
        if (!orders.length) return "You have no delivery orders currently.";

        // ✅ فلترة حسب payment status إن وُجد في الرسالة
        const paymentMatch = message.match(/payment status (is|=)?\s*(\w+)/i);
        if (paymentMatch) {
          const status = paymentMatch[2].toLowerCase();
          const filtered = orders.filter(
            (o) => o.payment_status?.toLowerCase() === status
          );

          if (filtered.length === 0)
            return `You currently have no orders with the payment status "${status}".`;

          // عرض قائمة الطلبات المطابقة
          let summary = `Here are your orders with payment status "${status}":\n\n`;
          summary += filtered
            .map(
              (o) =>
                `#${o.id} - ${o.status} - $${parseFloat(o.total_amount).toFixed(
                  2
                )}`
            )
            .join("\n");

          return summary;
        }

        // ✅ فلترة حسب status إن وُجد (اختياري)
        const statusMatch = message.match(/status (is|=)?\s*([\w\s]+)/i);
        if (statusMatch) {
          const status = statusMatch[2]
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_");
          const filtered = orders.filter(
            (o) => o.status?.toLowerCase() === status
          );

          if (filtered.length === 0)
            return `You have no orders with status "${status.replace(
              /_/g,
              " "
            )}".`;

          let summary = `Orders with status "${status.replace(
            /_/g,
            " "
          )}":\n\n`;
          summary += filtered
            .map(
              (o) =>
                `#${o.id} - ${o.status} - $${parseFloat(o.total_amount).toFixed(
                  2
                )}`
            )
            .join("\n");

          return summary;
        }

        // ✅ العرض الافتراضي لو ما في فلترة
        return (
          "Delivery Orders:\n" +
          orders
            .map(
              (o) =>
                `#${o.id} - ${o.status} - $${parseFloat(o.total_amount).toFixed(
                  2
                )}`
            )
            .join("\n")
        );
      }

      case "track_order":
      case "order_details": {
        const orderId = message.match(/\d+/)?.[0];
        if (!orderId) return "Please provide the order number.";
        const res = await axios.get(
          `http://localhost:3000/api/delivery/tracking/${orderId}`,
          { headers: { Authorization: `Bearer ${token || ""}` } }
        );
        const order = res.data;
        if (!order) return `Order #${orderId} not found.`;

        let summary = `Order #${order.order_id} → Status: ${order.status}, Payment: ${order.payment_status}\nItems:\n`;
        order.items.forEach((i, idx) => {
          const price = parseFloat(i.item_price) || 0;
          summary += `${idx + 1}. ${i.product_name} x${
            i.quantity
          } — $${price.toFixed(2)} (Vendor: ${i.vendor_name})\n`;
        });

        return summary;
      }

      case "coverage": {
        const res = await axios.get(
          "http://localhost:3000/api/delivery/coverage",
          {
            headers: { Authorization: `Bearer ${token || ""}` },
          }
        );
        const areas = res.data.coverage_areas || [];
        if (!areas.length) return "You currently have no coverage areas set.";
        return (
          "Your coverage areas:\n" +
          areas.map((a, i) => `${i + 1}. ${a}`).join("\n")
        );
      }

      case "report": {
        // تحديد الفترة الزمنية من الرسالة، الافتراضي 7 أيام
        let days = 7;
        const matchDays = message.match(/last\s*(\d+)\s*days/i);
        if (matchDays) days = parseInt(matchDays[1]);

        const res = await axios.get(
          `http://localhost:3000/api/delivery/reports?days=${days}`,
          { headers: { Authorization: `Bearer ${token || ""}` } }
        );

        const data = res.data.report;
        if (!data) return "⚠️ No report data available.";

        const { totals, payment_status, statuses, top_customers, top_vendors } =
          data;

        let report = `📊 **Delivery Report (Last ${days} day${
          days > 1 ? "s" : ""
        })**\n\n`;
        report += `📦 Total Orders: ${totals.total_orders}\n`;
        report += `💰 Total Revenue: $${parseFloat(totals.total_amount).toFixed(
          2
        )}\n\n`;

        // Payment status
        report += `💳 **Payment Status:**\n`;
        for (const [key, val] of Object.entries(payment_status)) {
          report += `- ${key}: ${val}\n`;
        }

        // Order statuses
        report += `📌 **Order Statuses:**\n`;
        for (const [key, val] of Object.entries(statuses)) {
          report += `- ${key}: ${val}\n`;
        }

        // Top customers
        if (top_customers?.length) {
          report += `\n👤 **Top Customers:**\n`;
          top_customers.forEach((c, i) => {
            report += `${i + 1}. ${c.customer_email || "N/A"} — ${
              c.orders_count
            } orders ($${parseFloat(c.total_amount).toFixed(2)})\n`;
          });
        }

        // Top vendors
        if (top_vendors?.length) {
          report += `\n🏬 **Top Vendors:**\n`;
          top_vendors.forEach((v, i) => {
            report += `${i + 1}. ${v.store_name} — ${
              v.orders_count
            } orders ($${parseFloat(v.revenue).toFixed(2)})\n`;
          });
        }

        return report;
      }

      case "update_order_status": {
        const regex =
          /order\s*(\d+).*?(accepted|processing|out_for_delivery|delivered)/i;
        const match = message.match(regex);

        if (!match)
          return "⚠️ Please specify both order ID and new status. Example: 'Update order 360 to out_for_delivery'";

        const orderId = match[1];
        const newStatus = match[2].toLowerCase();

        // 🔥 نرسل الطلب إلى الـ API
        const res = await axios.put(
          `http://localhost:3000/api/delivery/orders/${orderId}`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token || ""}` } }
        );

        return `✅ Order #${orderId} status updated to '${newStatus}'.`;
      }

      case "go_to_orders": {
        const frontendUrl = process.env.FRONTEND_URL;
        return `📦 Sure! You can view and manage all your delivery orders here:\n${frontendUrl}/delivery/dashboard/orders`;
      }

      case "go_to_profile": {
        const frontendUrl = process.env.FRONTEND_URL;
        return `👤 Here you can view and manage your delivery profile details:\n${frontendUrl}/delivery/dashboard/getProfile`;
      }

      case "go_to_reports": {
        const frontendUrl = process.env.FRONTEND_URL;
        return `📊 You can view performance reports and delivery statistics here:\n${frontendUrl}/delivery/dashboard/reports`;
      }

      case "go_to_home": {
        const frontendUrl = process.env.FRONTEND_URL;
        return `🏠 Welcome back! Here’s your main home dashboard:\n${frontendUrl}/delivery/dashboard/home`;
      }

      case "go_to_settings": {
        const frontendUrl = process.env.FRONTEND_URL;
        return `⚙️ You can manage your account preferences and settings here:\n${frontendUrl}/delivery/dashboard/settings`;
      }

      case "go_to_edit_profile": {
        const frontendUrl = process.env.FRONTEND_URL;
        return `👤 You can update your personal information and profile details here:\n${frontendUrl}/delivery/dashboard/edit`;
      }

      default:
        return "";
    }
  } catch (err) {
    console.error("Error in deliveryIntents:", err);
    return "❌ Failed to fetch delivery data.";
  }
};

// src/modules/chatbot/intents/deliveryIntents.js
const axios = require("axios");

exports.handleDeliveryIntent = async (intent, message, token) => {
  try {
    switch (intent) {
      case "list_orders": {
        // ✅ نفس الراوت اللي جربته على Postman
        const res = await axios.get(
          "https://qwikko.onrender.com/api/customers/delivery/accepted-orders",
          {
            headers: { Authorization: `Bearer ${token || ""}` },
          }
        );

        const orders = res.data?.data || [];

        if (!orders.length) {
          return "You have no delivery orders currently.";
        }

        // ✅ فلترة حسب payment status لو المستخدم كتبها
        const paymentMatch = message.match(/payment status (is|=)?\s*(\w+)/i);
        if (paymentMatch) {
          const status = paymentMatch[2].toLowerCase();
          const filtered = orders.filter(
            (o) => o.payment_status?.toLowerCase() === status
          );

          if (!filtered.length) {
            return `You currently have no orders with the payment status "${status}".`;
          }

          let summary = `Here are your orders with payment status "${status}":\n\n`;
          summary += filtered
            .map((o) => {
              const amount = Number(
                o.total_amount ?? o.final_amount ?? o.total_with_shipping ?? 0
              ).toFixed(2);
              return `#${o.id} - ${o.order_status} - $${amount}`;
            })
            .join("\n");

          return summary;
        }

        // ✅ فلترة حسب order_status
        const statusMatch = message.match(/status (is|=)?\s*([\w\s]+)/i);
        if (statusMatch) {
          const status = statusMatch[2]
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_");

          const filtered = orders.filter(
            (o) => o.order_status?.toLowerCase() === status
          );

          if (!filtered.length) {
            return `You have no orders with status "${status.replace(
              /_/g,
              " "
            )}".`;
          }

          let summary = `Orders with status "${status.replace(
            /_/g,
            " "
          )}":\n\n`;
          summary += filtered
            .map((o) => {
              const amount = Number(
                o.total_amount ?? o.final_amount ?? o.total_with_shipping ?? 0
              ).toFixed(2);
              return `#${o.id} - ${o.order_status} - $${amount}`;
            })
            .join("\n");

          return summary;
        }

        // ✅ لو ما في فلترة.. رجّع أوامر الصفحة الأولى
        return (
          "Delivery Orders:\n" +
          orders
            .map((o) => {
              const amount = Number(
                o.total_amount ?? o.final_amount ?? o.total_with_shipping ?? 0
              ).toFixed(2);
              return `#${o.id} - ${o.order_status} - $${amount}`;
            })
            .join("\n")
        );
      }

      case "list_requested_orders": {
        const res = await axios.get(
          "https://qwikko.onrender.com/api/customers/delivery/requested-orders",
          {
            headers: { Authorization: `Bearer ${token || ""}` },
          }
        );

        const orders = res.data?.data || [];

        if (!orders.length) {
          return "You currently have no requested delivery orders.";
        }

        const reqStatusMatch = message.match(/status (is|=)?\s*([\w\s]+)/i);
        if (reqStatusMatch) {
          const status = reqStatusMatch[2]
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_");

          const filtered = orders.filter(
            (o) => o.delivery_request_status?.toLowerCase() === status
          );

          if (!filtered.length) {
            return `You have no requested orders with status "${status.replace(
              /_/g,
              " "
            )}".`;
          }

          let summary = `Requested orders with status "${status.replace(
            /_/g,
            " "
          )}":\n\n`;
          summary += filtered
            .map((o) => {
              const amount = Number(
                o.total_amount ?? o.final_amount ?? 0
              ).toFixed(2);
              return `#${o.id} - request: ${o.delivery_request_status} - order: ${o.order_status} - $${amount}`;
            })
            .join("\n");

          return summary;
        }

        // العرض الافتراضي
        return (
          "Requested Delivery Orders:\n" +
          orders
            .map((o) => {
              const amount = Number(
                o.total_amount ?? o.final_amount ?? 0
              ).toFixed(2);
              return `#${o.id} - request: ${o.delivery_request_status} - order: ${o.order_status} - $${amount}`;
            })
            .join("\n")
        );
      }

      case "track_order":
      case "order_details": {
        const orderId = message.match(/\d+/)?.[0];
        if (!orderId) return "Please provide the order number.";
        const res = await axios.get(
          `https://qwikko.onrender.com/api/delivery/tracking/${orderId}`,
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
          "https://qwikko.onrender.com/api/delivery/coverage",
          {
            headers: { Authorization: `Bearer ${token || ""}` },
          }
        );

        // الريسبونس صار Array
        const rows = Array.isArray(res.data) ? res.data : [];
        if (!rows.length) {
          return "You currently have no coverage areas set.";
        }

        // نجيب المدن بدون تكرار
        const cities = [...new Set(rows.map((r) => r.city).filter(Boolean))];

        let out = "Your coverage areas:\n";
        out += cities.map((c, i) => `${i + 1}. ${c}`).join("\n");

        return out;
      }

      case "report": {
        // تحديد الفترة الزمنية من الرسالة، الافتراضي 7 أيام
        let days = 7;
        const matchDays = message.match(/last\s*(\d+)\s*days/i);
        if (matchDays) days = parseInt(matchDays[1]);

        const res = await axios.get(
          `https://qwikko.onrender.com/api/delivery/reports?days=${days}`,
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
          `https://qwikko.onrender.com/api/delivery/orders/${orderId}`,
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

      case "go_to_chats": {
        const frontendUrl = process.env.FRONTEND_URL;
        return `💬 Here are your delivery chats and conversations:\n${frontendUrl}/delivery/dashboard/chat`;
      }

      case "go_to_requested_orders": {
        const frontendUrl = process.env.FRONTEND_URL;
        return `📦 These are the delivery requests waiting for your action:\n${frontendUrl}/delivery/dashboard/DeliveryRequestedOrders`;
      }

      default:
        return "";
    }
  } catch (err) {
    console.error("Error in deliveryIntents:", err);
    return "❌ Failed to fetch delivery data.";
  }
};

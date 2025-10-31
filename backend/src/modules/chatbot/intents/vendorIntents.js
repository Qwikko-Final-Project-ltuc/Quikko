const axios = require("axios");

exports.handleVendorIntent = async (intent, message, token, userId) => {
  try {
    switch (intent) {
      case "orders": {
        const res = await axios.get("http://localhost:3000/api/vendor/orders", {
          headers: { Authorization: `Bearer ${token || ""}` },
        });
        const rows = res.data.data || [];
        if (!rows.length) return "You don't have any orders yet.";

        const uniqueOrders = Object.values(
          rows.reduce((acc, row) => {
            if (!acc[row.order_id]) {
              acc[row.order_id] = {
                order_id: row.order_id,
                status: row.status,
                total_amount: parseFloat(row.total_amount) || 0,
              };
            }
            return acc;
          }, {})
        );

        let totalRevenue = 0;
        const ordersList = uniqueOrders
          .map((o, i) => {
            totalRevenue += o.total_amount;
            return `${i + 1}. Order #${o.order_id}\n   Status: ${
              o.status
            }\n   Price: $${o.total_amount.toFixed(2)}`;
          })
          .join("\n\n");

        return `You have ${
          uniqueOrders.length
        } orders:\n\n${ordersList}\n\nTotal revenue from all orders: $${totalRevenue.toFixed(
          2
        )}`;
      }

      case "products": {
        const res = await axios.get(
          "http://localhost:3000/api/vendor/products",
          {
            headers: { Authorization: `Bearer ${token || ""}` },
          }
        );
        const products = res.data.data || [];
        if (!products.length) return "You don't have any products listed yet.";

        const productList = products
          .map((p, i) => {
            const price = parseFloat(p.price) || 0;
            return `${i + 1}. ${p.name}\n   Price: $${price.toFixed(
              2
            )}\n   Stock: ${p.stock_quantity ?? "N/A"}\n   Status: ${
              p.is_active ? "Active" : "Inactive"
            }`;
          })
          .join("\n\n");

        const totalValue = products.reduce(
          (sum, p) => sum + parseFloat(p.price || 0),
          0
        );
        return `You have ${
          products.length
        } products:\n\n${productList}\n\nTotal product value: $${totalValue.toFixed(
          2
        )}`;
      }

      case "report": {
        const res = await axios.get(
          `http://localhost:3000/api/vendor/reports/${userId}`,
          {
            headers: { Authorization: `Bearer ${token || ""}` },
          }
        );
        const report = res.data.data;
        if (!report) return "No report data found yet.";

        const storeName = report.store_name || "Your Store";
        const totalOrders = report.total_orders || 0;
        const totalSales = parseFloat(report.total_sales || 0).toFixed(2);

        return `Store Name: ${storeName}\nYour Total Orders: ${totalOrders}\nYour Total Sales: $${totalSales}`;
      }
      case "update_order_item_status": {
        const parts = message.split(" ");
        const itemId = parts.find((p) => /^\d+$/.test(p)); // extract number from message
        const lower = message.toLowerCase();
        let status = null;
        if (
          lower.includes("accept") ||
          lower.includes("approve") ||
          lower.includes("اقبل")
        )
          status = "accepted";
        if (
          lower.includes("reject") ||
          lower.includes("رفض") ||
          lower.includes("ارفض")
        )
          status = "rejected";

        if (!itemId) return "Please specify the item ID you want to update 🔢";
        if (!status)
          return "Please specify the new status ('accepted' or 'rejected') ✅❌";

        const res = await axios.put(
          `http://localhost:3000/api/vendor/order-items/${itemId}/status`,
          { status },
          {
            headers: { Authorization: `Bearer ${token || ""}` },
          }
        );

        if (res.data.success) {
          return `✅ Successfully updated item #${itemId} status to "${status}".`;
        } else {
          return `❌ Failed to update item #${itemId}: ${
            res.data.message || "Unknown error"
          }`;
        }
      }
      case "go_to_orders": {
        const frontendUrl = process.env.FRONTEND_URL;
        return `📦 Sure! You can view and manage all your orders here:\n${frontendUrl}/vendor/orders`;
      }

      case "go_to_products": {
        const frontendUrl = process.env.FRONTEND_URL;
        return `🛍️ Explore, add, or update your products here:\n${frontendUrl}/vendor/products`;
      }

      case "go_to_chat": {
        const frontendUrl = process.env.FRONTEND_URL;
        return `💬 Communicate easily with customers and support through the chat page:\n${frontendUrl}/vendor/chat`;
      }

      case "go_to_settings": {
        const frontendUrl = process.env.FRONTEND_URL;
        return `⚙️ Manage your store preferences and account settings here:\n${frontendUrl}/vendor/settings`;
      }

      case "go_to_profile": {
        const frontendUrl = process.env.FRONTEND_URL;
        return `👤 View and update your vendor profile details here:\n${frontendUrl}/vendor/profile`;
      }

      case "go_to_dashboard": {
        const frontendUrl = process.env.FRONTEND_URL;
        return `📊 Welcome back! Access your main vendor dashboard and performance insights here:\n${frontendUrl}/vendor/dashboard`;
      }

      default:
        return "";
    }
  } catch (err) {
    console.error("Error in vendorIntents:", err);
    return "❌ Failed to fetch vendor data.";
  }
};

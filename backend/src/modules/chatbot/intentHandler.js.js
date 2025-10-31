// src/modules/chatbot/intentHandler.js
const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const { handleCustomerIntent } = require("./intents/customerIntents");
const { handleDeliveryIntent } = require("./intents/deliveryIntents");
const { handleVendorIntent } = require("./intents/vendorIntents");
const { handleAdminIntent } = require("./intents/adminIntents");

const intentsByRole = {
  customer: [
    "orders",
    "order_details",
    "track_order",
    "wishlist",
    "cart",
    "cart_details",
    "payment",
    "coverage",
    "category",
    "vendors",
    "go_to_orders",
    "go_to_cart",
    "go_to_products",
    "go_to_vendors",
    "go_to_settings",
    "go_to_profile",
    "go_to_home",
    "go_to_wishlist",
  ],
  delivery: [
    "orders",
    "order_details",
    "track_order",
    "coverage",
    "report",
    "update_order_status",
    "go_to_orders",
    "go_to_settings",
    "go_to_profile",
    "go_to_edit_profile",
    "go_to_reports",
    "go_to_home",
  ],
  vendor: [
    "orders",
    "order_details",
    "products",
    "report",
    "update_order_item_status",
    "go_to_orders",
    "go_to_products",
    "go_to_chat",
    "go_to_settings",
    "go_to_profile",
    "go_to_dashboard",
  ],
  admin: [
    "orders",
    "pending_vendors",
    "delivery_companies",
    "pending_deliveries",
    "vendors",
    "go_to_profile",
    "go_to_dashboard",
    "go_to_home",
    "go_to_vendors_mangment",
    "go_to_delivery_companies_mangment",
    "go_to_orders_mangment",
    "go_to_cms",
    "go_to_pages_mangment",
    "go_to_notification_mangment",
    "go_to_category_mangment",
  ],
};

exports.classifyUserIntent = async (message, role = "customer") => {
  if (!intentsByRole[role]) role = "customer";
  const allowedIntents = intentsByRole[role];

  const prompt = `
You are an intent classifier for an e-commerce assistant (${role}).
Return only ONE word intent from the following list (ignore case): ${allowedIntents.join(
    ", "
  )}.
If none match, return "unknown".

Message: """${message}"""
  `;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: prompt }],
    max_tokens: 8,
  });

  const intent =
    res.choices?.[0]?.message?.content?.trim()?.toLowerCase() || "unknown";

  console.log(`🧠 Intent detected for ${role}: ${intent}`);

  return allowedIntents.includes(intent) ? intent : "unknown";
};

exports.handleIntent = async (
  intent,
  message,
  token,
  role = "customer",
  userId
) => {
  try {
    switch (role) {
      case "customer":
        return await handleCustomerIntent(intent, message, token, userId);
      case "delivery":
        return await handleDeliveryIntent(intent, message, token, userId);
      case "vendor":
        return await handleVendorIntent(intent, message, token, userId);
      case "admin":
        return await handleAdminIntent(intent, message, token, userId);
      default:
        return "";
    }
  } catch (err) {
    console.error(`❌ Error in handleIntent (${role}, ${intent}):`, err);
    return "";
  }
};

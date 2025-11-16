// src/modules/chatbot/intentHandler.js
const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Polyfill fetch لو Node < 18
const fetch =
  global.fetch ||
  ((...args) => import("node-fetch").then(({ default: f }) => f(...args)));

const { handleCustomerIntent } = require("./intents/customerIntents");
const { handleDeliveryIntent } = require("./intents/deliveryIntents");
const { handleVendorIntent } = require("./intents/vendorIntents");
const { handleAdminIntent } = require("./intents/adminIntents");

// ===== CMS base
const API_BASE = process.env.INTERNAL_API_BASE_URL || "https://qwikko.onrender.com";
// اسم الموقع بدك إياه ستاتيك = Qwikko
const BRAND_NAME = "Qwikko";

// —————— نيات كل رول ——————
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
    "go_to_chat",
    "about_website",
    "website_name",
  ],
  delivery: [
    "list_orders",
    "list_requested_orders",
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
    "go_to_chats",
    "go_to_requested_orders",
    "about_website",
    "website_name",
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
    "go_to_chat",
    "about_website",
    "website_name",
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
    "about_website",
    "website_name",
  ],
};

// —————— helpers ——————
function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[\u064B-\u065F]/g, "") // remove Arabic diacritics
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // remove punctuation
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  a = normalize(a);
  b = normalize(b);
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      m[i][j] = Math.min(
        m[i - 1][j] + 1,
        m[i][j - 1] + 1,
        m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return m[a.length][b.length];
}

// 👇 اكتشاف "عن الموقع"
function looksLikeAbout(text) {
  const t = normalize(text);

  const hardRegex =
    /(about(\s*(us|website))?|about\s+site|who\s+are\s+you|what\s+is\s+this\s+(site|app)|عن\s+الموقع|عن\s+التطبيق|نبذة|شو\s+هو\s+الموقع|ايش\s+الموقع|مين\s+انتو|مين\s+الشركة)/i;
  if (hardRegex.test(t)) return true;

  const anchors = [
    "about",
    "about website",
    "about site",
    "about app",
    "عن الموقع",
    "عن التطبيق",
    "نبذة",
    "الموقع",
  ];

  return anchors.some((w) => t.includes(w) || levenshtein(t, w) <= 2);
}

// 👇 اكتشاف "اسم الموقع"
function looksLikeWebsiteName(text) {
  const t = normalize(text);

  const hardRegex =
    /(what('?| i)?s\s+(the\s+)?(app|site|website)\s+name|site\s+name|website\s+name|اسم\s+الموقع|اسم\s+التطبيق|شو\s+اسم\s+الموقع|ايش\s+اسم\s+الموقع)/i;
  if (hardRegex.test(t)) return true;

  const anchors = [
    "website name",
    "site name",
    "name of website",
    "اسم الموقع",
    "اسم التطبيق",
    "شو اسم الموقع",
    "ايش اسم الموقع",
  ];

  return anchors.some((w) => t.includes(w) || levenshtein(t, w) <= 2);
}

// —————— CMS helpers ——————
async function fetchCMSByTitle(type, title) {
  const url = `${API_BASE}/api/cms?type=${encodeURIComponent(
    type
  )}&title=${encodeURIComponent(title)}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || `Failed to fetch CMS for title: ${title}`;
    throw new Error(msg);
  }
  const item = Array.isArray(data) ? data[0] : data?.items?.[0] || data;
  return item || null;
}

function parseCmsSectionFromContent(contentStr) {
  if (!contentStr) return null;
  const [titlePart, contentPartRaw] = String(contentStr).split("@");
  const title = (titlePart || "").trim();
  const body = (contentPartRaw || "").trim();

  const isList = body.includes("*");
  const listItems = isList
    ? body
        .split("*")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return { title, body: isList ? "" : body, listItems };
}

function renderSectionsToMarkdown(sections) {
  const out = [];
  for (const s of sections) {
    if (!s) continue;
    if (s.title) out.push(`## ${s.title}`);
    if (s.body) out.push(s.body);
    if (s.listItems?.length)
      out.push(s.listItems.map((x) => `- ${x}`).join("\n"));
    out.push("");
  }
  return out.join("\n");
}

async function getAboutWebsiteSections(type = "user") {
  const sections = [];

  // 1) about_website
  try {
    const one = await fetchCMSByTitle(type, "about_website");
    if (one?.content) {
      const s = parseCmsSectionFromContent(one.content);
      if (s) sections.push(s);
    }
  } catch (_) {}

  // 2) About Page 1..10
  const promises = [];
  for (let i = 1; i <= 10; i++) {
    const t = `About Page ${i}`;
    promises.push(
      fetchCMSByTitle(type, t)
        .then((it) =>
          it?.content ? parseCmsSectionFromContent(it.content) : null
        )
        .catch(() => null)
    );
  }
  const results = await Promise.all(promises);
  for (const r of results) if (r) sections.push(r);

  // unique
  const unique = [];
  const seen = new Set();
  for (const s of sections) {
    const key = `${s.title}|${s.body}|${(s.listItems || []).join("|")}`;
    if (!seen.has(key)) {
      unique.push(s);
      seen.add(key);
    }
  }
  return unique;
}

// ================== تصنيف النية ==================
exports.classifyUserIntent = async (message, role = "customer") => {
  if (!intentsByRole[role]) role = "customer";
  const allowedIntents = intentsByRole[role];

  const text = String(message || "").trim();

  // 1) about
  if (looksLikeAbout(text)) {
    return allowedIntents.includes("about_website")
      ? "about_website"
      : "unknown";
  }

  // 2) website name
  if (looksLikeWebsiteName(text)) {
    return allowedIntents.includes("website_name") ? "website_name" : "unknown";
  }

  // 3) موديل كـ fallback
  const prompt = `
You are an intent classifier for an e-commerce assistant (${role}).
Return only ONE intent from this list:
${allowedIntents.join(", ")}
User message: """${text}"""
  `;

  try {
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 8,
    });

    const intent =
      res.choices?.[0]?.message?.content?.trim()?.toLowerCase() || "unknown";

    return allowedIntents.includes(intent) ? intent : "unknown";
  } catch (err) {
    console.error("intent classification error:", err);
    return "unknown";
  }
};

// ================== التعامل مع النية ==================
exports.handleIntent = async (
  intent,
  message,
  token,
  role = "customer",
  userId
) => {
  try {
    // ✅ اسم الموقع دايمًا ستاتيك
    if (intent === "website_name") {
      return "We are Qwikko.";
    }

    // ✅ about من الـ CMS
    if (intent === "about_website") {
      const sections = await getAboutWebsiteSections("user");
      if (!sections.length) {
        // fallback لو ما في CMS
        return "Qwikko is a smart e-commerce and delivery platform that connects customers, vendors, and delivery companies.";
      }
      return renderSectionsToMarkdown(sections);
    }

    // ✅ نوايا الرول
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
    if (intent === "website_name") return "We are Qwikko.";
    if (intent === "about_website")
      return "Qwikko is an e-commerce and delivery platform.";
    return "";
  }
};

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
const API_BASE = process.env.INTERNAL_API_BASE_URL || "http://localhost:3000";
const BRAND_NAME = process.env.BRAND_NAME || "Qwikko";

// —————— نيات كل رول (بدون ما تحتاج تضيفها في سويتش لاحقًا) ——————
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
    "about_website",
    "website_name",
    
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

// —————— كشف ذكي (regex + تحمل أخطاء إملائية) ——————
const WEBSITE_REGEX =
  /(about(\s*(us|website))?|web\s*site|website|site|who\s+(are|r)\s+(you|u)|what\s+is\s+(this|your)\s+(app|site|website)|info about|about\s+the\s+(app|site)|company\s+info|معلومات|نبذة|موقع|عن\s+الموقع|شو\s+هو\s+الموقع|ايش\s+الموقع|عن\s+التطبيق|مين\s+انتو|مين\s+الشركة|شو\s+يعني\s+(كويكو|الموقع))/i;

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[\u064B-\u065F]/g, "") // remove Arabic diacritics
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // remove punctuation
    .replace(/\s+/g, " ")
    .trim();
}

// levenshtein بسيط لمسك typos مثل "abaut websait"
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

function looksLikeAbout(text) {
  const t = normalize(text);
  if (WEBSITE_REGEX.test(t)) return true;

  // كلمات أساس نقيس عليها تشابه بسيط (<=2)
  const anchors = [
    "about",
    "website",
    "web site",
    "site",
    "about website",
    "عن الموقع",
    "الموقع",
    "نبذة",
    "عن التطبيق",
    "عن الشركة",
  ];
  return anchors.some((w) => levenshtein(t, w) <= 2 || t.includes(w));
}

/* ==================== كشف ذكي لاسم الموقع (نسخة واحدة فقط) ==================== */
const WEBSITE_NAME_REGEX =
  /(what('?| i)?s\s+(the\s+)?(app|site|website)\s+name|name\s+of\s+(the\s+)?(app|site|website)|site\s+name|website\s+name|اسم\s+الموقع|شو\s+اسم\s+الموقع|ايش\s+اسم\s+الموقع|اسم\s+التطبيق|اسم\s+الويب\s*سايت)/i;

function looksLikeWebsiteName(text) {
  const t = normalize(text || "");
  if (WEBSITE_NAME_REGEX.test(t)) return true;

  const anchors = [
    "website name",
    "site name",
    "name of website",
    "اسم الموقع",
    "اسم الويب سايت",
    "شو اسم الموقع",
    "ايش اسم الموقع",
  ];
  return anchors.some((w) => t.includes(w) || levenshtein(t, w) <= 2);
}

/* ==================== حملة تعريفية Markdown ==================== */
function getWebsiteNameCampaign(role = "customer") {
  const brand = BRAND_NAME;

  const roleNotes = {
    customer:
      "- **للعملاء**: تسوّق بسرعة من متاجر قريبة، تتبّع طلباتك لحظيًا، وادفع بأمان.\n",
    delivery:
      "- **لشركات التوصيل**: استلام مهام ذكي، خرائط ومسارات، ولوحة تقارير لحظية.\n",
    vendor:
      "- **للتجّار**: أدر منتجاتك ومخزونك، استقبل طلباتك، وتابع المبيعات بتقارير واضحة.\n",
    admin:
      "- **للأدمن**: إدارة مركزية للمحتوى، التجّار، شركات التوصيل، والإشعارات.\n",
  };

  const extra = roleNotes[role] || "";

  return [
    `# ${brand}`,
    "الطريقة الأسرع لربط المتاجر المحلية بالعملاء والتوصيل — **اطلب، تبع، استلم**.",
    "",
    "## Elevator pitch",
    `${brand} منصة تجمع المتاجر، العملاء، وشركات التوصيل في مكان واحد: تجربة شراء سلسة، تتبّع لحظي، ودفع آمن.`,
    "",
    "## لماذا ${brand}؟",
    "- طلبات سريعة وسهلة الاستخدام.",
    "- تتبّع مباشر لحالة الطلب والتوصيل.",
    "- دعم متكامل للتجّار وشركات التوصيل.",
    "- أدوات إدارة وتقارير واضحة.",
    "",
    "## المزايا الأساسية",
    "- 🛒 **تصفّح وطلب سريع** من متاجر متعددة.",
    "- 📍 **تغطية ذكية** حسب مناطق الخدمة.",
    "- 🚚 **تتبّع لحظي** لحالة الطلب والتوصيل.",
    "- 💳 **مدفوعات آمنة** وخيارات متعددة.",
    "- 🔔 **إشعارات فورية** لحالة الطلب.",
    "",
    "## لمن هذه المنصة؟",
    extra || "- مناسبة للعملاء، التجّار، وشركات التوصيل.",
    "",
    "## نبرة وهوية العلامة",
    "- سريعة | واضحة | موثوقة.",
    "",
    "## دعوة لاتخاذ إجراء (CTA)",
    "- جرّب الآن وسجّل حسابك خلال أقل من دقيقة.",
    "",
    "—",
    `**اسم الموقع/العلامة:** ${brand}`,
  ].join("\n");
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
  // Resp حسب مثالك: Array بداخلها {content, image_url}
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

  // 1) جرّب عنوان عام واحد
  try {
    const one = await fetchCMSByTitle(type, "about_website");
    if (one?.content) {
      const s = parseCmsSectionFromContent(one.content);
      if (s) sections.push(s);
    }
  } catch (_) {
    /* تجاهل */
  }

  // 2) جرّب صفحات About Page 1..10 (مرن مش ثابت 1..4)
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

  // إزالة التكرار لو نفس العنوان انضاف مرتين
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

// —————— تصنيف النية (يتحمل typos) ——————
exports.classifyUserIntent = async (message, role = "customer") => {
  if (!intentsByRole[role]) role = "customer";
  const allowedIntents = intentsByRole[role];

  const text = String(message || "").trim();

  if (looksLikeWebsiteName(text)) {
    return allowedIntents.includes("website_name") ? "website_name" : "unknown";
  }
  // التقاط مباشر بدون موديل لو واضح أو فيه typos بسيطة
  if (looksLikeAbout(text)) {
    return allowedIntents.includes("about_website")
      ? "about_website"
      : "unknown";
  }

  // التقاط مباشر لاسم الموقع

  // موديل كـ fallback (نطلب منه يتجاهل الأخطاء الإملائية)
  const prompt = `
You are an intent classifier for an e-commerce assistant (${role}).

Return only ONE intent from the following list (ignore case and spelling mistakes):
${allowedIntents.join(", ")}.

If the message is asking about the website/app/company (e.g., who we are, about us, website info),
return "about_website" even if there are typos.

If the message is asking for the site/app name, return "website_name" even if there are typos.

Message: """${text}"""
  `;

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: prompt }],
    max_tokens: 8,
  });

  const intent =
    res.choices?.[0]?.message?.content?.trim()?.toLowerCase() || "unknown";
  if (intent.replace(/\s+/g, "_") === "about_website") return "about_website";
  if (intent.replace(/\s+/g, "_") === "website_name") return "website_name";
  return allowedIntents.includes(intent) ? intent : "unknown";
};

// —————— التعامل مع النيات ——————
exports.handleIntent = async (
  intent,
  message,
  token,
  role = "customer",
  userId
) => {
  try {
    // نية عامة لكل الأدوار — قبل السويتش
    if (intent === "about_website") {
      const sections = await getAboutWebsiteSections("user"); // غيرها لـ role لو بدك تخصيص
      if (!sections.length)
        return "Website information is not available right now.";
      return renderSectionsToMarkdown(sections);
    }

    // نية اسم الموقع — ترجع حملة تعريفية باسم البراند
    if (intent === "website_name") {
      return getWebsiteNameCampaign(role);
    }

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
    if (intent === "about_website")
      return "Sorry, I couldn't fetch the website info right now.";
    if (intent === "website_name")
      return "Sorry, I couldn't show the website name right now.";
    return "";
  }
};

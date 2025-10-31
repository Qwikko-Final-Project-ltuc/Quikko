const OpenAI = require("openai");
const userSessions = require("./sessionStore");
const { classifyUserIntent, handleIntent } = require("./intentHandler.js");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.getAIResponse = async (userId, role, message, token) => {
  try {
    if (!userId) userId = "guest"; // fallback لو مافي
    if (!userSessions[userId]) userSessions[userId] = {};
    if (!userSessions[userId].conversation) userSessions[userId].conversation = [];

    userSessions[userId].conversation.push({ role: "user", content: message });


    const intent = await classifyUserIntent(message, role);
    const dynamicInfo =
      (await handleIntent(intent, message, token, role)) || "";

    const rolePrompts = {
      customer: `You are a helpful AI assistant for customers.`,
      vendor: `You are a smart assistant for vendors.`,
      admin: `You are an assistant helping admins manage system data.`,
      delivery: `You are a delivery management assistant.`,
    };

    const systemPrompt =
      (rolePrompts[role] || rolePrompts.customer) +
      `\n\nDetected intent: ${intent}` +
      (dynamicInfo ? `\n\nBackend info:\n${dynamicInfo}` : "");

    // === limit memory ===
    if (userSessions[userId].conversation.length > 20) {
      userSessions[userId].conversation =
        userSessions[userId].conversation.slice(-20);
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...userSessions[userId].conversation,
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 400,
      temperature: 0,
      top_p: 1,
    });

    const reply = completion.choices[0].message.content?.trim() || "";
    userSessions[userId].conversation.push({
      role: "assistant",
      content: reply,
    });

    return reply;
  } catch (err) {
    console.error("Error in AI service:", err);
    return " Sorry, can't process request right now.";
  }
};

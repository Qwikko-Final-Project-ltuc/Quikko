const pool = require("../../config/db");
const ISO_UTC = `to_char($$COL$$ AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"')`;


exports.getMessagesBetween = async (customerId, vendorId) => {
  const { rows } = await pool.query(
    `
    SELECT
      id,
      sender_id,
      receiver_id,
      message,
      read_status,
      ${ISO_UTC.replace("$$COL$$", "created_at")} AS created_at_iso
    FROM chat_messages
    WHERE (sender_id = $1 AND receiver_id = $2)
       OR (sender_id = $2 AND receiver_id = $1)
    ORDER BY created_at ASC, id ASC
    `,
    [customerId, vendorId]
  );
  return rows;
};

exports.insertMessage = async (sender_id, receiver_id, text) => {
  const { rows } = await pool.query(
    `
    INSERT INTO chat_messages (sender_id, receiver_id, message)
    VALUES ($1, $2, $3)
    RETURNING
      id,
      sender_id,
      receiver_id,
      message,
      read_status,
      created_at,
      ${ISO_UTC.replace("$$COL$$", "created_at")} AS created_at_iso
    `,
    [sender_id, receiver_id, text]
  );
  return rows[0] || null;
};

// chatModel.js
exports.getVendorConversations = async (vendorId) => {
  const { rows } = await pool.query(
    `
    WITH conv AS (
      SELECT
        CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS other_user_id,
        MAX(created_at) AS last_at
      FROM chat_messages
      WHERE sender_id = $1 OR receiver_id = $1
      GROUP BY 1
    )
    SELECT
      conv.other_user_id,
      -- لو الآخر شركة توصيل → role = delivery
      CASE WHEN d.user_id IS NOT NULL THEN 'delivery' ELSE 'customer' END AS other_role,

      -- الاسم المناسب حسب الدور: شركة التوصيل أو اسم المستخدم
      COALESCE(NULLIF(d.company_name, ''), u.name) AS other_name,

      (
        SELECT m.message
        FROM chat_messages m
        WHERE (m.sender_id = $1 AND m.receiver_id = conv.other_user_id)
           OR (m.sender_id = conv.other_user_id AND m.receiver_id = $1)
        ORDER BY m.created_at DESC, m.id DESC
        LIMIT 1
      ) AS last_message,

      (
        SELECT COUNT(*)
        FROM chat_messages m2
        WHERE m2.receiver_id = $1
          AND m2.sender_id   = conv.other_user_id
          AND m2.read_status = false
      ) AS unread_count,

      ${ISO_UTC.replace("$$COL$$", "conv.last_at")} AS last_at_iso
    FROM conv
    LEFT JOIN delivery_companies d ON d.user_id = conv.other_user_id
    LEFT JOIN users u              ON u.id      = conv.other_user_id
    ORDER BY conv.last_at DESC NULLS LAST
    `,
    [vendorId]
  );
  return rows;
};


exports.markReadFor = async (receiverId, senderId) => {
  const { rowCount } = await pool.query(
    `
    UPDATE chat_messages
       SET read_status = true
     WHERE receiver_id = $1
       AND sender_id   = $2
       AND read_status = false
    `,
    [receiverId, senderId]
  );
  return rowCount;
};

exports.getCustomerConversations = async (customerId) => {
  const { rows } = await pool.query(
    `
    WITH conv AS (
      SELECT
        CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS other_user_id,
        MAX(created_at) AS last_at
      FROM chat_messages
      WHERE sender_id = $1 OR receiver_id = $1
      GROUP BY 1
    )
    SELECT
      ${ISO_UTC.replace("$$COL$$", "conv.last_at")} AS last_at_iso,
      u.id AS vendor_user_id,
      v.id AS vendor_id,
      COALESCE(NULLIF(v.store_name, ''), u.name) AS vendor_name,
      (
        SELECT m.message
        FROM chat_messages m
        WHERE (m.sender_id = $1 AND m.receiver_id = conv.other_user_id)
           OR (m.sender_id = conv.other_user_id AND m.receiver_id = $1)
        ORDER BY m.created_at DESC, m.id DESC
        LIMIT 1
      ) AS last_message,
      (
        SELECT COUNT(*)
        FROM chat_messages m2
        WHERE m2.receiver_id = $1
          AND m2.sender_id   = conv.other_user_id
          AND m2.read_status = false
      ) AS unread_count
    FROM conv
    JOIN users u   ON u.id      = conv.other_user_id
    LEFT JOIN vendors v ON v.user_id = u.id
    ORDER BY conv.last_at DESC NULLS LAST
    `,
    [customerId]
  );
  return rows;
};

exports.getDeliveryConversations = async (deliveryId) => {
  const { rows } = await pool.query(
    `
    WITH conv AS (
      SELECT
        CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS other_user_id,
        MAX(created_at) AS last_at
      FROM chat_messages
      WHERE sender_id = $1 OR receiver_id = $1
      GROUP BY 1
    )
    SELECT
      to_char(conv.last_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"') AS last_at_iso,
      u.id AS vendor_user_id,
      v.id AS vendor_id,
      COALESCE(NULLIF(v.store_name, ''), u.name) AS vendor_name,
      (
        SELECT m.message
        FROM chat_messages m
        WHERE (m.sender_id = $1 AND m.receiver_id = conv.other_user_id)
           OR (m.sender_id = conv.other_user_id AND m.receiver_id = $1)
        ORDER BY m.created_at DESC, m.id DESC
        LIMIT 1
      ) AS last_message,
      (
        SELECT COUNT(*)
        FROM chat_messages m2
        WHERE m2.receiver_id = $1
          AND m2.sender_id   = conv.other_user_id
          AND m2.read_status = false
      ) AS unread_count
    FROM conv
    JOIN users u   ON u.id      = conv.other_user_id
    LEFT JOIN vendors v ON v.user_id = u.id
    ORDER BY conv.last_at DESC NULLS LAST
    `,
    [deliveryId]
  );

  return rows;
};

// chatModel.js
exports.getMessagesBetween = async (customerId, vendorId) => {
  const { rows } = await pool.query(
    `
    SELECT
      m.id,
      m.sender_id,
      m.receiver_id,
      m.message,
      m.read_status,
      m.created_at,
      ${ISO_UTC.replace("$$COL$$", "m.created_at")} AS created_at_iso,

      -- تحديد دور المرسِل
      CASE
        WHEN m.sender_id = $2 THEN 'vendor'                    -- هو البائع
        WHEN d_s.user_id IS NOT NULL THEN 'delivery'           -- شركة توصيل
        ELSE 'customer'                                        -- عميل
      END AS sender_role,

      -- أسماء جاهزة للعرض
      u_s.name            AS sender_user_name,     -- لو customer
      d_s.company_name    AS sender_company_name   -- لو delivery
    FROM chat_messages m
    LEFT JOIN delivery_companies d_s ON d_s.user_id = m.sender_id
    LEFT JOIN users u_s              ON u_s.id      = m.sender_id
    WHERE (m.sender_id = $1 AND m.receiver_id = $2)
       OR (m.sender_id = $2 AND m.receiver_id = $1)
       OR (m.sender_id = $2 AND m.receiver_id = $1) -- بائع كمرسِل
    ORDER BY m.created_at ASC, m.id ASC
    `,
    [customerId, vendorId]
  );
  return rows;
};
// chatModel.js
exports.getIdentityForUser = async (userId, vendorId) => {
  const { rows } = await pool.query(
    `
    SELECT
      $1::int AS user_id,
      CASE
        WHEN $1 = $2 THEN 'vendor'
        WHEN d.user_id IS NOT NULL THEN 'delivery'
        ELSE 'customer'
      END AS role,
      u.name         AS user_name,
      d.company_name AS company_name
    FROM users u
    LEFT JOIN delivery_companies d ON d.user_id = $1
    WHERE u.id = $1
    `,
    [userId, vendorId]
  );
  return rows[0] || null;
};

const express = require("express");
const router = express.Router();
const userController = require("../user/userController");
const { protect} = require("../../middleware/authMiddleware");

router.put("/:id/fcm-token", userController.updateFcmToken);

const db = require('../../config/db');

//delete fcm token to stop recive notifications after logout
router.post("/unregister-fcm", protect, async (req, res) => {
  try {
    console.log("User from token:", req.user);
    const userId = req.user.id;

    const result =await db.query("UPDATE users SET fcm_token = NULL WHERE id = $1 RETURNING *", [userId]);
    console.log("Updated row:", result.rows);

    res.status(200).json({ message: "FCM token removed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove FCM token" });
  }
});
module.exports = router;


/* =================== Swagger Documentation =================== */

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management endpoints
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * security:
 *   - bearerAuth: []
 *
 * paths:
 *   /api/users/{id}/fcm-token:
 *     put:
 *       summary: Update FCM token for a user
 *       tags: [Users]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - name: id
 *           in: path
 *           required: true
 *           schema:
 *             type: integer
 *           description: User ID
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - fcmToken
 *               properties:
 *                 fcmToken:
 *                   type: string
 *                   description: Firebase Cloud Messaging token
 *       responses:
 *         200:
 *           description: FCM token updated successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     example: "FCM token updated successfully"
 *         400:
 *           description: fcmToken is required
 *         500:
 *           description: Internal server error
 */
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "./db.js";
import authenticateToken from "./middleware/auth.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "streamvault_secret_key_123";

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static built files from the frontend
const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath));

// Helper: Generate JWT Token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ── Auth API ───────────────────────────────────────────────────────────────────

// Register
app.post("/api/auth/register", (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check if user exists
    const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Insert user
    const insert = db.prepare(`
      INSERT INTO users (email, password, first_name, last_name, phone, role, joined_date)
      VALUES (?, ?, ?, ?, ?, 'user', ?)
    `);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const joinedStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

    const result = insert.run(email, hashedPassword, firstName, lastName, phone || "", joinedStr);
    const userId = result.lastInsertRowid;

    // Add welcome notification
    db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, time, read)
      VALUES (?, 'info', 'Welcome to StreamVault!', 'Start tracking your OTT subscriptions now. Add your existing plans or browse our platforms.', 'Just now', 0)
    `).run(userId);

    const newUser = { id: userId, email, first_name: firstName, last_name: lastName, phone, role: "user", joined_date: joinedStr };
    const token = generateToken(newUser);

    res.status(201).json({ token, user: newUser });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        joined_date: user.joined_date
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Me (Get profile)
app.get("/api/auth/me", authenticateToken, (req, res) => {
  try {
    const user = db.prepare("SELECT id, email, first_name, last_name, phone, role, joined_date FROM users WHERE id = ?").get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Auth me error:", error);
    res.status(500).json({ error: "Server error fetching profile" });
  }
});

// ── Plans API ──────────────────────────────────────────────────────────────────

// Get all plans grouped by platform (frontend compatible format)
app.get("/api/plans", (req, res) => {
  try {
    const allPlans = db.prepare("SELECT * FROM plans").all();
    
    // Group by platform
    const platformMap = {};
    for (const p of allPlans) {
      if (!platformMap[p.platform]) {
        platformMap[p.platform] = {
          platform: p.platform,
          color: p.color,
          bgColor: p.bg_color,
          plans: []
        };
      }
      platformMap[p.platform].plans.push({
        id: p.id,
        name: p.name,
        price: p.price,
        screens: p.screens,
        quality: p.quality,
        downloads: p.downloads === 1,
        popular: p.popular === 1
      });
    }

    res.json(Object.values(platformMap));
  } catch (error) {
    console.error("Fetch plans error:", error);
    res.status(500).json({ error: "Server error fetching plans" });
  }
});

// ── Subscriptions API ──────────────────────────────────────────────────────────

// Get logged-in user subscriptions
app.get("/api/subscriptions", authenticateToken, (req, res) => {
  try {
    const query = `
      SELECT s.id, s.status, s.start_date, s.renewal_date, 
             p.platform, p.name as plan_name, p.price, p.screens, p.quality, p.color
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE s.user_id = ?
    `;
    const subs = db.prepare(query).all(req.user.id);

    const active = [];
    const expired = [];

    for (const s of subs) {
      const formatted = {
        id: s.id,
        platform: s.platform,
        plan: s.plan_name,
        price: s.price,
        screens: s.screens,
        quality: s.quality,
        color: s.color,
        status: s.status,
      };

      if (s.status === "expired") {
        formatted.expiredDate = s.renewal_date;
        expired.push(formatted);
      } else {
        formatted.renewalDate = s.renewal_date;
        active.push(formatted);
      }
    }

    res.json({ active, expired });
  } catch (error) {
    console.error("Fetch subscriptions error:", error);
    res.status(500).json({ error: "Server error fetching subscriptions" });
  }
});

// ── Payment / Checkout API ─────────────────────────────────────────────────────

// Create new Subscription & Transaction (Checkout)
app.post("/api/subscriptions/checkout", authenticateToken, (req, res) => {
  const { planId, paymentMethod } = req.body;

  if (!planId || !paymentMethod) {
    return res.status(400).json({ error: "planId and paymentMethod are required" });
  }

  try {
    const plan = db.prepare("SELECT * FROM plans WHERE id = ?").get(planId);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    
    // Dates
    const startStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);
    const renewalStr = `${months[nextMonth.getMonth()]} ${nextMonth.getDate()}, ${nextMonth.getFullYear()}`;
    const txDateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

    // 1. Create subscription
    const insertSub = db.prepare(`
      INSERT INTO subscriptions (user_id, plan_id, status, start_date, renewal_date)
      VALUES (?, ?, 'active', ?, ?)
    `);
    const subResult = insertSub.run(req.user.id, planId, startStr, renewalStr);
    const subId = subResult.lastInsertRowid;

    // 2. Create successful transaction
    const txId = "TXN" + Math.floor(100000 + Math.random() * 900000);
    const insertTx = db.prepare(`
      INSERT INTO transactions (id, user_id, platform, plan, amount, status, method, date)
      VALUES (?, ?, ?, ?, ?, 'success', ?, ?)
    `);
    insertTx.run(txId, req.user.id, plan.platform, plan.name, plan.price, paymentMethod, txDateStr);

    // 3. Create Notification
    db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, time, read)
      VALUES (?, 'success', 'Payment Successful', ?, 'Just now', 0)
    `).run(
      req.user.id,
      `₹${plan.price} charged for ${plan.platform} ${plan.name} subscription. Valid till ${renewalStr}.`
    );

    res.status(201).json({
      message: "Subscription created successfully",
      subscriptionId: subId,
      transactionId: txId
    });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: "Server error during checkout" });
  }
});

// Renew Subscription
app.post("/api/subscriptions/:id/renew", authenticateToken, (req, res) => {
  const subId = req.params.id;
  const { paymentMethod } = req.body;

  if (!paymentMethod) {
    return res.status(400).json({ error: "paymentMethod is required" });
  }

  try {
    const query = `
      SELECT s.*, p.platform, p.name as plan_name, p.price 
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE s.id = ? AND s.user_id = ?
    `;
    const sub = db.prepare(query).get(subId, req.user.id);
    if (!sub) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);

    const startStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    const renewalStr = `${months[nextMonth.getMonth()]} ${nextMonth.getDate()}, ${nextMonth.getFullYear()}`;

    // Update Subscription to active
    db.prepare(`
      UPDATE subscriptions 
      SET status = 'active', start_date = ?, renewal_date = ?
      WHERE id = ?
    `).run(startStr, renewalStr, subId);

    // Create transaction
    const txId = "TXN" + Math.floor(100000 + Math.random() * 900000);
    const insertTx = db.prepare(`
      INSERT INTO transactions (id, user_id, platform, plan, amount, status, method, date)
      VALUES (?, ?, ?, ?, ?, 'success', ?, ?)
    `);
    insertTx.run(txId, req.user.id, sub.platform, sub.plan_name, sub.price, paymentMethod, startStr);

    // Create notification
    db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, time, read)
      VALUES (?, 'success', 'Subscription Renewed', ?, 'Just now', 0)
    `).run(
      req.user.id,
      `Successfully renewed ${sub.platform} ${sub.plan_name} for ₹${sub.price}. Next renewal: ${renewalStr}.`
    );

    res.json({ message: "Subscription renewed successfully", transactionId: txId });
  } catch (error) {
    console.error("Renewal error:", error);
    res.status(500).json({ error: "Server error during renewal" });
  }
});

// ── Transaction History API ───────────────────────────────────────────────────

app.get("/api/transactions", authenticateToken, (req, res) => {
  try {
    const txs = db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC").all(req.user.id);
    res.json(txs);
  } catch (error) {
    console.error("Fetch transactions error:", error);
    res.status(500).json({ error: "Server error fetching transaction history" });
  }
});

// ── Dashboard Dynamic Stats API ────────────────────────────────────────────────

app.get("/api/dashboard/stats", authenticateToken, (req, res) => {
  try {
    // 1. Calculate spending data for charts (last 6 months)
    const txs = db.prepare("SELECT amount, date FROM transactions WHERE user_id = ? AND status = 'success'").all(req.user.id);
    
    // Group transactions by month
    const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthStats = {};
    
    // Initialize last 6 months with 0
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mLabel = monthsOrder[d.getMonth()];
      monthStats[mLabel] = 0;
    }

    for (const tx of txs) {
      // Date format is e.g. "Jul 1, 2025" or "Jun 15, 2025"
      const parts = tx.date.split(" ");
      if (parts.length >= 1) {
        const mLabel = parts[0];
        if (monthStats[mLabel] !== undefined) {
          monthStats[mLabel] += tx.amount;
        }
      }
    }

    const spendingData = Object.keys(monthStats).map(month => ({
      month,
      amount: monthStats[month]
    }));

    // 2. Platform distribution for current user
    const query = `
      SELECT p.platform, COUNT(s.id) as count, p.color
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE s.user_id = ? AND s.status != 'expired'
      GROUP BY p.platform
    `;
    const platformDistribution = db.prepare(query).all(req.user.id).map(item => ({
      name: item.platform,
      value: item.count,
      color: item.color
    }));

    res.json({ spendingData, platformDistribution });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Server error fetching stats" });
  }
});

// ── Notifications API ─────────────────────────────────────────────────────────

// Get all notifications for user
app.get("/api/notifications", authenticateToken, (req, res) => {
  try {
    const notifs = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC").all(req.user.id);
    // Convert read field from 0/1 to boolean
    const formatted = notifs.map(n => ({ ...n, read: n.read === 1 }));
    res.json(formatted);
  } catch (error) {
    console.error("Fetch notifications error:", error);
    res.status(500).json({ error: "Server error fetching notifications" });
  }
});

// Mark notification as read
app.put("/api/notifications/:id/read", authenticateToken, (req, res) => {
  const notifId = req.params.id;
  try {
    db.prepare("UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?").run(notifId, req.user.id);
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Read notification error:", error);
    res.status(500).json({ error: "Server error marking notification as read" });
  }
});

// Mark all notifications as read
app.post("/api/notifications/mark-all-read", authenticateToken, (req, res) => {
  try {
    db.prepare("UPDATE notifications SET read = 1 WHERE user_id = ?").run(req.user.id);
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    res.status(500).json({ error: "Server error marking notifications read" });
  }
});

// Dismiss / delete notification
app.delete("/api/notifications/:id", authenticateToken, (req, res) => {
  const notifId = req.params.id;
  try {
    db.prepare("DELETE FROM notifications WHERE id = ? AND user_id = ?").run(notifId, req.user.id);
    res.json({ message: "Notification dismissed" });
  } catch (error) {
    console.error("Dismiss notification error:", error);
    res.status(500).json({ error: "Server error dismissing notification" });
  }
});

// ── Admin Panel API ────────────────────────────────────────────────────────────

// Admin Auth check middleware
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Admin resource. Access denied." });
  }
}

// Get Admin Analytics
app.get("/api/admin/analytics", authenticateToken, requireAdmin, (req, res) => {
  try {
    // 1. Total Revenue
    const revenueRow = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE status = 'success'").get();
    const totalRevenue = revenueRow.total || 0;

    // 2. Total active users (users with active subscriptions)
    const activeUsersRow = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM subscriptions 
      WHERE status != 'expired'
    `).get();
    const activeUsers = activeUsersRow.count || 0;

    // 3. Total active subscriptions
    const activeSubsRow = db.prepare("SELECT COUNT(*) as count FROM subscriptions WHERE status != 'expired'").get();
    const activeSubscriptionsCount = activeSubsRow.count || 0;

    // 4. Platform Distribution
    const query = `
      SELECT p.platform, COUNT(s.id) as count, p.color
      FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE s.status != 'expired'
      GROUP BY p.platform
    `;
    const platformDistribution = db.prepare(query).all().map(item => ({
      name: item.platform,
      value: item.count,
      color: item.color
    }));

    // 5. Growth Data (revenue & users grouped by month)
    const txs = db.prepare("SELECT amount, date, user_id FROM transactions WHERE status = 'success'").all();
    const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthStats = {};
    
    // Pre-fill last 6 months
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mLabel = monthsOrder[d.getMonth()];
      monthStats[mLabel] = { revenue: 0, usersSet: new Set() };
    }

    for (const tx of txs) {
      const parts = tx.date.split(" ");
      if (parts.length >= 1) {
        const mLabel = parts[0];
        if (monthStats[mLabel]) {
          monthStats[mLabel].revenue += tx.amount;
          monthStats[mLabel].usersSet.add(tx.user_id);
        }
      }
    }

    const growthData = Object.keys(monthStats).map(month => ({
      month,
      revenue: monthStats[month].revenue,
      users: monthStats[month].usersSet.size
    }));

    res.json({
      totalRevenue,
      activeUsers,
      activeSubscriptionsCount,
      platformDistribution,
      growthData
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    res.status(500).json({ error: "Server error fetching admin stats" });
  }
});

// Get Admin Users list
app.get("/api/admin/users", authenticateToken, requireAdmin, (req, res) => {
  try {
    const query = `
      SELECT u.id, u.first_name || ' ' || u.last_name as name, u.email, u.joined_date as joined,
             (SELECT COUNT(*) FROM subscriptions s WHERE s.user_id = u.id AND s.status != 'expired') as subscriptions,
             (SELECT COALESCE(SUM(t.amount), 0) FROM transactions t WHERE t.user_id = u.id AND t.status = 'success') as spending,
             CASE 
               WHEN EXISTS(SELECT 1 FROM subscriptions s WHERE s.user_id = u.id AND s.status != 'expired') THEN 'active'
               ELSE 'inactive'
             END as status
      FROM users u
      WHERE u.role != 'admin'
    `;
    const users = db.prepare(query).all();
    res.json(users);
  } catch (error) {
    console.error("Admin fetch users error:", error);
    res.status(500).json({ error: "Server error fetching users list" });
  }
});

// Get all transactions (Admin view)
app.get("/api/admin/transactions", authenticateToken, requireAdmin, (req, res) => {
  try {
    const query = `
      SELECT t.id, t.date, t.platform, t.plan, t.amount, t.status, t.method,
             u.first_name || ' ' || u.last_name as user_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.date DESC
    `;
    const txs = db.prepare(query).all();
    res.json(txs);
  } catch (error) {
    console.error("Admin fetch transactions error:", error);
    res.status(500).json({ error: "Server error fetching transactions list" });
  }
});

// Fallback route for React SPA routing
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("API Server is running. Frontend build not found.");
  }
});

// App listener
app.listen(PORT, () => {
  console.log(`StreamVault API Server is running on port ${PORT}`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`StreamVault API Server: Port ${PORT} already bound.`);
  } else {
    console.error("Server listen error:", err);
  }
});

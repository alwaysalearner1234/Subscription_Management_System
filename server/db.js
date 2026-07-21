import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFile = path.resolve(__dirname, "database.json");

let data = {
  users: [],
  plans: [],
  subscriptions: [],
  transactions: [],
  notifications: []
};

function load() {
  if (fs.existsSync(dbFile)) {
    try {
      const txt = fs.readFileSync(dbFile, "utf8");
      data = JSON.parse(txt || "{}");
      data.users = data.users || [];
      data.plans = data.plans || [];
      data.subscriptions = data.subscriptions || [];
      data.transactions = data.transactions || [];
      data.notifications = data.notifications || [];
    } catch (e) {
      console.error("Failed to load database.json, starting with empty DB", e);
    }
  } else {
    save();
  }
}

function save() {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Failed to save database.json", e);
  }
}

function nextId(collection) {
  const arr = data[collection];
  if (!arr || arr.length === 0) return 1;
  return Math.max(...arr.map(i => i.id || 0)) + 1;
}

// Minimal SQL-like wrapper used by the rest of the server. It matches
// specific query patterns used throughout the codebase.
const db = {
  prepare(sql) {
    const raw = sql.trim();

    return {
      get(...params) {
        // COUNT plans
        if (/SELECT COUNT\(\*\) as count FROM plans/i.test(raw)) {
          return { count: data.plans.length };
        }

        // SELECT * FROM plans WHERE id = ?
        if (/SELECT \* FROM plans WHERE id = \?/i.test(raw)) {
          const id = params[0];
          return data.plans.find(p => p.id === id) || null;
        }

        // SELECT * FROM users WHERE email = ?
        if (/SELECT \* FROM users WHERE email = \?/i.test(raw)) {
          const email = params[0];
          return data.users.find(u => u.email === email) || null;
        }

        // SELECT id FROM users WHERE email = 'literal'
        let m = raw.match(/SELECT id FROM users WHERE email = '([^']+)'/i);
        if (m) {
          const email = m[1];
          const u = data.users.find(x => x.email === email);
          return u ? { id: u.id } : undefined;
        }

        // Generic SELECT id FROM plans WHERE platform = 'X' AND name = 'Y'
        m = raw.match(/SELECT id FROM plans WHERE platform = '([^']+)' AND name = '([^']+)'/i);
        if (m) {
          const platform = m[1];
          const name = m[2];
          const p = data.plans.find(x => x.platform === platform && x.name === name);
          return p ? { id: p.id } : undefined;
        }

        // SELECT id, email, first_name, last_name, phone, role, joined_date FROM users WHERE id = ?
        if (/SELECT id, email, first_name, last_name, phone, role, joined_date FROM users WHERE id = \?/i.test(raw)) {
          const id = params[0];
          const u = data.users.find(x => x.id === id);
          return u || null;
        }

        // SELECT s.*, p.platform, p.name as plan_name, p.price FROM subscriptions s JOIN plans p ON s.plan_id = p.id WHERE s.id = ? AND s.user_id = ?
        if (/FROM subscriptions s[\s\S]*JOIN plans p ON s.plan_id = p.id[\s\S]*WHERE s.id = \? AND s.user_id = \?/i.test(raw)) {
          const [subId, userId] = params;
          const s = data.subscriptions.find(x => x.id == subId && x.user_id == userId);
          if (!s) return undefined;
          const p = data.plans.find(pl => pl.id === s.plan_id) || {};
          return Object.assign({}, s, {
            platform: p.platform,
            plan_name: p.name,
            price: p.price,
            screens: p.screens,
            quality: p.quality,
            color: p.color
          });
        }

        // Admin revenue sum
        if (/SELECT SUM\(amount\) as total FROM transactions WHERE status = 'success'/i.test(raw)) {
          const total = data.transactions.filter(t => t.status === 'success').reduce((s, t) => s + (t.amount || 0), 0);
          return { total };
        }

        // COUNT DISTINCT user_id from subscriptions where status != 'expired'
        if (/SELECT COUNT\(DISTINCT user_id\) as count[\s\S]*FROM subscriptions[\s\S]*WHERE status != 'expired'/i.test(raw)) {
          const set = new Set(data.subscriptions.filter(s => s.status !== 'expired').map(s => s.user_id));
          return { count: set.size };
        }

        // COUNT subscriptions WHERE status != 'expired'
        if (/SELECT COUNT\(\*\) as count FROM subscriptions WHERE status != 'expired'/i.test(raw)) {
          const count = data.subscriptions.filter(s => s.status !== 'expired').length;
          return { count };
        }

        // SELECT id FROM plans WHERE platform = 'X' AND name = 'Y' used in seeding
        m = raw.match(/SELECT id FROM plans WHERE platform = '([^']+)' AND name = '([^']+)'/i);
        if (m) {
          const platform = m[1];
          const name = m[2];
          const p = data.plans.find(x => x.platform === platform && x.name === name);
          return p ? { id: p.id } : undefined;
        }

        return undefined;
      },

      all(...params) {
        // SELECT * FROM plans
        if (/SELECT \* FROM plans/i.test(raw)) {
          return data.plans;
        }

        // Transactions list by user_id
        if (/SELECT \* FROM transactions WHERE user_id = \? ORDER BY date DESC/i.test(raw)) {
          const userId = params[0];
          return data.transactions
            .filter(t => t.user_id === userId)
            .sort((a, b) => (a.date < b.date ? 1 : -1));
        }

        // User successful transactions amount and date
        if (/SELECT amount, date FROM transactions WHERE user_id = \? AND status = 'success'/i.test(raw)) {
          const userId = params[0];
          return data.transactions.filter(t => t.user_id === userId && t.status === 'success');
        }

        // All successful transactions (for admin growth analytics)
        if (/SELECT amount, date, user_id FROM transactions WHERE status = 'success'/i.test(raw)) {
          return data.transactions.filter(t => t.status === 'success');
        }

        // JOIN subscriptions with plans for a user
        if (/FROM subscriptions s[\s\S]*JOIN plans p ON s.plan_id = p.id[\s\S]*WHERE s.user_id = \?/i.test(raw)) {
          const userId = params[0];
          return data.subscriptions
            .filter(s => s.user_id === userId)
            .map(s => {
              const p = data.plans.find(pl => pl.id === s.plan_id) || {};
              return Object.assign({}, s, {
                platform: p.platform,
                plan_name: p.name,
                price: p.price,
                screens: p.screens,
                quality: p.quality,
                color: p.color
              });
            });
        }

        // Platform distribution for user
        if (/SELECT p.platform, COUNT\(s.id\) as count, p.color[\s\S]*WHERE s.user_id = \? AND s.status != 'expired' GROUP BY p.platform/i.test(raw)) {
          const userId = params[0];
          const map = {};
          data.subscriptions.filter(s => s.user_id === userId && s.status !== 'expired').forEach(s => {
            const p = data.plans.find(pl => pl.id === s.plan_id) || {};
            map[p.platform] = map[p.platform] || { platform: p.platform, count: 0, color: p.color };
            map[p.platform].count++;
          });
          return Object.values(map).map(i => ({ platform: i.platform, count: i.count, color: i.color }));
        }

        // Generic platform distribution (admin)
        if (/FROM subscriptions s[\s\S]*JOIN plans p ON s.plan_id = p.id[\s\S]*WHERE s.status != 'expired' GROUP BY p.platform/i.test(raw)) {
          const map = {};
          data.subscriptions.filter(s => s.status !== 'expired').forEach(s => {
            const p = data.plans.find(pl => pl.id === s.plan_id) || {};
            map[p.platform] = map[p.platform] || { platform: p.platform, count: 0, color: p.color };
            map[p.platform].count++;
          });
          return Object.values(map).map(i => ({ platform: i.platform, count: i.count, color: i.color }));
        }

        // Admin users list (simple projection)
        if (/FROM users u[\s\S]*WHERE u.role != 'admin'/i.test(raw)) {
          return data.users.filter(u => u.role !== 'admin').map(u => {
            const subscriptions = data.subscriptions.filter(s => s.user_id === u.id && s.status !== 'expired').length;
            const spending = data.transactions.filter(t => t.user_id === u.id && t.status === 'success').reduce((s, t) => s + (t.amount || 0), 0);
            return {
              id: u.id,
              name: `${u.first_name} ${u.last_name}`,
              email: u.email,
              joined: u.joined_date,
              subscriptions,
              spending,
              status: subscriptions > 0 ? 'active' : 'inactive'
            };
          });
        }

        // Transactions join users (admin view)
        if (/FROM transactions t[\s\S]*JOIN users u ON t.user_id = u.id/i.test(raw)) {
          return data.transactions.map(t => {
            const u = data.users.find(x => x.id === t.user_id) || { first_name: '', last_name: '' };
            return Object.assign({}, t, { user_name: `${u.first_name} ${u.last_name}` });
          }).sort((a, b) => (a.date < b.date ? 1 : -1));
        }

        // Notifications for user
        if (/SELECT \* FROM notifications WHERE user_id = \? ORDER BY id DESC/i.test(raw)) {
          const userId = params[0];
          return data.notifications.filter(n => n.user_id === userId).sort((a, b) => b.id - a.id);
        }

        return [];
      },

      run(...params) {
        // INSERT INTO plans
        if (/INSERT INTO plans/i.test(raw)) {
          const [platform, name, price, screens, quality, downloads, popular, color, bg_color] = params;
          const id = nextId('plans');
          const rec = { id, platform, name, price, screens, quality, downloads, popular, color, bg_color };
          data.plans.push(rec);
          save();
          return { lastInsertRowid: id };
        }

        // INSERT INTO users
        if (/INSERT INTO users/i.test(raw)) {
          const [email, password, first_name, last_name, phone, role, joined_date] = params;
          const id = nextId('users');
          const rec = { id, email, password, first_name, last_name, phone, role, joined_date };
          data.users.push(rec);
          save();
          return { lastInsertRowid: id };
        }

        // INSERT INTO subscriptions
        if (/INSERT INTO subscriptions/i.test(raw)) {
          const [user_id, plan_id, status, start_date, renewal_date] = params;
          const id = nextId('subscriptions');
          const rec = { id, user_id, plan_id, status, start_date, renewal_date };
          data.subscriptions.push(rec);
          save();
          return { lastInsertRowid: id };
        }

        // INSERT INTO transactions
        if (/INSERT INTO transactions/i.test(raw)) {
          const [idParam, user_id, platform, plan, amount, status, method, date] = params;
          const rec = { id: idParam, user_id, platform, plan, amount, status, method, date };
          data.transactions.push(rec);
          save();
          return {};
        }

        // INSERT INTO notifications
        if (/INSERT INTO notifications/i.test(raw)) {
          const [user_id, type, title, message, time, read] = params;
          const id = nextId('notifications');
          const rec = { id, user_id, type, title, message, time, read };
          data.notifications.push(rec);
          save();
          return { lastInsertRowid: id };
        }

        // UPDATE subscriptions SET ... WHERE id = ?
        if (/UPDATE subscriptions[\s\S]*WHERE id = \?/i.test(raw)) {
          const [start_date, renewal_date, id] = params;
          const s = data.subscriptions.find(x => x.id == id);
          if (s) {
            // Handle both forms (some updates set status too)
            if (/SET status = 'active', start_date = \?, renewal_date = \?/i.test(raw)) {
              s.status = 'active';
              s.start_date = start_date;
              s.renewal_date = renewal_date;
            } else {
              // fallback
              s.start_date = start_date;
              s.renewal_date = renewal_date;
            }
            save();
          }
          return {};
        }

        // UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?
        if (/UPDATE notifications SET read = 1 WHERE id = \? AND user_id = \?/i.test(raw)) {
          const [id, user_id] = params;
          const n = data.notifications.find(x => x.id == id && x.user_id == user_id);
          if (n) {
            n.read = 1;
            save();
          }
          return {};
        }

        // UPDATE notifications SET read = 1 WHERE user_id = ?
        if (/UPDATE notifications SET read = 1 WHERE user_id = \?/i.test(raw)) {
          const [user_id] = params;
          data.notifications.filter(x => x.user_id == user_id).forEach(n => n.read = 1);
          save();
          return {};
        }

        // DELETE FROM notifications WHERE id = ? AND user_id = ?
        if (/DELETE FROM notifications WHERE id = \? AND user_id = \?/i.test(raw)) {
          const [id, user_id] = params;
          data.notifications = data.notifications.filter(x => !(x.id == id && x.user_id == user_id));
          save();
          return {};
        }

        return {};
      }
    };
  }
};

// Initialize/load DB
load();

// Seed data if empty using some of the original seeding logic
export function initDb() {
  if (data.plans.length === 0) {
    console.log("Seeding initial database data (JSON)...");
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync("password123", salt);
    const adminHashedPassword = bcrypt.hashSync("admin123", salt);

    const ottPlans = [
      {
        platform: "Netflix", color: "#E50914", bg_color: "rgba(229,9,20,0.08)",
        plans: [
          { name: "Mobile", price: 149, screens: 1, quality: "HD", downloads: 0 },
          { name: "Basic", price: 199, screens: 1, quality: "Full HD", downloads: 0 },
          { name: "Standard", price: 499, screens: 2, quality: "Full HD", downloads: 1 },
          { name: "Premium 4K", price: 649, screens: 4, quality: "4K Ultra HD", downloads: 1, popular: 1 },
        ],
      },
      {
        platform: "Prime Video", color: "#00A8E0", bg_color: "rgba(0,168,224,0.08)",
        plans: [
          { name: "Monthly", price: 179, screens: 3, quality: "Full HD", downloads: 1 },
          { name: "Annual", price: 299, screens: 3, quality: "4K", downloads: 1, popular: 1 },
        ],
      },
      {
        platform: "Disney+ Hotstar", color: "#113CCF", bg_color: "rgba(17,60,207,0.08)",
        plans: [
          { name: "Mobile", price: 149, screens: 1, quality: "HD", downloads: 1 },
          { name: "Super", price: 299, screens: 2, quality: "Full HD", downloads: 1, popular: 1 },
          { name: "Ultra", price: 499, screens: 4, quality: "4K", downloads: 1 },
        ],
      },
      {
        platform: "SonyLIV", color: "#F5A623", bg_color: "rgba(245,166,35,0.08)",
        plans: [
          { name: "Lite", price: 99, screens: 1, quality: "HD", downloads: 0 },
          { name: "Premium", price: 299, screens: 2, quality: "Full HD", downloads: 1, popular: 1 },
          { name: "Premium+", price: 499, screens: 4, quality: "4K", downloads: 1 },
        ],
      },
      {
        platform: "Zee5", color: "#6B0DAD", bg_color: "rgba(107,13,173,0.08)",
        plans: [
          { name: "Monthly", price: 99, screens: 2, quality: "HD", downloads: 1 },
          { name: "Annual", price: 499, screens: 4, quality: "Full HD", downloads: 1, popular: 1 },
          { name: "Family", price: 699, screens: 6, quality: "4K", downloads: 1 },
        ],
      },
    ];

    for (const p of ottPlans) {
      for (const pl of p.plans) {
        const id = nextId('plans');
        data.plans.push({
          id,
          platform: p.platform,
          name: pl.name,
          price: pl.price,
          screens: pl.screens,
          quality: pl.quality,
          downloads: pl.downloads || 0,
          popular: pl.popular || 0,
          color: p.color,
          bg_color: p.bg_color
        });
      }
    }

    // Users
    const usersToAdd = [
      ["rahul@example.com", hashedPassword, "Rahul", "Sharma", "9876543210", "user", "Jan 15, 2025"],
      ["admin@streamvault.com", adminHashedPassword, "Admin", "User", "9999999999", "admin", "Jan 1, 2025"],
      ["priya@example.com", hashedPassword, "Priya", "Patel", "9876543211", "user", "Feb 3, 2025"],
      ["arjun@example.com", hashedPassword, "Arjun", "Kumar", "9876543212", "user", "Mar 20, 2025"],
      ["neha@example.com", hashedPassword, "Neha", "Singh", "9876543213", "user", "Apr 7, 2025"],
      ["vikram@example.com", hashedPassword, "Vikram", "Nair", "9876543214", "user", "May 12, 2025"]
    ];

    for (const u of usersToAdd) {
      const id = nextId('users');
      data.users.push({ id, email: u[0], password: u[1], first_name: u[2], last_name: u[3], phone: u[4], role: u[5], joined_date: u[6] });
    }

    // Create some subscriptions and transactions (simplified)
    const rahul = data.users.find(u => u.email === 'rahul@example.com');
    const priya = data.users.find(u => u.email === 'priya@example.com');
    const arjun = data.users.find(u => u.email === 'arjun@example.com');
    const neha = data.users.find(u => u.email === 'neha@example.com');
    const vikram = data.users.find(u => u.email === 'vikram@example.com');

    const findPlan = (platform, name) => data.plans.find(p => p.platform === platform && p.name === name)?.id;

    if (rahul) {
      data.subscriptions.push({ id: nextId('subscriptions'), user_id: rahul.id, plan_id: findPlan('Netflix','Premium 4K'), status: 'active', start_date: 'Jul 15, 2025', renewal_date: 'Aug 15, 2025' });
      data.subscriptions.push({ id: nextId('subscriptions'), user_id: rahul.id, plan_id: findPlan('Prime Video','Annual'), status: 'active', start_date: 'Dec 3, 2024', renewal_date: 'Dec 3, 2025' });
    }

    // Transactions
    if (rahul) {
      data.transactions.push({ id: 'TXN001', user_id: rahul.id, platform: 'Netflix', plan: 'Premium 4K', amount: 649, status: 'success', method: 'UPI', date: 'Jul 1, 2025' });
    }

    // Notifications
    if (rahul) {
      data.notifications.push({ id: nextId('notifications'), user_id: rahul.id, type: 'warning', title: 'Subscription Expiring Soon', message: 'Your Disney+ Hotstar Super plan expires in 7 days on Jul 28, 2025. Renew now to avoid interruption.', time: '2 hours ago', read: 0 });
    }

    save();
    console.log('Database seeded successfully (JSON)!');
  }
}

export default db;
initDb();


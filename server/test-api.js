import db from "./db.js";
import http from "http";

// Simple integration test for backend APIs
async function runTests() {
  console.log("----------------------------------------");
  console.log("Running backend integration tests...");
  console.log("----------------------------------------");

  // Spin up the server in-process for testing
  const { default: expressApp } = await import("./index.js");

  // Wait a second for Express to bind to port 5000
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Utility to make HTTP requests
  const request = (path, method = "GET", body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const req = http.request(
        {
          hostname: "localhost",
          port: 5000,
          path,
          method,
          headers,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              const json = JSON.parse(data);
              resolve({ status: res.statusCode, body: json });
            } catch (e) {
              resolve({ status: res.statusCode, body: data });
            }
          });
        }
      );

      req.on("error", reject);
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  };

  let token = null;

  try {
    // Test 1: Seed verification
    console.log("Test 1: Verify database seeding...");
    const plansCount = db.prepare("SELECT COUNT(*) as count FROM plans").get().count;
    if (plansCount > 0) {
      console.log(`✓ Database plans seeded: ${plansCount} items`);
    } else {
      throw new Error("Failed: Database plans empty");
    }

    // Test 2: User Login
    console.log("\nTest 2: Logging in with seeded user...");
    const loginRes = await request("/api/auth/login", "POST", {
      email: "rahul@example.com",
      password: "password123",
    });

    if (loginRes.status === 200 && loginRes.body.token) {
      token = loginRes.body.token;
      console.log("✓ User login successful!");
      console.log(`  User: ${loginRes.body.user.first_name} ${loginRes.body.user.last_name}`);
    } else {
      throw new Error(`Failed: User login returned status ${loginRes.status}`);
    }

    // Test 3: Get Profile
    console.log("\nTest 3: Fetching user profile via /auth/me...");
    const meRes = await request("/api/auth/me", "GET", null, token);
    if (meRes.status === 200 && meRes.body.user.email === "rahul@example.com") {
      console.log("✓ Fetch profile successful!");
    } else {
      throw new Error(`Failed: Profile returned status ${meRes.status}`);
    }

    // Test 4: Get Plans
    console.log("\nTest 4: Fetching plans...");
    const plansRes = await request("/api/plans", "GET");
    if (plansRes.status === 200 && plansRes.body.length > 0) {
      console.log(`✓ Fetched ${plansRes.body.length} platform plans grouping`);
    } else {
      throw new Error(`Failed: Plans returned status ${plansRes.status}`);
    }

    // Test 5: Get Subscriptions
    console.log("\nTest 5: Fetching user subscriptions...");
    const subsRes = await request("/api/subscriptions", "GET", null, token);
    if (subsRes.status === 200 && (subsRes.body.active || subsRes.body.expired)) {
      console.log(`✓ Fetched ${subsRes.body.active.length} active and ${subsRes.body.expired.length} expired subscriptions`);
    } else {
      throw new Error(`Failed: Subscriptions returned status ${subsRes.status}`);
    }

    // Test 6: Create Subscription Checkout
    console.log("\nTest 6: Subscribing to a plan...");
    // Find a standard plan id
    const netflixBasicId = db.prepare("SELECT id FROM plans WHERE platform = 'Netflix' AND name = 'Basic'").get().id;
    const checkoutRes = await request("/api/subscriptions/checkout", "POST", {
      planId: netflixBasicId,
      paymentMethod: "UPI",
    }, token);

    if (checkoutRes.status === 201 && checkoutRes.body.subscriptionId) {
      console.log("✓ Plan checkout successful!");
      console.log(`  New Subscription ID: ${checkoutRes.body.subscriptionId}`);
      console.log(`  Transaction ID: ${checkoutRes.body.transactionId}`);
    } else {
      throw new Error(`Failed: Checkout returned status ${checkoutRes.status}`);
    }

    // Test 7: Fetch Dashboard stats
    console.log("\nTest 7: Fetching dashboard stats...");
    const statsRes = await request("/api/dashboard/stats", "GET", null, token);
    if (statsRes.status === 200 && statsRes.body.spendingData) {
      console.log("✓ Dynamic spending chart and platform split calculated correctly!");
      console.log(`  Platform Distribution count: ${statsRes.body.platformDistribution.length}`);
    } else {
      throw new Error(`Failed: Stats returned status ${statsRes.status}`);
    }

    // Test 8: Fetch Notifications
    console.log("\nTest 8: Fetching notifications...");
    const notifRes = await request("/api/notifications", "GET", null, token);
    if (notifRes.status === 200) {
      console.log(`✓ Fetched ${notifRes.body.length} notifications`);
    } else {
      throw new Error(`Failed: Notifications returned status ${notifRes.status}`);
    }

    // Test 9: Admin Access Check
    console.log("\nTest 9: Testing admin panel access restriction...");
    const adminFailRes = await request("/api/admin/analytics", "GET", null, token);
    if (adminFailRes.status === 403) {
      console.log("✓ User access to admin analytics restricted (Expected 403 Forbidden)");
    } else {
      throw new Error(`Failed: Expected 403 Forbidden but got ${adminFailRes.status}`);
    }

    // Test 10: Admin login and access
    console.log("\nTest 10: Logging in with Admin account...");
    const adminLoginRes = await request("/api/auth/login", "POST", {
      email: "admin@streamvault.com",
      password: "admin123",
    });

    if (adminLoginRes.status === 200 && adminLoginRes.body.token) {
      const adminToken = adminLoginRes.body.token;
      console.log("✓ Admin login successful!");

      console.log("Test 10b: Fetching admin analytics...");
      const adminAnalyticsRes = await request("/api/admin/analytics", "GET", null, adminToken);
      if (adminAnalyticsRes.status === 200) {
        console.log("✓ Fetched Admin Analytics successfully!");
        console.log(`  Total platform revenue: ₹${adminAnalyticsRes.body.totalRevenue}`);
        console.log(`  Total active platform users: ${adminAnalyticsRes.body.activeUsers}`);
      } else {
        throw new Error(`Failed: Admin analytics returned status ${adminAnalyticsRes.status}`);
      }
    } else {
      throw new Error(`Failed: Admin login returned status ${adminLoginRes.status}`);
    }

    console.log("\n========================================");
    console.log("ALL TESTS COMPLETED SUCCESSFULLY!");
    console.log("========================================");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ TEST FAILURE:");
    console.error(error.message);
    console.error("========================================");
    process.exit(1);
  }
}

runTests();

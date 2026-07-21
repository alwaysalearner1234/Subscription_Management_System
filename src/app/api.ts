// Client API helper for StreamVault

const API_BASE = "/api";

function getHeaders() {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "An error occurred");
  }
  return data;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: "user" | "admin";
  joined_date: string;
}

export interface Plan {
  id: number;
  name: string;
  price: number;
  screens: number;
  quality: string;
  downloads: boolean;
  popular: boolean;
}

export interface PlatformPlans {
  platform: string;
  color: string;
  bgColor: string;
  plans: Plan[];
}

export interface Subscription {
  id: number;
  platform: string;
  plan: string;
  price: number;
  screens: number;
  quality: string;
  color: string;
  status: "active" | "expiring" | "expired";
  renewalDate?: string;
  expiredDate?: string;
}

export interface Transaction {
  id: string;
  date: string;
  platform: string;
  plan: string;
  amount: number;
  status: "success" | "failed" | "refunded";
  method: string;
  user_name?: string;
}

export interface Notification {
  id: number;
  type: "warning" | "success" | "info" | "error";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface AdminAnalytics {
  totalRevenue: number;
  activeUsers: number;
  activeSubscriptionsCount: number;
  platformDistribution: { name: string; value: number; color: string }[];
  growthData: { month: string; revenue: number; users: number }[];
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("token", data.token);
    return data;
  },

  async register(body: { email: string; password: string; firstName: string; lastName: string; phone?: string }): Promise<{ token: string; user: User }> {
    const data = await request<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
    localStorage.setItem("token", data.token);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>("/auth/me");
  },

  logout() {
    localStorage.removeItem("token");
  },

  // Plans
  async getPlans(): Promise<PlatformPlans[]> {
    return request<PlatformPlans[]>("/plans");
  },

  // Subscriptions
  async getSubscriptions(): Promise<{ active: Subscription[]; expired: Subscription[] }> {
    return request<{ active: Subscription[]; expired: Subscription[] }>("/subscriptions");
  },

  async checkout(planId: number, paymentMethod: string): Promise<{ transactionId: string; subscriptionId: number }> {
    return request<{ transactionId: string; subscriptionId: number }>("/subscriptions/checkout", {
      method: "POST",
      body: JSON.stringify({ planId, paymentMethod }),
    });
  },

  async renew(subscriptionId: number, paymentMethod: string): Promise<{ transactionId: string }> {
    return request<{ transactionId: string }>(`/subscriptions/${subscriptionId}/renew`, {
      method: "POST",
      body: JSON.stringify({ paymentMethod }),
    });
  },

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return request<Transaction[]>("/transactions");
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<{ spendingData: { month: string; amount: number }[]; platformDistribution: { name: string; value: number; color: string }[] }> {
    return request<{ spendingData: { month: string; amount: number }[]; platformDistribution: { name: string; value: number; color: string }[] }>("/dashboard/stats");
  },

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    return request<Notification[]>("/notifications");
  },

  async markNotificationRead(id: number): Promise<void> {
    return request<void>(`/notifications/${id}/read`, { method: "PUT" });
  },

  async markAllNotificationsRead(): Promise<void> {
    return request<void>("/notifications/mark-all-read", { method: "POST" });
  },

  async dismissNotification(id: number): Promise<void> {
    return request<void>(`/notifications/${id}`, { method: "DELETE" });
  },

  // Admin
  async getAdminAnalytics(): Promise<AdminAnalytics> {
    return request<AdminAnalytics>("/admin/analytics");
  },

  async getAdminUsers(): Promise<{ id: number; name: string; email: string; subscriptions: number; spending: number; status: string; joined: string }[]> {
    return request<{ id: number; name: string; email: string; subscriptions: number; spending: number; status: string; joined: string }[]>("/admin/users");
  },

  async getAdminTransactions(): Promise<Transaction[]> {
    return request<Transaction[]>("/admin/transactions");
  },
};

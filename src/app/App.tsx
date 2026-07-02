import { useState } from "react";
import {
  Home, Tv, CreditCard, Clock, Bell, Shield, Menu, Search,
  TrendingUp, Users, DollarSign, AlertCircle, LogOut, Play,
  Zap, BarChart2, ArrowRight, Eye, EyeOff, Wallet, Plus,
  Download, Check, Star, RefreshCw, X, CheckCircle,
  XCircle, AlertTriangle, Info, QrCode
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

type Page = "landing" | "login" | "register" | "dashboard" | "plans" | "payment" | "history" | "notifications" | "admin";

// ── Mock Data ──────────────────────────────────────────────────────────────────
const spendingData = [
  { month: "Jan", amount: 1299 }, { month: "Feb", amount: 1599 },
  { month: "Mar", amount: 999 }, { month: "Apr", amount: 1899 },
  { month: "May", amount: 1299 }, { month: "Jun", amount: 2199 },
  { month: "Jul", amount: 1599 },
];

const adminRevenueData = [
  { month: "Jan", revenue: 245000, users: 1840 }, { month: "Feb", revenue: 312000, users: 2100 },
  { month: "Mar", revenue: 278000, users: 1980 }, { month: "Apr", revenue: 395000, users: 2450 },
  { month: "May", revenue: 421000, users: 2780 }, { month: "Jun", revenue: 498000, users: 3100 },
  { month: "Jul", revenue: 534000, users: 3420 },
];

const platformDistribution = [
  { name: "Netflix", value: 35, color: "#E50914" },
  { name: "Prime Video", value: 28, color: "#00A8E0" },
  { name: "Disney+", value: 18, color: "#113CCF" },
  { name: "SonyLIV", value: 12, color: "#F5A623" },
  { name: "Zee5", value: 7, color: "#6B0DAD" },
];

const activeSubscriptions = [
  { id: 1, platform: "Netflix", plan: "Premium 4K", price: 649, renewalDate: "Aug 15, 2025", color: "#E50914", status: "active", screens: 4, quality: "4K Ultra HD" },
  { id: 2, platform: "Prime Video", plan: "Annual", price: 299, renewalDate: "Dec 3, 2025", color: "#00A8E0", status: "active", screens: 3, quality: "Full HD" },
  { id: 3, platform: "Disney+ Hotstar", plan: "Super", price: 299, renewalDate: "Jul 28, 2025", color: "#113CCF", status: "expiring", screens: 2, quality: "Full HD" },
];

const expiredSubscriptions = [
  { id: 4, platform: "SonyLIV", plan: "Premium", price: 299, expiredDate: "Jun 1, 2025", color: "#F5A623" },
  { id: 5, platform: "Zee5", plan: "Annual", price: 499, expiredDate: "May 15, 2025", color: "#6B0DAD" },
];

const paymentHistory = [
  { id: "TXN001", date: "Jul 1, 2025", platform: "Netflix", plan: "Premium 4K", amount: 649, status: "success", method: "UPI" },
  { id: "TXN002", date: "Jun 15, 2025", platform: "Prime Video", plan: "Annual", amount: 299, status: "success", method: "Card" },
  { id: "TXN003", date: "Jun 3, 2025", platform: "Disney+ Hotstar", plan: "Super", amount: 299, status: "success", method: "Wallet" },
  { id: "TXN004", date: "May 20, 2025", platform: "SonyLIV", plan: "Premium", amount: 299, status: "failed", method: "UPI" },
  { id: "TXN005", date: "May 15, 2025", platform: "Zee5", plan: "Annual", amount: 499, status: "success", method: "Card" },
  { id: "TXN006", date: "Apr 28, 2025", platform: "Netflix", plan: "Premium 4K", amount: 649, status: "success", method: "UPI" },
  { id: "TXN007", date: "Apr 3, 2025", platform: "Prime Video", plan: "Monthly", amount: 179, status: "refunded", method: "Card" },
];

const notificationsData = [
  { id: 1, type: "warning", title: "Subscription Expiring Soon", message: "Your Disney+ Hotstar Super plan expires in 7 days on Jul 28, 2025. Renew now to avoid interruption.", time: "2 hours ago", read: false },
  { id: 2, type: "success", title: "Payment Successful", message: "₹649 charged for Netflix Premium 4K renewal. Valid till Aug 15, 2025.", time: "3 days ago", read: false },
  { id: 3, type: "info", title: "New Plan Available", message: "Netflix Ultra plan with 6 simultaneous streams is now available at ₹849/month.", time: "5 days ago", read: true },
  { id: 4, type: "error", title: "Payment Failed", message: "Payment of ₹299 for SonyLIV Premium failed. Please update your payment method.", time: "Jun 20, 2025", read: true },
  { id: 5, type: "info", title: "Price Update", message: "Prime Video Annual plan price will increase to ₹349/month from Aug 1, 2025.", time: "Jun 15, 2025", read: true },
  { id: 6, type: "success", title: "Referral Bonus", message: "You earned ₹100 credit for referring Priya Sharma to StreamVault.", time: "Jun 10, 2025", read: true },
];

const ottPlans = [
  {
    platform: "Netflix", color: "#E50914", bgColor: "rgba(229,9,20,0.08)",
    plans: [
      { name: "Mobile", price: 149, screens: 1, quality: "HD", downloads: false },
      { name: "Basic", price: 199, screens: 1, quality: "Full HD", downloads: false },
      { name: "Standard", price: 499, screens: 2, quality: "Full HD", downloads: true },
      { name: "Premium 4K", price: 649, screens: 4, quality: "4K Ultra HD", downloads: true, popular: true },
    ],
  },
  {
    platform: "Prime Video", color: "#00A8E0", bgColor: "rgba(0,168,224,0.08)",
    plans: [
      { name: "Monthly", price: 179, screens: 3, quality: "Full HD", downloads: true },
      { name: "Annual", price: 299, screens: 3, quality: "4K", downloads: true, popular: true },
    ],
  },
  {
    platform: "Disney+ Hotstar", color: "#113CCF", bgColor: "rgba(17,60,207,0.08)",
    plans: [
      { name: "Mobile", price: 149, screens: 1, quality: "HD", downloads: true },
      { name: "Super", price: 299, screens: 2, quality: "Full HD", downloads: true, popular: true },
      { name: "Ultra", price: 499, screens: 4, quality: "4K", downloads: true },
    ],
  },
  {
    platform: "SonyLIV", color: "#F5A623", bgColor: "rgba(245,166,35,0.08)",
    plans: [
      { name: "Lite", price: 99, screens: 1, quality: "HD", downloads: false },
      { name: "Premium", price: 299, screens: 2, quality: "Full HD", downloads: true, popular: true },
      { name: "Premium+", price: 499, screens: 4, quality: "4K", downloads: true },
    ],
  },
  {
    platform: "Zee5", color: "#6B0DAD", bgColor: "rgba(107,13,173,0.08)",
    plans: [
      { name: "Monthly", price: 99, screens: 2, quality: "HD", downloads: true },
      { name: "Annual", price: 499, screens: 4, quality: "Full HD", downloads: true, popular: true },
      { name: "Family", price: 699, screens: 6, quality: "4K", downloads: true },
    ],
  },
];

const adminUsers = [
  { id: 1, name: "Rahul Sharma", email: "rahul@example.com", subscriptions: 3, spending: 1247, status: "active", joined: "Jan 15, 2025" },
  { id: 2, name: "Priya Patel", email: "priya@example.com", subscriptions: 2, spending: 948, status: "active", joined: "Feb 3, 2025" },
  { id: 3, name: "Arjun Kumar", email: "arjun@example.com", subscriptions: 4, spending: 1896, status: "active", joined: "Mar 20, 2025" },
  { id: 4, name: "Neha Singh", email: "neha@example.com", subscriptions: 1, spending: 649, status: "inactive", joined: "Apr 7, 2025" },
  { id: 5, name: "Vikram Nair", email: "vikram@example.com", subscriptions: 3, spending: 1147, status: "active", joined: "May 12, 2025" },
];

// ── Shared Components ──────────────────────────────────────────────────────────
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.07] bg-white/[0.04] backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    expiring: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    expired: "bg-red-500/10 text-red-400 border-red-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    refunded: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    inactive: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] ?? map.active}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-[#E50914] flex items-center justify-center shadow-lg shadow-red-900/40">
        <Play className="w-3.5 h-3.5 text-white fill-white" />
      </div>
      <span className="text-base font-bold tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
        STREAM<span className="text-[#E50914]">VAULT</span>
      </span>
    </div>
  );
}

// ── Landing Page ───────────────────────────────────────────────────────────────
function LandingPage({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 md:px-14 py-4 bg-gradient-to-b from-black/70 to-transparent backdrop-blur-md border-b border-white/[0.04]">
        <Logo />
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("login")} className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">Sign In</button>
          <button onClick={() => navigate("register")} className="px-5 py-2 text-sm bg-[#E50914] hover:bg-[#c7060f] text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-red-900/30">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(229,9,20,0.18) 0%, transparent 65%)" }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 60px, white 60px, white 61px), repeating-linear-gradient(90deg, transparent, transparent 60px, white 60px, white 61px)" }} />
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E50914]/10 border border-[#E50914]/25 text-[#E50914] text-xs font-medium mb-8">
            <Zap className="w-3 h-3" /> All your OTT subscriptions — one dashboard
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.08]" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            Never Overpay for<br />
            <span style={{ backgroundImage: "linear-gradient(135deg, #E50914 30%, #ff6b6b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Entertainment
            </span>{" Again"}
          </h1>
          <p className="text-lg text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed">
            Track Netflix, Prime Video, Disney+, SonyLIV, Zee5 and more — all from a single intelligent dashboard. Get reminders, analytics, and smart cost insights.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate("register")} className="flex items-center gap-2 px-8 py-3.5 bg-[#E50914] hover:bg-[#c7060f] text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-xl shadow-red-900/30">
              Start Free — No Card Required <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate("dashboard")} className="flex items-center gap-2 px-8 py-3.5 bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all">
              <Play className="w-4 h-4 text-[#E50914] fill-[#E50914]" /> Live Demo
            </button>
          </div>
          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16">
            {[
              { val: "50K+", label: "Active Users" },
              { val: "₹2.4Cr", label: "Saved by Users" },
              { val: "5", label: "OTT Platforms" },
              { val: "99.9%", label: "Uptime" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-[#E50914]" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{s.val}</div>
                <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OTT Partners */}
      <section className="py-14 px-6 border-y border-white/[0.05]">
        <p className="text-center text-white/30 text-xs mb-8 uppercase tracking-[0.2em]">Supported Platforms</p>
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
          {[
            { name: "NETFLIX", color: "#E50914" },
            { name: "prime video", color: "#00A8E0" },
            { name: "Disney+", color: "#4a7dff" },
            { name: "SONY LIV", color: "#F5A623" },
            { name: "ZEE5", color: "#9B4DCA" },
            { name: "HOTSTAR", color: "#2F6FE1" },
          ].map((p) => (
            <div key={p.name} className="text-lg font-bold opacity-30 hover:opacity-70 transition-opacity cursor-default select-none"
              style={{ color: p.color, fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.06em" }}>
              {p.name}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Built for Binge-Watchers</h2>
          <p className="text-white/45">Everything you need to manage your entertainment budget</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: <BarChart2 className="w-5 h-5" />, title: "Spending Analytics", desc: "Visual breakdown of monthly spend across all OTT platforms with trend charts and insights." },
            { icon: <Bell className="w-5 h-5" />, title: "Smart Reminders", desc: "Get notified 7 days before renewal so you can cancel, switch, or upgrade without missing a beat." },
            { icon: <Shield className="w-5 h-5" />, title: "Secure Payments", desc: "Pay via UPI, credit/debit cards, or digital wallets. Every transaction is SSL-encrypted." },
            { icon: <RefreshCw className="w-5 h-5" />, title: "Auto Renewal", desc: "Set up seamless auto-renewal so your favorite shows never get cut off mid-season." },
            { icon: <Users className="w-5 h-5" />, title: "Family Dashboard", desc: "Manage subscriptions for every family member from one organized hub." },
            { icon: <TrendingUp className="w-5 h-5" />, title: "Cost Optimizer", desc: "AI suggestions that identify overlapping content and help you consolidate platforms." },
          ].map((f, i) => (
            <GlassCard key={i} className="p-6 group hover:border-white/[0.13] transition-all duration-300 hover:-translate-y-1">
              <div className="w-11 h-11 rounded-xl bg-[#E50914]/10 border border-[#E50914]/20 flex items-center justify-center text-[#E50914] mb-4 group-hover:bg-[#E50914]/15 transition-colors">
                {f.icon}
              </div>
              <h3 className="font-semibold mb-2 text-[15px]">{f.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>StreamVault Plans</h2>
          <p className="text-white/45">Manage the platform — OTT costs billed directly to you</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Starter", price: "Free", period: "", features: ["Up to 3 subscriptions", "Basic analytics", "Email reminders", "Community support"], cta: "Get Started", popular: false },
            { name: "Pro", price: "₹199", period: "/month", features: ["Unlimited subscriptions", "Advanced analytics", "Smart reminders", "Priority support", "Family sharing", "Cost optimizer AI"], cta: "Start Free Trial", popular: true },
            { name: "Business", price: "₹499", period: "/month", features: ["Multi-user accounts", "Team dashboard", "API access", "Custom reports", "Dedicated manager", "White-label option"], cta: "Contact Sales", popular: false },
          ].map((plan) => (
            <GlassCard key={plan.name} className={`p-6 relative ${plan.popular ? "border-[#E50914]/35 shadow-xl shadow-red-900/10" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-[#E50914] text-white text-xs rounded-full font-semibold shadow-lg">
                  Most Popular
                </div>
              )}
              <h3 className="font-semibold mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-white/35 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/65">
                    <Check className="w-3.5 h-3.5 text-[#E50914] shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("register")}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${plan.popular ? "bg-[#E50914] hover:bg-[#c7060f] text-white shadow-lg shadow-red-900/25" : "bg-white/[0.05] hover:bg-white/[0.09] text-white border border-white/10"}`}>
                {plan.cta}
              </button>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Real People, Real Savings</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { name: "Rahul Sharma", role: "Software Engineer, Bangalore", text: "StreamVault showed me I was paying for 3 services with overlapping content. Cut my spend by ₹800/month immediately.", rating: 5, av: "RS" },
            { name: "Priya Menon", role: "Freelancer, Mumbai", text: "The 7-day renewal reminder is a lifesaver. Used to lose money forgetting to cancel trials. Not anymore.", rating: 5, av: "PM" },
            { name: "Arjun Kapoor", role: "College Student, Delhi", text: "Managing 4 family members' subscriptions was chaos. One dashboard fixed everything. Highly recommend.", rating: 4, av: "AK" },
          ].map((t) => (
            <GlassCard key={t.name} className="p-6">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] text-xs font-bold">{t.av}</div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-white/35">{t.role}</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-2xl border border-[#E50914]/20 bg-[#E50914]/06 p-12" style={{ background: "linear-gradient(135deg, rgba(229,9,20,0.08) 0%, rgba(229,9,20,0.03) 100%)" }}>
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Take Control Today</h2>
            <p className="text-white/50 mb-8">Join 50,000+ users who never waste money on forgotten subscriptions.</p>
            <button onClick={() => navigate("register")} className="px-10 py-3.5 bg-[#E50914] hover:bg-[#c7060f] text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-xl shadow-red-900/30">
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-14 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-10">
          <div>
            <Logo />
            <p className="text-white/35 text-sm max-w-xs mt-3 leading-relaxed">Your intelligent OTT subscription management platform. Save time, save money.</p>
          </div>
          <div className="grid grid-cols-3 gap-10 text-sm">
            {[
              { title: "Product", links: ["Features", "Pricing", "Changelog", "API"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
            ].map((col) => (
              <div key={col.title}>
                <div className="font-semibold mb-4">{col.title}</div>
                <ul className="space-y-2.5">
                  {col.links.map((l) => <li key={l} className="text-white/35 hover:text-white/70 cursor-pointer transition-colors">{l}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/25">
          <span>© 2025 StreamVault. All rights reserved.</span>
          <span>Designed for entertainment lovers across India</span>
        </div>
      </footer>
    </div>
  );
}

// ── Login Page ─────────────────────────────────────────────────────────────────
function LoginPage({ navigate }: { navigate: (p: Page) => void }) {
  const [showPass, setShowPass] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]" style={{ background: "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(229,9,20,0.09) 0%, #0a0a0a 65%)", fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><Logo /></div>
          <h1 className="text-2xl font-bold text-white mt-2">Welcome back</h1>
          <p className="text-white/45 text-sm mt-1">Sign in to your StreamVault account</p>
        </div>
        <GlassCard className="p-8">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/55 mb-1.5 block">Email address</label>
              <input type="email" defaultValue="rahul@example.com" className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors" />
            </div>
            <div>
              <label className="text-sm text-white/55 mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} defaultValue="password123" className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors pr-10" />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-white/50 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#E50914] w-3.5 h-3.5" />
                Remember me
              </label>
              <button className="text-[#E50914] hover:text-red-400 transition-colors text-sm">Forgot password?</button>
            </div>
            <button onClick={() => navigate("dashboard")} className="w-full py-3 bg-[#E50914] hover:bg-[#c7060f] text-white rounded-xl font-semibold transition-all hover:shadow-xl hover:shadow-red-900/25 mt-1">
              Sign In
            </button>
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.07]" /></div>
              <div className="relative text-center"><span className="px-3 text-white/30 text-xs bg-transparent" style={{ background: "transparent" }}>OR CONTINUE WITH</span></div>
            </div>
            <button className="w-full py-2.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.09] text-white rounded-xl text-sm flex items-center justify-center gap-3 transition-colors font-medium">
              <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#4285F4] text-xs font-bold">G</span>
              Continue with Google
            </button>
          </div>
          <p className="text-center text-sm text-white/35 mt-6">
            {"Don't have an account? "}
            <button onClick={() => navigate("register")} className="text-[#E50914] hover:text-red-400 transition-colors font-medium">Create one</button>
          </p>
        </GlassCard>
        <button onClick={() => navigate("landing")} className="block w-full text-center text-xs text-white/25 hover:text-white/45 mt-5 transition-colors">← Back to home</button>
      </div>
    </div>
  );
}

// ── Register Page ──────────────────────────────────────────────────────────────
function RegisterPage({ navigate }: { navigate: (p: Page) => void }) {
  const [showPass, setShowPass] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]" style={{ background: "radial-gradient(ellipse 80% 60% at 80% 70%, rgba(229,9,20,0.09) 0%, #0a0a0a 65%)", fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><Logo /></div>
          <h1 className="text-2xl font-bold text-white mt-2">Create your account</h1>
          <p className="text-white/45 text-sm mt-1">Start managing subscriptions — free forever</p>
        </div>
        <GlassCard className="p-8">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-white/55 mb-1.5 block">First name</label>
                <input type="text" placeholder="Rahul" className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors" />
              </div>
              <div>
                <label className="text-sm text-white/55 mb-1.5 block">Last name</label>
                <input type="text" placeholder="Sharma" className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-sm text-white/55 mb-1.5 block">Email address</label>
              <input type="email" placeholder="rahul@example.com" className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors" />
            </div>
            <div>
              <label className="text-sm text-white/55 mb-1.5 block">Phone number</label>
              <div className="flex gap-2">
                <div className="px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white/50 text-sm shrink-0">+91</div>
                <input type="tel" placeholder="98765 43210" className="flex-1 px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-sm text-white/55 mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder="Min. 8 characters" className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors pr-10" />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <label className="flex items-start gap-2.5 text-sm text-white/45 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 accent-[#E50914] shrink-0 w-3.5 h-3.5" />
              <span>I agree to the <span className="text-[#E50914] cursor-pointer">Terms of Service</span> and <span className="text-[#E50914] cursor-pointer">Privacy Policy</span></span>
            </label>
            <button onClick={() => navigate("dashboard")} className="w-full py-3 bg-[#E50914] hover:bg-[#c7060f] text-white rounded-xl font-semibold transition-all hover:shadow-xl hover:shadow-red-900/25">
              Create Account
            </button>
          </div>
          <p className="text-center text-sm text-white/35 mt-6">
            Already have an account?{" "}
            <button onClick={() => navigate("login")} className="text-[#E50914] hover:text-red-400 transition-colors font-medium">Sign in</button>
          </p>
        </GlassCard>
        <button onClick={() => navigate("landing")} className="block w-full text-center text-xs text-white/25 hover:text-white/45 mt-5 transition-colors">← Back to home</button>
      </div>
    </div>
  );
}

// ── Dashboard Page ─────────────────────────────────────────────────────────────
function DashboardPage({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Dashboard</h1>
        <p className="text-white/45 text-sm mt-0.5">Good evening, Rahul. Here is your subscription overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Subscriptions", value: "3", icon: <Tv className="w-5 h-5" />, color: "#E50914", sub: "+1 this month" },
          { label: "Monthly Spend", value: "₹1,247", icon: <DollarSign className="w-5 h-5" />, color: "#00A8E0", sub: "↑ ₹150 vs last month" },
          { label: "Expiring Soon", value: "1", icon: <AlertCircle className="w-5 h-5" />, color: "#F5A623", sub: "Disney+ in 7 days" },
          { label: "Total Saved", value: "₹4,200", icon: <TrendingUp className="w-5 h-5" />, color: "#10b981", sub: "vs paying separately" },
        ].map((s) => (
          <GlassCard key={s.label} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-white/45 leading-tight">{s.label}</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}18`, color: s.color }}>
                {s.icon}
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{s.value}</div>
            <div className="text-xs text-white/35">{s.sub}</div>
          </GlassCard>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-5 gap-4">
        <GlassCard className="lg:col-span-3 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">Monthly Spending</h2>
            <span className="text-xs text-white/35 bg-white/[0.05] px-2.5 py-1 rounded-lg">Last 7 months</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={spendingData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E50914" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#E50914" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#fff", fontSize: 12 }} formatter={(v: number) => [`₹${v}`, "Spend"]} />
              <Area type="monotone" dataKey="amount" stroke="#E50914" strokeWidth={2} fill="url(#spendGrad)" dot={{ fill: "#E50914", r: 3 }} activeDot={{ r: 5, fill: "#E50914" }} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
        <GlassCard className="lg:col-span-2 p-5">
          <h2 className="font-semibold mb-4">Platform Split</h2>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={platformDistribution} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {platformDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#fff", fontSize: 12 }} formatter={(v: number) => [`${v}%`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-1">
            {platformDistribution.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-white/55">{p.name}</span>
                </div>
                <span className="font-medium">{p.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Active Subscriptions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Active Subscriptions</h2>
          <button onClick={() => navigate("plans")} className="flex items-center gap-1.5 text-sm text-[#E50914] hover:text-red-400 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add New
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {activeSubscriptions.map((sub) => (
            <GlassCard key={sub.id} className={`p-5 relative overflow-hidden group hover:border-white/[0.12] transition-all ${sub.status === "expiring" ? "border-amber-500/25" : ""}`}>
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 group-hover:opacity-15 transition-opacity" style={{ backgroundColor: sub.color }} />
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-sm tracking-wide" style={{ color: sub.color, fontFamily: "'Rajdhani', sans-serif" }}>{sub.platform.toUpperCase()}</div>
                  <div className="text-white/50 text-xs mt-0.5">{sub.plan}</div>
                </div>
                <StatusBadge status={sub.status} />
              </div>
              <div className="text-2xl font-bold mb-4">₹{sub.price}<span className="text-sm text-white/35 font-normal">/mo</span></div>
              <div className="space-y-1.5 text-xs text-white/40">
                <div className="flex justify-between"><span>Renews on</span><span className="text-white/65">{sub.renewalDate}</span></div>
                <div className="flex justify-between"><span>Screens</span><span className="text-white/65">{sub.screens}</span></div>
                <div className="flex justify-between"><span>Quality</span><span className="text-white/65">{sub.quality}</span></div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Expired */}
      <div>
        <h2 className="font-semibold mb-4">Expired Subscriptions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {expiredSubscriptions.map((sub) => (
            <GlassCard key={sub.id} className="p-4 opacity-55 hover:opacity-75 transition-opacity">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold" style={{ background: `${sub.color}15`, color: sub.color }}>
                    {sub.platform.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{sub.platform}</div>
                    <div className="text-xs text-white/35">{sub.plan} · Expired {sub.expiredDate}</div>
                  </div>
                </div>
                <button onClick={() => navigate("plans")} className="px-3 py-1.5 text-xs bg-[#E50914]/10 border border-[#E50914]/20 text-[#E50914] rounded-lg hover:bg-[#E50914]/20 transition-colors font-medium">
                  Renew
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Plans Page ─────────────────────────────────────────────────────────────────
function PlansPage({ navigate }: { navigate: (p: Page) => void }) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const filtered = selectedPlatform ? ottPlans.filter((p) => p.platform === selectedPlatform) : ottPlans;

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Subscription Plans</h1>
        <p className="text-white/45 text-sm mt-0.5">Choose from Netflix, Prime Video, Disney+, SonyLIV, and Zee5</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setSelectedPlatform(null)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!selectedPlatform ? "bg-[#E50914] text-white shadow-lg shadow-red-900/25" : "bg-white/[0.05] border border-white/[0.09] text-white/55 hover:text-white hover:bg-white/[0.08]"}`}>
          All Platforms
        </button>
        {ottPlans.map((p) => (
          <button key={p.platform} onClick={() => setSelectedPlatform(p.platform === selectedPlatform ? null : p.platform)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedPlatform === p.platform ? "text-white" : "bg-white/[0.05] border border-white/[0.09] text-white/55 hover:text-white hover:bg-white/[0.08]"}`}
            style={selectedPlatform === p.platform ? { backgroundColor: p.color, boxShadow: `0 4px 15px ${p.color}30` } : {}}>
            {p.platform}
          </button>
        ))}
      </div>

      <div className="space-y-10">
        {filtered.map((platform) => (
          <div key={platform.platform}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: platform.color, boxShadow: `0 0 8px ${platform.color}` }} />
              <h2 className="text-lg font-bold tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{platform.platform.toUpperCase()}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {platform.plans.map((plan) => (
                <GlassCard key={plan.name} className="p-5 relative group hover:-translate-y-0.5 transition-all"
                  style={plan.popular ? { borderColor: `${platform.color}40` } : {}}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-4 px-2.5 py-0.5 text-white text-xs rounded-full font-semibold" style={{ backgroundColor: platform.color }}>
                      Best Value
                    </div>
                  )}
                  <div className="font-semibold text-sm mb-0.5">{plan.name}</div>
                  <div className="text-2xl font-bold mb-4">₹{plan.price}<span className="text-sm text-white/35 font-normal">/mo</span></div>
                  <ul className="space-y-2 mb-5">
                    {[
                      { label: `${plan.screens} Screen${plan.screens > 1 ? "s" : ""}`, ok: true },
                      { label: plan.quality, ok: true },
                      { label: "Downloads", ok: plan.downloads },
                    ].map((item) => (
                      <li key={item.label} className="flex items-center gap-2 text-xs text-white/55">
                        {item.ok ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <X className="w-3.5 h-3.5 text-white/20 shrink-0" />}
                        {item.label}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => navigate("payment")}
                    className="w-full py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
                    style={{ backgroundColor: platform.color, boxShadow: plan.popular ? `0 4px 14px ${platform.color}35` : "none" }}>
                    Subscribe
                  </button>
                </GlassCard>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Payment Page ───────────────────────────────────────────────────────────────
function PaymentPage({ navigate }: { navigate: (p: Page) => void }) {
  const [method, setMethod] = useState<"upi" | "card" | "wallet">("upi");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); setDone(true); setTimeout(() => { setDone(false); navigate("history"); }, 1200); }, 2200);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Complete Payment</h1>
        <p className="text-white/45 text-sm mt-0.5">Secure checkout powered by StreamVault</p>
      </div>

      {/* Order Summary */}
      <GlassCard className="p-5">
        <h2 className="font-semibold mb-4 text-sm text-white/60 uppercase tracking-wider">Order Summary</h2>
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E50914]/12 border border-[#E50914]/20 flex items-center justify-center">
              <span className="text-[#E50914] font-bold text-sm">N</span>
            </div>
            <div>
              <div className="font-semibold text-sm">Netflix Premium 4K</div>
              <div className="text-xs text-white/35">Monthly · 4 Screens · 4K Ultra HD</div>
            </div>
          </div>
          <div className="font-bold">₹649</div>
        </div>
        <div className="space-y-2.5 pt-4 text-sm">
          <div className="flex justify-between text-white/50"><span>Subtotal</span><span>₹649.00</span></div>
          <div className="flex justify-between text-white/50"><span>GST (18%)</span><span>₹116.82</span></div>
          <div className="flex justify-between text-emerald-400"><span>StreamVault Discount</span><span>−₹50.00</span></div>
          <div className="flex justify-between font-bold text-base border-t border-white/[0.06] pt-3 mt-1">
            <span>Total Due</span><span>₹715.82</span>
          </div>
        </div>
      </GlassCard>

      {/* Payment Method */}
      <GlassCard className="p-5">
        <h2 className="font-semibold mb-4 text-sm text-white/60 uppercase tracking-wider">Payment Method</h2>
        <div className="flex gap-2 mb-6">
          {[
            { id: "upi", label: "UPI", icon: <QrCode className="w-4 h-4" /> },
            { id: "card", label: "Card", icon: <CreditCard className="w-4 h-4" /> },
            { id: "wallet", label: "Wallet", icon: <Wallet className="w-4 h-4" /> },
          ].map((m) => (
            <button key={m.id} onClick={() => setMethod(m.id as "upi" | "card" | "wallet")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${method === m.id ? "bg-[#E50914]/10 border-[#E50914]/40 text-[#E50914]" : "bg-white/[0.04] border-white/[0.09] text-white/50 hover:text-white"}`}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {method === "upi" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center p-5 bg-white rounded-xl">
              <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                <div className="grid grid-cols-7 gap-0.5 w-36 h-36">
                  {Array.from({ length: 49 }).map((_, i) => (
                    <div key={i} className="rounded-[1px]" style={{ backgroundColor: (i % 7 < 3 && i < 21) || (i % 7 > 3 && i >= 28) || Math.random() > 0.55 ? "#000" : "#fff", aspectRatio: "1" }} />
                  ))}
                </div>
              </div>
              <p className="text-gray-500 text-xs font-medium">Scan with any UPI app · ₹715.82</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-white/[0.07]" />
              <span className="text-xs text-white/30">or enter UPI ID</span>
              <div className="flex-1 border-t border-white/[0.07]" />
            </div>
            <input placeholder="yourname@upi" className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors" />
          </div>
        )}

        {method === "card" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/50 mb-1.5 block">Card Number</label>
              <input placeholder="4111 1111 1111 1111" className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-white/50 mb-1.5 block">Expiry</label>
                <input placeholder="MM / YY" className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors font-mono" />
              </div>
              <div>
                <label className="text-sm text-white/50 mb-1.5 block">CVV</label>
                <input placeholder="•••" className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors font-mono" />
              </div>
            </div>
            <div>
              <label className="text-sm text-white/50 mb-1.5 block">Cardholder Name</label>
              <input placeholder="Rahul Sharma" className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors" />
            </div>
          </div>
        )}

        {method === "wallet" && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "Paytm", color: "#00B9F1", abbr: "P" },
              { name: "PhonePe", color: "#5F259F", abbr: "Ph" },
              { name: "Amazon Pay", color: "#FF9900", abbr: "A" },
              { name: "Google Pay", color: "#4285F4", abbr: "G" },
              { name: "MobiKwik", color: "#22B5E8", abbr: "M" },
              { name: "Freecharge", color: "#E6232B", abbr: "F" },
            ].map((w) => (
              <button key={w.name} className="p-4 bg-white/[0.04] border border-white/[0.09] rounded-xl flex flex-col items-center gap-2 hover:bg-white/[0.08] hover:border-white/[0.16] transition-all">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: w.color }}>
                  {w.abbr}
                </div>
                <span className="text-xs text-white/50">{w.name}</span>
              </button>
            ))}
          </div>
        )}

        <button onClick={handlePay} disabled={processing || done}
          className={`w-full mt-6 py-3.5 rounded-xl font-bold text-white transition-all text-base ${done ? "bg-emerald-600" : processing ? "bg-white/15 cursor-not-allowed" : "bg-[#E50914] hover:bg-[#c7060f] hover:shadow-xl hover:shadow-red-900/30"}`}>
          {done ? "✓ Payment Successful!" : processing ? "Processing…" : "Pay ₹715.82"}
        </button>
        <div className="flex items-center justify-center gap-2 mt-3.5 text-xs text-white/25">
          <Shield className="w-3.5 h-3.5" />
          <span>Protected by 256-bit SSL encryption</span>
        </div>
      </GlassCard>
    </div>
  );
}

// ── History Page ───────────────────────────────────────────────────────────────
function HistoryPage() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? paymentHistory : paymentHistory.filter((h) => h.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Payment History</h1>
          <p className="text-white/45 text-sm mt-0.5">All your subscription transactions in one place</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/[0.08] transition-all">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Paid", value: "₹2,594", color: "#E50914" },
          { label: "Successful", value: "5 of 7", color: "#10b981" },
          { label: "Failed / Refunded", value: "2", color: "#F5A623" },
        ].map((s) => (
          <GlassCard key={s.label} className="p-4 text-center">
            <div className="text-xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-white/40">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "success", "failed", "refunded"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter === f ? "bg-[#E50914] text-white shadow-lg shadow-red-900/20" : "bg-white/[0.05] border border-white/[0.09] text-white/50 hover:text-white hover:bg-white/[0.08]"}`}>
            {f === "all" ? "All Transactions" : f}
          </button>
        ))}
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Transaction ID", "Date", "Platform", "Plan", "Method", "Amount", "Status"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs text-white/35 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx, i) => (
                <tr key={tx.id} className={`border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors ${i === filtered.length - 1 ? "border-none" : ""}`}>
                  <td className="px-5 py-4 text-sm font-mono text-white/45">{tx.id}</td>
                  <td className="px-5 py-4 text-sm text-white/60">{tx.date}</td>
                  <td className="px-5 py-4 text-sm font-semibold">{tx.platform}</td>
                  <td className="px-5 py-4 text-sm text-white/60">{tx.plan}</td>
                  <td className="px-5 py-4 text-sm text-white/50">{tx.method}</td>
                  <td className="px-5 py-4 text-sm font-bold">₹{tx.amount}</td>
                  <td className="px-5 py-4"><StatusBadge status={tx.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

// ── Notifications Page ─────────────────────────────────────────────────────────
function NotificationsPage() {
  const [notifs, setNotifs] = useState(notificationsData);
  const unread = notifs.filter((n) => !n.read).length;

  const markAllRead = () => setNotifs(notifs.map((n) => ({ ...n, read: true })));
  const dismiss = (id: number) => setNotifs(notifs.filter((n) => n.id !== id));

  const icons = {
    warning: <AlertTriangle className="w-4.5 h-4.5 text-amber-400" />,
    success: <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />,
    info: <Info className="w-4.5 h-4.5 text-blue-400" />,
    error: <XCircle className="w-4.5 h-4.5 text-red-400" />,
  };
  const bgs = {
    warning: "bg-amber-500/10 border-amber-500/25",
    success: "bg-emerald-500/10 border-emerald-500/25",
    info: "bg-blue-500/10 border-blue-500/25",
    error: "bg-red-500/10 border-red-500/25",
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Notifications</h1>
          <p className="text-white/45 text-sm mt-0.5">
            {unread > 0 ? `${unread} unread notification${unread > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-sm text-[#E50914] hover:text-red-400 transition-colors font-medium">Mark all read</button>
        )}
      </div>

      {/* Category Counts */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Reminders", count: 1, color: "#F5A623" },
          { label: "Payments", count: 2, color: "#10b981" },
          { label: "Updates", count: 2, color: "#00A8E0" },
          { label: "Alerts", count: 1, color: "#E50914" },
        ].map((c) => (
          <GlassCard key={c.label} className="p-3 text-center">
            <div className="text-lg font-bold mb-0.5" style={{ color: c.color }}>{c.count}</div>
            <div className="text-xs text-white/35">{c.label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="space-y-3">
        {notifs.map((n) => (
          <GlassCard key={n.id} className={`p-4 transition-all group ${!n.read ? "border-white/[0.10]" : "opacity-55 hover:opacity-75"}`}>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${bgs[n.type as keyof typeof bgs]}`}>
                {icons[n.type as keyof typeof icons]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{n.title}</span>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] shrink-0" />}
                </div>
                <p className="text-sm text-white/55 leading-relaxed">{n.message}</p>
                <span className="text-xs text-white/25 mt-1.5 block">{n.time}</span>
              </div>
              <button onClick={() => dismiss(n.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/[0.07] text-white/35 hover:text-white/70 shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </GlassCard>
        ))}
        {notifs.length === 0 && (
          <div className="text-center py-16 text-white/25">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Admin Dashboard ────────────────────────────────────────────────────────────
function AdminPage() {
  const [tab, setTab] = useState<"overview" | "users" | "plans" | "payments">("overview");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#E50914]/10 border border-[#E50914]/20 flex items-center justify-center">
          <Shield className="w-4.5 h-4.5 text-[#E50914]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Admin Dashboard</h1>
          <p className="text-white/45 text-sm">Platform management, analytics, and user control</p>
        </div>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: "3,420", icon: <Users className="w-5 h-5" />, color: "#00A8E0", change: "+342 this month" },
          { label: "Monthly Revenue", value: "₹5.34L", icon: <DollarSign className="w-5 h-5" />, color: "#E50914", change: "+7.2% vs last month" },
          { label: "Active Subscriptions", value: "8,241", icon: <Tv className="w-5 h-5" />, color: "#10b981", change: "Across 5 platforms" },
          { label: "Avg. Spend / User", value: "₹1,562", icon: <TrendingUp className="w-5 h-5" />, color: "#F5A623", change: "+₹89 this month" },
        ].map((s) => (
          <GlassCard key={s.label} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-white/45 leading-tight">{s.label}</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                {s.icon}
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{s.value}</div>
            <div className="text-xs text-white/35">{s.change}</div>
          </GlassCard>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-white/[0.06]">
        {[
          { id: "overview", label: "Overview" },
          { id: "users", label: "User Management" },
          { id: "plans", label: "Plan Management" },
          { id: "payments", label: "Payments" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${tab === t.id ? "border-[#E50914] text-white" : "border-transparent text-white/40 hover:text-white/70"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === "overview" && (
        <div className="space-y-5">
          <div className="grid lg:grid-cols-2 gap-4">
            <GlassCard className="p-5">
              <h2 className="font-semibold mb-5">Revenue & User Growth</h2>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={adminRevenueData} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#fff", fontSize: 12 }} />
                  <Bar dataKey="revenue" fill="#E50914" radius={[3, 3, 0, 0]} name="Revenue (₹)" />
                  <Bar dataKey="users" fill="#00A8E0" radius={[3, 3, 0, 0]} name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
            <GlassCard className="p-5">
              <h2 className="font-semibold mb-5">Platform Distribution</h2>
              <ResponsiveContainer width="100%" height={155}>
                <PieChart>
                  <Pie data={platformDistribution} cx="50%" cy="50%" outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {platformDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#fff", fontSize: 12 }} formatter={(v: number) => [`${v}%`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {platformDistribution.map((p) => (
                  <div key={p.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-white/50">{p.name}</span>
                    <span className="ml-auto font-medium">{p.value}%</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Renewal Rate", value: "94.2%", desc: "Users who renew their subscription" },
              { label: "Churn Rate", value: "5.8%", desc: "Monthly subscription cancellations" },
              { label: "Avg. Platforms/User", value: "2.4", desc: "Subscriptions per active user" },
            ].map((s) => (
              <GlassCard key={s.label} className="p-5">
                <div className="text-2xl font-bold text-[#E50914] mb-1">{s.value}</div>
                <div className="font-semibold text-sm mb-1">{s.label}</div>
                <div className="text-xs text-white/35">{s.desc}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Users */}
      {tab === "users" && (
        <GlassCard className="overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <h2 className="font-semibold">Registered Users</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                <input placeholder="Search users..." className="pl-9 pr-4 py-2 bg-white/[0.05] border border-white/[0.09] rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#E50914]/50 w-48" />
              </div>
              <button className="flex items-center gap-2 px-3.5 py-2 bg-[#E50914] hover:bg-[#c7060f] text-white rounded-xl text-sm transition-colors font-medium">
                <Plus className="w-4 h-4" /> Add User
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["User", "Email", "Subscriptions", "Spend", "Status", "Joined", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs text-white/35 font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((u, i) => (
                  <tr key={u.id} className={`border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors ${i === adminUsers.length - 1 ? "border-none" : ""}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#E50914]/15 border border-[#E50914]/25 flex items-center justify-center text-[#E50914] text-xs font-bold">
                          {u.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="text-sm font-semibold">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-white/50">{u.email}</td>
                    <td className="px-5 py-4 text-sm text-center font-medium">{u.subscriptions}</td>
                    <td className="px-5 py-4 text-sm font-bold">₹{u.spending}</td>
                    <td className="px-5 py-4"><StatusBadge status={u.status} /></td>
                    <td className="px-5 py-4 text-sm text-white/40">{u.joined}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button className="text-xs px-2.5 py-1.5 bg-white/[0.06] hover:bg-white/10 rounded-lg transition-colors">Edit</button>
                        <button className="text-xs px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">Block</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.05] text-xs text-white/35">
            <span>Showing 5 of 3,420 users</span>
            <div className="flex gap-1">
              {[1, 2, 3, "..."].map((p, i) => (
                <button key={i} className={`px-3 py-1.5 rounded-lg transition-colors ${p === 1 ? "bg-[#E50914] text-white" : "hover:bg-white/[0.07] text-white/50"}`}>{p}</button>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Tab: Plans */}
      {tab === "plans" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ottPlans.map((platform) => (
            <GlassCard key={platform.platform} className="p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: platform.color }} />
                <h3 className="font-bold tracking-wide" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{platform.platform.toUpperCase()}</h3>
                <span className="ml-auto text-xs text-white/30 bg-white/[0.05] px-2 py-0.5 rounded-md">{platform.plans.length} plans</span>
              </div>
              <div className="space-y-2">
                {platform.plans.map((plan) => (
                  <div key={plan.name} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-none">
                    <div>
                      <div className="text-sm font-medium">{plan.name}</div>
                      <div className="text-xs text-white/35 mt-0.5">{plan.quality} · {plan.screens} screen{plan.screens > 1 ? "s" : ""}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">₹{plan.price}</div>
                      {plan.popular && <div className="text-xs text-emerald-400">Popular</div>}
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 py-2 rounded-xl text-xs font-semibold border transition-colors bg-white/[0.04] border-white/[0.09] text-white/50 hover:text-white hover:bg-white/[0.08]">
                Manage Plans
              </button>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Tab: Payments */}
      {tab === "payments" && (
        <GlassCard className="overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <h2 className="font-semibold">Recent Transactions</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] border border-white/[0.09] rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/[0.08] transition-all">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Txn ID", "User", "Platform", "Amount", "Method", "Status", "Date"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs text-white/35 font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((tx, i) => (
                  <tr key={tx.id} className={`border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors ${i === paymentHistory.length - 1 ? "border-none" : ""}`}>
                    <td className="px-5 py-4 text-sm font-mono text-white/40">{tx.id}</td>
                    <td className="px-5 py-4 text-sm font-medium">Rahul Sharma</td>
                    <td className="px-5 py-4 text-sm">{tx.platform}</td>
                    <td className="px-5 py-4 text-sm font-bold">₹{tx.amount}</td>
                    <td className="px-5 py-4 text-sm text-white/50">{tx.method}</td>
                    <td className="px-5 py-4"><StatusBadge status={tx.status} /></td>
                    <td className="px-5 py-4 text-sm text-white/40">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// ── App Layout (Sidebar + Top Bar) ─────────────────────────────────────────────
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "plans", label: "Browse Plans", icon: Tv },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "history", label: "History", icon: Clock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "admin", label: "Admin Panel", icon: Shield },
];

function AppLayout({ page, navigate, unreadCount, children }: { page: Page; navigate: (p: Page) => void; unreadCount: number; children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside
        className="shrink-0 flex flex-col bg-[#0f0f0f] border-r border-white/[0.05] overflow-hidden transition-all duration-300"
        style={{ width: sidebarOpen ? 240 : 0 }}>
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/[0.05] shrink-0">
          <Logo />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = page === id;
            return (
              <button key={id} onClick={() => navigate(id as Page)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/20" : "text-white/45 hover:text-white hover:bg-white/[0.04] border border-transparent"}`}>
                <Icon className="w-4.5 h-4.5 shrink-0" />
                <span className="truncate">{label}</span>
                {id === "notifications" && unreadCount > 0 && (
                  <span className="ml-auto bg-[#E50914] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/[0.05] shrink-0">
          <div className="flex items-center gap-3 px-3 py-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-[#E50914]/15 border border-[#E50914]/25 flex items-center justify-center text-[#E50914] text-xs font-bold shrink-0">RS</div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">Rahul Sharma</div>
              <div className="text-xs text-white/35 truncate">Pro Plan</div>
            </div>
          </div>
          <button onClick={() => navigate("landing")} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-white/35 hover:text-white/65 hover:bg-white/[0.04] border border-transparent transition-all">
            <LogOut className="w-4 h-4 shrink-0" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 flex items-center justify-between px-5 border-b border-white/[0.05] bg-[#0a0a0a]/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input placeholder="Search subscriptions…" className="pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.07] rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#E50914]/40 w-56 transition-colors" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => navigate("notifications")} className="relative p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.05] transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#E50914] rounded-full ring-2 ring-[#0a0a0a]" />}
            </button>
            <div className="w-px h-5 bg-white/[0.08] mx-1" />
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-7 h-7 rounded-full bg-[#E50914]/15 border border-[#E50914]/25 flex items-center justify-center text-[#E50914] text-[10px] font-bold">RS</div>
              <div className="hidden md:block">
                <div className="text-sm font-semibold leading-tight">Rahul Sharma</div>
                <div className="text-[10px] text-white/30 leading-tight">Pro Plan</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-7" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// ── Root App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const unreadCount = notificationsData.filter((n) => !n.read).length;
  const navigate = (p: Page) => setPage(p);

  if (page === "landing") return <LandingPage navigate={navigate} />;
  if (page === "login") return <LoginPage navigate={navigate} />;
  if (page === "register") return <RegisterPage navigate={navigate} />;

  return (
    <AppLayout page={page} navigate={navigate} unreadCount={unreadCount}>
      {page === "dashboard" && <DashboardPage navigate={navigate} />}
      {page === "plans" && <PlansPage navigate={navigate} />}
      {page === "payment" && <PaymentPage navigate={navigate} />}
      {page === "history" && <HistoryPage />}
      {page === "notifications" && <NotificationsPage />}
      {page === "admin" && <AdminPage />}
    </AppLayout>
  );
}

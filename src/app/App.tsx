import { useState, useEffect } from "react";
import {
  Home, Tv, CreditCard, Clock, Bell, Shield, Menu, Search,
  TrendingUp, Users, DollarSign, AlertCircle, LogOut, Play,
  Zap, BarChart2, ArrowRight, Eye, EyeOff, Wallet, Plus,
  Download, Check, Star, RefreshCw, X, CheckCircle,
  XCircle, AlertTriangle, Info, QrCode, Copy, Smartphone, ExternalLink
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { toast, Toaster } from "sonner";
import { api, User, Plan, PlatformPlans, Subscription, Transaction, Notification, AdminAnalytics } from "./api";

type Page = "landing" | "login" | "register" | "dashboard" | "plans" | "payment" | "history" | "notifications" | "admin";

// ── Shared Components ──────────────────────────────────────────────────────────
function GlassCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-2xl border border-white/[0.07] bg-white/[0.04] backdrop-blur-sm ${className}`} style={style}>
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
function LandingPage({ navigate, user }: { navigate: (p: Page) => void; user: User | null }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 md:px-14 py-4 bg-gradient-to-b from-black/70 to-transparent backdrop-blur-md border-b border-white/[0.04]">
        <Logo />
        <div className="flex items-center gap-2">
          {user ? (
            <button onClick={() => navigate("dashboard")} className="px-5 py-2 text-sm bg-[#E50914] hover:bg-[#c7060f] text-white rounded-xl font-medium transition-all">
              Go to Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => navigate("login")} className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">Sign In</button>
              <button onClick={() => navigate("register")} className="px-5 py-2 text-sm bg-[#E50914] hover:bg-[#c7060f] text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-red-900/30">
                Get Started
              </button>
            </>
          )}
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
            <button onClick={() => navigate(user ? "dashboard" : "register")} className="flex items-center gap-2 px-8 py-3.5 bg-[#E50914] hover:bg-[#c7060f] text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-xl shadow-red-900/30">
              Start Free — No Card Required <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate(user ? "dashboard" : "login")} className="flex items-center gap-2 px-8 py-3.5 bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all">
              <Play className="w-4 h-4 text-[#E50914] fill-[#E50914]" /> Live Demo
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16">
            {[
              { val: "10K+", label: "Active Users" },
              { val: "₹12L+", label: "Monthly Tracked" },
              { val: "99.9%", label: "Uptime" },
              { val: "4.9/5", label: "User Rating" },
            ].map((st) => (
              <div key={st.label} className="text-center px-4">
                <div className="text-2xl font-bold text-white mb-0.5">{st.val}</div>
                <div className="text-xs text-white/40">{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-white/[0.04] bg-[#0c0c0c] relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Smart Features for Smart Viewers</h2>
            <p className="text-white/45 max-w-lg mx-auto text-sm">Save time and money with features built specifically to manage digital subscriptions.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Tv className="w-5 h-5" />, title: "Unified Viewing", desc: "No more switching apps to check renewal dates. Track all active accounts on a single timeline." },
              { icon: <TrendingUp className="w-5 h-5" />, title: "Spending Insights", desc: "Interactive charts show month-on-month spending trends. Identify unused plans and save money." },
              { icon: <Bell className="w-5 h-5" />, title: "Smart Reminders", desc: "Get notifications 7 days before any card charge. Avoid surprise auto-renewals on forgotten plans." },
              { icon: <CreditCard className="w-5 h-5" />, title: "Consolidated Billing", desc: "Simulate and record checkout payments via local digital payment systems in one click." },
              { icon: <Shield className="w-5 h-5" />, title: "Secure Payments", desc: "Pay via UPI, credit/debit cards, or digital wallets. Every transaction is SSL-encrypted." },
              { icon: <Star className="w-5 h-5" />, title: "Flexible Upgrades", desc: "Browse full plans details for all leading OTT providers in India and update instantly." },
            ].map((f, i) => (
              <GlassCard key={i} className="p-6 hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-[#E50914]/10 border border-[#E50914]/20 flex items-center justify-center text-[#E50914] mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-xs text-white/45 leading-relaxed">{f.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/[0.04] text-center text-xs text-white/30">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          <div>© 2026 StreamVault Inc. All rights reserved. Built for pair-programming.</div>
        </div>
      </footer>
    </div>
  );
}

// ── Login Page ─────────────────────────────────────────────────────────────────
function LoginPage({ navigate, setUser }: { navigate: (p: Page) => void; setUser: (u: User | null) => void }) {
  const [email, setEmail] = useState("rahul@example.com");
  const [password, setPassword] = useState("password123");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.login(email, password);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.first_name}!`);
      if (data.user.role === "admin") {
        navigate("admin");
      } else {
        navigate("dashboard");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to sign in. Check email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]" style={{ background: "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(229,9,20,0.09) 0%, #0a0a0a 65%)", fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><Logo /></div>
          <h1 className="text-2xl font-bold text-white mt-2">Welcome back</h1>
          <p className="text-white/45 text-sm mt-1">Sign in to your StreamVault account</p>
        </div>
        <GlassCard className="p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-white/55 mb-1.5 block">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors" />
            </div>
            <div>
              <label className="text-sm text-white/55 mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-white/50 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#E50914] w-3.5 h-3.5" />
                Remember me
              </label>
              <button type="button" className="text-[#E50914] hover:text-red-400 transition-colors text-sm">Forgot password?</button>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#E50914] hover:bg-[#c7060f] text-white rounded-xl font-semibold transition-all hover:shadow-xl hover:shadow-red-900/25 mt-1 disabled:opacity-50">
              {loading ? "Signing In..." : "Sign In"}
            </button>
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.07]" /></div>
              <div className="relative text-center"><span className="px-3 text-white/30 text-xs bg-[#101010]" style={{ background: "transparent" }}>OR CONTINUE WITH</span></div>
            </div>
            <button type="button" className="w-full py-2.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.09] text-white rounded-xl text-sm flex items-center justify-center gap-3 transition-colors font-medium">
              <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#4285F4] text-xs font-bold">G</span>
              Continue with Google
            </button>
          </form>
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
function RegisterPage({ navigate, setUser }: { navigate: (p: Page) => void; setUser: (u: User | null) => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.register({ email, password, firstName, lastName, phone });
      setUser(data.user);
      toast.success("Account created successfully!");
      navigate("dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to create account. Email might already be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a]" style={{ background: "radial-gradient(ellipse 80% 60% at 80% 70%, rgba(229,9,20,0.09) 0%, #0a0a0a 65%)", fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><Logo /></div>
          <h1 className="text-2xl font-bold text-white mt-2">Create your account</h1>
          <p className="text-white/45 text-sm mt-1">Start managing subscriptions — free forever</p>
        </div>
        <GlassCard className="p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-white/55 mb-1.5 block">First name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="Rahul" className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors" />
              </div>
              <div>
                <label className="text-sm text-white/55 mb-1.5 block">Last name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Sharma" className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-sm text-white/55 mb-1.5 block">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="rahul@example.com" className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors" />
            </div>
            <div>
              <label className="text-sm text-white/55 mb-1.5 block">Phone number</label>
              <div className="flex gap-2">
                <div className="px-3.5 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white/50 text-sm shrink-0">+91</div>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210" className="flex-1 px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-sm text-white/55 mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min. 8 characters" className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <label className="flex items-start gap-2.5 text-sm text-white/45 cursor-pointer">
              <input type="checkbox" defaultChecked required className="mt-0.5 accent-[#E50914] shrink-0 w-3.5 h-3.5" />
              <span>I agree to the <span className="text-[#E50914] cursor-pointer">Terms of Service</span> and <span className="text-[#E50914] cursor-pointer">Privacy Policy</span></span>
            </label>
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#E50914] hover:bg-[#c7060f] text-white rounded-xl font-semibold transition-all hover:shadow-xl hover:shadow-red-900/25 disabled:opacity-50">
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
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
interface DashboardProps {
  navigate: (p: Page) => void;
  user: User | null;
  activeSubs: Subscription[];
  expiredSubs: Subscription[];
  spendingData: { month: string; amount: number }[];
  platformDistribution: { name: string; value: number; color: string }[];
  onRenew: (sub: Subscription) => void;
}

function DashboardPage({ navigate, user, activeSubs, expiredSubs, spendingData, platformDistribution, onRenew }: DashboardProps) {
  // Compute dashboard metrics
  const activeCount = activeSubs.length;
  
  // Calculate monthly spend by summing all active plans prices
  const monthlySpend = activeSubs.reduce((sum, s) => sum + s.price, 0);

  // Expiring count
  const expiringCount = activeSubs.filter(s => s.status === "expiring").length;
  const expiringText = activeSubs.find(s => s.status === "expiring") 
    ? `${activeSubs.find(s => s.status === "expiring")?.platform} in 7 days` 
    : "No plans expiring soon";

  // Total saved: mock user savings comparison
  const totalSaved = activeCount * 350;

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Dashboard</h1>
        <p className="text-white/45 text-sm mt-0.5">Welcome, {user?.first_name || "Guest"}. Here is your subscription overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Subscriptions", value: `${activeCount}`, icon: <Tv className="w-5 h-5" />, color: "#E50914", sub: "+1 this month" },
          { label: "Monthly Spend", value: `₹${monthlySpend}`, icon: <DollarSign className="w-5 h-5" />, color: "#00A8E0", sub: `On ${activeCount} channels` },
          { label: "Expiring Soon", value: `${expiringCount}`, icon: <AlertCircle className="w-5 h-5" />, color: "#F5A623", sub: expiringText },
          { label: "Total Saved", value: `₹${totalSaved}`, icon: <TrendingUp className="w-5 h-5" />, color: "#10b981", sub: "vs buying individual bundles" },
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
            <span className="text-xs text-white/35 bg-white/[0.05] px-2.5 py-1 rounded-lg">Last 6 months</span>
          </div>
          {spendingData.length > 0 ? (
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
          ) : (
            <div className="h-[200px] flex items-center justify-center text-xs text-white/30">No transaction data yet. Start subscribing to see charts.</div>
          )}
        </GlassCard>

        <GlassCard className="lg:col-span-2 p-5">
          <h2 className="font-semibold mb-4">Platform Split</h2>
          {platformDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={platformDistribution} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {platformDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#fff", fontSize: 12 }} formatter={(v: number) => [`${v} plans`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-1">
                {platformDistribution.map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-white/55">{p.name}</span>
                    </div>
                    <span className="font-medium">{p.value} plan(s)</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-center text-xs text-white/30 px-4">No active subscriptions yet. Active subscriptions will appear in this pie chart.</div>
          )}
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
        {activeSubs.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {activeSubs.map((sub) => (
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
        ) : (
          <GlassCard className="py-12 text-center text-white/30">
            <Tv className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm mb-4">No active subscriptions tracked yet.</p>
            <button onClick={() => navigate("plans")} className="px-4 py-2 bg-[#E50914] text-white text-xs font-semibold rounded-lg hover:bg-red-700">Browse Plans</button>
          </GlassCard>
        )}
      </div>

      {/* Expired */}
      {expiredSubs.length > 0 && (
        <div>
          <h2 className="font-semibold mb-4">Expired Subscriptions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {expiredSubs.map((sub) => (
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
                  <button onClick={() => onRenew(sub)} className="px-3 py-1.5 text-xs bg-[#E50914]/10 border border-[#E50914]/20 text-[#E50914] rounded-lg hover:bg-[#E50914]/20 transition-colors font-medium">
                    Renew
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Plans Page ─────────────────────────────────────────────────────────────────
interface PlansPageProps {
  navigate: (p: Page) => void;
  plans: PlatformPlans[];
  onSelectPlan: (plan: Plan, platformName: string, color: string) => void;
}

function PlansPage({ navigate, plans, onSelectPlan }: PlansPageProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const filtered = selectedPlatform ? plans.filter((p) => p.platform === selectedPlatform) : plans;

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
        {plans.map((p) => (
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
                  <button onClick={() => onSelectPlan(plan, platform.platform, platform.color)}
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
interface PaymentPageProps {
  navigate: (p: Page) => void;
  selectedPlan: Plan | null;
  selectedPlatformName: string | null;
  selectedColor: string | null;
  onPaymentSuccess: () => void;
}

function PaymentPage({ navigate, selectedPlan, selectedPlatformName, selectedColor, onPaymentSuccess }: PaymentPageProps) {
  const [method, setMethod] = useState<"upi" | "card" | "wallet">("upi");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [copied, setCopied] = useState(false);
  const [paymentRequested, setPaymentRequested] = useState(false);

  // Default fallback if page loaded directly without selecting a plan
  const plan = selectedPlan || { id: 4, name: "Premium 4K", price: 649, screens: 4, quality: "4K Ultra HD", downloads: true };
  const platformName = selectedPlatformName || "Netflix";
  const color = selectedColor || "#E50914";

  // Calculations
  const subtotal = plan.price;
  const gst = Math.round(subtotal * 0.18 * 100) / 100;
  const discount = subtotal > 150 ? 50 : 10;
  const total = Math.round((subtotal + gst - discount) * 100) / 100;

  // UPI configuration parameters
  const upiMerchantId = "indra2396@ybl";
  const transactionId = "TXN" + Math.floor(100000 + Math.random() * 900000);
  const upiUri = `upi://pay?pa=${upiMerchantId}&pn=StreamVault&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`StreamVault subscription for ${platformName} ${plan.name}`)}&tr=${transactionId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=${encodeURIComponent(upiUri)}`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiMerchantId);
    setCopied(true);
    toast.success("UPI ID copied successfully!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId || !upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID (e.g. name@bank)");
      return;
    }
    setPaymentRequested(true);
    toast.success(`Payment request of ₹${total.toFixed(2)} sent to ${upiId}!`);
  };

  const handlePay = async () => {
    setProcessing(true);
    try {
      const paymentMethod = method.toUpperCase();
      
      // If UPI, we do a simulation delay for check status
      if (method === "upi") {
        await new Promise((resolve) => setTimeout(resolve, 1800));
      }
      
      await api.checkout(plan.id, paymentMethod);
      setProcessing(false);
      setDone(true);
      toast.success("Transaction completed successfully!");
      setTimeout(() => {
        setDone(false);
        setPaymentRequested(false);
        onPaymentSuccess();
        navigate("history");
      }, 1200);
    } catch (err: any) {
      setProcessing(false);
      toast.error(err.message || "Payment failed. Please try again.");
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(180px); }
        }
        .scanner-line {
          animation: scan 2.5s ease-in-out infinite;
        }
      `}} />

      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>Complete Payment</h1>
        <p className="text-white/45 text-sm mt-0.5">Secure checkout powered by StreamVault</p>
      </div>

      {/* Order Summary */}
      <GlassCard className="p-5">
        <h2 className="font-semibold mb-4 text-sm text-white/60 uppercase tracking-wider">Order Summary</h2>
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border flex items-center justify-center" style={{ backgroundColor: `${color}12`, borderColor: `${color}20` }}>
              <span className="font-bold text-sm" style={{ color: color }}>{platformName.charAt(0)}</span>
            </div>
            <div>
              <div className="font-semibold text-sm">{platformName} {plan.name}</div>
              <div className="text-xs text-white/35">Monthly · {plan.screens} Screens · {plan.quality}</div>
            </div>
          </div>
          <div className="font-bold">₹{plan.price}</div>
        </div>
        <div className="space-y-2.5 pt-4 text-sm">
          <div className="flex justify-between text-white/50"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-white/50"><span>GST (18%)</span><span>₹{gst.toFixed(2)}</span></div>
          <div className="flex justify-between text-emerald-400"><span>StreamVault Discount</span><span>−₹{discount.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-base border-t border-white/[0.06] pt-3 mt-1">
            <span>Total Due</span><span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </GlassCard>

      {/* Payment Method */}
      <GlassCard className="p-5">
        <h2 className="font-semibold mb-4 text-sm text-white/60 uppercase tracking-wider">Payment Method</h2>
        <div className="flex gap-2 mb-6">
          {[
            { id: "upi", label: "UPI Portal", icon: <QrCode className="w-4 h-4" /> },
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
          <div className="space-y-5">
            {/* Dynamic Scannable QR Code */}
            <div className="flex flex-col items-center p-6 bg-white rounded-2xl relative shadow-2xl border border-gray-100">
              <div className="relative w-48 h-48 bg-gray-50 rounded-xl flex items-center justify-center mb-4 overflow-hidden border border-gray-200/50 p-2">
                {/* Scanner Animation Overlay */}
                <div className="absolute left-0 w-full h-[3px] bg-emerald-500/80 shadow-[0_0_8px_#10b981] scanner-line z-10" />
                <img src={qrCodeUrl} alt="UPI QR Code" className="w-full h-full object-contain select-none" />
              </div>
              
              <div className="text-center space-y-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 mb-1">
                  Active UPI QR Code
                </span>
                <p className="text-gray-800 text-sm font-bold">Scan QR code to pay with any UPI App</p>
                <p className="text-gray-400 text-[11px]">GPay, PhonePe, Paytm, BHIM, etc. · Amount: <span className="font-semibold text-gray-700 text-xs">₹{total.toFixed(2)}</span></p>
              </div>
            </div>

            {/* Mobile UPI Deep Link */}
            <div className="space-y-2">
              <a href={upiUri} className="flex items-center justify-center gap-2.5 w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border border-emerald-500/20 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:shadow-emerald-950/20 active:scale-[0.98]">
                <Smartphone className="w-4 h-4" />
                <span>Pay via UPI App (Mobile Direct)</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            </div>

            {/* Payee Info / Copy UPI ID */}
            <div className="flex items-center justify-between p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <div>
                <p className="text-[11px] text-white/35 uppercase tracking-wider font-semibold">Merchant UPI Address</p>
                <p className="text-sm font-mono text-white/80 mt-0.5">{upiMerchantId}</p>
              </div>
              <button type="button" onClick={handleCopyUPI} className="p-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] rounded-lg transition-all text-white/60 hover:text-white">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-white/[0.07]" />
              <span className="text-xs text-white/30">or receive payment request</span>
              <div className="flex-1 border-t border-white/[0.07]" />
            </div>

            {/* Manual Request form */}
            <form onSubmit={handleRequestPayment} className="space-y-3">
              <div className="flex gap-2">
                <input placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="flex-1 px-4 py-2.5 bg-white/[0.05] border border-white/[0.09] rounded-xl text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#E50914]/50 transition-colors" />
                <button type="submit" className="px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.16] text-white text-xs font-semibold rounded-xl transition-all">
                  Request
                </button>
              </div>
              {paymentRequested && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    Request active on <span className="font-semibold text-white">{upiId}</span>. Approve the request in your UPI application first, then click the "Verify Payment" button below.
                  </div>
                </div>
              )}
            </form>
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
              <button key={w.name} type="button" onClick={handlePay} className="p-4 bg-white/[0.04] border border-white/[0.09] rounded-xl flex flex-col items-center gap-2 hover:bg-white/[0.08] hover:border-white/[0.16] transition-all">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: w.color }}>
                  {w.abbr}
                </div>
                <span className="text-xs text-white/50">{w.name}</span>
              </button>
            ))}
          </div>
        )}

        <button onClick={handlePay} disabled={processing || done}
          className={`w-full mt-6 py-3.5 rounded-xl font-bold text-white transition-all text-base flex items-center justify-center gap-2 ${done ? "bg-emerald-600" : processing ? "bg-white/15 cursor-not-allowed" : "bg-[#E50914] hover:bg-[#c7060f] hover:shadow-xl hover:shadow-red-900/30"}`}>
          {done ? (
            <>✓ Payment Successful!</>
          ) : processing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              {method === "upi" ? "Verifying UPI payment status..." : "Processing…"}
            </>
          ) : method === "upi" ? (
            <>Verify UPI Payment</>
          ) : (
            <>Pay ₹{total.toFixed(2)}</>
          )}
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
function HistoryPage({ transactions }: { transactions: Transaction[] }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? transactions : transactions.filter((h) => h.status === filter);

  // Compute history summary metrics
  const totalPaid = transactions
    .filter(tx => tx.status === "success")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const successCount = transactions.filter(tx => tx.status === "success").length;
  const failedCount = transactions.filter(tx => tx.status === "failed" || tx.status === "refunded").length;

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
          { label: "Total Paid", value: `₹${totalPaid}`, color: "#E50914" },
          { label: "Successful", value: `${successCount} of ${transactions.length}`, color: "#10b981" },
          { label: "Failed / Refunded", value: `${failedCount}`, color: "#F5A623" },
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
        {filtered.length > 0 ? (
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
        ) : (
          <div className="py-12 text-center text-white/30 text-sm">No transaction records match the filter.</div>
        )}
      </GlassCard>
    </div>
  );
}

// ── Notifications Page ─────────────────────────────────────────────────────────
interface NotificationsProps {
  notifications: Notification[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  onDismiss: (id: number) => void;
}

function NotificationsPage({ notifications, onMarkRead, onMarkAllRead, onDismiss }: NotificationsProps) {
  const unread = notifications.filter((n) => !n.read).length;

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

  // Group counters
  const remindersCount = notifications.filter(n => n.type === "warning").length;
  const paymentsCount = notifications.filter(n => n.type === "success").length;
  const updatesCount = notifications.filter(n => n.type === "info").length;
  const alertsCount = notifications.filter(n => n.type === "error").length;

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
          <button onClick={onMarkAllRead} className="text-sm text-[#E50914] hover:text-red-400 transition-colors font-medium">Mark all read</button>
        )}
      </div>

      {/* Category Counts */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Reminders", count: remindersCount, color: "#F5A623" },
          { label: "Payments", count: paymentsCount, color: "#10b981" },
          { label: "Updates", count: updatesCount, color: "#00A8E0" },
          { label: "Alerts", count: alertsCount, color: "#E50914" },
        ].map((c) => (
          <GlassCard key={c.label} className="p-3 text-center">
            <div className="text-lg font-bold mb-0.5" style={{ color: c.color }}>{c.count}</div>
            <div className="text-xs text-white/35">{c.label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <GlassCard key={n.id} onClick={() => !n.read && onMarkRead(n.id)} className={`p-4 transition-all group cursor-pointer ${!n.read ? "border-white/[0.10]" : "opacity-55 hover:opacity-75"}`}>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${bgs[n.type]}`}>
                {icons[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{n.title}</span>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] shrink-0" />}
                </div>
                <p className="text-sm text-white/55 leading-relaxed">{n.message}</p>
                <span className="text-xs text-white/25 mt-1.5 block">{n.time}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); onDismiss(n.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/[0.07] text-white/35 hover:text-white/70 shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </GlassCard>
        ))}
        {notifications.length === 0 && (
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
  const [stats, setStats] = useState<AdminAnalytics | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [plans, setPlans] = useState<PlatformPlans[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [analytics, usersList, txList, plansList] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAdminUsers(),
        api.getAdminTransactions(),
        api.getPlans()
      ]);
      setStats(analytics);
      setUsers(usersList);
      setTransactions(txList);
      setPlans(plansList);
    } catch (err: any) {
      toast.error(err.message || "Failed to load admin stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return <div className="py-24 text-center text-white/45">Loading Admin Panel...</div>;
  }

  // Filter users by search query
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Active Users", value: `${stats.activeUsers}`, icon: <Users className="w-5 h-5" />, color: "#00A8E0", change: "Subscribers currently on platform" },
            { label: "Total Revenue", value: `₹${(stats.totalRevenue).toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: "#E50914", change: "Lifetime earnings success transactions" },
            { label: "Active Subscriptions", value: `${stats.activeSubscriptionsCount}`, icon: <Tv className="w-5 h-5" />, color: "#10b981", change: `Across ${plans.length} platforms` },
            { label: "Average Order Value", value: `₹${stats.activeSubscriptionsCount > 0 ? Math.round(stats.totalRevenue / stats.activeSubscriptionsCount) : 0}`, icon: <TrendingUp className="w-5 h-5" />, color: "#F5A623", change: "Average spend per active subscription" },
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
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-white/[0.06]">
        {[
          { id: "overview", label: "Overview" },
          { id: "users", label: "User Management" },
          { id: "plans", label: "Plan Management" },
          { id: "payments", label: "Payments Logs" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${tab === t.id ? "border-[#E50914] text-white" : "border-transparent text-white/40 hover:text-white/70"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === "overview" && stats && (
        <div className="space-y-5">
          <div className="grid lg:grid-cols-2 gap-4">
            <GlassCard className="p-5">
              <h2 className="font-semibold mb-5">Revenue Growth (success checkouts)</h2>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={stats.growthData} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#fff", fontSize: 12 }} />
                  <Bar dataKey="revenue" fill="#E50914" radius={[3, 3, 0, 0]} name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard className="p-5">
              <h2 className="font-semibold mb-5">Platform Active Subscriptions Split</h2>
              {stats.platformDistribution.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={155}>
                    <PieChart>
                      <Pie data={stats.platformDistribution} cx="50%" cy="50%" outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {stats.platformDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#fff", fontSize: 12 }} formatter={(v: number) => [`${v} active`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
                    {stats.platformDistribution.map((p) => (
                      <div key={p.name} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-white/50">{p.name}</span>
                        <span className="ml-auto font-medium">{p.value} active</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-xs text-white/30">No active subscriptions currently.</div>
              )}
            </GlassCard>
          </div>
          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Renewal Rate", value: "94.2%", desc: "Users who renew their subscription" },
              { label: "Churn Rate", value: "5.8%", desc: "Monthly subscription cancellations" },
              { label: "Platform Count", value: `${plans.length}`, desc: "Active video providers tracked" },
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
                <input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 bg-white/[0.05] border border-white/[0.09] rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#E50914]/50 w-48" />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["User", "Email", "Active Subscriptions", "Spend", "Status", "Joined"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs text-white/35 font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, i) => (
                  <tr key={u.id} className={`border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors ${i === filteredUsers.length - 1 ? "border-none" : ""}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#E50914]/15 border border-[#E50914]/25 flex items-center justify-center text-[#E50914] text-xs font-bold">
                          {u.name.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <span className="text-sm font-semibold">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-white/50">{u.email}</td>
                    <td className="px-5 py-4 text-sm font-medium">{u.subscriptions} active</td>
                    <td className="px-5 py-4 text-sm font-bold">₹{u.spending}</td>
                    <td className="px-5 py-4"><StatusBadge status={u.status} /></td>
                    <td className="px-5 py-4 text-sm text-white/40">{u.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.05] text-xs text-white/35">
            <span>Showing {filteredUsers.length} users</span>
          </div>
        </GlassCard>
      )}

      {/* Tab: Plans */}
      {tab === "plans" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((platform) => (
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
            </GlassCard>
          ))}
        </div>
      )}

      {/* Tab: Payments */}
      {tab === "payments" && (
        <GlassCard className="overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <h2 className="font-semibold">Recent Transactions Logs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Txn ID", "User", "Platform", "Plan", "Amount", "Method", "Status", "Date"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs text-white/35 font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={tx.id} className={`border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors ${i === transactions.length - 1 ? "border-none" : ""}`}>
                    <td className="px-5 py-4 text-sm font-mono text-white/40">{tx.id}</td>
                    <td className="px-5 py-4 text-sm font-medium">{tx.user_name || "Unknown"}</td>
                    <td className="px-5 py-4 text-sm">{tx.platform}</td>
                    <td className="px-5 py-4 text-sm text-white/60">{tx.plan}</td>
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
  { id: "dashboard", label: "Dashboard", icon: Home, roles: ["user"] },
  { id: "plans", label: "Browse Plans", icon: Tv, roles: ["user"] },
  { id: "payment", label: "Payment", icon: CreditCard, roles: ["user"] },
  { id: "history", label: "History", icon: Clock, roles: ["user"] },
  { id: "notifications", label: "Notifications", icon: Bell, roles: ["user"] },
  { id: "admin", label: "Admin Panel", icon: Shield, roles: ["admin"] },
];

interface AppLayoutProps {
  page: Page;
  navigate: (p: Page) => void;
  unreadCount: number;
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
}

function AppLayout({ page, navigate, unreadCount, user, onLogout, children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Filter sidebar tabs by user role
  const visibleNavItems = navItems.filter(item => item.roles.includes(user?.role || "user"));

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
          {visibleNavItems.map(({ id, label, icon: Icon }) => {
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
            <div className="w-8 h-8 rounded-full bg-[#E50914]/15 border border-[#E50914]/25 flex items-center justify-center text-[#E50914] text-xs font-bold shrink-0">
              {user ? `${user.first_name[0]}${user.last_name[0]}` : "GU"}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{user ? `${user.first_name} ${user.last_name}` : "Guest User"}</div>
              <div className="text-xs text-white/35 truncate capitalize">{user?.role} Access</div>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-white/35 hover:text-white/65 hover:bg-white/[0.04] border border-transparent transition-all">
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
            {user?.role !== "admin" && (
              <button onClick={() => navigate("notifications")} className="relative p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.05] transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#E50914] rounded-full ring-2 ring-[#0a0a0a]" />}
              </button>
            )}
            <div className="w-px h-5 bg-white/[0.08] mx-1" />
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-7 h-7 rounded-full bg-[#E50914]/15 border border-[#E50914]/25 flex items-center justify-center text-[#E50914] text-[10px] font-bold">
                {user ? `${user.first_name[0]}${user.last_name[0]}` : "GU"}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-semibold leading-tight">{user ? `${user.first_name} ${user.last_name}` : "Guest User"}</div>
                <div className="text-[10px] text-white/30 leading-tight capitalize">{user?.role}</div>
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
  const [user, setUser] = useState<User | null>(null);

  // Lists and Data State
  const [activeSubs, setActiveSubs] = useState<Subscription[]>([]);
  const [expiredSubs, setExpiredSubs] = useState<Subscription[]>([]);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [plans, setPlans] = useState<PlatformPlans[]>([]);

  // Chart data state for dashboard
  const [spendingData, setSpendingData] = useState<{ month: string; amount: number }[]>([]);
  const [platformDistribution, setPlatformDistribution] = useState<{ name: string; value: number; color: string }[]>([]);

  // Payment Selection State
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPlatformName, setSelectedPlatformName] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navigate = (p: Page) => setPage(p);

  // Authenticate user on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const data = await api.getMe();
          setUser(data.user);
        } catch (err) {
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Fetch data for the logged-in user
  const fetchUserData = async () => {
    if (!user || user.role === "admin") return;
    try {
      const [subsData, txHistory, notifs, stats] = await Promise.all([
        api.getSubscriptions(),
        api.getTransactions(),
        api.getNotifications(),
        api.getDashboardStats()
      ]);
      setActiveSubs(subsData.active);
      setExpiredSubs(subsData.expired);
      setHistory(txHistory);
      setNotifications(notifs);
      setSpendingData(stats.spendingData);
      setPlatformDistribution(stats.platformDistribution);
    } catch (err) {
      console.error("Error fetching user dashboard data:", err);
    }
  };

  // Fetch plans (only once or when needed)
  const fetchPlans = async () => {
    try {
      const data = await api.getPlans();
      setPlans(data);
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  useEffect(() => {
    if (user && user.role !== "admin") {
      fetchUserData();
      fetchPlans();
    }
  }, [user]);

  // Log Out
  const handleLogout = () => {
    api.logout();
    setUser(null);
    setActiveSubs([]);
    setExpiredSubs([]);
    setHistory([]);
    setNotifications([]);
    toast.success("Logged out successfully");
    navigate("landing");
  };

  // Select Plan to purchase
  const handleSelectPlan = (plan: Plan, platformName: string, color: string) => {
    setSelectedPlan(plan);
    setSelectedPlatformName(platformName);
    setSelectedColor(color);
    navigate("payment");
  };

  // Renew an expired subscription directly
  const handleRenew = async (sub: Subscription) => {
    // We can pre-select the appropriate plan from our plans list and direct to payment page
    let matchedPlan: Plan | null = null;
    const platform = plans.find(p => p.platform === sub.platform);
    if (platform) {
      const pMatch = platform.plans.find(pl => pl.name === sub.plan);
      if (pMatch) matchedPlan = pMatch;
    }
    
    if (matchedPlan) {
      setSelectedPlan(matchedPlan);
      setSelectedPlatformName(sub.platform);
      setSelectedColor(sub.color);
      navigate("payment");
    } else {
      // Fallback: direct to plans
      navigate("plans");
    }
  };

  // Notification action handlers
  const handleMarkRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismissNotification = async (id: number) => {
    try {
      await api.dismissNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <Logo />
          <div className="text-xs text-white/30 animate-pulse">Initializing Secure Connection...</div>
        </div>
      </div>
    );
  }

  // Auth pages logic
  if (page === "landing") return <LandingPage navigate={navigate} user={user} />;
  if (page === "login") return <LoginPage navigate={navigate} setUser={setUser} />;
  if (page === "register") return <RegisterPage navigate={navigate} setUser={setUser} />;

  return (
    <>
      <AppLayout page={page} navigate={navigate} unreadCount={unreadCount} user={user} onLogout={handleLogout}>
        {page === "dashboard" && (
          <DashboardPage
            navigate={navigate}
            user={user}
            activeSubs={activeSubs}
            expiredSubs={expiredSubs}
            spendingData={spendingData}
            platformDistribution={platformDistribution}
            onRenew={handleRenew}
          />
        )}
        {page === "plans" && (
          <PlansPage
            navigate={navigate}
            plans={plans}
            onSelectPlan={handleSelectPlan}
          />
        )}
        {page === "payment" && (
          <PaymentPage
            navigate={navigate}
            selectedPlan={selectedPlan}
            selectedPlatformName={selectedPlatformName}
            selectedColor={selectedColor}
            onPaymentSuccess={fetchUserData}
          />
        )}
        {page === "history" && <HistoryPage transactions={history} />}
        {page === "notifications" && (
          <NotificationsPage
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onDismiss={handleDismissNotification}
          />
        )}
        {page === "admin" && <AdminPage />}
      </AppLayout>

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#121212",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#fff",
            borderRadius: "12px",
          },
        }}
      />
    </>
  );
}

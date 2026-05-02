import { useEffect, useState, useRef } from "react";

/* ============================
   Types
============================ */
interface DashboardStats {
  activeUsers: number;
  inactiveUsers: number;
  totalUsers: number;
  sellTransactions: number;
  withdrawalTransactions: number;
  buyContainers: number;
  totalMonthlyInterest: number;
  pendingWithdrawals: number;
  approvedWithdrawals: number;
  totalWithdrawalAmount: number;
}

interface RecentWithdrawal {
  withdrawRequestPkId: number;
  userFkId: string;
  requestAmount: number;
  currency: string;
  status: string;
  requestedAt: string;
}

interface RecentActivity {
  id: number;
  type: "BUY" | "SELL" | "WITHDRAW" | "INTEREST";
  userFkId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

/* ============================
   API
============================ */
const BASE_URL =
  "http://containershipment-app-env.eba-p7ijagki.ap-south-1.elasticbeanstalk.com/api/container";

const dashboardApi = {
  // Active users
  getUsers: async (filterBy: string) => {
    const res = await fetch(
      `http://containershipment-app-env.eba-p7ijagki.ap-south-1.elasticbeanstalk.com/api/users/getUser?page=0&size=1000&filterBy=ACTIVE&inputPkId=null&inputFkId=null`
    );
    const data = await res.json();
    return data.count || 0;
  },

  // Investments (buy containers)
  getInvestments: async (filterBy = "ALL") => {
    const res = await fetch(
      `${BASE_URL}/getInvestment?page=1&size=1&filterBy=${filterBy}&inputPkId=null&inputFkId=null`
    );
    const data = await res.json();
    return data.count || 0;
  },

  // ROI transactions (monthly interest)
  getRoiTransactions: async () => {
    const res = await fetch(
      `${BASE_URL}/getRoiTransaction?page=1&size=1000&filterBy=ALL&inputPkId=null&inputFkId=null`
    );
    const data = await res.json();
    const list = data.data || [];
    const total = list.reduce(
      (sum: number, r: any) => sum + Number(r.monthlyPayout || 0),
      0
    );
    return { count: list.length, totalInterest: total };
  },

  // Withdraw requests
  getWithdrawRequests: async (filterBy = "ALL") => {
    const res = await fetch(
      `${BASE_URL}/withdraw/getWithdrawRequests?filterBy=${filterBy}&page=1&size=1000&userFkId=null`
    );
    const data = await res.json();
    const list = data.content || [];
    const totalAmount = list.reduce(
      (sum: number, r: any) => sum + Number(r.requestAmount || 0),
      0
    );
    return {
      count: data.totalElements || list.length,
      totalAmount,
      list: list.slice(0, 5),
    };
  },

  // Sell transactions
  getSellTransactions: async () => {
    const res = await fetch(
      `${BASE_URL}/getSellRequest?page=0&size=1000&filterBy=ACTIVE&inputPkId=null&inputFkId=null`
    );
    const data = await res.json();
    return data.count || 0;
  },
};

/* ============================
   Animated Counter
============================ */
function AnimatedCounter({
  target,
  duration = 1200,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (target === 0) return;
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  const display =
    decimals > 0
      ? value.toLocaleString("en-IN", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : Math.floor(value).toLocaleString("en-IN");

  return (
    <span>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ============================
   Stat Card
============================ */
function StatCard({
  title,
  value,
  prefix,
  suffix,
  decimals,
  icon,
  color,
  bgColor,
  borderColor,
  subLabel,
  subValue,
  delay,
}: {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  subLabel?: string;
  subValue?: string;
  delay?: number;
}) {
  return (
    <div
      className={`relative bg-white dark:bg-gray-900 rounded-2xl border ${borderColor} p-5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group`}
      style={{ animationDelay: `${delay || 0}ms` }}
    >
      {/* Background glow */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300 ${bgColor}`}
      />

      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${bgColor} ${color}`}>{icon}</div>
      </div>

      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
        {title}
      </p>

      <p className={`text-2xl font-bold ${color} mb-1`}>
        <AnimatedCounter
          target={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
        />
      </p>

      {subLabel && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {subLabel}: <span className="font-medium text-gray-600 dark:text-gray-300">{subValue}</span>
        </p>
      )}
    </div>
  );
}

/* ============================
   Donut Chart (SVG)
============================ */
function DonutChart({
  active,
  inactive,
}: {
  active: number;
  inactive: number;
}) {
  const total = active + inactive || 1;
  const activePercent = (active / total) * 100;
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const activeDash = (activePercent / 100) * circumference;

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle
            cx="65"
            cy="65"
            r={r}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="14"
          />
          <circle
            cx="65"
            cy="65"
            r={r}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="14"
            strokeDasharray={`${circumference - activeDash} ${circumference}`}
            strokeDashoffset={-activeDash}
            strokeLinecap="round"
            transform="rotate(-90 65 65)"
          />
          <circle
            cx="65"
            cy="65"
            r={r}
            fill="none"
            stroke="#f97316"
            strokeWidth="14"
            strokeDasharray={`${activeDash} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(-90 65 65)"
            style={{ transition: "stroke-dasharray 1.2s ease" }}
          />
          <text
            x="65"
            y="60"
            textAnchor="middle"
            className="fill-gray-900 dark:fill-white"
            fontSize="18"
            fontWeight="700"
          >
            {Math.round(activePercent)}%
          </text>
          <text
            x="65"
            y="78"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="10"
          >
            Active
          </text>
        </svg>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Active Users</p>
            <p className="font-bold text-gray-900 dark:text-white">
              {active.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-200 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Inactive Users</p>
            <p className="font-bold text-gray-900 dark:text-white">
              {inactive.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500">Total</p>
          <p className="font-bold text-gray-900 dark:text-white">
            {(active + inactive).toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================
   Status Badge
============================ */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-blue-100 text-blue-700",
    WITHDRAWN: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    ACTIVE: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
}

/* ============================
   Main Dashboard
============================ */
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeUsers: 0,
    inactiveUsers: 0,
    totalUsers: 0,
    sellTransactions: 0,
    withdrawalTransactions: 0,
    buyContainers: 0,
    totalMonthlyInterest: 0,
    pendingWithdrawals: 0,
    approvedWithdrawals: 0,
    totalWithdrawalAmount: 0,
  });
  const [recentWithdrawals, setRecentWithdrawals] = useState<RecentWithdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = async () => {
    try {
      setIsLoading(true);

      const [
        activeUsers,
        inactiveUsers,
        buyContainers,
        roiData,
        allWithdrawals,
        pendingWithdrawals,
        approvedWithdrawals,
        sellTxns,
      ] = await Promise.allSettled([
        dashboardApi.getUsers("ACTIVE"),
        dashboardApi.getUsers("INACTIVE"),
        dashboardApi.getInvestments("ACTIVE"),
        dashboardApi.getRoiTransactions(),
        dashboardApi.getWithdrawRequests("ALL"),
        dashboardApi.getWithdrawRequests("PENDING"),
        dashboardApi.getWithdrawRequests("APPROVED"),
        dashboardApi.getSellTransactions(),
      ]);

      const active = activeUsers.status === "fulfilled" ? activeUsers.value : 0;
      const inactive = inactiveUsers.status === "fulfilled" ? inactiveUsers.value : 0;
      const buy = buyContainers.status === "fulfilled" ? buyContainers.value : 0;
      const roi = roiData.status === "fulfilled" ? roiData.value : { count: 0, totalInterest: 0 };
      const allW = allWithdrawals.status === "fulfilled" ? allWithdrawals.value : { count: 0, totalAmount: 0, list: [] };
      const pendW = pendingWithdrawals.status === "fulfilled" ? pendingWithdrawals.value : { count: 0, totalAmount: 0, list: [] };
      const appW = approvedWithdrawals.status === "fulfilled" ? approvedWithdrawals.value : { count: 0, totalAmount: 0, list: [] };
      const sell = sellTxns.status === "fulfilled" ? sellTxns.value : 0;

      setStats({
        activeUsers: active,
        inactiveUsers: inactive,
        totalUsers: active + inactive,
        sellTransactions: sell,
        withdrawalTransactions: allW.count,
        buyContainers: buy,
        totalMonthlyInterest: roi.totalInterest,
        pendingWithdrawals: pendW.count,
        approvedWithdrawals: appW.count,
        totalWithdrawalAmount: allW.totalAmount,
      });

      setRecentWithdrawals(allW.list);
      setLastRefreshed(new Date());
    } catch (err: any) {
      showToast("error", "Failed to load some dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ============================
     Stat Cards Config
  ============================ */
  const statCards = [
    {
      title: "Active Users",
      value: stats.activeUsers,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-950/40",
      borderColor: "border-orange-100 dark:border-orange-900/40",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      subLabel: "Inactive",
      subValue: stats.inactiveUsers.toLocaleString("en-IN"),
    },
    {
      title: "Inactive Users",
      value: stats.inactiveUsers,
      color: "text-slate-600",
      bgColor: "bg-slate-100 dark:bg-slate-800/60",
      borderColor: "border-slate-100 dark:border-slate-700/40",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      subLabel: "Total Users",
      subValue: stats.totalUsers.toLocaleString("en-IN"),
    },
    {
      title: "Buy Containers",
      value: stats.buyContainers,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-950/40",
      borderColor: "border-blue-100 dark:border-blue-900/40",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      subLabel: "Status",
      subValue: "Active Investments",
    },
    {
      title: "Sell Transactions",
      value: stats.sellTransactions,
      color: "text-rose-600",
      bgColor: "bg-rose-100 dark:bg-rose-950/40",
      borderColor: "border-rose-100 dark:border-rose-900/40",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      ),
      subLabel: "Type",
      subValue: "Container Sales",
    },
    {
      title: "Withdrawal Txns",
      value: stats.withdrawalTransactions,
      color: "text-violet-600",
      bgColor: "bg-violet-100 dark:bg-violet-950/40",
      borderColor: "border-violet-100 dark:border-violet-900/40",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      subLabel: "Pending",
      subValue: stats.pendingWithdrawals.toLocaleString("en-IN"),
    },
    {
      title: "Monthly Interest",
      value: stats.totalMonthlyInterest,
      prefix: "₹",
      decimals: 2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-950/40",
      borderColor: "border-emerald-100 dark:border-emerald-900/40",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      subLabel: "Total Paid Out",
      subValue: `₹${stats.totalWithdrawalAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium
            ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
            {toast.type === "success" ? "✓" : "✕"} {toast.msg}
          </div>
        )}

        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
              Last refreshed:{" "}
              {lastRefreshed.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          </div>

          <button
            onClick={fetchAll}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-orange-200 dark:shadow-none"
          >
            <svg
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* ===== STAT CARDS GRID ===== */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 animate-pulse">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl mb-3" />
                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
                <div className="h-7 w-24 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
                <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {statCards.map((card, i) => (
              <StatCard key={card.title} {...card} delay={i * 80} />
            ))}
          </div>
        )}

        {/* ===== BOTTOM ROW ===== */}
        <div className="grid md:grid-cols-2 gap-4">

          {/* User Distribution Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                User Distribution
              </h3>
              <span className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
                All time
              </span>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-32 h-32 rounded-full border-8 border-gray-100 dark:border-gray-800 animate-pulse" />
              </div>
            ) : (
              <DonutChart
                active={stats.activeUsers}
                inactive={stats.inactiveUsers}
              />
            )}
          </div>

          {/* Withdrawal Summary Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Withdrawal Summary
              </h3>
              <span className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
                All time
              </span>
            </div>
            <div className="space-y-3">
              {[
                {
                  label: "Pending",
                  value: stats.pendingWithdrawals,
                  color: "bg-amber-400",
                  textColor: "text-amber-600",
                  total: stats.withdrawalTransactions,
                },
                {
                  label: "Approved",
                  value: stats.approvedWithdrawals,
                  color: "bg-blue-400",
                  textColor: "text-blue-600",
                  total: stats.withdrawalTransactions,
                },
                {
                  label: "Paid Out",
                  value: stats.withdrawalTransactions - stats.pendingWithdrawals - stats.approvedWithdrawals,
                  color: "bg-green-400",
                  textColor: "text-green-600",
                  total: stats.withdrawalTransactions,
                },
              ].map((item) => {
                const pct = stats.withdrawalTransactions > 0
                  ? Math.round((item.value / stats.withdrawalTransactions) * 100)
                  : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{item.label}</span>
                      <span className={`font-semibold ${item.textColor}`}>
                        {item.value} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-1000`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                <span className="text-xs text-gray-500">Total Paid Out</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  ₹{stats.totalWithdrawalAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Withdrawal Requests */}
          <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Recent Withdrawal Requests
              </h3>
              <span className="text-xs text-gray-400">Latest 5</span>
            </div>

            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentWithdrawals.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                No withdrawal requests yet
              </div>
            ) : (
              <>
                {/* Table head */}
                <div className="grid grid-cols-5 gap-4 px-6 py-2.5 bg-gray-50 dark:bg-gray-800/60 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <span>User</span>
                  <span>Amount</span>
                  <span>Method</span>
                  <span>Status</span>
                  <span>Requested</span>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {recentWithdrawals.map((w) => (
                    <div
                      key={w.withdrawRequestPkId}
                      className="grid grid-cols-5 gap-4 px-6 py-3.5 items-center hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors text-sm"
                    >
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {w.userFkId}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {w.currency} {Number(w.requestAmount).toFixed(2)}
                      </span>
                      <span className="text-gray-500 text-xs">CRYPTO</span>
                      <StatusBadge status={w.status} />
                      <span className="text-gray-400 text-xs">
                        {formatDate(w.requestedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
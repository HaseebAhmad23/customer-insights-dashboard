import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from "recharts";
import StatCard from "../components/StatCard";
import DateRangeSelect from "../components/DateRangeSelect";
import { getDashboardMetrics } from "../api/analytics";

const SEGMENT_COLORS = {
  Active: "#22c55e",
  Medium: "#f59e0b",
  "At Risk": "#f43f5e",
};

export default function Dashboard() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getDashboardMetrics(days)
      .then(({ data }) => setData(data))
      .catch(() => setError("Failed to load metrics."))
      .finally(() => setLoading(false));
  }, [days]);

  const activeCount = data?.segment_distribution?.find((s) => s.segment === "Active")?.count ?? 0;
  const atRiskCount = data?.segment_distribution?.find((s) => s.segment === "At Risk")?.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of your product analytics</p>
        </div>
        <DateRangeSelect value={days} onChange={setDays} />
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Users" value={data?.total_users ?? "—"} description="All time" accent="indigo" />
            <StatCard title="Events" value={data?.total_events ?? "—"} description={`Last ${days} days`} accent="green" />
            <StatCard title="Active Users" value={activeCount} description="High engagement" accent="green" />
            <StatCard title="At Risk" value={atRiskCount} description="Low engagement" accent="rose" />
          </div>

          {/* Daily signups chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Daily Signups</h2>
            {data?.daily_signups_labeled?.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No signups in this period.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data?.daily_signups_labeled ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickFormatter={(v) => {
                      const d = new Date(v);
                      return `${d.getMonth() + 1}/${d.getDate()}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                    labelFormatter={(v) => new Date(v).toLocaleDateString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="signups"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#6366f1" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bottom row: segments + event breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Segment distribution */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Engagement Segments</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data?.segment_distribution ?? []} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="segment" tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {(data?.segment_distribution ?? []).map((entry) => (
                      <Cell key={entry.segment} fill={SEGMENT_COLORS[entry.segment] ?? "#6366f1"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Event breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Event Breakdown</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data?.event_breakdown ?? []} layout="vertical" barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis dataKey="event_name" type="category" tick={{ fontSize: 11, fill: "#6b7280" }} width={100} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

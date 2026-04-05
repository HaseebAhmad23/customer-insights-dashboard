import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import DateRangeSelect from "../components/DateRangeSelect";
import { getTopFeatures } from "../api/analytics";

const COLORS = [
  "#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd",
  "#818cf8", "#7c3aed", "#5b21b6", "#4338ca", "#3730a3", "#312e81",
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm shadow">
        <p className="font-medium text-gray-800">{payload[0].payload.feature}</p>
        <p className="text-indigo-600 font-semibold">{payload[0].value} uses</p>
      </div>
    );
  }
  return null;
};

export default function FeatureUsage() {
  const [days, setDays] = useState(30);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getTopFeatures(days)
      .then(({ data }) => setFeatures(data))
      .catch(() => setError("Failed to load feature usage."))
      .finally(() => setLoading(false));
  }, [days]);

  const total = features.reduce((sum, f) => sum + f.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Usage</h1>
          <p className="text-sm text-gray-500 mt-0.5">Top features by number of uses</p>
        </div>
        <DateRangeSelect value={days} onChange={setDays} />
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
      ) : features.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm">No feature_used events in this period.</p>
        </div>
      ) : (
        <>
          {/* Bar chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Feature Uses — Last {days} days
            </h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={features} layout="vertical" barSize={24} margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis
                  dataKey="feature"
                  type="category"
                  tick={{ fontSize: 12, fill: "#374151" }}
                  width={130}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {features.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Feature table with share % */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {["Rank", "Feature", "Uses", "Share", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {features.map((f, i) => {
                  const pct = total > 0 ? ((f.count / total) * 100).toFixed(1) : 0;
                  return (
                    <tr key={f.feature} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-sm text-gray-400 font-mono">#{i + 1}</td>
                      <td className="px-5 py-3 text-sm font-medium text-gray-900">{f.feature}</td>
                      <td className="px-5 py-3 text-sm text-gray-700 font-semibold">{f.count}</td>
                      <td className="px-5 py-3 text-sm text-gray-500">{pct}%</td>
                      <td className="px-5 py-3 w-40">
                        <div className="bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

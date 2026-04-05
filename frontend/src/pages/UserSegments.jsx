import { useEffect, useState } from "react";
import SegmentBadge from "../components/SegmentBadge";
import { getUserSegments } from "../api/analytics";

const SEGMENTS = ["All", "Active", "Medium", "At Risk"];
const PLANS = ["All", "free", "pro", "enterprise"];

export default function UserSegments() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [segmentFilter, setSegmentFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (segmentFilter !== "All") params.segment = segmentFilter;
    if (planFilter !== "All") params.plan_type = planFilter;

    getUserSegments(params)
      .then(({ data }) => setUsers(data))
      .catch(() => setError("Failed to load user segments."))
      .finally(() => setLoading(false));
  }, [segmentFilter, planFilter]);

  const displayed = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Segments</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Engagement-based segmentation of all users
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52"
        />

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {SEGMENTS.map((s) => (
            <button
              key={s}
              onClick={() => setSegmentFilter(s)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                segmentFilter === s
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {PLANS.map((p) => (
            <option key={p} value={p}>
              {p === "All" ? "All plans" : p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>

        <span className="text-xs text-gray-400 ml-auto">
          {displayed.length} user{displayed.length !== 1 ? "s" : ""}
        </span>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {["Email", "Plan", "Segment", "Engagement Score", "Signed Up"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-5 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : displayed.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                  No users match the current filters.
                </td>
              </tr>
            ) : (
              displayed.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 capitalize">
                      {u.plan_type}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <SegmentBadge segment={u.segment} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-20">
                        <div
                          className="h-1.5 rounded-full bg-indigo-500"
                          style={{ width: `${Math.min(100, (u.engagement_score / 20) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-4 text-right">{u.engagement_score}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-400">
                    {new Date(u.signup_date).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

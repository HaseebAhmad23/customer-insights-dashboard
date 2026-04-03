const styles = {
  Active: "bg-green-100 text-green-700",
  Medium: "bg-amber-100 text-amber-700",
  "At Risk": "bg-rose-100 text-rose-700",
};

export default function SegmentBadge({ segment }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${styles[segment] ?? "bg-gray-100 text-gray-600"}`}>
      {segment}
    </span>
  );
}


const statusStyles: Record<string, string> = {
  Draft: "bg-fuchsia-500/20 border border-fuchsia-300 text-fuchsia-100",
  Scheduled: "bg-cyan-500/20 border border-cyan-300 text-cyan-100",
  Published: "bg-lime-500/20 border border-lime-300 text-lime-100",
  Failed: "bg-red-500/20 border border-red-300 text-red-100"
};

export default function StatusBadge({
  status
}: {
  status: string;
}) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em] ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

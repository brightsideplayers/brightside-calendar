<div className="flex items-center justify-between flex-wrap gap-3">
  <div className="flex items-center gap-2">
    <div className="px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-300/20 text-xs uppercase tracking-[0.2em]">
      {item.type === "task"
        ? "Task"
          : item.platform}
    </div>

    <div
         className={`px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em] ${
         item.type === "task"
         ? "bg-amber-500/20 border border-amber-300/20 text-amber-100"
         : "bg-cyan-500/20 border border-cyan-300/20 text-cyan-100"
     }`}
         >
  {item.status}
 </div>

  <div className="text-xs text-cyan-100/50">
    {new Date(
      item.scheduledFor ||
        item.date
    ).toLocaleString()}
  </div>
</div>

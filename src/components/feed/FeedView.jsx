import GlassCard from "../layout/GlassCard";

import {
  doc,
  deleteDoc
} from "firebase/firestore";

import { db } from "../../firebase";

export default function FeedView({
  items
}) {
  const getTaskStatusStyles = (
    status
  ) => {
    switch (status) {
      case "completed":
        return "bg-cyan-400/15 border border-cyan-300/20 text-cyan-100 shadow-[0_0_25px_rgba(34,211,238,0.18)]";

      case "in-progress":
        return "bg-fuchsia-500/15 border border-fuchsia-300/20 text-fuchsia-100 shadow-[0_0_25px_rgba(217,70,239,0.18)]";

      case "blocked":
        return "bg-rose-500/15 border border-rose-300/20 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.18)]";

      default:
        return "bg-amber-400/15 border border-amber-300/20 text-amber-100 shadow-[0_0_25px_rgba(251,191,36,0.18)]";
    }
  };

  const getTaskStatusLabel = (
    status
  ) => {
    switch (status) {
      case "completed":
        return "Completed";

      case "in-progress":
        return "In Progress";

      case "blocked":
        return "Blocked";

      default:
        return "Todo";
    }
  };

  return (
    <div className="grid gap-5">
      <GlassCard>
        <div className="grid gap-4">
          <div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-orange-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              Feed Planner
            </h2>

            <div className="text-cyan-100/70 mt-2">
              Scheduled content &
              production tasks
            </div>
          </div>

          <div className="grid gap-4">
            {items.length ===
              0 && (
              <div className="rounded-[1.8rem] border border-dashed border-white/10 p-10 text-center text-white/40">
                Nothing scheduled
                yet.
              </div>
            )}

            {items
              .slice()
              .reverse()
              .map((item) => (
                <div
                  key={item.id}
                  className={`rounded-[1.8rem] border overflow-hidden backdrop-blur-sm transition-all duration-300 ${
                    item.type ===
                    "task"
                      ? item.taskStatus ===
                        "completed"
                        ? "border-cyan-300/20 bg-cyan-500/10 shadow-[0_0_40px_rgba(34,211,238,0.08)]"
                        : item.taskStatus ===
                          "in-progress"
                        ? "border-fuchsia-300/20 bg-fuchsia-500/10 shadow-[0_0_40px_rgba(217,70,239,0.08)]"
                        : item.taskStatus ===
                          "blocked"
                        ? "border-rose-300/20 bg-rose-500/10 shadow-[0_0_40px_rgba(244,63,94,0.08)]"
                        : "border-amber-300/20 bg-amber-500/10 shadow-[0_0_40px_rgba(251,191,36,0.08)]"
                      : item.platform ===
                        "Facebook"
                      ? "border-cyan-300/20 bg-cyan-500/10 shadow-[0_0_40px_rgba(34,211,238,0.08)]"
                      : "border-fuchsia-300/20 bg-fuchsia-500/10 shadow-[0_0_40px_rgba(217,70,239,0.08)]"
                  }`}
                >
                  {item.imageUrl && (
                    <img
                      src={
                        item.imageUrl
                      }
                      alt=""
                      className="w-full aspect-square object-cover"
                    />
                  )}

                  <div className="p-5 grid gap-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className={`px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,255,255,0.08)] ${
                            item.type ===
                            "task"
                              ? "bg-fuchsia-500/15 border border-fuchsia-300/20 text-fuchsia-100 shadow-[0_0_25px_rgba(217,70,239,0.18)]"
                              : item.platform ===
                                "Facebook"
                              ? "bg-cyan-400/15 border border-cyan-300/20 text-cyan-100 shadow-[0_0_25px_rgba(34,211,238,0.18)]"
                              : "bg-fuchsia-500/15 border border-fuchsia-300/20 text-fuchsia-100 shadow-[0_0_25px_rgba(217,70,239,0.18)]"
                          }`}
                        >
                          {item.platform ||
                             (item.type === "task"
                              ? "Task"
                              : "Post")}
                        </div>

                        <div
                          className={`px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em] ${getTaskStatusStyles(
                            item.taskStatus
                          )}`}
                        >
                          {item.type ===
                          "task"
                            ? getTaskStatusLabel(
                                item.taskStatus
                              )
                            : item.status}
                        </div>
                      </div>

                      <div className="text-xs text-cyan-100/50">
                        {new Date(
                          item.scheduledFor ||
                            item.date
                        ).toLocaleString()}
                      </div>
                    </div>

                    {item.type ===
                    "task" ? (
                      <div className="grid gap-3">
                        <div className="grid gap-2">
                          <div className="text-2xl font-black text-white">
                            {item.title}
                          </div>

                          {item.assignedTo && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="px-3 py-1 rounded-full border border-cyan-300/20 bg-cyan-500/10 text-xs uppercase tracking-[0.2em] text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
                                Assigned To
                              </div>

                              <div className="text-white font-medium">
                                {
                                  item.assignedTo
                                }
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4 text-white/80 leading-relaxed">
                          {item.description?.slice(
                            0,
                            180
                          )}

                          {item.description
                            ?.length >
                            180 && (
                            <span className="text-cyan-300">
                              {" "}
                              ...more
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        <div className="text-xl font-black text-white">
                          Social Post
                        </div>

                        {item.assignedTo && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="px-3 py-1 rounded-full border border-cyan-300/20 bg-cyan-500/10 text-xs uppercase tracking-[0.2em] text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
                              Assigned To
                            </div>

                            <div className="text-white font-medium">
                              {
                                item.assignedTo
                              }
                            </div>
                          </div>
                        )}

                     <div className="text-white/90 whitespace-pre-wrap leading-relaxed">
  {item.caption || item.description}
</div>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {item.type !==
                        "task" && (
                        <button
                          onClick={() =>
                            nnavigator.clipboard.writeText(
  item.caption || item.description
)
                          }
                          className="h-11 px-4 rounded-2xl border border-cyan-300/20 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all"
                        >
                          Copy Caption
                        </button>
                      )}

                      <button
                        onClick={async () => {
                          await deleteDoc(
                            doc(
                              db,
                              "posts",
                              item.id
                            )
                          );
                        }}
                        className="h-11 px-4 rounded-2xl border border-rose-300/20 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

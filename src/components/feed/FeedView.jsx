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
        return "bg-green-500/20 border border-green-300/20 text-green-100";

      case "in-progress":
        return "bg-cyan-500/20 border border-cyan-300/20 text-cyan-100";

      case "blocked":
        return "bg-red-500/20 border border-red-300/20 text-red-100";

      default:
        return "bg-yellow-500/20 border border-yellow-300/20 text-yellow-100";
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
            <h2 className="text-4xl font-black bg-gradient-to-r from-orange-300 to-fuchsia-300 bg-clip-text text-transparent">
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
                  className={`rounded-[1.8rem] border overflow-hidden backdrop-blur-sm transition-all ${
                    item.type ===
                    "task"
                      ? item.taskStatus ===
                        "completed"
                        ? "border-green-300/20 bg-green-500/10"
                        : item.taskStatus ===
                          "in-progress"
                        ? "border-cyan-300/20 bg-cyan-500/10"
                        : item.taskStatus ===
                          "blocked"
                        ? "border-red-300/20 bg-red-500/10"
                        : "border-amber-300/20 bg-amber-500/10"
                      : item.platform ===
                        "Facebook"
                      ? "border-blue-300/20 bg-blue-500/10"
                      : "border-fuchsia-300/20 bg-fuchsia-500/10"
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
                          className={`px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em] ${
                            item.type ===
                            "task"
                              ? "bg-white/10 border border-white/10 text-white"
                              : item.platform ===
                                "Facebook"
                              ? "bg-blue-500/20 border border-blue-300/20 text-blue-100"
                              : "bg-fuchsia-500/20 border border-fuchsia-300/20 text-fuchsia-100"
                          }`}
                        >
                          {item.type ===
                          "task"
                            ? "Task"
                            : item.platform}
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
                        <div className="grid gap-1">
                          <div className="text-2xl font-black text-white">
                            {item.title}
                          </div>

                          {item.assignedTo && (
                            <div className="text-sm text-cyan-200/70">
                              Assigned to{" "}
                              <span className="text-white">
                                {
                                  item.assignedTo
                                }
                              </span>
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
                          <div className="text-sm text-cyan-200/70">
                            Assigned to{" "}
                            <span className="text-white">
                              {
                                item.assignedTo
                              }
                            </span>
                          </div>
                        )}

                        <div className="text-white/90 whitespace-pre-wrap leading-relaxed">
                          {item.caption}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {item.type !==
                        "task" && (
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(
                              item.caption
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
                        className="h-11 px-4 rounded-2xl border border-red-300/20 bg-red-500/10 hover:bg-red-500/20 transition-all"
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

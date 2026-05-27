import { useState } from "react";
import GlassCard from "../layout/GlassCard";

export default function FeedView({
  items,
  setItems
}) {
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [feedFilter, setFeedFilter] = useState("all");

  const deleteItem = (id) => {
    setItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const filteredItems = items.filter((item) => {
    if (feedFilter === "tasks") {
      return item.type === "task";
    }

    if (feedFilter === "social") {
      return item.type !== "task";
    }

    return true;
  });

  return (
    <div className="grid gap-6">
      <GlassCard>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight">
              Feed Planner
            </h2>

            <div className="text-cyan-100/70 mt-2">
              Scheduled content & production tasks
            </div>

            <div className="flex gap-2 flex-wrap mt-4">
              {["all", "tasks", "social"].map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() =>
                      setFeedFilter(filter)
                    }
                    className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-[0.15em] transition-all ${
                      feedFilter === filter
                        ? "bg-cyan-400 text-black shadow-[0_0_25px_rgba(34,211,238,0.35)]"
                        : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {filter}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {filteredItems.length === 0 && (
        <GlassCard>
          <div className="text-center py-12 text-white/50">
            Nothing scheduled here yet.
          </div>
        </GlassCard>
      )}

      {filteredItems
        .slice()
        .reverse()
        .map((item) => (
          <GlassCard key={item.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.15em] ${
                      item.type === "task"
                        ? "bg-orange-400/20 text-orange-200 border border-orange-300/20"
                        : item.platform ===
                          "Instagram"
                        ? "bg-pink-400/20 text-pink-200 border border-pink-300/20"
                        : item.platform ===
                          "Facebook"
                        ? "bg-blue-400/20 text-blue-200 border border-blue-300/20"
                        : item.platform ===
                          "TikTok"
                        ? "bg-cyan-400/20 text-cyan-200 border border-cyan-300/20"
                        : "bg-white/10 text-white/70 border border-white/10"
                    }`}
                  >
                    {item.type === "task"
                      ? "Task"
                      : item.platform ||
                        "Post"}
                  </div>

                  {item.date && (
                    <div className="text-sm text-white/50">
                      {item.date}
                    </div>
                  )}
                </div>

                <div className="text-lg whitespace-pre-wrap leading-relaxed">
                  {item.caption ||
                    item.task ||
                    "Untitled item"}
                </div>

                {item.hashtags && (
                  <div className="mt-4 text-cyan-200/70 text-sm whitespace-pre-wrap">
                    {item.hashtags}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() =>
                    setMenuOpenId(
                      menuOpenId === item.id
                        ? null
                        : item.id
                    )
                  }
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-xl"
                >
                  ⋯
                </button>

                {menuOpenId === item.id && (
                  <div className="absolute right-0 top-12 z-50 w-44 rounded-2xl border border-white/10 bg-[#111827] shadow-2xl overflow-hidden">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setMenuOpenId(null);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-white/10 transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        deleteItem(item.id);
                        setMenuOpenId(null);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-red-500/20 text-red-300 transition"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
    </div>
  );
}

import { useState } from "react";

import GlassCard from "../layout/GlassCard";

export default function PropsView() {
  const [items, setItems] = useState([
    {
      id: 1,
      text: "Captain Hook Sword",
      status: "Needed",
      assignedTo: "",
      location: "",
      notes: "",
      checked: false
    }
  ]);

  const [newProp, setNewProp] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState("Needed");

  const getStatusStyles = (
    status
  ) => {
    switch (status) {
      case "Ready":
        return "border-cyan-300/20 bg-cyan-500/10 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.08)]";

      case "In Progress":
        return "border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100 shadow-[0_0_30px_rgba(217,70,239,0.08)]";

      case "Repair":
        return "border-amber-300/20 bg-amber-500/10 text-amber-100 shadow-[0_0_30px_rgba(251,191,36,0.08)]";

      case "Missing":
        return "border-rose-300/20 bg-rose-500/10 text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.08)]";

      default:
        return "border-white/10 bg-white/5 text-white";
    }
  };

  const addProp = () => {
    if (!newProp.trim())
      return;

    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: newProp,
        status:
          selectedStatus,
        assignedTo: "",
        location: "",
        notes: "",
        checked: false
      }
    ]);

    setNewProp("");

    setSelectedStatus(
      "Needed"
    );
  };

  return (
    <div className="grid gap-5">
      <GlassCard>
        <div className="grid gap-5">
          <div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-300 bg-clip-text text-transparent">
              Props
            </h2>

            <div className="text-cyan-100/60 mt-2">
              Prop inventory &
              production tracking
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_220px_140px] gap-3">
            <input
              value={newProp}
              onChange={(e) =>
                setNewProp(
                  e.target.value
                )
              }
              placeholder="Add prop..."
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
            />

            <select
              value={
                selectedStatus
              }
              onChange={(e) =>
                setSelectedStatus(
                  e.target.value
                )
              }
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            >
              <option>
                Needed
              </option>

              <option>
                In Progress
              </option>

              <option>
                Ready
              </option>

              <option>
                Repair
              </option>

              <option>
                Missing
              </option>
            </select>

            <button
              onClick={addProp}
              className="h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 font-bold hover:scale-[1.02] transition-all"
            >
              Add
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-3">
        {items.map((item) => (
          <GlassCard
            key={item.id}
          >
            <div
              className={`rounded-[1.6rem] border p-4 transition-all ${getStatusStyles(
                item.status
              )}`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="grid gap-3 flex-1 min-w-0">
                  <input
                    value={item.text}
                    onChange={(e) =>
                      setItems(
                        (prev) =>
                          prev.map(
                            (i) =>
                              i.id ===
                              item.id
                                ? {
                                    ...i,
                                    text: e
                                      .target
                                      .value
                                  }
                                : i
                          )
                      )
                    }
                    className="bg-transparent text-xl font-black text-white outline-none"
                  />

                  <div className="flex flex-wrap gap-2">
                    <div
                      className={`px-3 py-1 rounded-full border text-xs uppercase tracking-[0.2em] ${getStatusStyles(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </div>

                    {item.assignedTo && (
                      <div className="px-3 py-1 rounded-full border border-cyan-300/20 bg-cyan-500/10 text-cyan-100 text-xs uppercase tracking-[0.2em]">
                        Assigned:{" "}
                        {
                          item.assignedTo
                        }
                      </div>
                    )}

                    {item.location && (
                      <div className="px-3 py-1 rounded-full border border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100 text-xs uppercase tracking-[0.2em]">
                        {
                          item.location
                        }
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-3 text-white/70 text-sm">
                      {item.notes}
                    </div>
                  )}
                </div>

                <details className="relative shrink-0">
                  <summary className="list-none cursor-pointer w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                    ⋮
                  </summary>

                  <div className="absolute right-0 mt-2 w-56 rounded-[1.4rem] bg-[#071018] border border-white/10 p-2 grid gap-2 z-50 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
                    <input
                      placeholder="Assign to..."
                      value={
                        item.assignedTo
                      }
                      onChange={(e) =>
                        setItems(
                          (prev) =>
                            prev.map(
                              (i) =>
                                i.id ===
                                item.id
                                  ? {
                                      ...i,
                                      assignedTo:
                                        e
                                          .target
                                          .value
                                    }
                                  : i
                            )
                        )
                      }
                      className="h-10 rounded-xl bg-black/30 border border-white/10 px-3 text-sm"
                    />

                    <input
                      placeholder="Location..."
                      value={
                        item.location
                      }
                      onChange={(e) =>
                        setItems(
                          (prev) =>
                            prev.map(
                              (i) =>
                                i.id ===
                                item.id
                                  ? {
                                      ...i,
                                      location:
                                        e
                                          .target
                                          .value
                                    }
                                  : i
                            )
                        )
                      }
                      className="h-10 rounded-xl bg-black/30 border border-white/10 px-3 text-sm"
                    />

                    <textarea
                      placeholder="Notes..."
                      value={item.notes}
                      onChange={(e) =>
                        setItems(
                          (prev) =>
                            prev.map(
                              (i) =>
                                i.id ===
                                item.id
                                  ? {
                                      ...i,
                                      notes:
                                        e
                                          .target
                                          .value
                                    }
                                  : i
                            )
                        )
                      }
                      className="min-h-[80px] rounded-xl bg-black/30 border border-white/10 p-3 text-sm"
                    />

                    <select
                      value={
                        item.status
                      }
                      onChange={(e) =>
                        setItems(
                          (prev) =>
                            prev.map(
                              (i) =>
                                i.id ===
                                item.id
                                  ? {
                                      ...i,
                                      status:
                                        e
                                          .target
                                          .value
                                    }
                                  : i
                            )
                        )
                      }
                      className="h-10 rounded-xl bg-black/30 border border-white/10 px-3 text-sm"
                    >
                      <option>
                        Needed
                      </option>

                      <option>
                        In Progress
                      </option>

                      <option>
                        Ready
                      </option>

                      <option>
                        Repair
                      </option>

                      <option>
                        Missing
                      </option>
                    </select>

                    <button
                      onClick={() =>
                        setItems(
                          (prev) =>
                            prev.filter(
                              (i) =>
                                i.id !==
                                item.id
                            )
                        )
                      }
                      className="h-10 rounded-xl border border-rose-300/20 bg-rose-500/10 text-rose-100"
                    >
                      Delete
                    </button>
                  </div>
                </details>
              </div>
            </div>
          </GlassCard>
        ))}

        {items.length ===
          0 && (
          <GlassCard>
            <div className="rounded-[1.8rem] border border-dashed border-white/10 p-10 text-center text-white/40">
              No props yet.
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}


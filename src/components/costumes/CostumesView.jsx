
import { useState } from "react";
import GlassCard from "../layout/GlassCard";

export default function CostumesView() {
  const [items, setItems] = useState([
  const [newCostume, setNewCostume] =
  useState("");

const [selectedStatus, setSelectedStatus] =
  useState("Needed");
    { id: 1, text: "Prince Costume", checked: false }
  ]);

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <GlassCard key={item.id}>
          <div className="flex justify-between items-center gap-3">
            <input
              value={item.text}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((i) =>
                    i.id === item.id
                      ? { ...i, text: e.target.value }
                      : i
                  )
                )
              }
              className="flex-1 bg-transparent"
            />

            <details className="relative">
              <summary className="list-none cursor-pointer w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center">
                ⋮
              </summary>

              <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-[#111827] border border-white/10 p-2 grid gap-2">
                <button className="h-10 rounded-xl bg-cyan-500/10">
                  Assign
                </button>

                <button
                  onClick={() =>
                    setItems((prev) =>
                      prev.filter((i) => i.id !== item.id)
                    )
                  }
                  className="h-10 rounded-xl bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </details>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

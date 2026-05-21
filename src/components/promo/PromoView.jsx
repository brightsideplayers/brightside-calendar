
import { useState } from "react";
import GlassCard from "../layout/GlassCard";

export default function PromoView() {
  const [items, setItems] = useState([
    {
      id: 1,
      title: "Promo Poster",
      link: "https://placehold.co/600x400"
    }
  ]);

  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {items.map((item) => (
        <GlassCard key={item.id}>
          <div className="grid gap-4">
            <input
              value={item.title}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((p) =>
                    p.id === item.id
                      ? { ...p, title: e.target.value }
                      : p
                  )
                )
              }
              className="h-11 rounded-2xl bg-black/30 border border-white/10 px-4"
            />

            <img
              src={item.link}
              alt={item.title}
              className="rounded-3xl"
            />

            <button
              onClick={() =>
                setItems((prev) =>
                  prev.filter((p) => p.id !== item.id)
                )
              }
              className="h-11 rounded-2xl bg-red-500/10 border border-red-300/20"
            >
              Delete Promo
            </button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

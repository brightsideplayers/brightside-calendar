import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";

import GlassCard from "../layout/GlassCard";

export default function QuickAddModal({
  quickAddDate,
  setQuickAddDate
}) {
  const [caption, setCaption] = useState("");

  const [imageUrl, setImageUrl] = useState("");

  const [platform, setPlatform] = useState("Instagram");

  const handleSave = async () => {
    if (!caption.trim()) return;

    await addDoc(collection(db, "posts"), {
      caption,
      platform,
      imageUrl,
      date: quickAddDate.toISOString(),
      status: "Scheduled",
      createdAt: Date.now()
    });

    setCaption("");

    setImageUrl("");

    setPlatform("Instagram");

    setQuickAddDate(null);
  };

  if (!quickAddDate) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-2xl border-fuchsia-300/20">
        <div className="grid gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
              Quick Add
            </h2>

            <button
              onClick={() => setQuickAddDate(null)}
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10"
            >
              ✕
            </button>
          </div>

          <div className="text-cyan-100">
            {quickAddDate.toLocaleDateString()}
          </div>

          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
          >
            <option>Instagram</option>

            <option>Facebook</option>

            <option>TikTok</option>

            <option>YouTube</option>
          </select>

          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste IMGUR direct image link..."
            className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
          />

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write your caption or task..."
            className="min-h-[180px] rounded-[1.8rem] bg-black/30 border border-white/10 p-5"
          />

          <button
            onClick={handleSave}
            className="h-14 rounded-[1.4rem] bg-gradient-to-r from-orange-400 to-fuchsia-500 font-black text-white hover:scale-[1.01] transition-all"
          >
            Save To Calendar
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

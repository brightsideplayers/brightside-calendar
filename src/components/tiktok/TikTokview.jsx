
import { useState } from "react";
import GlassCard from "../layout/GlassCard";

export default function TikTokView() {
  const [caption, setCaption] = useState("");

  const hashtags = [
    "#Pantomime",
    "#StageLife",
    "#ComedyTheatre"
  ];

  const hashtagString = hashtags.join(" ");

  return (
    <GlassCard>
      <div className="grid gap-5">
        <h2 className="text-4xl font-black">
          TikTok Dashboard
        </h2>

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write TikTok caption..."
          className="min-h-[180px] rounded-3xl bg-black/30 border border-white/10 p-5"
        />

        <div className="rounded-3xl border border-fuchsia-300/20 bg-fuchsia-500/10 p-5">
          <div className="mb-3">
            Suggested Hashtags ({hashtagString.length} chars)
          </div>

          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag) => (
              <div
                key={tag}
                className="px-3 py-2 rounded-2xl bg-black/30 border border-white/10"
              >
                {tag}
              </div>
            ))}
          </div>

          <button
            onClick={() =>
              navigator.clipboard.writeText(hashtagString)
            }
            className="mt-4 h-11 px-5 rounded-2xl bg-cyan-500/10 border border-cyan-300/20"
          >
            Copy Hashtags
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

import { useState } from "react";

import {
  collection,
  addDoc
} from "firebase/firestore";

import { db } from "../../firebase";

import GlassCard from "../layout/GlassCard";

export default function TikTokView() {
  const [caption, setCaption] =
    useState("");

  const [videoLink, setVideoLink] =
    useState("");
  const [
  scheduledDate,
  setScheduledDate
] = useState("");

  const [selectedPreset, setSelectedPreset] =
    useState("Show Promo");

  const hashtagPresets = {
    "Show Promo": [
      "#TheLittleMermaid",
      "#BrightsidePlayers",
      "#CommunityTheatre",
      "#MusicalTheatre",
      "#LiveTheatre"
    ],

    Comedy: [
      "#TheatreKids",
      "#Backstage",
      "#Comedy",
      "#Rehearsal",
      "#Chaos"
    ],

    "Behind the Scenes": [
      "#BTS",
      "#BackstageLife",
      "#TheatreMagic",
      "#Costumes",
      "#StageLife"
    ],

    Cast: [
      "#CastLife",
      "#Musical",
      "#Performers",
      "#TheatreTok",
      "#Actors"
    ]
  };

  return (
    <div className="grid gap-5">
      <GlassCard>
  <div className="grid gap-4">
    <div className="text-sm uppercase tracking-[0.25em] text-cyan-200/50">
      Schedule TikTok
    </div>

    <input
      type="datetime-local"
      value={scheduledDate}
      onChange={(e) =>
        setScheduledDate(
          e.target.value
        )
      }
      className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
    />

    <div className="text-sm text-cyan-100/50">
      Choose when this TikTok
      should appear in your
      production calendar.
    </div>
  </div>
</GlassCard>

      <GlassCard>
        <div className="grid gap-4">
          <div className="text-sm uppercase tracking-[0.25em] text-cyan-200/50">
            TikTok Posting Checklist
          </div>

          <div className="grid gap-3">
            {[
              "Strong first 3 seconds",
              "Captions added",
              "Thumbnail checked",
              "Vertical framing",
              "Hashtags added",
              "Audio tested"
            ].map((item) => (
              <label
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-fuchsia-500"
                />

                <span className="text-white/80">
                  {item}
                </span>
              </label>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

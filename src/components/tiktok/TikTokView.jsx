import { useState } from "react";

import GlassCard from "../layout/GlassCard";

export default function TikTokView() {
  const [caption, setCaption] =
    useState("");

  const [videoLink, setVideoLink] =
    useState("");

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
        <div className="grid gap-5">
          <div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
              TikTok Studio
            </h2>

            <div className="text-cyan-100/60 mt-2">
              Short-form content &
              caption builder
            </div>
          </div>

          <div className="grid gap-3">
            <select
              value={selectedPreset}
              onChange={(e) => {
                const preset =
                  e.target.value;

                setSelectedPreset(
                  preset
                );

                setCaption(
                  hashtagPresets[
                    preset
                  ].join(" ")
                );
              }}
              className="h-12 rounded-2xl bg-black/30 border border-fuchsia-300/20 px-4 text-white"
            >
              {Object.keys(
                hashtagPresets
              ).map((preset) => (
                <option
                  key={preset}
                >
                  {preset}
                </option>
              ))}
            </select>

            <textarea
              value={caption}
              onChange={(e) =>
                setCaption(
                  e.target.value
                )
              }
              placeholder="Write TikTok caption..."
              className="min-h-[180px] rounded-[1.8rem] bg-black/30 border border-white/10 p-5"
            />

            <input
              value={videoLink}
              onChange={(e) =>
                setVideoLink(
                  e.target.value
                )
              }
              placeholder="Paste TikTok draft/video link..."
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
            />

            <div className="grid md:grid-cols-2 gap-3">
              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    caption
                  )
                }
                className="h-12 rounded-2xl border border-cyan-300/20 bg-cyan-500/10 text-cyan-100 font-bold"
              >
                Copy Caption
              </button>

              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    hashtagPresets[
                      selectedPreset
                    ].join(" ")
                  )
                }
                className="h-12 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100 font-bold"
              >
                Copy Hashtags
              </button>
            </div>
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

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

  const [
    selectedPreset,
    setSelectedPreset
  ] = useState("Show Promo");

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

            <button
              onClick={async () => {
                await addDoc(
                  collection(
                    db,
                    "posts"
                  ),
                  {
                    type: "post",
                    status: "scheduled",

                    category:
                      "TikTok",

                    platform:
                      "TikTok",

                    title:
                      selectedPreset,

                    description:
                      caption,

                    videoLink,

                    taskStatus:
                      "in-progress",

                    completed:
                      false,

                    date:
  scheduledDate
    ? new Date(
        scheduledDate
      ).toISOString()
    : new Date().toISOString(),

scheduledFor:
  scheduledDate
    ? new Date(
        scheduledDate
      ).toISOString()
    : new Date().toISOString(),

                    createdAt:
                      Date.now()
                  }
                );

                setCaption("");

                setVideoLink("");

                setScheduledDate("");
              }}
              className="h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-bold hover:scale-[1.02] transition-all"
            >
              Save To Planner
            </button>

            <div className="grid grid-cols-2 gap-3">
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
    </div>
  );
}

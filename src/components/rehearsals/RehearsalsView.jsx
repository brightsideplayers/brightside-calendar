import { useState } from "react";

import GlassCard from "../layout/GlassCard";

export default function RehearsalsView() {
  const [rehearsals] = useState([
    {
      id: 1,
      title: "Blocking Rehearsal",
      date: "Tonight",
      time: "6:00 PM – 9:00 PM",
      location: "Studio B",
      type: "Blocking",
      scenes: "Act 1 • Scenes 1–3",
      called: "Ariel • Eric • Sebastian",
      notes: "Bring scripts and pencils."
    },
    {
      id: 2,
      title: "Choreography",
      date: "Tomorrow",
      time: "7:00 PM – 10:00 PM",
      location: "Main Hall",
      type: "Choreo",
      scenes: "Under the Sea",
      called: "Full Ensemble",
      notes: "Wear comfortable shoes."
    }
  ]);

  const nextRehearsal = rehearsals[0];
  const upcomingRehearsals = rehearsals.slice(1);

  return (
    <div className="grid gap-5">
      <GlassCard>
        <div className="grid gap-2">
          <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-300 bg-clip-text text-transparent">
            Rehearsals
          </h2>

          <div className="text-cyan-100/60">
            Callboard, rehearsal schedule & notes
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="rounded-[1.7rem] border border-cyan-300/20 bg-cyan-500/10 p-5 grid gap-4 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-100/60">
            Next Up
          </div>

          <div>
            <h3 className="text-3xl font-black text-white">
              {nextRehearsal.title}
            </h3>

            <div className="text-cyan-100/70 mt-1">
              {nextRehearsal.date} • {nextRehearsal.time}
            </div>
          </div>

          <div className="grid gap-2 text-sm">
            <div className="rounded-2xl bg-black/20 border border-white/10 p-3">
              <span className="text-white/40">Location: </span>
              {nextRehearsal.location}
            </div>

            <div className="rounded-2xl bg-black/20 border border-white/10 p-3">
              <span className="text-white/40">Scenes: </span>
              {nextRehearsal.scenes}
            </div>

            <div className="rounded-2xl bg-black/20 border border-white/10 p-3">
              <span className="text-white/40">Called: </span>
              {nextRehearsal.called}
            </div>

            <div className="rounded-2xl bg-black/20 border border-white/10 p-3">
              <span className="text-white/40">Notes: </span>
              {nextRehearsal.notes}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-3">
        <div className="text-sm uppercase tracking-[0.25em] text-white/40 px-1">
          Upcoming
        </div>

        {upcomingRehearsals.map((rehearsal) => (
          <GlassCard key={rehearsal.id}>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 grid gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-fuchsia-100/60">
                    {rehearsal.date}
                  </div>

                  <h3 className="text-xl font-black text-white mt-1">
                    {rehearsal.title}
                  </h3>
                </div>

                <div className="px-3 py-1 rounded-full border border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100 text-xs">
                  {rehearsal.type}
                </div>
              </div>

              <div className="text-white/60 text-sm">
                {rehearsal.time} • {rehearsal.location}
              </div>

              <div className="text-white/70 text-sm">
                {rehearsal.scenes}
              </div>

              <div className="text-cyan-100/70 text-sm">
                Called: {rehearsal.called}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

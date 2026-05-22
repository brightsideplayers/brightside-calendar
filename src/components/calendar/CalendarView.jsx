import {
  doc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "../../firebase";
import { useState } from "react";
import GlassCard from "../layout/GlassCard";

export default function CalendarView({
  items,
  openCalendarQuickAdd
}) {
  const [calendarDate, setCalendarDate] =
    useState(new Date());

  const today = new Date();

  const currentMonth =
    calendarDate.getMonth();

  const currentYear =
    calendarDate.getFullYear();

  const firstDay = new Date(
    currentYear,
    currentMonth,
    1
  ).getDay();

  const daysInMonth = new Date(
    currentYear,
    currentMonth + 1,
    0
  ).getDate();

  const calendarDays = [
    ...Array(firstDay).fill(null),

    ...Array.from(
      { length: daysInMonth },
      (_, i) => i + 1
    )
  ];

  const changeMonth = (direction) => {
    setCalendarDate((prev) => {
      const next = new Date(prev);

      next.setMonth(
        prev.getMonth() + direction
      );

      return next;
    });
  };

  const handleDrop = async (e, day) => {
    const id =
      e.dataTransfer.getData("eventId");

    const droppedDate = new Date(
      currentYear,
      currentMonth,
      day
    );

    await updateDoc(
      doc(db, "posts", id),
      {
        date: droppedDate.toISOString()
      }
    );
  };

  return (
    <GlassCard>
      <div className="grid gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl leading-tight pb-2 font-black bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
            Content Calendar
          </h2>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                changeMonth(-1)
              }
              className="w-10 h-10 rounded-2xl border border-white/10 bg-white/5"
            >
              ←
            </button>

            <div className="text-cyan-100 font-bold">
              {calendarDate.toLocaleString(
                "default",
                {
                  month: "long",
                  year: "numeric"
                }
              )}
            </div>

            <button
              onClick={() =>
                changeMonth(1)
              }
              className="w-10 h-10 rounded-2xl border border-white/10 bg-white/5"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3 text-center text-xs uppercase tracking-[0.2em] text-cyan-200/50">
          {[
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat"
          ].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3">
          {calendarDays.map((day, i) => {
            const matchingPosts =
              items.filter((item) => {
                if 
                  (!item.scheduledFor || !day
                )
                  return false;

                const itemDate =
                 new Date(
                     item.scheduledFor || item.date
);

                return (
                  itemDate.getDate() ===
                    day &&
                  itemDate.getMonth() ===
                    currentMonth &&
                  itemDate.getFullYear() ===
                    currentYear
                );
              });

            return (
              <div
                key={i}
                onDragOver={(e) =>
                  e.preventDefault()
                }
                onDrop={(e) =>
                  handleDrop(e, day)
                }
                className={`min-h-[160px] rounded-[1.8rem] border p-3 transition-all relative overflow-hidden ${
                  day ===
                    today.getDate() &&
                  currentMonth ===
                    today.getMonth() &&
                  currentYear ===
                    today.getFullYear()
                    ? "border-fuchsia-300 shadow-[0_0_24px_rgba(236,72,153,0.45)] bg-fuchsia-500/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-bold text-cyan-100">
                    {day || ""}
                  </div>

                  {day && (
                    <button
                      onClick={() =>
                        openCalendarQuickAdd(
                          day
                        )
                      }
                      className="w-8 h-8 rounded-xl border border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100 text-lg font-bold hover:scale-105 transition-all"
                    >
                      +
                    </button>
                  )}
                </div>

                <div className="grid gap-2 max-h-[140px] overflow-hidden">
                  {matchingPosts
                    .slice(0, 2)
                    .map((post) => (
                      <div
                        key={post.id}
                        draggable
                        onDragStart={(e) =>
                          e.dataTransfer.setData(
                            "eventId",
                            post.id
                          )
                        }
                        className="group relative rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-2 text-xs cursor-move overflow-hidden transition-all hover:border-cyan-200 hover:shadow-[0_0_16px_rgba(34,211,238,0.25)]"
                      >
                        <button
                          onClick={async (
                            e
                          ) => {
                            e.stopPropagation();

                            await deleteDoc(
                              doc(
                                db,
                                "posts",
                                post.id
                              )
                            );
                          }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-yellow-400 text-black text-[10px] font-black opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all flex items-center justify-center z-10"
                        >
                          ✕
                        </button>

                        <div className="font-bold text-cyan-100 truncate pr-6">
                          {post.platform ||
                            "Task"}
                        </div>

                        <div className="text-white/70 truncate">
                          {post.caption?.slice(
                            0,
                            24
                          )}
                        </div>
                      </div>
                    ))}

                  {matchingPosts.length >
                    2 && (
                    <button className="h-9 rounded-2xl border border-white/10 bg-white/5 text-cyan-100 text-xs hover:bg-white/10 transition-all">
                      +
                      {matchingPosts.length -
                        2}{" "}
                      more...
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}

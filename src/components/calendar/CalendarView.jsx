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

  const [selectedDay, setSelectedDay] =
    useState(null);

  const [selectedDayItems, setSelectedDayItems] =
    useState([]);

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

  const handleDrop = async (
    e,
    day
  ) => {
    e.preventDefault();

    const id =
      e.dataTransfer.getData(
        "eventId"
      );

    if (!id || !day) return;

    const droppedDate =
      new Date(
        currentYear,
        currentMonth,
        day
      );

    await updateDoc(
      doc(db, "posts", id),
      {
        scheduledFor:
          droppedDate.toISOString()
      }
    );
  };

  return (
    <>
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
              <div key={day}>
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3">
            {calendarDays.map(
              (day, i) => {
                const matchingPosts =
                  items.filter(
                    (item) => {
                      if (
                        !(
                          item.scheduledFor ||
                          item.date
                        ) ||
                        !day
                      ) {
                        return false;
                      }

                      const itemDate =
                        new Date(
                          item.scheduledFor ||
                            item.date
                        );

                      return (
                        itemDate.getDate() ===
                          day &&
                        itemDate.getMonth() ===
                          currentMonth &&
                        itemDate.getFullYear() ===
                          currentYear
                      );
                    }
                  );

                return (
                  <div
                    key={i}
                    onDragOver={(e) =>
                      e.preventDefault()
                    }
                    onDrop={(e) =>
                      handleDrop(
                        e,
                        day
                      )
                    }
                    onClick={() => {
                      if (!day) return;

                      setSelectedDay(
                        new Date(
                          currentYear,
                          currentMonth,
                          day
                        )
                      );

                      setSelectedDayItems(
                        matchingPosts
                      );
                    }}
                    className={`min-h-[170px] rounded-[1.8rem] border p-3 transition-all relative overflow-hidden cursor-pointer hover:scale-[1.01] ${
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
                          onClick={(e) => {
                            e.stopPropagation();

                            openCalendarQuickAdd(
                              day
                            );
                          }}
                          className="w-8 h-8 rounded-xl border border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100 text-lg font-bold hover:scale-105 transition-all"
                        >
                          +
                        </button>
                      )}
                    </div>

                    <div className="grid gap-2">
                      {matchingPosts
                        .slice(0, 2)
                        .map((post) => (
                          <div
                            key={post.id}
                            draggable
                            onDragStart={(
                              e
                            ) =>
                              e.dataTransfer.setData(
                                "eventId",
                                post.id
                              )
                            }
                            className={`group relative rounded-2xl p-2 text-xs overflow-hidden transition-all ${
                              post.type ===
                              "task"
                                ? "border border-amber-300/20 bg-amber-400/10"
                                : "border border-cyan-300/20 bg-cyan-400/10"
                            }`}
                          >
                            <div
                              className={`font-bold truncate pr-6 ${
                                post.type ===
                                "task"
                                  ? "text-amber-200"
                                  : "text-cyan-100"
                              }`}
                            >
                              {post.type ===
                              "task"
                                ? post.title
                                : post.platform}
                            </div>

                            <div className="text-white/70 truncate">
                              {post.type ===
                              "task"
                                ? post.description
                                : post.caption?.slice(
                                    0,
                                    32
                                  )}
                            </div>
                          </div>
                        ))}

                      {matchingPosts.length >
                        2 && (
                        <div className="h-9 rounded-2xl border border-white/10 bg-white/5 text-cyan-100 text-xs flex items-center justify-center">
                          +
                          {matchingPosts.length -
                            2}{" "}
                          more
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </GlassCard>

      {selectedDay && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-[#071018] p-6 grid gap-5 relative shadow-[0_0_60px_rgba(0,255,255,0.08)] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setSelectedDay(null);

                setSelectedDayItems([]);
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-yellow-400 text-black font-black text-xl shadow-[0_0_20px_rgba(250,204,21,0.75)] hover:scale-110 transition-all"
            >
              ✕
            </button>

            <div className="grid gap-2">
              <div className="text-xs uppercase tracking-[0.3em] text-cyan-300/60">
                Daily Agenda
              </div>

              <h2 className="text-4xl font-black text-cyan-100">
                {selectedDay.toLocaleDateString()}
              </h2>
            </div>

            <div className="grid gap-4">
              {selectedDayItems.map(
                (item) => (
                  <div
                    key={item.id}
                    className={`rounded-[1.8rem] border p-5 grid gap-4 relative ${
                      item.type ===
                      "task"
                        ? "border-amber-300/20 bg-amber-500/10"
                        : "border-cyan-300/20 bg-cyan-500/10"
                    }`}
                  >
                    <button
                      onClick={async () => {
                        await deleteDoc(
                          doc(
                            db,
                            "posts",
                            item.id
                          )
                        );

                        setSelectedDayItems(
                          (
                            prev
                          ) =>
                            prev.filter(
                              (
                                p
                              ) =>
                                p.id !==
                                item.id
                            )
                        );
                      }}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-yellow-400 text-black text-sm font-black shadow-[0_0_20px_rgba(250,204,21,0.75)]"
                    >
                      ✕
                    </button>

                    <div className="grid gap-1">
                      <div className="text-xs uppercase tracking-[0.25em] text-white/50">
                        {item.type ===
                        "task"
                          ? "Task"
                          : item.platform}
                      </div>

                      <div
                        className={`text-2xl font-black ${
                          item.type ===
                          "task"
                            ? "text-amber-200"
                            : "text-cyan-100"
                        }`}
                      >
                        {item.type ===
                        "task"
                          ? item.title
                          : "Social Post"}
                      </div>
                    </div>

                    {item.imageUrl && (
                      <img
                        src={
                          item.imageUrl
                        }
                        alt=""
                        className="w-full rounded-[1.5rem] border border-white/10"
                      />
                    )}

                    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 whitespace-pre-wrap leading-relaxed text-white/80">
                      {item.type ===
                      "task"
                        ? item.description
                        : item.caption}
                    </div>

                    {item.assignedTo && (
                      <div className="text-sm text-cyan-200/70">
                        Assigned to:{" "}
                        <span className="text-white">
                          {
                            item.assignedTo
                          }
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-cyan-100/40">
                      {new Date(
                        item.scheduledFor
                      ).toLocaleString()}
                    </div>
                  </div>
                )
              )}

              {selectedDayItems.length ===
                0 && (
                <div className="rounded-[1.8rem] border border-dashed border-white/10 p-10 text-center text-white/40">
                  Nothing scheduled.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

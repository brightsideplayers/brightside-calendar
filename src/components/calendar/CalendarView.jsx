import { useMemo, useState } from "react";

import {
  doc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "../../firebase";

export default function CalendarView({
  posts = [],
  openCalendarQuickAdd
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayItems, setSelectedDayItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  const today = new Date();

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const monthNames = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();

  const calendarDays = useMemo(() => {
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [startDay, daysInMonth]);

  const formatDateTimeLocal = (value) => {
    if (!value) return "";

    const date = new Date(value);

    date.setMinutes(
      date.getMinutes() - date.getTimezoneOffset()
    );

    return date.toISOString().slice(0, 16);
  };

  const selectedDateLabel = selectedDay
    ? new Date(year, month, selectedDay).toLocaleDateString(
        undefined,
        {
          weekday: "long",
          month: "long",
          day: "numeric"
        }
      )
    : "";

  const getPostsForDay = (day) => {
    if (!day) return [];

    return posts.filter((post) => {
      const rawDate = post.date || post.scheduledFor;

      if (!rawDate) return false;

      const postDate = new Date(rawDate);

      return (
        postDate.getDate() === day &&
        postDate.getMonth() === month &&
        postDate.getFullYear() === year
      );
    });
  };

  const openDay = (day) => {
    setSelectedDay(day);
    setSelectedDayItems(getPostsForDay(day));
    setEditingId(null);
    setEditDraft({});
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const deleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, "posts", id));

      setSelectedDayItems((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (item) => {
    const rawDate = item.date || item.scheduledFor;

    setEditingId(item.id);

    setEditDraft({
      type: item.type || "post",
      title: item.title || "",
      caption: item.caption || item.description || "",
      platform: item.platform || "Instagram",
      assignedTo: item.assignedTo || "",
      taskStatus: item.taskStatus || "todo",
      tiktokLink: item.tiktokLink || "",
      scheduledDate: formatDateTimeLocal(rawDate)
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
  };

  const saveEdit = async (item) => {
    const finalDate = editDraft.scheduledDate
      ? new Date(editDraft.scheduledDate)
      : new Date();

    const updates =
      item.type === "task"
        ? {
            title: editDraft.title,
            description: editDraft.caption,
            assignedTo: editDraft.assignedTo,
            taskStatus: editDraft.taskStatus,
            date: finalDate.toISOString(),
            scheduledFor: finalDate.toISOString()
          }
        : {
            caption: editDraft.caption,
            platform: editDraft.platform,
            assignedTo: editDraft.assignedTo,
            tiktokLink:
              editDraft.platform === "TikTok"
                ? editDraft.tiktokLink
                : "",
            date: finalDate.toISOString(),
            scheduledFor: finalDate.toISOString()
          };

    try {
      await updateDoc(
        doc(db, "posts", item.id),
        updates
      );

      const updatedItem = {
        ...item,
        ...updates
      };

      const updatedDate = new Date(
        updatedItem.date || updatedItem.scheduledFor
      );

      const stillOnThisDay =
        updatedDate.getDate() === selectedDay &&
        updatedDate.getMonth() === month &&
        updatedDate.getFullYear() === year;

      setSelectedDayItems((prev) =>
        stillOnThisDay
          ? prev.map((i) =>
              i.id === item.id ? updatedItem : i
            )
          : prev.filter((i) => i.id !== item.id)
      );

      setEditingId(null);
      setEditDraft({});
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full min-w-0 pb-28 sm:pb-32 overflow-x-hidden">
      <div className="grid gap-5 sm:gap-6 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0">
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white flex items-center gap-3">
              <span className="text-cyan-400">
                📅
              </span>
              Calendar
            </h1>

            <p className="text-white/50 mt-2 text-sm sm:text-base">
              Schedule your productions, social posts & rehearsal tasks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={previousMonth}
              className="flex-1 sm:flex-none h-11 sm:w-11 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center"
            >
              ←
            </button>

            <button
              onClick={nextMonth}
              className="flex-1 sm:flex-none h-11 sm:w-11 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center"
            >
              →
            </button>
          </div>
        </div>

        <div className="min-w-0">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-200 bg-clip-text text-transparent break-words">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3 min-w-0">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-white/50 text-[10px] sm:text-xs md:text-base font-bold py-1 sm:py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3 min-w-0">
          {calendarDays.map((day, index) => {
            const items = getPostsForDay(day);

            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            return (
              <button
                key={index}
                onClick={() => {
                  if (!day) return;
                  openDay(day);
                }}
                className={`relative h-[78px] sm:h-[115px] md:h-[180px] rounded-xl sm:rounded-[1.2rem] md:rounded-[1.5rem] p-1.5 sm:p-2 md:p-3 text-left overflow-hidden transition-all min-w-0 ${
                  day
                    ? isToday
                      ? "bg-cyan-500/[0.08] border border-cyan-300/20 shadow-[0_0_25px_rgba(34,211,238,0.18)]"
                      : "bg-[#060b16] border border-white/[0.06] hover:bg-cyan-500/[0.04]"
                    : "bg-transparent border border-transparent"
                }`}
              >
                {day && (
                  <>
                    <div
                      className={`text-sm sm:text-lg md:text-2xl font-black ${
                        isToday
                          ? "text-cyan-300"
                          : "text-white"
                      }`}
                    >
                      {day}
                    </div>

                    <div className="grid gap-1 mt-1 sm:mt-2">
                      {items.slice(0, 2).map((item, idx) => (
                        <div
                          key={idx}
                          className={`rounded-md px-1.5 py-0.5 text-[9px] sm:text-[11px] md:text-xs truncate border ${
                            item.type === "task"
                              ? "bg-violet-500/20 border-violet-300/20 text-violet-100"
                              : item.platform === "Instagram"
                              ? "bg-fuchsia-500/20 border-fuchsia-300/20 text-fuchsia-100"
                              : item.platform === "Facebook"
                              ? "bg-cyan-500/20 border-cyan-300/20 text-cyan-100"
                              : item.platform === "TikTok"
                              ? "bg-gradient-to-r from-[#111111] to-cyan-500/20 border-cyan-300/20 text-cyan-100"
                              : item.platform === "YouTube"
                              ? "bg-red-500/20 border-red-300/20 text-red-100"
                              : "bg-white/10 border-white/10 text-white"
                          }`}
                        >
                          {item.platform || item.title || "Post"}
                        </div>
                      ))}

                      {items.length > 2 && (
                        <div className="text-[9px] sm:text-[11px] text-cyan-300 font-semibold">
                          +{items.length - 2}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => {
          const today = new Date();

          if (openCalendarQuickAdd) {
            openCalendarQuickAdd(today.getDate());
          }
        }}
        className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-[90] w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-black text-3xl sm:text-5xl font-light shadow-[0_0_40px_rgba(34,211,238,0.45)] hover:scale-105 transition-all flex items-center justify-center"
      >
        +
      </button>

      {selectedDay && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl overflow-y-auto p-3 sm:p-4 flex items-start md:items-center justify-center">
          <div className="w-full md:max-w-3xl bg-[#071018] border border-white/10 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 relative max-h-[92vh] overflow-y-auto shadow-[0_0_60px_rgba(0,255,255,0.08)]">
            <button
              onClick={() => {
                setSelectedDay(null);
                setSelectedDayItems([]);
                setEditingId(null);
                setEditDraft({});
              }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 rounded-full bg-cyan-400 text-black font-black text-xl hover:scale-110 transition-all"
            >
              ✕
            </button>

            <div className="mb-5 sm:mb-6 pr-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
                {selectedDateLabel}
              </h2>

              <p className="text-white/50 mt-2">
                {selectedDayItems.length} scheduled item
                {selectedDayItems.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid gap-4 pb-6">
              {selectedDayItems.length > 0 ? (
                selectedDayItems.map((item, index) => {
                  const isEditing = editingId === item.id;

                  return (
                    <div
                      key={index}
                      className="rounded-[1.3rem] sm:rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 sm:p-5 grid gap-4 min-w-0"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
                        <div className="px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-xs sm:text-sm font-bold uppercase w-fit">
                          {item.platform || item.type || "POST"}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          {(item.date || item.scheduledFor) && (
                            <div className="text-sm text-white/50">
                              {new Date(
                                item.date || item.scheduledFor
                              ).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit"
                              })}
                            </div>
                          )}

                          {!isEditing && (
                            <button
                              onClick={() => startEdit(item)}
                              className="h-8 px-3 rounded-full bg-cyan-400/15 border border-cyan-300/20 text-cyan-100 text-xs font-bold hover:bg-cyan-400/25 transition-all"
                            >
                              Edit
                            </button>
                          )}

                          <button
                            onClick={() => deleteItem(item.id)}
                            className="w-8 h-8 rounded-full bg-yellow-400/15 border border-yellow-300/20 text-yellow-200 text-sm font-black hover:bg-yellow-400/25 hover:scale-110 transition-all flex items-center justify-center"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="grid gap-3">
                          {item.type === "task" && (
                            <input
                              value={editDraft.title}
                              onChange={(e) =>
                                setEditDraft((prev) => ({
                                  ...prev,
                                  title: e.target.value
                                }))
                              }
                              placeholder="Task title..."
                              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white min-w-0"
                            />
                          )}

                          {item.type !== "task" && (
                            <select
                              value={editDraft.platform}
                              onChange={(e) =>
                                setEditDraft((prev) => ({
                                  ...prev,
                                  platform: e.target.value
                                }))
                              }
                              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white min-w-0"
                            >
                              <option>Instagram</option>
                              <option>Facebook</option>
                              <option>TikTok</option>
                              <option>YouTube</option>
                            </select>
                          )}

                          <input
                            type="datetime-local"
                            value={editDraft.scheduledDate}
                            onChange={(e) =>
                              setEditDraft((prev) => ({
                                ...prev,
                                scheduledDate: e.target.value
                              }))
                            }
                            className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white min-w-0"
                          />

                          <input
                            value={editDraft.assignedTo}
                            onChange={(e) =>
                              setEditDraft((prev) => ({
                                ...prev,
                                assignedTo: e.target.value
                              }))
                            }
                            placeholder="Assigned to..."
                            className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white min-w-0"
                          />

                          {item.type === "task" && (
                            <select
                              value={editDraft.taskStatus}
                              onChange={(e) =>
                                setEditDraft((prev) => ({
                                  ...prev,
                                  taskStatus: e.target.value
                                }))
                              }
                              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white min-w-0"
                            >
                              <option value="todo">🟣 Todo</option>
                              <option value="in-progress">🔵 In Progress</option>
                              <option value="completed">🟢 Completed</option>
                              <option value="blocked">🔴 Blocked</option>
                            </select>
                          )}

                          {editDraft.platform === "TikTok" &&
                            item.type !== "task" && (
                              <input
                                value={editDraft.tiktokLink}
                                onChange={(e) =>
                                  setEditDraft((prev) => ({
                                    ...prev,
                                    tiktokLink: e.target.value
                                  }))
                                }
                                placeholder="TikTok link..."
                                className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white min-w-0"
                              />
                            )}

                          <textarea
                            value={editDraft.caption}
                            onChange={(e) =>
                              setEditDraft((prev) => ({
                                ...prev,
                                caption: e.target.value
                              }))
                            }
                            placeholder={
                              item.type === "task"
                                ? "Task description..."
                                : "Caption..."
                            }
                            className="min-h-[150px] rounded-[1.5rem] bg-black/30 border border-white/10 p-4 text-white min-w-0"
                          />

                          <div className="grid grid-cols-1 sm:flex sm:justify-end gap-3">
                            <button
                              onClick={cancelEdit}
                              className="h-11 px-5 rounded-xl bg-white/5 border border-white/10 text-white/70"
                            >
                              Cancel
                            </button>

                            <button
                              onClick={() => saveEdit(item)}
                              className="h-11 px-5 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-black"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {item.title && (
                            <h3 className="text-xl sm:text-2xl font-black text-white break-words">
                              {item.title}
                            </h3>
                          )}

                          {(item.caption || item.description) && (
                            <div className="rounded-2xl bg-black/20 border border-white/5 p-4 text-white/80 whitespace-pre-wrap leading-relaxed break-words">
                              {item.caption || item.description}
                            </div>
                          )}

                          {item.tiktokLink && (
                            <a
                              href={item.tiktokLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-300 underline underline-offset-4 break-all"
                            >
                              {item.tiktokLink}
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="rounded-[1.5rem] sm:rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-6 sm:p-12 text-center grid gap-5">
                  <h3 className="text-2xl font-black text-white">
                    Nothing Scheduled
                  </h3>

                  <p className="text-white/50 mt-2">
                    There are no scheduled posts or tasks for this day.
                  </p>

                  <button
                    onClick={() => {
                      if (openCalendarQuickAdd) {
                        openCalendarQuickAdd(selectedDay);
                        setSelectedDay(null);
                      }
                    }}
                    className="mx-auto h-14 px-6 sm:px-8 rounded-[1.4rem] bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-orange-400 font-black text-white hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(217,70,239,0.25)]"
                  >
                    + Add Post / Task
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

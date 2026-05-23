import {
  useState,
  useEffect
} from "react";

import {
  collection,
  addDoc
} from "firebase/firestore";

import { db } from "../../firebase";

import GlassCard from "../layout/GlassCard";

export default function QuickAddModal({
  quickAddDate,
  setQuickAddDate
}) {
  const [type, setType] =
    useState("post");

  const [caption, setCaption] =
    useState("");

  const [taskTitle, setTaskTitle] =
    useState("");

  const [imageUrl, setImageUrl] =
    useState("");

  const [platform, setPlatform] =
    useState("Instagram");

  const [assignedTo, setAssignedTo] =
    useState("");

  const [
    scheduledDate,
    setScheduledDate
  ] = useState("");

  const [taskStatus, setTaskStatus] =
    useState("todo");

  // PREFILL DATE
  useEffect(() => {
    if (quickAddDate) {
      const local =
        new Date(quickAddDate);

      local.setMinutes(
        local.getMinutes() -
          local.getTimezoneOffset()
      );

      setScheduledDate(
        local
          .toISOString()
          .slice(0, 16)
      );
    }
  }, [quickAddDate]);

  const handleSave = async () => {
    if (
      type === "task" &&
      !taskTitle.trim()
    )
      return;

    if (
      type === "post" &&
      !caption.trim()
    )
      return;

    const finalDate =
      scheduledDate
        ? new Date(
            scheduledDate
          )
        : new Date();

    // TASK
    if (type === "task") {
      await addDoc(
        collection(db, "posts"),
        {
          type: "task",

          title: taskTitle,

          description:
            caption,

          assignedTo,

          taskStatus,

          date:
            finalDate.toISOString(),

          scheduledFor:
            finalDate.toISOString(),

          status: "open",

          createdAt: Date.now()
        }
      );
    }

    // POST
    else {
      await addDoc(
        collection(db, "posts"),
        {
          type: "post",

          caption,

          platform,

          imageUrl,

          assignedTo,

          date:
            finalDate.toISOString(),

          scheduledFor:
            finalDate.toISOString(),

          status: "scheduled",

          createdAt: Date.now()
        }
      );
    }

    // RESET
    setCaption("");

    setTaskTitle("");

    setImageUrl("");

    setAssignedTo("");

    setPlatform("Instagram");

    setTaskStatus("todo");

    setType("post");

    setScheduledDate("");

    setQuickAddDate(null);
  };

  if (!quickAddDate)
    return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-2xl border-fuchsia-300/20">
        <div className="grid gap-5">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-200 bg-clip-text text-transparent">
                Quick Add
              </h2>

              <div className="text-cyan-100/60 mt-1">
                Add a post or task
                to your production
                calendar.
              </div>
            </div>

            <button
              onClick={() =>
                setQuickAddDate(
                  null
                )
              }
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              ✕
            </button>
          </div>

          {/* TYPE */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() =>
                setType("post")
              }
              className={`h-14 rounded-[1.4rem] border font-bold transition-all ${
                type === "post"
                  ? "bg-fuchsia-500/20 border-fuchsia-300/30 text-white"
                  : "bg-black/30 border-white/10 text-white/60"
              }`}
            >
              Social Post
            </button>

            <button
              onClick={() =>
                setType("task")
              }
              className={`h-14 rounded-[1.4rem] border font-bold transition-all ${
                type === "task"
                  ? "bg-amber-500/20 border-amber-300/30 text-white"
                  : "bg-black/30 border-white/10 text-white/60"
              }`}
            >
              Task
            </button>
          </div>

          {/* DATE */}
          <div className="grid gap-2">
            <div className="text-sm uppercase tracking-[0.2em] text-cyan-100/50">
              Scheduled Date
            </div>

            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) =>
                setScheduledDate(
                  e.target.value
                )
              }
              className="h-14 rounded-[1.4rem] bg-black/30 border border-white/10 px-5 text-white"
            />
          </div>

          {/* PLATFORM */}
          {type === "post" && (
            <select
              value={platform}
              onChange={(e) =>
                setPlatform(
                  e.target.value
                )
              }
              className="h-14 rounded-[1.4rem] bg-black/30 border border-white/10 px-5"
            >
              <option>
                Instagram
              </option>

              <option>
                Facebook
              </option>

              <option>
                TikTok
              </option>

              <option>
                YouTube
              </option>
            </select>
          )}

          {/* ASSIGNED */}
          <input
            type="text"
            value={assignedTo}
            onChange={(e) =>
              setAssignedTo(
                e.target.value
              )
            }
            placeholder="Assign to..."
            className="h-14 rounded-[1.4rem] bg-black/30 border border-white/10 px-5"
          />

          {/* TASK */}
          {type === "task" && (
            <>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) =>
                  setTaskTitle(
                    e.target.value
                  )
                }
                placeholder="Task title..."
                className="h-14 rounded-[1.4rem] bg-black/30 border border-white/10 px-5"
              />

              <select
                value={
                  taskStatus
                }
                onChange={(e) =>
                  setTaskStatus(
                    e.target.value
                  )
                }
                className="h-14 rounded-[1.4rem] bg-black/30 border border-white/10 px-5"
              >
                <option value="todo">
                  🟡 Todo
                </option>

                <option value="in-progress">
                  🔵 In Progress
                </option>

                <option value="completed">
                  🟢 Completed
                </option>

                <option value="blocked">
                  🔴 Blocked
                </option>
              </select>
            </>
          )}

          {/* IMAGE */}
          {type === "post" && (
            <input
              type="file"
              accept="image/*"
              onChange={async (
                e
              ) => {
                const file =
                  e.target
                    .files[0];

                if (!file)
                  return;

                const formData =
                  new FormData();

                formData.append(
                  "file",
                  file
                );

                formData.append(
                  "upload_preset",
                  "brightside_unassigned"
                );

                const res =
                  await fetch(
                    "https://api.cloudinary.com/v1_1/dkpsljxkq/image/upload",
                    {
                      method:
                        "POST",
                      body: formData
                    }
                  );

                const data =
                  await res.json();

                setImageUrl(
                  data.secure_url
                );
              }}
              className="h-14 rounded-[1.4rem] bg-black/30 border border-white/10 px-4 py-3 file:mr-4 file:px-4 file:py-2 file:border-0 file:rounded-xl file:bg-fuchsia-500/20 file:text-white"
            />
          )}

          {/* CONTENT */}
          <textarea
            value={caption}
            onChange={(e) =>
              setCaption(
                e.target.value
              )
            }
            placeholder={
              type === "task"
                ? "Describe the task..."
                : "Write your caption..."
            }
            className="min-h-[220px] rounded-[1.8rem] bg-black/30 border border-white/10 p-5"
          />

          {/* SAVE */}
          <button
            onClick={handleSave}
            className="h-16 rounded-[1.6rem] bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-orange-400 font-black text-white hover:scale-[1.01] transition-all shadow-[0_0_40px_rgba(217,70,239,0.28)]"
          >
            Save To Calendar
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

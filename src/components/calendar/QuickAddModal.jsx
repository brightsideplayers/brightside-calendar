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
  setQuickAddDate,
  currentProduction
}) {
  const [type, setType] = useState("post");
  const [caption, setCaption] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tiktokLink, setTiktokLink] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [assignedTo, setAssignedTo] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [taskStatus, setTaskStatus] = useState("todo");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (quickAddDate) {
      const local = new Date(quickAddDate);

      local.setMinutes(
        local.getMinutes() - local.getTimezoneOffset()
      );

      setScheduledDate(
        local.toISOString().slice(0, 16)
      );
    }
  }, [quickAddDate]);

  const closeModal = () => {
    setQuickAddDate(null);
  };

  const resetForm = () => {
    setCaption("");
    setTaskTitle("");
    setImageUrl("");
    setTiktokLink("");
    setAssignedTo("");
    setPlatform("Instagram");
    setTaskStatus("todo");
    setType("post");
    setScheduledDate("");
    setIsUploadingImage(false);
    setUploadError("");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImageUrl("");
    setUploadError("");
    setIsUploadingImage(true);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append(
        "upload_preset",
        "brightside_unassigned"
      );

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dkpsljxkq/image/upload",
        {
          method: "POST",
          body: formData
        }
      );

      if (!res.ok) {
        throw new Error("Cloudinary upload failed");
      }

      const data = await res.json();

      if (!data.secure_url) {
        throw new Error("No image URL returned");
      }

      setImageUrl(data.secure_url);
    } catch (error) {
      console.error("Image upload error:", error);
      setUploadError(
        "Image did not finish saving. Please try uploading it again."
      );
      setImageUrl("");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (isUploadingImage) return;
    if (type === "task" && !taskTitle.trim()) return;
    if (type === "post" && !caption.trim()) return;

    const finalDate = scheduledDate
      ? new Date(scheduledDate)
      : new Date();

    if (type === "task") {
      await addDoc(
        collection(db, "posts"),
        {
          type: "task",
          title: taskTitle,
          description: caption,
          assignedTo,
          taskStatus,
          date: finalDate.toISOString(),
          scheduledFor: finalDate.toISOString(),
          status: "open",
          production: currentProduction,
          createdAt: Date.now()
        }
      );
    } else {
      await addDoc(
        collection(db, "posts"),
        {
          type: "post",
          caption,
          platform,
          imageUrl:
            platform === "TikTok"
              ? ""
              : imageUrl,
          tiktokLink:
            platform === "TikTok"
              ? tiktokLink
              : "",
          assignedTo,
          date: finalDate.toISOString(),
          scheduledFor: finalDate.toISOString(),
          status: "scheduled",
          production: currentProduction,
          createdAt: Date.now()
        }
      );
    }

    resetForm();
    setQuickAddDate(null);
  };

  if (!quickAddDate) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl overflow-y-auto p-3 sm:p-4 flex items-start sm:items-center justify-center">
      <div className="w-full max-w-2xl min-w-0 my-3 sm:my-6">
        <GlassCard className="w-full min-w-0 border-fuchsia-300/20 overflow-hidden">
          <div className="grid gap-4 sm:gap-5 p-1 min-w-0">
            <div className="flex items-start justify-between gap-3 min-w-0">
              <div className="min-w-0">
                <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-200 bg-clip-text text-transparent break-words">
                  Quick Add
                </h2>

                <div className="text-cyan-100/60 mt-1 text-sm sm:text-base">
                  Add a post or task to {currentProduction}.
                </div>
              </div>

              <button
                onClick={closeModal}
                className="shrink-0 w-10 h-10 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setType("post")}
                className={`h-12 sm:h-14 rounded-[1.2rem] sm:rounded-[1.4rem] border font-bold transition-all ${
                  type === "post"
                    ? "bg-fuchsia-500/20 border-fuchsia-300/30 text-white"
                    : "bg-black/30 border-white/10 text-white/60"
                }`}
              >
                Social Post
              </button>

              <button
                onClick={() => setType("task")}
                className={`h-12 sm:h-14 rounded-[1.2rem] sm:rounded-[1.4rem] border font-bold transition-all ${
                  type === "task"
                    ? "bg-violet-500/20 border-violet-300/30 text-white"
                    : "bg-black/30 border-white/10 text-white/60"
                }`}
              >
                Task
              </button>
            </div>

            <div className="grid gap-2 min-w-0">
              <div className="text-xs sm:text-sm uppercase tracking-[0.2em] text-cyan-100/50">
                Scheduled Date
              </div>

              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) =>
                  setScheduledDate(e.target.value)
                }
                className="w-full min-w-0 h-12 sm:h-14 rounded-[1.2rem] sm:rounded-[1.4rem] bg-black/30 border border-white/10 px-4 sm:px-5 text-white"
              />
            </div>

            {type === "post" && (
              <select
                value={platform}
                onChange={(e) => {
                  setPlatform(e.target.value);
                  setImageUrl("");
                  setTiktokLink("");
                  setUploadError("");
                  setIsUploadingImage(false);
                }}
                className="w-full min-w-0 h-12 sm:h-14 rounded-[1.2rem] sm:rounded-[1.4rem] bg-black/30 border border-white/10 px-4 sm:px-5 text-white"
              >
                <option>Instagram</option>
                <option>Facebook</option>
                <option>TikTok</option>
                <option>YouTube</option>
              </select>
            )}

            <input
              type="text"
              value={assignedTo}
              onChange={(e) =>
                setAssignedTo(e.target.value)
              }
              placeholder="Assign to..."
              className="w-full min-w-0 h-12 sm:h-14 rounded-[1.2rem] sm:rounded-[1.4rem] bg-black/30 border border-white/10 px-4 sm:px-5 text-white"
            />

            {type === "task" && (
              <>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) =>
                    setTaskTitle(e.target.value)
                  }
                  placeholder="Task title..."
                  className="w-full min-w-0 h-12 sm:h-14 rounded-[1.2rem] sm:rounded-[1.4rem] bg-black/30 border border-white/10 px-4 sm:px-5 text-white"
                />

                <select
                  value={taskStatus}
                  onChange={(e) =>
                    setTaskStatus(e.target.value)
                  }
                  className="w-full min-w-0 h-12 sm:h-14 rounded-[1.2rem] sm:rounded-[1.4rem] bg-black/30 border border-white/10 px-4 sm:px-5 text-white"
                >
                  <option value="todo">🟣 Todo</option>
                  <option value="in-progress">🔵 In Progress</option>
                  <option value="completed">🟢 Completed</option>
                  <option value="blocked">🔴 Blocked</option>
                </select>
              </>
            )}

            {type === "post" && (
              <>
                {platform === "TikTok" ? (
                  <div className="grid gap-2 min-w-0">
                    <div className="text-xs sm:text-sm uppercase tracking-[0.2em] text-cyan-100/50">
                      TikTok Link
                    </div>

                    <input
                      type="text"
                      value={tiktokLink}
                      onChange={(e) =>
                        setTiktokLink(e.target.value)
                      }
                      placeholder="Paste TikTok draft/video link..."
                      className="w-full min-w-0 h-12 sm:h-14 rounded-[1.2rem] sm:rounded-[1.4rem] bg-black/30 border border-white/10 px-4 sm:px-5 text-white"
                    />
                  </div>
                ) : (
                  <div className="grid gap-3">
                    <div className="text-xs sm:text-sm uppercase tracking-[0.2em] text-cyan-100/50">
                      Image
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full min-w-0 min-h-12 sm:min-h-14 rounded-[1.2rem] sm:rounded-[1.4rem] bg-black/30 border border-white/10 px-3 py-3 text-sm text-white file:mr-2 file:px-3 file:py-2 file:border-0 file:rounded-xl file:bg-fuchsia-500/20 file:text-white file:text-sm"
                    />

                    {isUploadingImage && (
                      <div className="rounded-[1.2rem] border border-cyan-300/20 bg-cyan-400/10 p-4 text-cyan-100">
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 rounded-full border-2 border-cyan-100/30 border-t-cyan-100 animate-spin" />

                          <div>
                            <div className="font-bold">
                              Saving image to Cloudinary...
                            </div>

                            <div className="text-sm text-cyan-100/70">
                              Please wait until this finishes before saving.
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 h-2 rounded-full bg-black/30 overflow-hidden">
                          <div className="h-full w-1/2 rounded-full bg-cyan-300 animate-pulse" />
                        </div>
                      </div>
                    )}

                    {!isUploadingImage && imageUrl && (
                      <div className="rounded-[1.2rem] border border-emerald-300/20 bg-emerald-400/10 p-4 text-emerald-100">
                        <div className="font-bold">
                          ✓ Image uploaded and ready to save.
                        </div>

                        <img
                          src={imageUrl}
                          alt="Uploaded preview"
                          className="mt-3 max-h-48 w-full object-cover rounded-2xl border border-white/10"
                        />

                        <button
                          type="button"
                          onClick={() => setImageUrl("")}
                          className="mt-3 h-10 px-4 rounded-xl border border-rose-300/20 bg-rose-500/10 text-rose-100 font-bold"
                        >
                          Remove Image
                        </button>
                      </div>
                    )}

                    {uploadError && (
                      <div className="rounded-[1.2rem] border border-red-300/20 bg-red-500/10 p-4 text-red-100 text-sm">
                        {uploadError}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <textarea
              value={caption}
              onChange={(e) =>
                setCaption(e.target.value)
              }
              placeholder={
                type === "task"
                  ? "Describe the task..."
                  : "Write your caption..."
              }
              className="w-full min-w-0 min-h-[150px] sm:min-h-[220px] rounded-[1.4rem] sm:rounded-[1.8rem] bg-black/30 border border-white/10 p-4 sm:p-5 text-white"
            />

            <button
              onClick={handleSave}
              disabled={isUploadingImage}
              className="w-full h-14 sm:h-16 rounded-[1.3rem] sm:rounded-[1.6rem] bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-orange-400 font-black text-white hover:scale-[1.01] transition-all shadow-[0_0_40px_rgba(217,70,239,0.28)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isUploadingImage
                ? "Saving Image..."
                : "Save To Calendar"}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

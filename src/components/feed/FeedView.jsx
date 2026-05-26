import { useState } from "react";

import GlassCard from "../layout/GlassCard";

import {
  doc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "../../firebase";

export default function FeedView({
  items
}) {
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const getTaskStatusStyles = (status) => {
    switch (status) {
      case "completed":
        return "bg-cyan-400/15 border border-cyan-300/20 text-cyan-100 shadow-[0_0_25px_rgba(34,211,238,0.18)]";
      case "in-progress":
        return "bg-fuchsia-500/15 border border-fuchsia-300/20 text-fuchsia-100 shadow-[0_0_25px_rgba(217,70,239,0.18)]";
      case "blocked":
        return "bg-rose-500/15 border border-rose-300/20 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.18)]";
      default:
        return "bg-amber-400/15 border border-amber-300/20 text-amber-100 shadow-[0_0_25px_rgba(251,191,36,0.18)]";
    }
  };

  const getTaskStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "blocked":
        return "Blocked";
      default:
        return "Todo";
    }
  };

  const formatDateTimeLocal = (value) => {
    if (!value) return "";

    const date = new Date(value);

    date.setMinutes(
      date.getMinutes() - date.getTimezoneOffset()
    );

    return date.toISOString().slice(0, 16);
  };

  const startEdit = (item) => {
    setMenuOpenId(null);
    setUploadError("");
    setIsUploadingImage(false);

    setEditingItem({
      ...item,
      imageUrl: item.imageUrl || "",
      tiktokLink: item.tiktokLink || "",
      editDate: formatDateTimeLocal(
        item.scheduledFor || item.date
      )
    });
  };

  const handleEditImageUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

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

      setEditingItem((current) => ({
        ...current,
        imageUrl: data.secure_url
      }));
    } catch (error) {
      console.error("Image upload error:", error);
      setUploadError(
        "Image did not finish saving. Please try uploading it again."
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const saveEdit = async () => {
    if (!editingItem || isUploadingImage) return;

    const finalDate = editingItem.editDate
      ? new Date(editingItem.editDate)
      : new Date();

    const updates =
      editingItem.type === "task"
        ? {
            title: editingItem.title || "",
            description: editingItem.description || "",
            assignedTo: editingItem.assignedTo || "",
            taskStatus: editingItem.taskStatus || "todo",
            date: finalDate.toISOString(),
            scheduledFor: finalDate.toISOString()
          }
        : {
            caption: editingItem.caption || "",
            platform: editingItem.platform || "Instagram",
            imageUrl:
              editingItem.platform === "TikTok"
                ? ""
                : editingItem.imageUrl || "",
            tiktokLink:
              editingItem.platform === "TikTok"
                ? editingItem.tiktokLink || ""
                : "",
            assignedTo: editingItem.assignedTo || "",
            date: finalDate.toISOString(),
            scheduledFor: finalDate.toISOString()
          };

    await updateDoc(
      doc(db, "posts", editingItem.id),
      updates
    );

    setEditingItem(null);
    setUploadError("");
    setIsUploadingImage(false);
  };

  const deleteItem = async (id) => {
    setMenuOpenId(null);

    await deleteDoc(
      doc(db, "posts", id)
    );
  };

  return (
    <div className="grid gap-5">
      <GlassCard>
        <div className="grid gap-4">
          <div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-orange-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              Feed Planner
            </h2>

            <div className="text-cyan-100/70 mt-2">
              Scheduled content & production tasks
            </div>
          </div>

          <div className="grid gap-4">
            {items.length === 0 && (
              <div className="rounded-[1.8rem] border border-dashed border-white/10 p-10 text-center text-white/40">
                Nothing scheduled yet.
              </div>
            )}

            {items
              .slice()
              .reverse()
              .map((item) => (
                <div
                  key={item.id}
                  className={`rounded-[1.8rem] border overflow-hidden backdrop-blur-sm transition-all duration-300 ${
                    item.type === "task"
                      ? item.taskStatus === "completed"
                        ? "border-cyan-300/20 bg-cyan-500/10 shadow-[0_0_40px_rgba(34,211,238,0.08)]"
                        : item.taskStatus === "in-progress"
                        ? "border-fuchsia-300/20 bg-fuchsia-500/10 shadow-[0_0_40px_rgba(217,70,239,0.08)]"
                        : item.taskStatus === "blocked"
                        ? "border-rose-300/20 bg-rose-500/10 shadow-[0_0_40px_rgba(244,63,94,0.08)]"
                        : "border-amber-300/20 bg-amber-500/10 shadow-[0_0_40px_rgba(251,191,36,0.08)]"
                      : item.platform === "Facebook"
                      ? "border-cyan-300/20 bg-cyan-500/10 shadow-[0_0_40px_rgba(34,211,238,0.08)]"
                      : "border-fuchsia-300/20 bg-fuchsia-500/10 shadow-[0_0_40px_rgba(217,70,239,0.08)]"
                  }`}
                >
                  {item.type !== "task" && item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt="Post preview"
                      className="w-full max-h-[420px] object-cover border-b border-white/10"
                    />
                  )}

                  <div className="p-5 grid gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <div
                          className={`px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,255,255,0.08)] ${
                            item.type === "task"
                              ? "bg-fuchsia-500/15 border border-fuchsia-300/20 text-fuchsia-100 shadow-[0_0_25px_rgba(217,70,239,0.18)]"
                              : item.platform === "Facebook"
                              ? "bg-cyan-400/15 border border-cyan-300/20 text-cyan-100 shadow-[0_0_25px_rgba(34,211,238,0.18)]"
                              : "bg-fuchsia-500/15 border border-fuchsia-300/20 text-fuchsia-100 shadow-[0_0_25px_rgba(217,70,239,0.18)]"
                          }`}
                        >
                          {item.platform ||
                            (item.type === "task"
                              ? "Task"
                              : "Post")}
                        </div>

                        <div
                          className={`px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em] ${getTaskStatusStyles(
                            item.taskStatus
                          )}`}
                        >
                          {item.type === "task"
                            ? getTaskStatusLabel(
                                item.taskStatus
                              )
                            : item.status}
                        </div>
                      </div>

                      <div className="relative shrink-0">
                        <button
                          onClick={() =>
                            setMenuOpenId(
                              menuOpenId === item.id
                                ? null
                                : item.id
                            )
                          }
                          className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
                        >
                          ⋮
                        </button>

                        {menuOpenId === item.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() =>
                                setMenuOpenId(null)
                              }
                            />

                            <div className="absolute right-0 mt-2 w-44 rounded-[1.4rem] bg-[#071018] border border-white/10 p-2 grid gap-2 z-50 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
                              <button
                                onClick={() =>
                                  startEdit(item)
                                }
                                className="h-10 rounded-xl border border-cyan-300/20 bg-cyan-500/10 text-cyan-100 font-bold"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  deleteItem(item.id)
                                }
                                className="h-10 rounded-xl border border-rose-300/20 bg-rose-500/10 text-rose-100 font-bold"
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-cyan-100/50">
                      {new Date(
                        item.scheduledFor || item.date
                      ).toLocaleString()}
                    </div>

                    {item.type === "task" ? (
                      <div className="grid gap-3">
                        <div className="grid gap-2">
                          <div className="text-2xl font-black text-white break-words">
                            {item.title}
                          </div>

                          {item.assignedTo && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="px-3 py-1 rounded-full border border-cyan-300/20 bg-cyan-500/10 text-xs uppercase tracking-[0.2em] text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
                                Assigned To
                              </div>

                              <div className="text-white font-medium">
                                {item.assignedTo}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4 text-white/80 leading-relaxed whitespace-pre-wrap break-words">
                          {item.description?.slice(0, 180)}

                          {item.description?.length > 180 && (
                            <span className="text-cyan-300">
                              {" "}
                              ...more
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        <div className="text-xl font-black text-white">
                          Social Post
                        </div>

                        {item.assignedTo && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="px-3 py-1 rounded-full border border-cyan-300/20 bg-cyan-500/10 text-xs uppercase tracking-[0.2em] text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
                              Assigned To
                            </div>

                            <div className="text-white font-medium">
                              {item.assignedTo}
                            </div>
                          </div>
                        )}

                        <div className="text-white/90 whitespace-pre-wrap leading-relaxed break-words">
                          {item.caption || item.description}
                        </div>

                        {item.platform === "TikTok" && item.tiktokLink && (
                          <a
                            href={item.tiktokLink}
                            target="_blank"
                            rel="noreferrer"
                            className="h-11 px-4 rounded-2xl border border-fuchsia-300/20 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 transition-all w-fit flex items-center"
                          >
                            Open TikTok Link
                          </a>
                        )}

                        {item.platform === "TikTok" && (
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(
                                item.caption ||
                                  item.description ||
                                  ""
                              )
                            }
                            className="h-11 px-4 rounded-2xl border border-cyan-300/20 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all w-fit"
                          >
                            Copy Caption
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </GlassCard>

      {editingItem && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl overflow-y-auto p-4 flex items-start md:items-center justify-center">
          <div className="w-full md:max-w-2xl bg-[#071018] border border-white/10 rounded-[2rem] p-6 grid gap-5 shadow-[0_0_60px_rgba(0,255,255,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-3xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-200 bg-clip-text text-transparent">
                  Edit Feed Item
                </h3>

                <div className="text-white/50 mt-1">
                  Update the scheduled item details.
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingItem(null);
                  setUploadError("");
                  setIsUploadingImage(false);
                }}
                className="w-10 h-10 rounded-full bg-cyan-400 text-black font-black hover:scale-110 transition-all"
              >
                ✕
              </button>
            </div>

            {editingItem.type === "task" ? (
              <>
                <input
                  value={editingItem.title || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      title: e.target.value
                    })
                  }
                  placeholder="Task title..."
                  className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
                />

                <select
                  value={editingItem.taskStatus || "todo"}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      taskStatus: e.target.value
                    })
                  }
                  className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
                >
                  <option value="todo">🟣 Todo</option>
                  <option value="in-progress">🔵 In Progress</option>
                  <option value="completed">🟢 Completed</option>
                  <option value="blocked">🔴 Blocked</option>
                </select>
              </>
            ) : (
              <>
                <select
                  value={editingItem.platform || "Instagram"}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      platform: e.target.value,
                      imageUrl:
                        e.target.value === "TikTok"
                          ? ""
                          : editingItem.imageUrl || "",
                      tiktokLink:
                        e.target.value === "TikTok"
                          ? editingItem.tiktokLink || ""
                          : ""
                    })
                  }
                  className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
                >
                  <option>Instagram</option>
                  <option>Facebook</option>
                  <option>TikTok</option>
                  <option>YouTube</option>
                </select>

                {editingItem.platform === "TikTok" ? (
                  <input
                    value={editingItem.tiktokLink || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        tiktokLink: e.target.value
                      })
                    }
                    placeholder="TikTok link..."
                    className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
                  />
                ) : (
                  <div className="grid gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageUpload}
                      className="w-full min-w-0 min-h-12 rounded-2xl bg-black/30 border border-white/10 px-3 py-3 text-sm text-white file:mr-2 file:px-3 file:py-2 file:border-0 file:rounded-xl file:bg-fuchsia-500/20 file:text-white file:text-sm"
                    />

                    {isUploadingImage && (
                      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4 text-cyan-100">
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 rounded-full border-2 border-cyan-100/30 border-t-cyan-100 animate-spin" />

                          <div>
                            <div className="font-bold">
                              Saving image to Cloudinary...
                            </div>

                            <div className="text-sm text-cyan-100/70">
                              Wait until this finishes before pressing Save.
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 h-2 rounded-full bg-black/30 overflow-hidden">
                          <div className="h-full w-1/2 rounded-full bg-cyan-300 animate-pulse" />
                        </div>
                      </div>
                    )}

                    {!isUploadingImage && editingItem.imageUrl && (
                      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-emerald-100">
                        <div className="font-bold">
                          ✓ Image saved and ready.
                        </div>

                        <img
                          src={editingItem.imageUrl}
                          alt="Current post preview"
                          className="mt-3 max-h-64 w-full object-cover rounded-2xl border border-white/10"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setEditingItem({
                              ...editingItem,
                              imageUrl: ""
                            })
                          }
                          className="mt-3 h-10 px-4 rounded-xl border border-rose-300/20 bg-rose-500/10 text-rose-100 font-bold"
                        >
                          Remove Image
                        </button>
                      </div>
                    )}

                    {uploadError && (
                      <div className="rounded-2xl border border-red-300/20 bg-red-500/10 p-4 text-red-100 text-sm">
                        {uploadError}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <input
              type="datetime-local"
              value={editingItem.editDate || ""}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  editDate: e.target.value
                })
              }
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            />

            <input
              value={editingItem.assignedTo || ""}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  assignedTo: e.target.value
                })
              }
              placeholder="Assign to..."
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            />

            <textarea
              value={
                editingItem.type === "task"
                  ? editingItem.description || ""
                  : editingItem.caption || ""
              }
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  [editingItem.type === "task"
                    ? "description"
                    : "caption"]: e.target.value
                })
              }
              placeholder={
                editingItem.type === "task"
                  ? "Task description..."
                  : "Caption..."
              }
              className="min-h-[140px] rounded-xl bg-black/30 border border-white/10 p-3 text-sm text-white"
            />

            <div className="grid md:grid-cols-2 gap-3 pt-2">
              <button
                onClick={saveEdit}
                disabled={isUploadingImage}
                className="h-12 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-black disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isUploadingImage ? "Saving Image..." : "Save"}
              </button>

              <button
                onClick={() => {
                  setEditingItem(null);
                  setUploadError("");
                  setIsUploadingImage(false);
                }}
                className="h-12 rounded-xl border border-white/10 bg-white/5 text-white/70"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

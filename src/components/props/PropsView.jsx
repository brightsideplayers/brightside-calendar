import {
  useState,
  useEffect
} from "react";

import GlassCard from "../layout/GlassCard";

import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

import { db } from "../../firebase";

export default function PropsView() {
  const [items, setItems] = useState([]);
  const [newProp, setNewProp] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Needed");
  const [editingItem, setEditingItem] = useState(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "props"),
      (snapshot) => {
        setItems(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }))
        );
      }
    );

    return () => unsub();
  }, []);

  const getStatusStyles = (status) => {
    switch (status) {
      case "Ready":
        return "border-cyan-300/20 bg-cyan-500/10 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.08)]";
      case "In Progress":
        return "border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100 shadow-[0_0_30px_rgba(217,70,239,0.08)]";
      case "Repair":
        return "border-amber-300/20 bg-amber-500/10 text-amber-100 shadow-[0_0_30px_rgba(251,191,36,0.08)]";
      case "Missing":
        return "border-rose-300/20 bg-rose-500/10 text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.08)]";
      default:
        return "border-white/10 bg-white/5 text-white";
    }
  };

  const addProp = async () => {
    if (!newProp.trim()) return;

    await addDoc(
      collection(db, "props"),
      {
        text: newProp,
        status: selectedStatus,
        assignedTo: "",
        location: "",
        notes: "",
        comments: [],
        createdAt: Date.now()
      }
    );

    setNewProp("");
    setSelectedStatus("Needed");
  };

  const saveEditingItem = async () => {
    if (!editingItem) return;

    await updateDoc(
      doc(db, "props", editingItem.id),
      {
        text: editingItem.text || "",
        status: editingItem.status || "Needed",
        assignedTo: editingItem.assignedTo || "",
        location: editingItem.location || "",
        notes: editingItem.notes || "",
        comments: editingItem.comments || []
      }
    );

    setEditingItem(null);
    setNewComment("");
  };

  const addComment = () => {
    if (!newComment.trim() || !editingItem) return;

    setEditingItem({
      ...editingItem,
      comments: [
        ...(editingItem.comments || []),
        {
          text: newComment,
          createdAt: new Date().toLocaleString()
        }
      ]
    });

    setNewComment("");
  };

  const deleteItem = async () => {
    if (!editingItem) return;

    await deleteDoc(
      doc(db, "props", editingItem.id)
    );

    setEditingItem(null);
    setNewComment("");
  };

  return (
    <div className="grid gap-5">
      <GlassCard>
        <div className="grid gap-5">
          <div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-300 bg-clip-text text-transparent">
              Props
            </h2>

            <div className="text-cyan-100/60 mt-2">
              Prop inventory & production tracking
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_220px_140px] gap-3">
            <input
              value={newProp}
              onChange={(e) => setNewProp(e.target.value)}
              placeholder="Add prop..."
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            />

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            >
              <option>Needed</option>
              <option>In Progress</option>
              <option>Ready</option>
              <option>Repair</option>
              <option>Missing</option>
            </select>

            <button
              onClick={addProp}
              className="h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 font-bold hover:scale-[1.02] transition-all"
            >
              Add
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-3">
        {[...items]
          .sort((a, b) =>
            (a.text || "").localeCompare(b.text || "")
          )
          .map((item) => (
            <GlassCard key={item.id}>
              <div
                className={`rounded-[1.6rem] border p-4 transition-all ${getStatusStyles(
                  item.status
                )}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="grid gap-3 flex-1 min-w-0">
                    <div className="text-xl font-black text-white">
                      {item.text}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <div
                        className={`px-3 py-1 rounded-full border text-xs uppercase tracking-[0.2em] ${getStatusStyles(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </div>

                      {item.assignedTo && (
                        <div className="px-3 py-1 rounded-full border border-cyan-300/20 bg-cyan-500/10 text-cyan-100 text-xs uppercase tracking-[0.2em]">
                          Assigned: {item.assignedTo}
                        </div>
                      )}

                      {item.location && (
                        <div className="px-3 py-1 rounded-full border border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100 text-xs uppercase tracking-[0.2em]">
                          {item.location}
                        </div>
                      )}
                    </div>

                    {item.notes && (
                      <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-3 text-white/70 text-sm whitespace-pre-wrap">
                        {item.notes}
                      </div>
                    )}

                    {(item.comments || []).length > 0 && (
                      <div className="ml-6 grid gap-2">
                        {(item.comments || []).map(
                          (comment, index) => (
                            <div
                              key={index}
                              className="rounded-[1.2rem] border border-cyan-300/30 bg-cyan-500/10 p-3 text-sm shadow-[0_0_20px_rgba(34,211,238,0.12)]"
                            >
                              <div className="font-semibold text-white whitespace-pre-wrap">
                                {comment.text}
                              </div>

                              <div className="text-cyan-100/50 text-[10px] mt-1">
                                {comment.createdAt}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setNewComment("");
                    }}
                    className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all shrink-0"
                  >
                    ⋮
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}

        {items.length === 0 && (
          <GlassCard>
            <div className="rounded-[1.8rem] border border-dashed border-white/10 p-10 text-center text-white/40">
              No props yet.
            </div>
          </GlassCard>
        )}
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl overflow-y-auto p-4 flex items-start md:items-center justify-center">
          <div className="w-full md:max-w-2xl bg-[#071018] border border-white/10 rounded-[2rem] p-6 grid gap-5 shadow-[0_0_60px_rgba(0,255,255,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-3xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-200 bg-clip-text text-transparent">
                  Edit Prop
                </h3>

                <div className="text-white/50 mt-1">
                  Update details, location, notes, comments and status.
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingItem(null);
                  setNewComment("");
                }}
                className="w-10 h-10 rounded-full bg-cyan-400 text-black font-black hover:scale-110 transition-all"
              >
                ✕
              </button>
            </div>

            <input
              value={editingItem.text || ""}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  text: e.target.value
                })
              }
              placeholder="Prop name..."
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

            <input
              value={editingItem.location || ""}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  location: e.target.value
                })
              }
              placeholder="Location..."
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            />

            <select
              value={editingItem.status || "Needed"}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  status: e.target.value
                })
              }
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            >
              <option>Needed</option>
              <option>In Progress</option>
              <option>Ready</option>
              <option>Repair</option>
              <option>Missing</option>
            </select>

            <div className="grid gap-2">
              <div className="text-xs uppercase tracking-[0.2em] text-white/40">
                Notes
              </div>

              <textarea
                value={editingItem.notes || ""}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    notes: e.target.value
                  })
                }
                placeholder="Production notes..."
                className="min-h-[120px] rounded-xl bg-black/30 border border-white/10 p-3 text-sm text-white"
              />
            </div>

            <div className="grid gap-3">
              <div className="text-xs uppercase tracking-[0.2em] text-white/40">
                Comments
              </div>

              {(editingItem.comments || []).length > 0 && (
                <div className="grid gap-2">
                  {(editingItem.comments || []).map(
                    (comment, index) => (
                      <div
                        key={index}
                        className="rounded-[1.2rem] border border-cyan-300/30 bg-cyan-500/10 p-3 text-sm"
                      >
                        <div className="font-semibold text-white whitespace-pre-wrap">
                          {comment.text}
                        </div>

                        <div className="text-cyan-100/50 text-[10px] mt-1">
                          {comment.createdAt}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              <textarea
                value={newComment}
                onChange={(e) =>
                  setNewComment(e.target.value)
                }
                placeholder="Write a comment..."
                className="min-h-[80px] rounded-xl bg-black/30 border border-white/10 p-3 text-sm text-white"
              />

              <button
                onClick={addComment}
                className="h-11 rounded-xl border border-cyan-300/20 bg-cyan-500/10 text-cyan-100 font-bold hover:bg-cyan-500/20 transition-all"
              >
                Add Comment
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-3 pt-2">
              <button
                onClick={saveEditingItem}
                className="h-12 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-black"
              >
                Save
              </button>

              <button
                onClick={() => {
                  setEditingItem(null);
                  setNewComment("");
                }}
                className="h-12 rounded-xl border border-white/10 bg-white/5 text-white/70"
              >
                Cancel
              </button>

              <button
                onClick={deleteItem}
                className="h-12 rounded-xl border border-rose-300/20 bg-rose-500/10 text-rose-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

export default function SetView() {
  const [items, setItems] = useState([]);
  const [newSetPiece, setNewSetPiece] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Needed");

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "setPieces"),
      (snapshot) => {
        setItems(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            menuOpen: false,
            newComment: ""
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
      case "Build":
        return "border-violet-300/20 bg-violet-500/10 text-violet-100 shadow-[0_0_30px_rgba(139,92,246,0.08)]";
      case "Repair":
        return "border-amber-300/20 bg-amber-500/10 text-amber-100 shadow-[0_0_30px_rgba(251,191,36,0.08)]";
      case "Missing":
        return "border-rose-300/20 bg-rose-500/10 text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.08)]";
      default:
        return "border-white/10 bg-white/5 text-white";
    }
  };

  const updateLocalItem = (id, updates) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updates }
          : item
      )
    );
  };

  const saveItemUpdate = async (id, updates) => {
    await updateDoc(
      doc(db, "setPieces", id),
      updates
    );
  };

  const closeMenus = () => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        menuOpen: false
      }))
    );
  };

  const addSetPiece = async () => {
    if (!newSetPiece.trim()) return;

    await addDoc(
      collection(db, "setPieces"),
      {
        text: newSetPiece,
        status: selectedStatus,
        assignedTo: "",
        location: "",
        scene: "",
        notes: "",
        comments: [],
        createdAt: Date.now()
      }
    );

    setNewSetPiece("");
    setSelectedStatus("Needed");
  };

  const addComment = async (item) => {
    if (!item.newComment?.trim()) return;

    const updatedComments = [
      ...(item.comments || []),
      {
        text: item.newComment,
        createdAt: new Date().toLocaleString()
      }
    ];

    await saveItemUpdate(item.id, {
      comments: updatedComments
    });

    updateLocalItem(item.id, {
      comments: updatedComments,
      newComment: "",
      menuOpen: false
    });
  };

  const deleteItem = async (id) => {
    await deleteDoc(
      doc(db, "setPieces", id)
    );
  };

  return (
    <div className="grid gap-5">
      <GlassCard>
        <div className="grid gap-5">
          <div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-300 bg-clip-text text-transparent">
              Set
            </h2>

            <div className="text-cyan-100/60 mt-2">
              Set pieces, scenery & build tracking
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_220px_140px] gap-3">
            <input
              value={newSetPiece}
              onChange={(e) => setNewSetPiece(e.target.value)}
              placeholder="Add set piece..."
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            />

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            >
              <option>Needed</option>
              <option>Build</option>
              <option>In Progress</option>
              <option>Ready</option>
              <option>Repair</option>
              <option>Missing</option>
            </select>

            <button
              onClick={addSetPiece}
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
    (a.text || "").localeCompare(
      b.text || ""
    )
  )
  .map((item) => (
          <GlassCard
  key={item.id}
  className="overflow-visible"
>
            <div
  className={`rounded-[1.6rem] border p-4 transition-all overflow-visible ${getStatusStyles(
    item.status
  )}`}
>
              <div className="flex justify-between items-start gap-4">
                <div className="grid gap-3 flex-1 min-w-0">
                  <input
                    value={item.text || ""}
                    onChange={(e) =>
                      updateLocalItem(item.id, {
                        text: e.target.value
                      })
                    }
                    onBlur={(e) =>
                      saveItemUpdate(item.id, {
                        text: e.target.value
                      })
                    }
                    className="bg-transparent text-xl font-black text-white outline-none"
                  />

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

                    {item.scene && (
                      <div className="px-3 py-1 rounded-full border border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100 text-xs uppercase tracking-[0.2em]">
                        Scene: {item.scene}
                      </div>
                    )}

                    {item.location && (
                      <div className="px-3 py-1 rounded-full border border-violet-300/20 bg-violet-500/10 text-violet-100 text-xs uppercase tracking-[0.2em]">
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
                      {(item.comments || []).map((comment, index) => (
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
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative shrink-0">
                  <button
                    onClick={() =>
                      setItems((prev) =>
                        prev.map((i) => ({
                          ...i,
                          menuOpen:
                            i.id === item.id
                              ? !i.menuOpen
                              : false
                        }))
                      )
                    }
                    className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
                  >
                    ⋮
                  </button>

                  {item.menuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={closeMenus}
                      />

                      <div className="absolute right-0 mt-2 w-72 rounded-[1.4rem] bg-[#071018] border border-white/10 p-3 grid gap-3 z-50 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
                        <input
                          placeholder="Assign to..."
                          value={item.assignedTo || ""}
                          onChange={(e) =>
                            updateLocalItem(item.id, {
                              assignedTo: e.target.value
                            })
                          }
                          onBlur={(e) =>
                            saveItemUpdate(item.id, {
                              assignedTo: e.target.value
                            })
                          }
                          className="h-10 rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-white"
                        />

                        <input
                          placeholder="Scene..."
                          value={item.scene || ""}
                          onChange={(e) =>
                            updateLocalItem(item.id, {
                              scene: e.target.value
                            })
                          }
                          onBlur={(e) =>
                            saveItemUpdate(item.id, {
                              scene: e.target.value
                            })
                          }
                          className="h-10 rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-white"
                        />

                        <input
                          placeholder="Location..."
                          value={item.location || ""}
                          onChange={(e) =>
                            updateLocalItem(item.id, {
                              location: e.target.value
                            })
                          }
                          onBlur={(e) =>
                            saveItemUpdate(item.id, {
                              location: e.target.value
                            })
                          }
                          className="h-10 rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-white"
                        />

                        <div className="grid gap-1">
                          <div className="text-xs uppercase tracking-[0.2em] text-white/40">
                            Notes
                          </div>

                          <textarea
                            placeholder="Production notes..."
                            value={item.notes || ""}
                            onChange={(e) =>
                              updateLocalItem(item.id, {
                                notes: e.target.value
                              })
                            }
                            onBlur={(e) =>
                              saveItemUpdate(item.id, {
                                notes: e.target.value
                              })
                            }
                            className="min-h-[100px] rounded-xl bg-black/30 border border-white/10 p-3 text-sm text-white"
                          />
                        </div>

                        <div className="grid gap-1">
                          <div className="text-xs uppercase tracking-[0.2em] text-white/40">
                            Comments
                          </div>

                          <textarea
                            placeholder="Write a comment..."
                            value={item.newComment || ""}
                            onChange={(e) =>
                              updateLocalItem(item.id, {
                                newComment: e.target.value
                              })
                            }
                            className="min-h-[80px] rounded-xl bg-black/30 border border-white/10 p-3 text-sm text-white"
                          />

                          <button
                            onClick={() => addComment(item)}
                            className="h-10 rounded-xl border border-cyan-300/20 bg-cyan-500/10 text-cyan-100 font-bold hover:bg-cyan-500/20 transition-all"
                          >
                            Add Comment
                          </button>
                        </div>

                        <select
                          value={item.status || "Needed"}
                          onChange={(e) => {
                            updateLocalItem(item.id, {
                              status: e.target.value
                            });

                            saveItemUpdate(item.id, {
                              status: e.target.value
                            });
                          }}
                          className="h-10 rounded-xl bg-black/30 border border-white/10 px-3 text-sm text-white"
                        >
                          <option>Needed</option>
                          <option>Build</option>
                          <option>In Progress</option>
                          <option>Ready</option>
                          <option>Repair</option>
                          <option>Missing</option>
                        </select>

                        <button
                          onClick={() => deleteItem(item.id)}
                          className="h-10 rounded-xl border border-rose-300/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        ))}

        {items.length === 0 && (
          <GlassCard>
            <div className="rounded-[1.8rem] border border-dashed border-white/10 p-10 text-center text-white/40">
              No set pieces yet.
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

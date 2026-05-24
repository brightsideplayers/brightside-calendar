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

export default function RehearsalsView({
  currentProduction
}) {
  const [rehearsals, setRehearsals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDateTime, setNewDateTime] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newType, setNewType] = useState("Blocking");
  const [newScenes, setNewScenes] = useState("");
  const [newCalled, setNewCalled] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "rehearsals"),
      (snapshot) => {
       setRehearsals(
  snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))
    .filter((item) =>
      !item.production ||
      item.production === currentProduction
    )
);
      }
    );

    return () => unsub();
  }, []);

  const getTypeStyles = (type) => {
    switch (type) {
      case "Blocking":
        return "border-cyan-300/20 bg-cyan-500/10 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.08)]";
      case "Choreo":
        return "border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100 shadow-[0_0_30px_rgba(217,70,239,0.08)]";
      case "Music":
        return "border-amber-300/20 bg-amber-500/10 text-amber-100 shadow-[0_0_30px_rgba(251,191,36,0.08)]";
      case "Tech":
        return "border-violet-300/20 bg-violet-500/10 text-violet-100 shadow-[0_0_30px_rgba(139,92,246,0.08)]";
      case "Dress":
        return "border-rose-300/20 bg-rose-500/10 text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.08)]";
      default:
        return "border-white/10 bg-white/5 text-white";
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

  const formatDisplayDate = (value) => {
    if (!value) return "Date TBD";

    return new Date(value).toLocaleDateString(
      undefined,
      {
        weekday: "long",
        month: "long",
        day: "numeric"
      }
    );
  };

  const formatDisplayTime = (value) => {
    if (!value) return "Time TBD";

    return new Date(value).toLocaleTimeString(
      undefined,
      {
        hour: "numeric",
        minute: "2-digit"
      }
    );
  };

  const sortedRehearsals = [...rehearsals].sort((a, b) => {
    const aDate = a.dateTime
      ? new Date(a.dateTime).getTime()
      : 0;

    const bDate = b.dateTime
      ? new Date(b.dateTime).getTime()
      : 0;

    return aDate - bDate;
  });

  const now = Date.now();

  const upcomingRehearsals = sortedRehearsals.filter((item) => {
    if (!item.dateTime) return true;

    return new Date(item.dateTime).getTime() >= now;
  });

  const pastRehearsals = sortedRehearsals.filter((item) => {
    if (!item.dateTime) return false;

    return new Date(item.dateTime).getTime() < now;
  });

  const nextRehearsal = upcomingRehearsals[0];
  const remainingUpcoming = upcomingRehearsals.slice(1);

  const resetForm = () => {
    setNewTitle("");
    setNewDateTime("");
    setNewLocation("");
    setNewType("Blocking");
    setNewScenes("");
    setNewCalled("");
    setNewNotes("");
  };

  const addRehearsal = async () => {
    if (!newTitle.trim()) return;

    const finalDate = newDateTime
      ? new Date(newDateTime)
      : null;

    await addDoc(
      collection(db, "rehearsals"),
      {
        title: newTitle,
        dateTime: finalDate
          ? finalDate.toISOString()
          : "",
        location: newLocation,
        type: newType,
        scenes: newScenes,
        called: newCalled,
        notes: newNotes,
        production: currentProduction,
        createdAt: Date.now()
      }
    );

    resetForm();
    setShowAddModal(false);
  };

  const saveEditingItem = async () => {
    if (!editingItem) return;

    const finalDate = editingItem.dateTime
      ? new Date(editingItem.dateTime)
      : null;

    await updateDoc(
      doc(db, "rehearsals", editingItem.id),
      {
        title: editingItem.title || "",
        dateTime: finalDate
          ? finalDate.toISOString()
          : "",
        location: editingItem.location || "",
        type: editingItem.type || "Blocking",
        scenes: editingItem.scenes || "",
        called: editingItem.called || "",
        notes: editingItem.notes || ""
      }
    );

    setEditingItem(null);
  };

  const deleteItem = async () => {
    if (!editingItem) return;

    await deleteDoc(
      doc(db, "rehearsals", editingItem.id)
    );

    setEditingItem(null);
  };

  const openEditModal = (item) => {
    setEditingItem({
      ...item,
      dateTime: formatDateTimeLocal(item.dateTime)
    });
  };

  const rehearsalCard = (item) => (
    <GlassCard key={item.id}>
      <div
        className={`rounded-[1.5rem] border p-4 grid gap-3 ${getTypeStyles(
          item.type
        )}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.2em] text-white/50">
              {formatDisplayDate(item.dateTime)}
            </div>

            <h3 className="text-xl font-black text-white mt-1 break-words">
              {item.title}
            </h3>
          </div>

          <button
            onClick={() => openEditModal(item)}
            className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all shrink-0"
          >
            ⋮
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1 rounded-full border border-white/10 bg-black/20 text-xs uppercase tracking-[0.15em]">
            {item.type || "Rehearsal"}
          </div>

          <div className="px-3 py-1 rounded-full border border-white/10 bg-black/20 text-xs">
            {formatDisplayTime(item.dateTime)}
          </div>

          {item.location && (
            <div className="px-3 py-1 rounded-full border border-white/10 bg-black/20 text-xs">
              {item.location}
            </div>
          )}
        </div>

        {item.scenes && (
          <div className="rounded-2xl bg-black/20 border border-white/10 p-3 text-sm text-white/75">
            <span className="text-white/40">
              Scenes:{" "}
            </span>
            {item.scenes}
          </div>
        )}

        {item.called && (
          <div className="rounded-2xl bg-black/20 border border-white/10 p-3 text-sm text-white/75">
            <span className="text-white/40">
              Called:{" "}
            </span>
            {item.called}
          </div>
        )}

        {item.notes && (
          <div className="rounded-2xl bg-black/20 border border-white/10 p-3 text-sm text-white/75 whitespace-pre-wrap">
            <span className="text-white/40">
              Notes:{" "}
            </span>
            {item.notes}
          </div>
        )}
      </div>
    </GlassCard>
  );

  return (
    <div className="grid gap-5 pb-28 sm:pb-32">
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

      {nextRehearsal && (
        <GlassCard>
          <div className="rounded-[1.7rem] border border-cyan-300/20 bg-cyan-500/10 p-5 grid gap-4 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-[0.25em] text-cyan-100/60">
                  Next Up
                </div>

                <h3 className="text-3xl font-black text-white mt-2 break-words">
                  {nextRehearsal.title}
                </h3>

                <div className="text-cyan-100/70 mt-1">
                  {formatDisplayDate(nextRehearsal.dateTime)} •{" "}
                  {formatDisplayTime(nextRehearsal.dateTime)}
                </div>
              </div>

              <button
                onClick={() => openEditModal(nextRehearsal)}
                className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all shrink-0"
              >
                ⋮
              </button>
            </div>

            <div className="grid gap-2 text-sm">
              {nextRehearsal.location && (
                <div className="rounded-2xl bg-black/20 border border-white/10 p-3">
                  <span className="text-white/40">
                    Location:{" "}
                  </span>
                  {nextRehearsal.location}
                </div>
              )}

              {nextRehearsal.scenes && (
                <div className="rounded-2xl bg-black/20 border border-white/10 p-3">
                  <span className="text-white/40">
                    Scenes:{" "}
                  </span>
                  {nextRehearsal.scenes}
                </div>
              )}

              {nextRehearsal.called && (
                <div className="rounded-2xl bg-black/20 border border-white/10 p-3">
                  <span className="text-white/40">
                    Called:{" "}
                  </span>
                  {nextRehearsal.called}
                </div>
              )}

              {nextRehearsal.notes && (
                <div className="rounded-2xl bg-black/20 border border-white/10 p-3 whitespace-pre-wrap">
                  <span className="text-white/40">
                    Notes:{" "}
                  </span>
                  {nextRehearsal.notes}
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      )}

      {remainingUpcoming.length > 0 && (
        <div className="grid gap-3">
          <div className="text-sm uppercase tracking-[0.25em] text-white/40 px-1">
            Upcoming
          </div>

          {remainingUpcoming.map((item) =>
            rehearsalCard(item)
          )}
        </div>
      )}

      {pastRehearsals.length > 0 && (
        <div className="grid gap-3">
          <div className="text-sm uppercase tracking-[0.25em] text-white/40 px-1">
            Past
          </div>

          {pastRehearsals.map((item) =>
            rehearsalCard(item)
          )}
        </div>
      )}

      {rehearsals.length === 0 && (
        <GlassCard>
          <div className="rounded-[1.8rem] border border-dashed border-white/10 p-10 text-center text-white/40">
            No rehearsals yet.
          </div>
        </GlassCard>
      )}

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-[90] w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-yellow-300 to-orange-400 text-black text-3xl sm:text-5xl font-light shadow-[0_0_40px_rgba(251,191,36,0.45)] hover:scale-105 transition-all flex items-center justify-center"
      >
        +
      </button>

      {showAddModal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl overflow-y-auto p-4 flex items-start md:items-center justify-center">
          <div className="w-full md:max-w-2xl bg-[#071018] border border-white/10 rounded-[2rem] p-6 grid gap-5 shadow-[0_0_60px_rgba(251,191,36,0.12)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-3xl font-black bg-gradient-to-r from-yellow-200 via-orange-300 to-fuchsia-300 bg-clip-text text-transparent">
                  Add Rehearsal
                </h3>

                <div className="text-white/50 mt-1">
                  Add call time, location, scenes, called cast and notes.
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 rounded-full bg-yellow-300 text-black font-black hover:scale-110 transition-all"
              >
                ✕
              </button>
            </div>

            <input
              value={newTitle}
              onChange={(e) =>
                setNewTitle(e.target.value)
              }
              placeholder="Rehearsal title..."
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            />

            <input
              type="datetime-local"
              value={newDateTime}
              onChange={(e) =>
                setNewDateTime(e.target.value)
              }
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            />

            <select
              value={newType}
              onChange={(e) =>
                setNewType(e.target.value)
              }
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            >
              <option>Blocking</option>
              <option>Choreo</option>
              <option>Music</option>
              <option>Tech</option>
              <option>Dress</option>
              <option>Other</option>
            </select>

            <input
              value={newLocation}
              onChange={(e) =>
                setNewLocation(e.target.value)
              }
              placeholder="Location..."
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            />

            <input
              value={newScenes}
              onChange={(e) =>
                setNewScenes(e.target.value)
              }
              placeholder="Scenes..."
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            />

            <input
              value={newCalled}
              onChange={(e) =>
                setNewCalled(e.target.value)
              }
              placeholder="Called cast..."
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            />

            <textarea
              value={newNotes}
              onChange={(e) =>
                setNewNotes(e.target.value)
              }
              placeholder="Notes..."
              className="min-h-[120px] rounded-xl bg-black/30 border border-white/10 p-3 text-sm text-white"
            />

            <div className="grid md:grid-cols-2 gap-3 pt-2">
              <button
                onClick={addRehearsal}
                className="h-12 rounded-xl bg-gradient-to-r from-yellow-300 to-orange-400 text-black font-black"
              >
                Save Rehearsal
              </button>

              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(false);
                }}
                className="h-12 rounded-xl border border-white/10 bg-white/5 text-white/70"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl overflow-y-auto p-4 flex items-start md:items-center justify-center">
          <div className="w-full md:max-w-2xl bg-[#071018] border border-white/10 rounded-[2rem] p-6 grid gap-5 shadow-[0_0_60px_rgba(0,255,255,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-3xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-200 bg-clip-text text-transparent">
                  Edit Rehearsal
                </h3>

                <div className="text-white/50 mt-1">
                  Update call time, location, scenes, called cast and notes.
                </div>
              </div>

              <button
                onClick={() => setEditingItem(null)}
                className="w-10 h-10 rounded-full bg-cyan-400 text-black font-black hover:scale-110 transition-all"
              >
                ✕
              </button>
            </div>

            <input
              value={editingItem.title || ""}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  title: e.target.value
                })
              }
              placeholder="Rehearsal title..."
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            />

            <input
              type="datetime-local"
              value={editingItem.dateTime || ""}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  dateTime: e.target.value
                })
              }
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            />

            <select
              value={editingItem.type || "Blocking"}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  type: e.target.value
                })
              }
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            >
              <option>Blocking</option>
              <option>Choreo</option>
              <option>Music</option>
              <option>Tech</option>
              <option>Dress</option>
              <option>Other</option>
            </select>

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

            <input
              value={editingItem.scenes || ""}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  scenes: e.target.value
                })
              }
              placeholder="Scenes..."
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            />

            <input
              value={editingItem.called || ""}
              onChange={(e) =>
                setEditingItem({
                  ...editingItem,
                  called: e.target.value
                })
              }
              placeholder="Called cast..."
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            />

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
                placeholder="Notes..."
                className="min-h-[120px] rounded-xl bg-black/30 border border-white/10 p-3 text-sm text-white"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-3 pt-2">
              <button
                onClick={saveEditingItem}
                className="h-12 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-black"
              >
                Save
              </button>

              <button
                onClick={() => setEditingItem(null)}
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

import { useState, useEffect } from "react";

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

function TextField({ label, value, onChange, placeholder }) {
  return (
    <div className="grid gap-2">
      <div className="text-xs uppercase tracking-[0.2em] text-white/40">
        {label}
      </div>

      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }) {
  return (
    <div className="grid gap-2">
      <div className="text-xs uppercase tracking-[0.2em] text-white/40">
        {label}
      </div>

      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="min-h-[100px] rounded-2xl bg-black/30 border border-white/10 p-4 text-white"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <div className="grid gap-2">
      <div className="text-xs uppercase tracking-[0.2em] text-white/40">
        {label}
      </div>

      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
      >
        {children}
      </select>
    </div>
  );
}

function PhotoUploader({ photoUrl, onUpload }) {
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = async (file) => {
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("upload_preset", "brightside_costume_inventory");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dkpsljxkq/image/upload",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await res.json();

      if (data.secure_url) {
        onUpload(data.secure_url);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-3">
      <div className="text-xs uppercase tracking-[0.2em] text-white/40">
        Costume Photo
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => uploadPhoto(e.target.files[0])}
        className="w-full min-w-0 min-h-12 rounded-2xl bg-black/30 border border-white/10 px-3 py-3 text-sm text-white file:mr-2 file:px-3 file:py-2 file:border-0 file:rounded-xl file:bg-fuchsia-500/20 file:text-white file:text-sm"
      />

      {uploading && (
        <div className="text-sm text-cyan-100/60">
          Uploading photo...
        </div>
      )}

      {photoUrl && (
        <img
          src={photoUrl}
          alt=""
          className="w-32 h-32 rounded-2xl object-cover border border-white/10"
        />
      )}
    </div>
  );
}

export default function CostumesView({ currentProduction }) {
  const [activeTab, setActiveTab] = useState("show");

  const [showCostumes, setShowCostumes] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [measurements, setMeasurements] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newProgressNote, setNewProgressNote] = useState("");
  const [form, setForm] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "costumes"), (snapshot) => {
      setShowCostumes(
        snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter((item) => item.production === currentProduction)
      );
    });

    return () => unsub();
  }, [currentProduction]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "costumeInventory"), (snapshot) => {
      setInventoryItems(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "actorMeasurements"), (snapshot) => {
      setMeasurements(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    return () => unsub();
  }, []);

  const resetForm = () => {
    setForm({});
    setEditingItem(null);
    setNewProgressNote("");
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "Ready":
      case "Complete":
      case "Available":
      case "Excellent":
        return "border-cyan-300/20 bg-cyan-500/10 text-cyan-100";
      case "In Progress":
      case "Pulled":
      case "Good":
        return "border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100";
      case "Alterations":
      case "To Buy":
      case "To Build":
      case "Needs Repair":
        return "border-amber-300/20 bg-amber-500/10 text-amber-100";
      case "Missing":
      case "Unavailable":
      case "Retire":
        return "border-rose-300/20 bg-rose-500/10 text-rose-100";
      default:
        return "border-white/10 bg-white/5 text-white";
    }
  };

  const getCollectionName = () => {
    if (activeTab === "inventory") return "costumeInventory";
    if (activeTab === "measurements") return "actorMeasurements";
    return "costumes";
  };

  const getActiveItems = () => {
    if (activeTab === "inventory") return inventoryItems;
    if (activeTab === "measurements") return measurements;
    return showCostumes;
  };

  const getSearchText = (item) => {
    if (activeTab === "inventory") {
      return [
        item.name,
        item.category,
        item.size,
        item.colour,
        item.location,
        item.condition,
        item.status,
        item.notes
      ]
        .join(" ")
        .toLowerCase();
    }

    if (activeTab === "measurements") {
      return [
        item.actorName,
        item.role,
        item.height,
        item.chest,
        item.waist,
        item.hips,
        item.shoeSize,
        item.clothingSize,
        item.notes
      ]
        .join(" ")
        .toLowerCase();
    }

    return [
      item.text,
      item.character,
      item.actor,
      item.scene,
      item.assignedTo,
      item.status,
      item.inventoryLink,
      item.notes
    ]
      .join(" ")
      .toLowerCase();
  };

  const sortedItems = [...getActiveItems()]
    .filter((item) => getSearchText(item).includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aName =
        activeTab === "inventory"
          ? a.name || ""
          : activeTab === "measurements"
          ? a.actorName || ""
          : a.character || a.text || "";

      const bName =
        activeTab === "inventory"
          ? b.name || ""
          : activeTab === "measurements"
          ? b.actorName || ""
          : b.character || b.text || "";

      return aName.localeCompare(bName);
    });

  const openAddModal = () => {
    resetForm();

    if (activeTab === "show") {
      setForm({
        text: "",
        character: "",
        actor: "",
        scene: "",
        assignedTo: "",
        status: "Needed",
        dueDate: "",
        inventoryLink: "",
        notes: "",
        comments: []
      });
    }

    if (activeTab === "inventory") {
      setForm({
        name: "",
        category: "",
        size: "",
        colour: "",
        location: "",
        condition: "Good",
        status: "Available",
        photoUrl: "",
        notes: ""
      });
    }

    if (activeTab === "measurements") {
      setForm({
        actorName: "",
        role: "",
        height: "",
        chest: "",
        waist: "",
        hips: "",
        shoeSize: "",
        clothingSize: "",
        notes: ""
      });
    }

    setShowAddModal(true);
  };

  const saveNewItem = async () => {
    if (activeTab === "show" && !(form.text || form.character)) return;
    if (activeTab === "inventory" && !form.name) return;
    if (activeTab === "measurements" && !form.actorName) return;

    const payload = {
      ...form,
      createdAt: Date.now()
    };

    if (activeTab === "show") {
      payload.production = currentProduction;
    }

    await addDoc(collection(db, getCollectionName()), payload);

    resetForm();
    setShowAddModal(false);
  };

  const saveEditingItem = async () => {
    if (!editingItem) return;

    await updateDoc(doc(db, getCollectionName(), editingItem.id), {
      ...editingItem,
      updatedAt: Date.now()
    });

    setEditingItem(null);
    setNewProgressNote("");
  };

  const deleteEditingItem = async () => {
    if (!editingItem) return;

    await deleteDoc(doc(db, getCollectionName(), editingItem.id));

    setEditingItem(null);
    setNewProgressNote("");
  };

  const addProgressNote = () => {
    if (!newProgressNote.trim() || !editingItem) return;

    const existingNotes = editingItem.comments || [];

    setEditingItem({
      ...editingItem,
      comments: [
        ...existingNotes,
        {
          text: newProgressNote,
          createdAt: new Date().toLocaleString()
        }
      ]
    });

    setNewProgressNote("");
  };

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setSearchTerm("");
        resetForm();
      }}
      className={`h-11 rounded-2xl px-4 font-black transition-all ${
        activeTab === id
          ? "bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black"
          : "border border-white/10 bg-white/5 text-white/60"
      }`}
    >
      {label}
    </button>
  );

  const ShowCostumeRow = ({ item }) => {
    const title = item.character || item.text || "Untitled Costume";
    const subtitle = item.text || "";

    return (
      <GlassCard>
        <div className={`rounded-[1.6rem] border p-4 ${getStatusStyles(item.status)}`}>
          <div className="flex justify-between items-start gap-4">
            <div className="grid gap-3 flex-1 min-w-0">
              <div>
                <div className="text-xl font-black text-white break-words">
                  {title}
                </div>

                {subtitle && subtitle !== title && (
                  <div className="text-sm text-white/50 mt-1 break-words">
                    {subtitle}
                  </div>
                )}

                <div className="text-sm text-white/40 mt-1">
                  {[item.actor, item.scene].filter(Boolean).join(" • ")}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className={`px-3 py-1 rounded-full border text-xs uppercase tracking-[0.2em] ${getStatusStyles(item.status)}`}>
                  {item.status || "Needed"}
                </div>

                {item.assignedTo && (
                  <div className="px-3 py-1 rounded-full border border-cyan-300/20 bg-cyan-500/10 text-cyan-100 text-xs uppercase tracking-[0.2em]">
                    Assigned: {item.assignedTo}
                  </div>
                )}

                {item.dueDate && (
                  <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs uppercase tracking-[0.2em]">
                    Due: {item.dueDate}
                  </div>
                )}
              </div>

              {item.inventoryLink && (
                <div className="text-sm text-white/60">
                  Inventory: {item.inventoryLink}
                </div>
              )}

              {item.notes && (
                <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-3 text-white/70 text-sm whitespace-pre-wrap">
                  {item.notes}
                </div>
              )}

              {(item.comments || []).length > 0 && (
                <div className="grid gap-2">
                  {(item.comments || []).slice(-2).map((note, index) => (
                    <div
                      key={index}
                      className="rounded-[1.2rem] border border-cyan-300/30 bg-cyan-500/10 p-3 text-sm"
                    >
                      <div className="font-semibold text-white whitespace-pre-wrap">
                        {note.text}
                      </div>

                      <div className="text-cyan-100/50 text-[10px] mt-1">
                        {note.createdAt}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setEditingItem(item);
                setNewProgressNote("");
              }}
              className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all shrink-0"
            >
              ⋮
            </button>
          </div>
        </div>
      </GlassCard>
    );
  };

  const InventoryRow = ({ item }) => (
    <GlassCard>
      <div className="flex items-center gap-4 min-w-0">
        {item.photoUrl ? (
          <img
            src={item.photoUrl}
            alt=""
            className="w-20 h-20 rounded-xl object-cover border border-white/10 shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-3xl shrink-0">
            👗
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="text-xl font-black text-white break-words">
            {item.name}
          </div>

          <div className="text-sm text-white/50 break-words">
            {[item.category, item.size, item.colour, item.location]
              .filter(Boolean)
              .join(" • ")}
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <div className={`px-3 py-1 rounded-full border text-xs uppercase tracking-[0.2em] ${getStatusStyles(item.status)}`}>
              {item.status || "Available"}
            </div>

            <div className={`px-3 py-1 rounded-full border text-xs uppercase tracking-[0.2em] ${getStatusStyles(item.condition)}`}>
              {item.condition || "Good"}
            </div>
          </div>
        </div>

        <button
          onClick={() => setEditingItem(item)}
          className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all shrink-0"
        >
          ⋮
        </button>
      </div>
    </GlassCard>
  );

  const MeasurementRow = ({ item }) => (
    <GlassCard>
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-16 h-16 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-3xl shrink-0">
          📏
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xl font-black text-white break-words">
            {item.actorName}
          </div>

          <div className="text-sm text-white/50 break-words">
            {item.role || "Actor"}
          </div>

          <div className="text-sm text-white/40 mt-1 break-words">
            {[
              item.height && `Height ${item.height}`,
              item.chest && `Chest ${item.chest}`,
              item.waist && `Waist ${item.waist}`,
              item.hips && `Hips ${item.hips}`,
              item.shoeSize && `Shoe ${item.shoeSize}`,
              item.clothingSize && `Size ${item.clothingSize}`
            ]
              .filter(Boolean)
              .join(" • ")}
          </div>
        </div>

        <button
          onClick={() => setEditingItem(item)}
          className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all shrink-0"
        >
          ⋮
        </button>
      </div>
    </GlassCard>
  );

  return (
    <div className="grid gap-5 pb-28 sm:pb-32">
      <GlassCard>
        <div className="grid gap-5">
          <div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-300 bg-clip-text text-transparent">
              Costumes
            </h2>

            <div className="text-cyan-100/60 mt-2">
              {currentProduction} wardrobe tracking, inventory & measurements
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TabButton id="show" label="Show Costumes" />
            <TabButton id="inventory" label="Inventory" />
            <TabButton id="measurements" label="Measurements" />
          </div>

          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${
              activeTab === "show"
                ? "show costumes"
                : activeTab === "inventory"
                ? "inventory"
                : "measurements"
            }...`}
            className="w-full h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white placeholder:text-white/30"
          />
        </div>
      </GlassCard>

      <div className="grid gap-3">
        {sortedItems.map((item) => {
          if (activeTab === "inventory") {
            return <InventoryRow key={item.id} item={item} />;
          }

          if (activeTab === "measurements") {
            return <MeasurementRow key={item.id} item={item} />;
          }

          return <ShowCostumeRow key={item.id} item={item} />;
        })}

        {sortedItems.length === 0 && (
          <GlassCard>
            <div className="rounded-[1.8rem] border border-dashed border-white/10 p-10 text-center text-white/40">
              No {activeTab === "show" ? "show costumes" : activeTab} yet.
            </div>
          </GlassCard>
        )}
      </div>

      <button
        onClick={openAddModal}
        className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-[90] w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-yellow-300 to-orange-400 text-black text-3xl sm:text-5xl font-light shadow-[0_0_40px_rgba(251,191,36,0.45)] hover:scale-105 transition-all flex items-center justify-center"
      >
        +
      </button>

      {showAddModal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl overflow-y-auto p-4 flex items-start md:items-center justify-center">
          <div className="w-full md:max-w-3xl bg-[#071018] border border-white/10 rounded-[2rem] p-6 grid gap-5 shadow-[0_0_60px_rgba(0,255,255,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-3xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-200 bg-clip-text text-transparent">
                Add {activeTab === "show" ? "Show Costume" : activeTab === "inventory" ? "Inventory Item" : "Actor Measurements"}
              </h3>

              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(false);
                }}
                className="w-10 h-10 rounded-full bg-cyan-400 text-black font-black hover:scale-110 transition-all"
              >
                ✕
              </button>
            </div>

            {activeTab === "show" && (
              <div className="grid gap-4">
                <TextField label="Costume Name" value={form.text} onChange={(v) => setForm({ ...form, text: v })} placeholder="Shelley Mermaid Tail" />
                <TextField label="Character" value={form.character} onChange={(v) => setForm({ ...form, character: v })} />
                <TextField label="Actor" value={form.actor} onChange={(v) => setForm({ ...form, actor: v })} />
                <TextField label="Scene" value={form.scene} onChange={(v) => setForm({ ...form, scene: v })} />
                <TextField label="Assigned To" value={form.assignedTo} onChange={(v) => setForm({ ...form, assignedTo: v })} />

                <SelectField label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })}>
                  <option>Needed</option>
                  <option>Looking in Inventory</option>
                  <option>Pulled</option>
                  <option>To Buy</option>
                  <option>To Build</option>
                  <option>In Progress</option>
                  <option>Alterations</option>
                  <option>Ready</option>
                  <option>Complete</option>
                  <option>Missing</option>
                </SelectField>

                <TextField label="Due Date" value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} placeholder="Nov 12" />
                <TextField label="Linked Inventory" value={form.inventoryLink} onChange={(v) => setForm({ ...form, inventoryLink: v })} placeholder="Purple mermaid tail / Rack A" />
                <TextAreaField label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
              </div>
            )}

            {activeTab === "inventory" && (
              <div className="grid gap-4">
                <TextField label="Item Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Blue Ballgown" />

                <PhotoUploader
                  photoUrl={form.photoUrl}
                  onUpload={(url) => setForm({ ...form, photoUrl: url })}
                />

                <TextField label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder="Princess / Pirate / Wig / Shoes" />
                <TextField label="Size" value={form.size} onChange={(v) => setForm({ ...form, size: v })} />
                <TextField label="Colour" value={form.colour} onChange={(v) => setForm({ ...form, colour: v })} />
                <TextField label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="Rack A / Bin 4" />

                <SelectField label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })}>
                  <option>Available</option>
                  <option>Pulled</option>
                  <option>Unavailable</option>
                </SelectField>

                <SelectField label="Condition" value={form.condition} onChange={(v) => setForm({ ...form, condition: v })}>
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Needs Repair</option>
                  <option>Retire</option>
                </SelectField>

                <TextAreaField label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
              </div>
            )}

            {activeTab === "measurements" && (
              <div className="grid gap-4">
                <TextField label="Actor Name" value={form.actorName} onChange={(v) => setForm({ ...form, actorName: v })} />
                <TextField label="Role / Character" value={form.role} onChange={(v) => setForm({ ...form, role: v })} />
                <TextField label="Height" value={form.height} onChange={(v) => setForm({ ...form, height: v })} />
                <TextField label="Chest / Bust" value={form.chest} onChange={(v) => setForm({ ...form, chest: v })} />
                <TextField label="Waist" value={form.waist} onChange={(v) => setForm({ ...form, waist: v })} />
                <TextField label="Hips" value={form.hips} onChange={(v) => setForm({ ...form, hips: v })} />
                <TextField label="Shoe Size" value={form.shoeSize} onChange={(v) => setForm({ ...form, shoeSize: v })} />
                <TextField label="Clothing Size" value={form.clothingSize} onChange={(v) => setForm({ ...form, clothingSize: v })} />
                <TextAreaField label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={saveNewItem}
                className="h-12 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-black"
              >
                Save
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
          <div className="w-full md:max-w-3xl bg-[#071018] border border-white/10 rounded-[2rem] p-6 grid gap-5 shadow-[0_0_60px_rgba(0,255,255,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-3xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-200 bg-clip-text text-transparent">
                Edit {activeTab === "show" ? "Show Costume" : activeTab === "inventory" ? "Inventory Item" : "Actor Measurements"}
              </h3>

              <button
                onClick={() => {
                  setEditingItem(null);
                  setNewProgressNote("");
                }}
                className="w-10 h-10 rounded-full bg-cyan-400 text-black font-black hover:scale-110 transition-all"
              >
                ✕
              </button>
            </div>

            {activeTab === "show" && (
              <div className="grid gap-4">
                <TextField label="Costume Name" value={editingItem.text} onChange={(v) => setEditingItem({ ...editingItem, text: v })} />
                <TextField label="Character" value={editingItem.character} onChange={(v) => setEditingItem({ ...editingItem, character: v })} />
                <TextField label="Actor" value={editingItem.actor} onChange={(v) => setEditingItem({ ...editingItem, actor: v })} />
                <TextField label="Scene" value={editingItem.scene} onChange={(v) => setEditingItem({ ...editingItem, scene: v })} />
                <TextField label="Assigned To" value={editingItem.assignedTo} onChange={(v) => setEditingItem({ ...editingItem, assignedTo: v })} />

                <SelectField label="Status" value={editingItem.status || "Needed"} onChange={(v) => setEditingItem({ ...editingItem, status: v })}>
                  <option>Needed</option>
                  <option>Looking in Inventory</option>
                  <option>Pulled</option>
                  <option>To Buy</option>
                  <option>To Build</option>
                  <option>In Progress</option>
                  <option>Alterations</option>
                  <option>Ready</option>
                  <option>Complete</option>
                  <option>Missing</option>
                </SelectField>

                <TextField label="Due Date" value={editingItem.dueDate} onChange={(v) => setEditingItem({ ...editingItem, dueDate: v })} />
                <TextField label="Linked Inventory" value={editingItem.inventoryLink} onChange={(v) => setEditingItem({ ...editingItem, inventoryLink: v })} />
                <TextAreaField label="Notes" value={editingItem.notes} onChange={(v) => setEditingItem({ ...editingItem, notes: v })} />

                <TextAreaField
                  label="Add Progress Note"
                  value={newProgressNote}
                  onChange={setNewProgressNote}
                  placeholder="Write progress note..."
                />

                <button
                  onClick={addProgressNote}
                  className="h-11 rounded-xl border border-cyan-300/20 bg-cyan-500/10 text-cyan-100 font-bold hover:bg-cyan-500/20 transition-all"
                >
                  Add Progress Note
                </button>
              </div>
            )}

            {activeTab === "inventory" && (
              <div className="grid gap-4">
                <TextField label="Item Name" value={editingItem.name} onChange={(v) => setEditingItem({ ...editingItem, name: v })} />

                <PhotoUploader
                  photoUrl={editingItem.photoUrl}
                  onUpload={(url) => setEditingItem({ ...editingItem, photoUrl: url })}
                />

                <TextField label="Category" value={editingItem.category} onChange={(v) => setEditingItem({ ...editingItem, category: v })} />
                <TextField label="Size" value={editingItem.size} onChange={(v) => setEditingItem({ ...editingItem, size: v })} />
                <TextField label="Colour" value={editingItem.colour} onChange={(v) => setEditingItem({ ...editingItem, colour: v })} />
                <TextField label="Location" value={editingItem.location} onChange={(v) => setEditingItem({ ...editingItem, location: v })} />

                <SelectField label="Status" value={editingItem.status || "Available"} onChange={(v) => setEditingItem({ ...editingItem, status: v })}>
                  <option>Available</option>
                  <option>Pulled</option>
                  <option>Unavailable</option>
                </SelectField>

                <SelectField label="Condition" value={editingItem.condition || "Good"} onChange={(v) => setEditingItem({ ...editingItem, condition: v })}>
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Needs Repair</option>
                  <option>Retire</option>
                </SelectField>

                <TextAreaField label="Notes" value={editingItem.notes} onChange={(v) => setEditingItem({ ...editingItem, notes: v })} />
              </div>
            )}

            {activeTab === "measurements" && (
              <div className="grid gap-4">
                <TextField label="Actor Name" value={editingItem.actorName} onChange={(v) => setEditingItem({ ...editingItem, actorName: v })} />
                <TextField label="Role / Character" value={editingItem.role} onChange={(v) => setEditingItem({ ...editingItem, role: v })} />
                <TextField label="Height" value={editingItem.height} onChange={(v) => setEditingItem({ ...editingItem, height: v })} />
                <TextField label="Chest / Bust" value={editingItem.chest} onChange={(v) => setEditingItem({ ...editingItem, chest: v })} />
                <TextField label="Waist" value={editingItem.waist} onChange={(v) => setEditingItem({ ...editingItem, waist: v })} />
                <TextField label="Hips" value={editingItem.hips} onChange={(v) => setEditingItem({ ...editingItem, hips: v })} />
                <TextField label="Shoe Size" value={editingItem.shoeSize} onChange={(v) => setEditingItem({ ...editingItem, shoeSize: v })} />
                <TextField label="Clothing Size" value={editingItem.clothingSize} onChange={(v) => setEditingItem({ ...editingItem, clothingSize: v })} />
                <TextAreaField label="Notes" value={editingItem.notes} onChange={(v) => setEditingItem({ ...editingItem, notes: v })} />
              </div>
            )}

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
                  setNewProgressNote("");
                }}
                className="h-12 rounded-xl border border-white/10 bg-white/5 text-white/70"
              >
                Cancel
              </button>

              <button
                onClick={deleteEditingItem}
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

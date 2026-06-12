import {
  useState,
  useEffect
} from "react";

import GlassCard from "../layout/GlassCard";

import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "../../firebase";

export default function PromoView({
  currentProduction
}) {
  const [items, setItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
const [menuOpenId, setMenuOpenId] = useState(null);

const [editingItem, setEditingItem] = useState(null);
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "promo"),
      (snapshot) => {
        setItems(
          snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data()
            }))
            .filter((item) =>
              item.production === currentProduction
            )
        );
      }
    );

    return () => unsub();
  }, [currentProduction]);

  const resetForm = () => {
    setTitle("");
    setImageUrl("");
  };

  const addPromo = async () => {
    if (!title.trim() || !imageUrl) return;

    await addDoc(
      collection(db, "promo"),
      {
        title,
        imageUrl,
        production: currentProduction,
        createdAt: Date.now()
      }
    );

    resetForm();
    setShowAddModal(false);
  };

  const deletePromo = async (id) => {
    await deleteDoc(
      doc(db, "promo", id)
    );
  };
const saveEdit = async () => {
  if (!editingItem) return;

  await updateDoc(
    doc(db, "promo", editingItem.id),
    {
      title: editingItem.title || "",
      imageUrl: editingItem.imageUrl || ""
    }
  );

  setEditingItem(null);
};
  return (
    <div className="grid gap-5 pb-28 sm:pb-32">
      <GlassCard>
        <div className="grid gap-2">
          <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-300 bg-clip-text text-transparent">
            Promo Assets
          </h2>

          <div className="text-cyan-100/60">
            {currentProduction} posters, graphics & marketing materials
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {items.map((item) => (
          <GlassCard key={item.id}>
            <div className="grid gap-4 min-w-0">
              {item.imageUrl?.toLowerCase().includes(".pdf") ? (
  <div className="w-full aspect-square rounded-[1.5rem] border border-white/10 bg-white/5 flex flex-col items-center justify-center text-white/80 text-center p-6">
    <div className="text-5xl mb-3">📄</div>
    <div className="font-black">PDF</div>
    <div className="text-sm text-white/50 mt-2 break-words">
      {item.title}
    </div>
  </div>
) : (
  <img
    src={item.imageUrl}
    alt=""
    className="w-full aspect-square object-cover rounded-[1.5rem] border border-white/10"
  />
)}

              <div className="grid gap-3 min-w-0">
                <div className="text-xl font-black text-white break-words">
                  {item.title}
                </div>

               <div className="flex justify-end relative">
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

      <div className="absolute right-0 top-12 w-44 rounded-[1.4rem] bg-[#071018] border border-white/10 p-2 grid gap-2 z-50 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
        <a
          href={item.imageUrl}
          download
          target="_blank"
          rel="noreferrer"
          className="h-10 rounded-xl border border-cyan-300/20 bg-cyan-500/10 text-cyan-100 font-bold flex items-center justify-center"
        >
          Download
        </a>

        <button
          onClick={() => {
            setMenuOpenId(null);

            setEditingItem(item);
          }}
          className="h-10 rounded-xl border border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100 font-bold"
        >
          Edit
        </button>

        <button
          onClick={() =>
            deletePromo(item.id)
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
            </div>
          </GlassCard>
        ))}

        {items.length === 0 && (
          <GlassCard>
            <div className="rounded-[1.8rem] border border-dashed border-white/10 p-10 text-center text-white/40">
              No promo assets yet for {currentProduction}.
            </div>
          </GlassCard>
        )}
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-[90] w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-yellow-300 to-orange-400 text-black text-3xl sm:text-5xl font-light shadow-[0_0_40px_rgba(251,191,36,0.45)] hover:scale-105 transition-all flex items-center justify-center"
      >
        +
      </button>
{editingItem && (
  <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl overflow-y-auto p-4 flex items-start md:items-center justify-center">
    <div className="w-full md:max-w-2xl bg-[#071018] border border-white/10 rounded-[2rem] p-6 grid gap-5 shadow-[0_0_60px_rgba(251,191,36,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black bg-gradient-to-r from-yellow-200 via-orange-300 to-fuchsia-300 bg-clip-text text-transparent">
            Edit Promo Asset
          </h3>

          <div className="text-white/50 mt-1">
            Update this promo asset.
          </div>
        </div>

        <button
          onClick={() =>
            setEditingItem(null)
          }
          className="w-10 h-10 rounded-full bg-yellow-300 text-black font-black hover:scale-110 transition-all"
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
        placeholder="Asset title..."
        className="w-full h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
      />

      <input
        value={editingItem.imageUrl || ""}
        onChange={(e) =>
          setEditingItem({
            ...editingItem,
            imageUrl: e.target.value
          })
        }
        placeholder="Image URL..."
        className="w-full h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
      />

      {editingItem.imageUrl && (
        <img
          src={editingItem.imageUrl}
          alt=""
          className="w-full max-w-[220px] aspect-square object-cover rounded-[1.4rem] border border-white/10"
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          onClick={saveEdit}
          className="h-12 rounded-xl bg-gradient-to-r from-yellow-300 to-orange-400 text-black font-black"
        >
          Save Changes
        </button>

        <button
          onClick={() =>
            setEditingItem(null)
          }
          className="h-12 rounded-xl border border-white/10 bg-white/5 text-white/70"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl overflow-y-auto p-4 flex items-start md:items-center justify-center">
          <div className="w-full md:max-w-2xl bg-[#071018] border border-white/10 rounded-[2rem] p-6 grid gap-5 shadow-[0_0_60px_rgba(251,191,36,0.12)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-3xl font-black bg-gradient-to-r from-yellow-200 via-orange-300 to-fuchsia-300 bg-clip-text text-transparent">
                  Add Promo Asset
                </h3>

                <div className="text-white/50 mt-1">
                  Upload a {currentProduction} poster, graphic or marketing image.
                </div>
              </div>

              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(false);
                }}
                className="w-10 h-10 rounded-full bg-yellow-300 text-black font-black hover:scale-110 transition-all shrink-0"
              >
                ✕
              </button>
            </div>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Asset title..."
              className="w-full min-w-0 h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white"
            />

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={async (e) => {
                const file = e.target.files[0];

                if (!file) return;

                const formData = new FormData();

                formData.append("file", file);

                formData.append(
                  "upload_preset",
                  "brightside_unassigned"
                );

                const res = await fetch(
                   "https://api.cloudinary.com/v1_1/dkpsljxkq/auto/upload",
                  {
                    method: "POST",
                    body: formData
                  }
                );

                const data = await res.json();

                setImageUrl(data.secure_url);
              }}
              className="w-full min-w-0 min-h-12 rounded-2xl bg-black/30 border border-white/10 px-3 py-3 text-sm text-white file:mr-2 file:px-3 file:py-2 file:border-0 file:rounded-xl file:bg-fuchsia-500/20 file:text-white file:text-sm"
            />

            {imageUrl && (
              <img
                src={imageUrl}
                alt=""
                className="w-full max-w-[220px] aspect-square object-cover rounded-[1.4rem] border border-white/10"
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={addPromo}
                className="h-12 rounded-xl bg-gradient-to-r from-yellow-300 to-orange-400 text-black font-black"
              >
                Save Asset
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
    </div>
  );
}

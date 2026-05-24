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
  doc
} from "firebase/firestore";

import { db } from "../../firebase";

export default function PromoView() {
  const [items, setItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "promo"),
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

  return (
    <div className="grid gap-5 pb-28 sm:pb-32">
      <GlassCard>
        <div className="grid gap-2">
          <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-300 bg-clip-text text-transparent">
            Promo Assets
          </h2>

          <div className="text-cyan-100/60">
            Posters, graphics & marketing materials
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {items.map((item) => (
          <GlassCard key={item.id}>
            <div className="grid gap-4 min-w-0">
              <img
                src={item.imageUrl}
                alt=""
                className="w-full aspect-square object-cover rounded-[1.5rem] border border-white/10"
              />

              <div className="grid gap-3 min-w-0">
                <div className="text-xl font-black text-white break-words">
                  {item.title}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={item.imageUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="h-11 rounded-xl border border-cyan-300/20 bg-cyan-500/10 text-cyan-100 flex items-center justify-center text-sm font-bold"
                  >
                    Download
                  </a>

                  <button
                    onClick={() => deletePromo(item.id)}
                    className="h-11 rounded-xl border border-rose-300/20 bg-rose-500/10 text-rose-100 text-sm font-bold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}

        {items.length === 0 && (
          <GlassCard>
            <div className="rounded-[1.8rem] border border-dashed border-white/10 p-10 text-center text-white/40">
              No promo assets yet.
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

      {showAddModal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl overflow-y-auto p-4 flex items-start md:items-center justify-center">
          <div className="w-full md:max-w-2xl bg-[#071018] border border-white/10 rounded-[2rem] p-6 grid gap-5 shadow-[0_0_60px_rgba(251,191,36,0.12)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-3xl font-black bg-gradient-to-r from-yellow-200 via-orange-300 to-fuchsia-300 bg-clip-text text-transparent">
                  Add Promo Asset
                </h3>

                <div className="text-white/50 mt-1">
                  Upload a poster, graphic or marketing image.
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
              accept="image/jpeg,image/png,image/webp"
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
                  "https://api.cloudinary.com/v1_1/dkpsljxkq/image/upload",
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

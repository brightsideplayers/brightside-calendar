import { useState } from "react";

import GlassCard from "../layout/GlassCard";

export default function PromoView() {
  const [items, setItems] =
    useState([]);

  const [title, setTitle] =
    useState("");

  const [imageUrl, setImageUrl] =
    useState("");

  const addPromo = () => {
    if (!title || !imageUrl)
      return;

    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        title,
        imageUrl
      }
    ]);

    setTitle("");
    setImageUrl("");
  };

  return (
    <div className="grid gap-5">
      <GlassCard>
        <div className="grid gap-5">
          <div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-300 bg-clip-text text-transparent">
              Promo Assets
            </h2>

            <div className="text-cyan-100/60 mt-2">
              Posters, graphics &
              marketing materials
            </div>
          </div>

          <div className="grid gap-3">
            <input
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="Asset title..."
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
            />

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={async (e) => {
                const file =
                  e.target.files[0];

                if (!file) return;

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
                      method: "POST",
                      body: formData
                    }
                  );

                const data =
                  await res.json();

                setImageUrl(
                  data.secure_url
                );
              }}
              className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4 py-2 file:mr-4 file:px-4 file:py-2 file:border-0 file:rounded-xl file:bg-fuchsia-500/20 file:text-white"
            />

            <button
              onClick={addPromo}
              className="h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 font-bold hover:scale-[1.02] transition-all"
            >
              Save Asset
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => (
         <GlassCard
  key={item.id}
>
  <div className="grid gap-4 relative">
    <img
      src={item.imageUrl}
      alt=""
      className="w-full aspect-square object-cover rounded-[1.6rem] border border-white/10"
    />

    <div className="flex items-start justify-between gap-3">
      <div className="text-xl font-black text-white">
        {item.title}
      </div>

      <details className="relative shrink-0">
        <summary className="list-none cursor-pointer w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
          ⋮
        </summary>

        <div className="absolute right-0 mt-2 w-44 rounded-[1.4rem] bg-[#071018] border border-white/10 p-2 grid gap-2 z-50 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
          <a
            href={item.imageUrl}
            download
            target="_blank"
            rel="noreferrer"
            className="h-10 rounded-xl border border-cyan-300/20 bg-cyan-500/10 text-cyan-100 flex items-center justify-center"
          >
            Download
          </a>

          <button
            onClick={() =>
              setItems((prev) =>
                prev.filter(
                  (i) =>
                    i.id !==
                    item.id
                )
              )
            }
            className="h-10 rounded-xl border border-rose-300/20 bg-rose-500/10 text-rose-100"
          >
            Delete
          </button>
        </div>
      </details>
    </div>
  </div>
</GlassCard>
            <div className="grid gap-4">
              <img
                src={item.imageUrl}
                alt=""
                className="w-full aspect-square object-cover rounded-[1.6rem] border border-white/10"
              />

              <div className="text-xl font-black text-white">
                {item.title}
              </div>
            </div>
          </GlassCard>
        ))}

        {items.length ===
          0 && (
          <GlassCard>
            <div className="rounded-[1.8rem] border border-dashed border-white/10 p-10 text-center text-white/40">
              No promo assets yet.
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

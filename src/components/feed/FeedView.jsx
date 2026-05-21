import GlassCard from "../layout/GlassCard";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function FeedView({
  items,
  setItems
}) {
  const addTestPost = async () => {
  await addDoc(collection(db, "posts"), {
    caption: "Test Instagram Post",
    platform: "Instagram",
    status: "Scheduled",
    imageUrl: "https://i.imgur.com/CzifUhZ.jpeg",
    date: new Date().toISOString(),
    createdAt: Date.now()
  });

  alert("Saved to Firebase");
};
  return (
    <div className="grid gap-5">
      <GlassCard>
        <div className="grid gap-4">
          <div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-orange-300 to-fuchsia-300 bg-clip-text text-transparent">
              Feed Planner
            </h2>

            <div className="text-cyan-100/70 mt-2">
              Scheduled social content
            </div>
          </div>

         <div className="grid gap-4">

  <button
    onClick={addTestPost}
    className="h-12 px-5 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-300/20"
  >
    Save Test Post
  </button>
            {items.length === 0 && (
              <div className="rounded-[1.8rem] border border-dashed border-white/10 p-10 text-center text-white/40">
                No scheduled posts yet.
              </div>
            )}

            {items
              .slice()
              .reverse()
              .map((item) => (
                <div
                  key={item.id}
                  className="rounded-[1.8rem] border border-white/10 bg-white/5 overflow-hidden"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-full aspect-square object-cover"
                    />
                  )}

                  <div className="p-5 grid gap-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-300/20 text-xs uppercase tracking-[0.2em]">
                          {item.platform}
                        </div>

                        <div className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-300/20 text-xs uppercase tracking-[0.2em]">
                          {item.status}
                        </div>
                      </div>

                      <div className="text-xs text-cyan-100/50">
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-white/90 whitespace-pre-wrap leading-relaxed">
                      {item.caption}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            item.caption
                          )
                        }
                        className="h-11 px-4 rounded-2xl border border-cyan-300/20 bg-cyan-500/10"
                      >
                        Copy Caption
                      </button>

                      <button
                       onClick={async () => {
                        await deleteDoc(
                          doc(db, "posts", item.id)
  );
}}
                        className="h-11 px-4 rounded-2xl border border-red-300/20 bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

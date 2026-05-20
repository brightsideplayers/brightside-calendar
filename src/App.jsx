
import { useState, useEffect } from "react";
import {
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

import {
  collection,
  addDoc,
  onSnapshot
} from "firebase/firestore";

import GlassCard from "./components/GlassCard";
import StatusBadge from "./components/StatusBadge";
import CalendarView from "./views/CalendarView";

import {
  db,
  auth,
  provider
} from "./lib/firebase";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [view, setView] = useState("feed");

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
      }
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(
      collection(db, "posts"),
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
  }, [user]);

  const login = async () => {
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const seedPost = async () => {
    await addDoc(collection(db, "posts"), {
      caption: "Brightside Test Post",
      date: new Date().toISOString(),
      status: "Scheduled"
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <button
          onClick={login}
          className="h-14 px-8 rounded-2xl bg-cyan-500 text-white"
        >
          Continue with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      <div className="max-w-6xl mx-auto grid gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-6xl font-black">
            Brightside
          </h1>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-2xl border border-white/10"
          >
            Logout
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView("feed")}
            className="px-4 py-2 rounded-2xl border border-white/10"
          >
            Feed
          </button>

          <button
            onClick={() => setView("calendar")}
            className="px-4 py-2 rounded-2xl border border-white/10"
          >
            Calendar
          </button>

          <button
            onClick={seedPost}
            className="px-4 py-2 rounded-2xl bg-fuchsia-500"
          >
            Test Post
          </button>
        </div>

        {view === "calendar" ? (
          <CalendarView items={items} />
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <GlassCard key={item.id}>
                <div className="flex justify-between">
                  <div>
                    <p className="text-xl font-semibold">
                      {item.caption}
                    </p>

                    <p className="text-sm text-white/50 mt-2">
                      {new Date(item.date).toLocaleString()}
                    </p>
                  </div>

                  <StatusBadge status={item.status} />
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

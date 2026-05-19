import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithRedirect,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZ3nQpzf246EepmNDK6Qs32q-G4-b8R4E",
  authDomain: "brightside-calendar-50da5.firebaseapp.com",
  projectId: "brightside-calendar-50da5",
  storageBucket: "brightside-calendar-50da5.firebasestorage.app",
  messagingSenderId: "342676365953",
  appId: "1:342676365953:web:d4fb633c1bb0d8af09e380"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const platformColors = {
  Instagram: "bg-pink-300",
  Facebook: "bg-blue-300",
  TikTok: "bg-neutral-400"
};

const taskColors = {
  Yellow: "bg-yellow-300",
  Green: "bg-emerald-300",
  Purple: "bg-purple-300",
  Orange: "bg-orange-300"
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export default function App() {
  const designMode = true;

  const [items, setItems] = useState([]);
  const [user, setUser] = useState(
    designMode
      ? {
          displayName: "Brightside Team",
          email: "team@brightside.ca",
          photoURL: "https://i.imgur.com/YdjP8nC.png"
        }
      : null
  );

  const [caption, setCaption] = useState("");
  const [date, setDate] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [view, setView] = useState("list");
  const [type, setType] = useState("Post");
  const [taskColor, setTaskColor] = useState("Yellow");

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(collection(db, "calendarItems"), (snapshot) => {
      const data = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data()
      }));

      setItems(data);
    });

    return () => unsubscribe();
  }, [user]);

  const addItem = async () => {
    if (!caption || !date) return;

    await addDoc(collection(db, "calendarItems"), {
      caption,
      date,
      type,
      platform,
      color: taskColor,
      createdBy: user?.displayName || "Unknown"
    });

    setCaption("");
    setDate("");
  };

  const deleteItem = async (id) => {
    await deleteDoc(doc(db, "calendarItems", id));
  };

  const days = getDaysInMonth(currentYear, currentMonth);

  return (
    <div className="p-6 grid gap-6 min-h-screen bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#0f172a] text-white font-sans">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-light tracking-tight">
            Brightside Calendar
          </h1>
          <p className="text-teal-300 text-sm tracking-[0.25em] uppercase">
            Delivering Laughs On Time
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium">{user.displayName}</p>
          <p className="text-xs text-neutral-400">{user.email}</p>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          className={`rounded-full px-6 py-2 transition-all duration-300 ${
            view === "list"
              ? "bg-teal-400 text-black"
              : "border border-white/20 bg-white/5 text-white"
          }`}
          onClick={() => setView("list")}
        >
          List
        </button>

        <button
          className={`rounded-full px-6 py-2 transition-all duration-300 ${
            view === "calendar"
              ? "bg-teal-400 text-black"
              : "border border-white/20 bg-white/5 text-white"
          }`}
          onClick={() => setView("calendar")}
        >
          Calendar
        </button>
      </div>

      <div className="p-6 rounded-[2rem] shadow-2xl bg-white/5 backdrop-blur-xl border border-white/10">
        <div className="grid gap-3">

          <select
            className="p-3 rounded-2xl bg-[#1f2937] border border-white/20 text-white"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="Post" style={{ color: "black" }}>Post</option>
            <option value="Task" style={{ color: "black" }}>Task</option>
          </select>

          <input
            className="p-3 rounded-2xl bg-black/40 border border-white/10 text-white"
            placeholder={type === "Post" ? "Caption" : "Task"}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          <input
            className="p-3 rounded-2xl bg-black/40 border border-white/10 text-white"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {type === "Post" && (
            <select
              className="p-3 rounded-2xl bg-[#1f2937] border border-white/20 text-white"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="Instagram" style={{ color: "black" }}>Instagram</option>
              <option value="Facebook" style={{ color: "black" }}>Facebook</option>
              <option value="TikTok" style={{ color: "black" }}>TikTok</option>
            </select>
          )}

          {type === "Task" && (
            <select
              className="p-3 rounded-2xl bg-[#1f2937] border border-white/20 text-white"
              value={taskColor}
              onChange={(e) => setTaskColor(e.target.value)}
            >
              <option value="Yellow">🟡</option>
              <option value="Green">🟢</option>
              <option value="Purple">🟣</option>
              <option value="Orange">🟠</option>
            </select>
          )}

          <button
            className="rounded-full bg-teal-400 text-black py-3"
            onClick={addItem}
          >
            Add
          </button>
        </div>
      </div>

      {view === "calendar" && (
        <div>
          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: days }, (_, i) => {
              const day = i + 1;

              const dayItems = items.filter((p) => {
                const d = new Date(p.date);

                return (
                  d.getDate() === day &&
                  d.getMonth() === currentMonth &&
                  d.getFullYear() === currentYear
                );
              });

              return (
                <div
                  key={i}
                  className="p-2 min-h-[120px] rounded-3xl bg-white/5 border border-white/10"
                >
                  <p className="text-xs text-neutral-400">{day}</p>

                  {dayItems.map((p, idx) => {
                    const colorClass =
                      p.type === "Task"
                        ? taskColors[p.color || "Yellow"]
                        : platformColors[p.platform];

                    return (
                      <p
                        key={idx}
                        className={`text-[10px] truncate p-1 rounded-lg text-black ${colorClass}`}
                      >
                        {p.caption}
                      </p>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "list" && (
        <div className="grid gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-3xl bg-white/5 border border-white/10"
            >
              <div className="grid gap-2">
                <p className="font-semibold">{item.caption}</p>

                <p className="text-sm text-neutral-400">
                  {new Date(item.date).toLocaleString()}
                </p>

                <div className="flex gap-2 flex-wrap">
                  <button
                    className="px-3 py-1 rounded-full bg-red-500"
                    onClick={() => deleteItem(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

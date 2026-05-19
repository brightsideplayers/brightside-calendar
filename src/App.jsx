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

const hashtagSets = {
  "Family Theatre Local": [
    "#BramptonTheatre",
    "#MiltonTheatre",
    "#GeorgetownOntario",
    "#OakvilleEvents",
    "#HamiltonTheatre",
    "#FamilyTheatre",
    "#KidsTheatre",
    "#CommunityTheatre",
    "#LiveTheatre",
    "#TheatreKids",
    "#OntarioTheatre",
    "#ThingsToDoWithKids",
    "#FamilyFunOntario"
  ],
  "Panto / Shows": [
    "#Panto",
    "#Pantomime",
    "#MiltonPanto",
    "#HolidayShows",
    "#FamilyEntertainment",
    "#StageProduction",
    "#MusicalTheatre",
    "#TheatreLife",
    "#SupportLocalTheatre",
    "#FirstOntarioArtsCentre",
    "#ArtsMilton",
    "#MiltonEvents"
  ],
  "Actors / BTS": [
    "#ActorLife",
    "#TheatreActors",
    "#RehearsalLife",
    "#Backstage",
    "#TheatreRehearsal",
    "#PerformersLife",
    "#StageLife",
    "#CommunityActors",
    "#CastingCall",
    "#Auditions"
  ]
};

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
  // TEMPORARY: bypass login while designing UI
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
  const [authError, setAuthError] = useState("");

  const [caption, setCaption] = useState("");
  const [date, setDate] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [fileLink, setFileLink] = useState("");
  const [selectedSet, setSelectedSet] = useState("");
  const [view, setView] = useState("list");

  const [type, setType] = useState("Post");
  const [taskColor, setTaskColor] = useState("Yellow");

  const [dragIndex, setDragIndex] = useState(null);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  useEffect(() => {
    if (designMode) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

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

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  const login = async () => {
    try {
      await signInWithRedirect(auth, provider);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const addItem = async () => {
    if (!caption || !date) return;

    await addDoc(collection(db, "calendarItems"), {
      caption,
      date,
      type,
      platform,
      color: taskColor,
      fileLink,
      createdBy: user?.displayName || "Unknown"
    });

    setCaption("");
    setDate("");
    setFileLink("");
  };

  const deleteItem = async (id) => {
    await deleteDoc(doc(db, "calendarItems", id));
  };

  const copyCaption = async (text) => {
    await navigator.clipboard.writeText(text);
  };

  const sendToMeta = async () => {
    window.open("https://business.facebook.com/latest/posts", "_blank");
  };

  const openFile = (url) => {
    if (url) window.open(url, "_blank");
  };

  const addHashtags = () => {
    if (!selectedSet) return;

    const tags = hashtagSets[selectedSet].join(" ");
    setCaption((prev) => `${prev}

${tags}`);
  };

  const changeMonth = (direction) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const quickAdd = (day) => {
    const quickDate = new Date(currentYear, currentMonth, day, 12, 0);
    setDate(quickDate.toISOString().slice(0, 16));
  };

  const handleDrop = () => {};

  const days = getDaysInMonth(currentYear, currentMonth);
  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", {
    month: "long"
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#0f172a]/90 border-b border-white/10 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-teal-400/30 bg-white/5 flex-shrink-0">
                <img
                  src="https://i.imgur.com/YdjP8nC.png"
                  alt="Brightside Logo"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 leading-none">
                <h1
                  className="font-semibold"
                  style={{
                    fontSize: isMobile ? "1.8rem" : "3rem",
                    lineHeight: 0.95,
                    marginBottom: isMobile ? "0.35rem" : "0.25rem"
                  }}
                >
                  Brightside
                </h1>

                <p
                  className="text-teal-300 uppercase"
                  style={{
                    fontSize: isMobile ? "0.72rem" : "0.9rem",
                    letterSpacing: isMobile ? "0.18em" : "0.25em",
                    lineHeight: 1.2,
                    maxWidth: isMobile ? "140px" : "none"
                  }}
                >
                  Delivering Laughs On Time
                </p>
              </div>
            </div>

            <button
              className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 text-lg"
              onClick={logout}
            >
              ⌁
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              style={{ fontSize: isMobile ? "1.25rem" : "1rem" }}
              className={`h-14 rounded-2xl font-semibold transition-all ${
                view === "list"
                  ? "bg-teal-400 text-black"
                  : "bg-white/5 border border-white/10"
              }`}
              onClick={() => setView("list")}
            >
              Feed
            </button>

            <button
              style={{ fontSize: isMobile ? "1.25rem" : "1rem" }}
              className={`h-14 rounded-2xl font-semibold transition-all ${
                view === "calendar"
                  ? "bg-teal-400 text-black"
                  : "bg-white/5 border border-white/10"
              }`}
              onClick={() => setView("calendar")}
            >
              Calendar
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 grid gap-4 sm:gap-6">
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-4 sm:p-6 backdrop-blur-xl">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  style={{ fontSize: isMobile ? "1.25rem" : "1rem" }}
              className={`h-14 rounded-2xl font-semibold transition-all ${
                    type === "Post"
                      ? "bg-teal-400 text-black"
                      : "bg-white/5 border border-white/10"
                  }`}
                  onClick={() => setType("Post")}
                >
                  Post
                </button>

                <button
                  style={{ fontSize: isMobile ? "1.25rem" : "1rem" }}
              className={`h-14 rounded-2xl font-semibold transition-all ${
                    type === "Task"
                      ? "bg-teal-400 text-black"
                      : "bg-white/5 border border-white/10"
                  }`}
                  onClick={() => setType("Task")}
                >
                  Task
                </button>
              </div>

              <textarea
                className="w-full min-h-[140px] rounded-3xl bg-black/30 border border-white/10 p-5 resize-none"
                style={{ fontSize: isMobile ? "1.2rem" : "1rem" }}
                placeholder={type === "Post" ? "Write caption..." : "Task details..."}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />

              <input
                className="w-full h-14 rounded-2xl bg-black/30 border border-white/10 px-4"
                style={{ fontSize: isMobile ? "1.15rem" : "1rem" }}
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

              {type === "Post" && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(platformColors).map((p) => (
                      <button
                        key={p}
                        className={`h-12 rounded-2xl text-sm font-semibold transition-all ${
                          platform === p
                            ? "bg-teal-400 text-black"
                            : "bg-white/5 border border-white/10"
                        }`}
                        onClick={() => setPlatform(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <input
                    className="w-full h-14 rounded-2xl bg-black/30 border border-white/10 px-4"
                style={{ fontSize: isMobile ? "1.15rem" : "1rem" }}
                    placeholder="Media link"
                    value={fileLink}
                    onChange={(e) => setFileLink(e.target.value)}
                  />
                </>
              )}

              <button
                className="h-16 rounded-2xl bg-teal-400 text-black font-bold shadow-lg shadow-teal-500/20"
                style={{ fontSize: isMobile ? "1.4rem" : "1.1rem" }}
                onClick={addItem}
              >
                Add {type}
              </button>
            </div>
          </div>

          {view === "calendar" && (
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <button
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10"
                  onClick={() => changeMonth(-1)}
                >
                  ←
                </button>

                <h2 className="font-semibold"
                  style={{ fontSize: isMobile ? "2rem" : "1.5rem" }}>
                  {monthName} {currentYear}
                </h2>

                <button
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10"
                  onClick={() => changeMonth(1)}
                >
                  →
                </button>
              </div>

            <div className="grid grid-cols-7 gap-2">
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
                      className="rounded-2xl border border-white/10 bg-black/20 p-2 min-h-[80px]"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-teal-300">
                          {day}
                        </p>

                        <button
                          className="text-xs px-3 py-1 rounded-full bg-white/10"
                          onClick={() => quickAdd(day)}
                        >
                          +
                        </button>
                      </div>

                      <div className="grid gap-2">
                        {dayItems.map((p, idx) => {
                          const colorClass =
                            p.type === "Task"
                              ? taskColors[p.color || "Yellow"]
                              : platformColors[p.platform];

                          return (
                            <div
                              key={idx}
                              className={`rounded-2xl p-3 text-black text-sm font-semibold ${colorClass}`}
                            >
                              {p.caption}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === "list" && (
            <div className="grid gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="font-semibold break-words"
                        style={{ fontSize: isMobile ? "1.5rem" : "1.25rem" }}>
                        {item.caption}
                      </p>

                      <p className="text-sm text-neutral-400 mt-2">
                        {new Date(item.date).toLocaleString()}
                      </p>
                    </div>

                    <div className={`w-4 h-4 rounded-full ${
                      item.type === "Task"
                        ? taskColors[item.color || "Yellow"]
                        : platformColors[item.platform]
                    }`} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      className="h-12 rounded-2xl bg-white/10 text-sm font-semibold"
                      onClick={() => copyCaption(item.caption)}
                    >
                      Copy
                    </button>

                    <button
                      className="h-12 rounded-2xl bg-red-500/80 text-sm font-semibold"
                      onClick={() => deleteItem(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


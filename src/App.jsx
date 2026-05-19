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

  const addHashtags = () => {
    if (!selectedSet) return;
    const tags = hashtagSets[selectedSet].join(" ");
    setCaption((prev) => prev + "\n\n" + tags);
  };

  const addItem = async () => {
    if (!caption || !date) return;

    const newItem = {
      caption,
      date,
      type,
      platform: type === "Post" ? platform : "Task",
      fileLink,
      color: type === "Task" ? taskColor : null,
      createdBy: user?.displayName || "Unknown"
    };

    await addDoc(collection(db, "calendarItems"), newItem);

    setCaption("");
    setDate("");
    setFileLink("");
  };

  const handleDrop = async (day) => {
    if (dragIndex === null) return;

    const updated = [...items];
    const item = updated[dragIndex];

    const newDate = new Date(currentYear, currentMonth, day);
    const oldDate = new Date(item.date);

    newDate.setHours(oldDate.getHours() || 12);
    newDate.setMinutes(oldDate.getMinutes() || 0);

    await updateDoc(doc(db, "calendarItems", item.id), {
      date: newDate.toISOString()
    });

    setDragIndex(null);
  };

  const deleteItem = async (id) => {
    await deleteDoc(doc(db, "calendarItems", id));
  };

  const copyCaption = async (text) => {
    await navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const sendToMeta = async (item) => {
    await navigator.clipboard.writeText(item.caption);
    window.open("https://business.facebook.com/latest/posts", "_blank");
  };

  const openFile = (link) => {
    if (link) window.open(link, "_blank");
  };

  const days = getDaysInMonth(currentYear, currentMonth);

  const changeMonth = (direction) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }

    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", {
    month: "long"
  });

  const quickAdd = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setDate(newDate.toISOString().slice(0, 16));
    setView("list");
  };

  const login = async () => {
    try {
      setAuthError("");
      await signInWithRedirect(auth, provider);
    } catch (error) {
      if (error.code === "auth/unauthorized-domain") {
        setAuthError(
          "This domain has not been authorized in Firebase yet. Add your preview/deployment domain inside Firebase Authentication → Settings → Authorized domains."
        );
      } else {
        setAuthError(error.message || "Authentication failed.");
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };


  if (!user && !designMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#0f172a] flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-md p-8 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 text-center shadow-2xl">
          <div className="flex flex-col gap-6 items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border border-teal-400/30 shadow-2xl shadow-teal-500/20 bg-white/5 backdrop-blur flex items-center justify-center">
              <img
                src="https://i.imgur.com/YdjP8nC.png"
                alt="Brightside Logo"
                className="w-full h-full object-cover scale-110"
              />
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-light tracking-tight leading-tight">
                Brightside Calendar
              </h1>
              <p className="text-teal-300 text-sm tracking-[0.25em] uppercase mt-2">
                Delivering Laughs On Time
              </p>
            </div>

            {authError && (
              <div className="text-sm text-red-300 bg-red-500/10 border border-red-400/20 rounded-2xl p-4 text-left">
                {authError}
                <div className="mt-3 text-xs text-neutral-300">
                  Add these domains in Firebase:
                  <ul className="list-disc ml-5 mt-2">
                    <li>codesandbox.io</li>
                    <li>localhost</li>
                    <li>Your future Vercel/Netlify domain</li>
                  </ul>
                </div>
              </div>
            )}

            <button
              className="rounded-full px-6 py-3 bg-teal-400 text-black hover:bg-teal-300 transition-all duration-300 shadow-lg shadow-teal-500/20 cursor-pointer"
              onClick={login}
            >
              Continue with Google
            </button>
          </div>
        </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#0f172a] text-white font-sans overflow-x-hidden">
      <div className="w-full max-w-md sm:max-w-6xl mx-auto p-3 sm:p-6 grid gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-teal-400/30 shadow-2xl shadow-teal-500/20 bg-white/5 backdrop-blur flex items-center justify-center">
            <img
              src="https://i.imgur.com/YdjP8nC.png"
              alt="Brightside Logo"
              className="w-full h-full object-cover scale-110"
            />
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-light tracking-tight leading-tight">
              Brightside Calendar
            </h1>
            <p className="text-teal-300 text-[9px] sm:text-[10px] sm:text-sm tracking-[0.18em] sm:tracking-[0.25em] uppercase">
              Delivering Laughs On Time
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <p className="text-sm font-medium">{user.displayName}</p>
            <p className="text-xs text-neutral-400">{user.email}</p>
          </div>

          <img
            src={user.photoURL}
            alt="User"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/10"
          />

          <button
            className="rounded-full border border-white/10 bg-white/5 hover:bg-red-500 hover:text-white"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex gap-2 sm:gap-3 justify-center items-center w-full">
        <button
          className={`flex-1 sm:flex-none sm:min-w-[140px] h-11 sm:h-12 rounded-full px-6 flex items-center justify-center transition-all duration-300 font-medium ${
            view === "list"
              ? "bg-teal-400 text-black shadow-lg shadow-teal-500/20"
              : "border border-white/20 bg-white/5 backdrop-blur text-white hover:bg-teal-400 hover:text-black hover:border-teal-300"
          }`}
          onClick={() => setView("list")}
        >
          List
        </button>

        <button
          className={`flex-1 sm:flex-none sm:min-w-[140px] h-11 sm:h-12 rounded-full px-6 flex items-center justify-center transition-all duration-300 font-medium ${
            view === "calendar"
              ? "bg-teal-400 text-black shadow-lg shadow-teal-500/20"
              : "border border-white/20 bg-white/5 backdrop-blur text-white hover:bg-teal-400 hover:text-black hover:border-teal-300"
          }`}
          onClick={() => setView("calendar")}
        >
          Calendar
        </button>
      </div>

      <div className="p-4 sm:p-6 rounded-[2rem] shadow-2xl bg-white/5 backdrop-blur-xl border border-white/10">
        <div className="grid gap-3">
          <select
            className="p-3 rounded-2xl bg-neutral-900 border border-white/20 text-white backdrop-blur appearance-auto cursor-pointer relative z-10"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="Post" style={{ color: 'black', backgroundColor: 'white' }}>Post</option>
            <option value="Task" style={{ color: 'black', backgroundColor: 'white' }}>Task</option>
          </select>

          <input
            className="w-full p-3 rounded-2xl bg-black/40 border border-white/10 text-white backdrop-blur"
            placeholder={type === "Post" ? "Caption" : "Task..."}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          <input
            className="w-full p-3 rounded-2xl bg-black/40 border border-white/10 text-white backdrop-blur"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {type === "Post" && (
            <>
              <select
                className="p-3 rounded-2xl bg-neutral-900 border border-white/20 text-white backdrop-blur appearance-auto cursor-pointer relative z-10"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="Instagram" style={{ color: 'black', backgroundColor: 'white' }}>Instagram</option>
                <option value="Facebook" style={{ color: 'black', backgroundColor: 'white' }}>Facebook</option>
                <option value="TikTok" style={{ color: 'black', backgroundColor: 'white' }}>TikTok</option>
              </select>

              <input
                className="w-full p-3 rounded-2xl bg-black/40 border border-white/10 text-white backdrop-blur"
                placeholder="Icedrive link"
                value={fileLink}
                onChange={(e) => setFileLink(e.target.value)}
              />

              <select
                className="p-3 rounded-2xl bg-neutral-900 border border-white/20 text-white backdrop-blur appearance-auto cursor-pointer relative z-10"
                value={selectedSet}
                onChange={(e) => setSelectedSet(e.target.value)}
              >
                <option value="">Hashtag set</option>
                {Object.keys(hashtagSets).map((set) => (
                  <option key={set}>{set}</option>
                ))}
              </select>

              <button
                className="w-full p-3 rounded-full bg-teal-400 text-black hover:bg-teal-300 transition-all duration-300 shadow-lg shadow-teal-500/20 font-medium"
                onClick={addHashtags}
              >
                Add Hashtags
              </button>
            </>
          )}

          {type === "Task" && (
            <select
              className="p-3 rounded-2xl bg-neutral-900 border border-white/20 text-white backdrop-blur appearance-auto cursor-pointer relative z-10"
              value={taskColor}
              onChange={(e) => setTaskColor(e.target.value)}
            >
              {Object.keys(taskColors).map((c) => {
                const dotMap = {
                  Yellow: "🟡",
                  Green: "🟢",
                  Purple: "🟣",
                  Orange: "🟠"
                };

                return (
                  <option key={c} value={c}>
                    {dotMap[c]}
                  </option>
                );
              })}
            </select>
          )}

          <button
            className="w-full p-3 rounded-full bg-teal-400 text-black hover:bg-teal-300 transition-all duration-300 shadow-lg shadow-teal-500/20 font-medium"
            onClick={addItem}
          >
            Add
          </button>
        </div>
      </div>

      {view === "calendar" && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <button onClick={() => changeMonth(-1)}>←</button>
            <h2 className="text-xl tracking-widest">
              {monthName} {currentYear}
            </h2>
            <button onClick={() => changeMonth(1)}>→</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div
                  key={day}
                  className="text-center text-xs uppercase tracking-widest text-teal-300 pb-2"
                >
                  {day}
                </div>
              )
            )}

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
                  className="p-2 min-h-[90px] sm:min-h-[120px] rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-teal-400/40 transition-all duration-300 hover:scale-[1.02]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(day)}
                  onDoubleClick={() => quickAdd(day)}
                >
                  <div>
                    <p className="text-xs text-neutral-400">{day}</p>

                    {dayItems.map((p, idx) => {
                      const originalIndex = items.findIndex((x) => x === p);

                      const colorClass =
                        p.type === "Task"
                          ? taskColors[p.color || "Yellow"]
                          : platformColors[p.platform];

                      return (
                        <p
                          key={idx}
                          draggable
                          onDragStart={() => setDragIndex(originalIndex)}
                          className={`text-[9px] sm:text-[10px] truncate cursor-move p-1 rounded-lg text-black ${colorClass}`}
                        >
                          {p.type === "Task" ? "📝" : ""} {p.caption.slice(0, 20)}
                        </p>
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
        <div className="grid gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-3 sm:p-4 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-teal-400/50 transition-all duration-300 overflow-hidden"
            >
              <div className="grid gap-2">
                <p className="font-semibold">{item.caption}</p>

                <p className="text-sm text-neutral-400">
                  {new Date(item.date).toLocaleString()}
                </p>

                <p className="text-xs text-teal-300">
                  Added by {item.createdBy || "Unknown"}
                </p>

                <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                  <button className="w-full sm:w-auto px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all" onClick={() => copyCaption(item.caption)}>
                    Copy
                  </button>

                  {item.type === "Post" && (
                    <button className="w-full sm:w-auto px-4 py-2 rounded-full bg-teal-400 text-black hover:bg-teal-300 transition-all" onClick={() => sendToMeta(item)}>Send</button>
                  )}

                  {item.fileLink && (
                    <button className="w-full sm:w-auto px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all" onClick={() => openFile(item.fileLink)}>
                      Open Media
                    </button>
                  )}

                  <button className="w-full sm:w-auto px-4 py-2 rounded-full bg-red-500/80 hover:bg-red-500 transition-all" onClick={() => deleteItem(item.id)}>
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

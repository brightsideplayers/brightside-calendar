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

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

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

              <div className="min-w-0">
                <h1 className="text-2xl sm:text-4xl font-semibold truncate">
                  Brightside
                </h1>
                <p className="text-teal-300 text-xs sm:text-sm uppercase tracking-[0.25em] truncate">
                  Delivering Laughs On Time
                </p>
              </div>
            </div>

            <button
              className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 text-lg"
              onClick={logout}
            >
              ↗
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              className={`h-14 rounded-2xl text-lg font-semibold transition-all ${
                view === "list"
                  ? "bg-teal-400 text-black"
                  : "bg-white/5 border border-white/10"
              }`}
              onClick={() => setView("list")}
            >
              Feed
            </button>

            <button
              className={`h-14 rounded-2xl text-lg font-semibold transition-all ${
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
                  className={`h-14 rounded-2xl text-lg font-semibold transition-all ${
                    type === "Post"
                      ? "bg-teal-400 text-black"
                      : "bg-white/5 border border-white/10"
                  }`}
                  onClick={() => setType("Post")}
                >
                  Post
                </button>

                <button
                  className={`h-14 rounded-2xl text-lg font-semibold transition-all ${
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
                className="w-full min-h-[140px] rounded-3xl bg-black/30 border border-white/10 p-5 text-lg resize-none"
                placeholder={type === "Post" ? "Write caption..." : "Task details..."}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />

              <input
                className="w-full h-14 rounded-2xl bg-black/30 border border-white/10 px-4 text-lg"
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
                    className="w-full h-14 rounded-2xl bg-black/30 border border-white/10 px-4 text-lg"
                    placeholder="Media link"
                    value={fileLink}
                    onChange={(e) => setFileLink(e.target.value)}
                  />
                </>
              )}

              <button
                className="h-16 rounded-2xl bg-teal-400 text-black text-xl font-bold shadow-lg shadow-teal-500/20"
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

                <h2 className="text-2xl font-semibold">
                  {monthName} {currentYear}
                </h2>

                <button
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10"
                  onClick={() => changeMonth(1)}
                >
                  →
                </button>
              </div>

              <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-7"} gap-3`}>
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
                      className="rounded-3xl border border-white/10 bg-black/20 p-4 min-h-[120px]"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-lg font-semibold text-teal-300">
                          {monthName.slice(0,3)} {day}
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
                      <p className="text-xl font-semibold break-words">
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
              <h1 className="text-5xl sm:text-6xl font-light tracking-tight leading-tight">
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
      <div className="w-full min-h-screen mx-auto p-3 sm:p-6 grid gap-4 sm:gap-6 sm:max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-teal-400/30 shadow-2xl shadow-teal-500/20 bg-white/5 backdrop-blur flex items-center justify-center">
            <img
              src="https://i.imgur.com/YdjP8nC.png"
              alt="Brightside Logo"
              className="w-full h-full object-cover scale-110"
            />
          </div>

          <div>
            <h1 className="text-5xl sm:text-6xl font-light tracking-tight leading-tight">
              Brightside Calendar
            </h1>
            <p className="text-teal-300 text-lg sm:text-xl tracking-[0.18em] sm:tracking-[0.25em] uppercase">
              Delivering Laughs On Time
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <p className="text-2xl sm:text-lg font-medium">{user.displayName}</p>
            <p className="text-lg sm:text-base text-neutral-400">{user.email}</p>
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

      <div className="sticky top-0 z-20 flex gap-2 sm:gap-3 justify-center items-center w-full py-2">
        <button
          className={`flex-1 h-20 text-2xl sm:flex-none sm:min-w-[140px] rounded-full px-6 flex items-center justify-center transition-all duration-300 font-medium ${
            view === "list"
              ? "bg-teal-400 text-black shadow-lg shadow-teal-500/20"
              : "border border-white/20 bg-white/5 backdrop-blur text-white hover:bg-teal-400 hover:text-black hover:border-teal-300"
          }`}
          onClick={() => setView("list")}
        >
          List
        </button>

        <button
          className={`flex-1 h-20 text-2xl sm:flex-none sm:min-w-[140px] rounded-full px-6 flex items-center justify-center transition-all duration-300 font-medium ${
            view === "calendar"
              ? "bg-teal-400 text-black shadow-lg shadow-teal-500/20"
              : "border border-white/20 bg-white/5 backdrop-blur text-white hover:bg-teal-400 hover:text-black hover:border-teal-300"
          }`}
          onClick={() => setView("calendar")}
        >
          Calendar
        </button>
      </div>

      <div className="w-full p-4 sm:p-6 rounded-[2rem] shadow-2xl bg-white/5 backdrop-blur-xl border border-white/10">
        <div className="grid gap-3">
          <select
            className="p-5 text-2xl rounded-2xl bg-neutral-900 border border-white/20 text-white backdrop-blur appearance-auto cursor-pointer relative z-10"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="Post" style={{ color: 'black', backgroundColor: 'white' }}>Post</option>
            <option value="Task" style={{ color: 'black', backgroundColor: 'white' }}>Task</option>
          </select>

          <input
            className="w-full p-6 text-2xl rounded-2xl bg-black/40 border border-white/10 text-white backdrop-blur"
            placeholder={type === "Post" ? "Caption" : "Task..."}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          <input
            className="w-full p-6 text-2xl rounded-2xl bg-black/40 border border-white/10 text-white backdrop-blur"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {type === "Post" && (
            <>
              <select
                className="p-5 text-2xl rounded-2xl bg-neutral-900 border border-white/20 text-white backdrop-blur appearance-auto cursor-pointer relative z-10"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="Instagram" style={{ color: 'black', backgroundColor: 'white' }}>Instagram</option>
                <option value="Facebook" style={{ color: 'black', backgroundColor: 'white' }}>Facebook</option>
                <option value="TikTok" style={{ color: 'black', backgroundColor: 'white' }}>TikTok</option>
              </select>

              <input
                className="w-full p-6 text-2xl rounded-2xl bg-black/40 border border-white/10 text-white backdrop-blur"
                placeholder="Icedrive link"
                value={fileLink}
                onChange={(e) => setFileLink(e.target.value)}
              />

              <select
                className="p-5 text-2xl rounded-2xl bg-neutral-900 border border-white/20 text-white backdrop-blur appearance-auto cursor-pointer relative z-10"
                value={selectedSet}
                onChange={(e) => setSelectedSet(e.target.value)}
              >
                <option value="">Hashtag set</option>
                {Object.keys(hashtagSets).map((set) => (
                  <option key={set}>{set}</option>
                ))}
              </select>

              <button
                className="w-full p-6 text-2xl rounded-full bg-teal-400 text-black hover:bg-teal-300 transition-all duration-300 shadow-lg shadow-teal-500/20 font-medium"
                onClick={addHashtags}
              >
                Add Hashtags
              </button>
            </>
          )}

          {type === "Task" && (
            <select
              className="p-5 text-2xl rounded-2xl bg-neutral-900 border border-white/20 text-white backdrop-blur appearance-auto cursor-pointer relative z-10"
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
            className="w-full p-6 text-2xl rounded-full bg-teal-400 text-black hover:bg-teal-300 transition-all duration-300 shadow-lg shadow-teal-500/20 font-medium"
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
            <h2 className="text-5xl tracking-widest">
              {monthName} {currentYear}
            </h2>
            <button onClick={() => changeMonth(1)}>→</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div
                  key={day}
                  className="text-center text-2xl uppercase tracking-widest text-teal-300 pb-2"
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
                  className="p-6 min-h-[240px] rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-teal-400/40 transition-all duration-300 hover:scale-[1.02]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(day)}
                  onDoubleClick={() => quickAdd(day)}
                >
                  <div>
                    <p className="text-lg sm:text-base text-neutral-400">{day}</p>

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
                          className={`text-2xl sm:text-lg truncate cursor-move p-1 rounded-lg text-black ${colorClass}`}
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
      )}      {view === "list" && (
        <div className="grid gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-5 sm:p-6 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-teal-400/50 transition-all duration-300 overflow-hidden"
            >
              <div className="grid gap-2">
                <p className="text-3xl font-semibold">{item.caption}</p>

                <p className="text-sm text-neutral-400">
                  {new Date(item.date).toLocaleString()}
                </p>

                <p className="text-xs text-teal-300">
                  Added by {item.createdBy || "Unknown"}
                </p>

                <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                  <button
                    className="w-full sm:w-auto px-6 py-4 text-xl rounded-full bg-white/10 hover:bg-white/20 transition-all"
                    onClick={() => copyCaption(item.caption)}
                  >
                    Copy
                  </button>

                  {item.type === "Post" && (
                    <button
                      className="w-full sm:w-auto px-6 py-4 text-xl rounded-full bg-teal-400 text-black hover:bg-teal-300 transition-all"
                      onClick={() => sendToMeta(item)}
                    >
                      Send
                    </button>
                  )}

                  {item.fileLink && (
                    <button
                      className="w-full sm:w-auto px-6 py-4 text-xl rounded-full bg-white/10 hover:bg-white/20 transition-all"
                      onClick={() => openFile(item.fileLink)}
                    >
                      Open Media
                    </button>
                  )}

                  <button
                    className="w-full sm:w-auto px-6 py-4 text-xl rounded-full bg-red-500/80 hover:bg-red-500 transition-all"
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
  </div>
  );
}

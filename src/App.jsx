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
  const [recurring, setRecurring] = useState("none");
  const [assignedTo, setAssignedTo] = useState([]);
  const [showAssignMenu, setShowAssignMenu] = useState(false);

  const [dragIndex, setDragIndex] = useState(null);

  const teamMembers = [
    {
      name: "Jenn Bryant",
      email: "jennifer.bryant98@gmail.com"
    },
    {
      name: "Cathy Kates",
      email: "Cathy@brightsideplayers.com"
    },
    {
      name: "Morna Scott-Dunne",
      email: "morna.scott.dunne@gmail.com"
    },
    {
      name: "Lesley Quinn",
      email: "lesley.quinn@gmail.com"
    },
    {
      name: "Amanda Massey",
      email: "giorgio_amanda@hotmail.com"
    },
    {
      name: "Aaron Smaller",
      email: "Aaronsmaller@gmail.com"
    }
  ];

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

    const baseItem = {
      caption,
      date,
      type,
      platform,
      color: taskColor,
      fileLink,
      recurring,
      createdBy: user?.displayName || "Unknown",
      assignedTo
    };

    await addDoc(collection(db, "calendarItems"), baseItem);

    if (recurring !== "none") {
      const repeatCount = recurring === "weekly" ? 12 : 6;

      for (let i = 1; i <= repeatCount; i++) {
        const nextDate = new Date(date);

        if (recurring === "weekly") {
          nextDate.setDate(nextDate.getDate() + i * 7);
        }

        if (recurring === "monthly") {
          nextDate.setMonth(nextDate.getMonth() + i);
        }

        await addDoc(collection(db, "calendarItems"), {
          ...baseItem,
          date: nextDate.toISOString()
        });
      }
    }

    setCaption("");
    setDate("");
    setFileLink("");
    setRecurring("none");
    setAssignedTo([]);
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
                  ? "bg-teal-400/10 border-2 border-teal-300 text-teal-100"
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
                  ? "bg-teal-400/10 border-2 border-teal-300 text-teal-100"
                  : "bg-white/5 border border-white/10"
              }`}
              onClick={() => setView("calendar")}
            >
              Calendar
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 grid gap-4 sm:gap-6">
          <div className="bg-white/[0.08] border border-white/10 rounded-[2rem] p-4 sm:p-6 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
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

              <div className="grid grid-cols-3 gap-2">
                <button
                  className={`h-12 rounded-2xl text-sm font-semibold transition-all ${
                    recurring === "none"
                      ? "bg-teal-400/10 border-2 border-teal-300 text-teal-100"
                      : "bg-white/5 border border-white/10"
                  }`}
                  onClick={() => setRecurring("none")}
                >
                  Once
                </button>

                <button
                  className={`h-12 rounded-2xl text-sm font-semibold transition-all ${
                    recurring === "weekly"
                      ? "bg-teal-400/10 border-2 border-teal-300 text-teal-100"
                      : "bg-white/5 border border-white/10"
                  }`}
                  onClick={() => setRecurring("weekly")}
                >
                  Weekly
                </button>

                <button
                  className={`h-12 rounded-2xl text-sm font-semibold transition-all ${
                    recurring === "monthly"
                      ? "bg-teal-400/10 border-2 border-teal-300 text-teal-100"
                      : "bg-white/5 border border-white/10"
                  }`}
                  onClick={() => setRecurring("monthly")}
                >
                  Monthly
                </button>
              </div>

              {type === "Post" && (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(platformColors).map((p) => (
                      <button
                        key={p}
                        className={`h-12 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                          platform === p
                            ? "bg-teal-400/10 border-2 border-teal-300 text-teal-100"
                            : "bg-white/5 border border-white/10"
                        }`}
                        onClick={() => setPlatform(p)}
                      >
                        <img
                          src={
                            p === "Instagram"
                              ? "https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
                              : p === "Facebook"
                              ? "https://cdn-icons-png.flaticon.com/512/733/733547.png"
                              : "https://cdn-icons-png.flaticon.com/512/3046/3046121.png"
                          }
                          alt={p}
                          className="w-5 h-5"
                        />
                        <span>{p}</span>
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

              <div className="grid gap-2 relative">
                <label className="text-sm uppercase tracking-wide text-neutral-400 px-1">
                  Assign To
                </label>

                <button
                  type="button"
                  onClick={() => setShowAssignMenu(!showAssignMenu)}
                  className="w-full min-h-[56px] rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-left flex items-center justify-between"
                  style={{ fontSize: isMobile ? "1.05rem" : "1rem" }}
                >
                  <div className="flex flex-wrap gap-2">
                    {assignedTo.length === 0 ? (
                      <span className="text-neutral-400">
                        Select team members
                      </span>
                    ) : (
                      assignedTo.map((person) => (
                        <span
                          key={person}
                          className="px-2 py-1 rounded-full bg-teal-400 text-black text-sm font-semibold"
                        >
                          {person}
                        </span>
                      ))
                    )}
                  </div>

                  <span className="text-xl">
                    {showAssignMenu ? "▲" : "▼"}
                  </span>
                </button>

                {showAssignMenu && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-3xl border border-white/10 bg-[#111827] shadow-2xl overflow-hidden">
                    <div className="max-h-[320px] overflow-y-auto p-2 grid gap-2">
                      {teamMembers.map((member) => {
                        const isSelected = assignedTo.includes(member.name);

                        return (
                          <label
                            key={member.email}
                            className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 cursor-pointer transition-all ${
                              isSelected
                                ? "bg-teal-400 text-black"
                                : "bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold">
                                {member.name}
                              </span>

                              <span className="text-xs opacity-70 truncate">
                                {member.email}
                              </span>
                            </div>

                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setAssignedTo(
                                    assignedTo.filter(
                                      (name) => name !== member.name
                                    )
                                  );
                                } else {
                                  setAssignedTo([
                                    ...assignedTo,
                                    member.name
                                  ]);
                                }
                              }}
                              className="w-5 h-5"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

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
            <div className="bg-white/[0.06] border border-white/10 rounded-[2rem] p-4 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
              <div className="flex items-center justify-between mb-4">
                <button
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10"
                  onClick={() => changeMonth(-1)}
                >
                  ←
                </button>

                <h2
                  className="font-semibold"
                  style={{ fontSize: isMobile ? "2rem" : "1.5rem" }}
                >
                  {monthName} {currentYear}
                </h2>

                <button
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10"
                  onClick={() => changeMonth(1)}
                >
                  →
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs uppercase tracking-wide text-neutral-400">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
                  <div key={d} className="py-2 font-semibold">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({
                  length:
                    new Date(currentYear, currentMonth, 1).getDay() + days
                }, (_, i) => {
                  const firstDayOffset = new Date(currentYear, currentMonth, 1).getDay();

                  if (i < firstDayOffset) {
                    return (
                      <div
                        key={`empty-${i}`}
                        className="rounded-2xl bg-white/5 border border-white/5 min-h-[90px]"
                      />
                    );
                  }

                  const day = i - firstDayOffset + 1;

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
                      className={`rounded-2xl border p-2 sm:p-3 min-h-[90px] transition-all duration-200 overflow-hidden ${
                      new Date().getDate() === day &&
                      new Date().getMonth() === currentMonth &&
                      new Date().getFullYear() === currentYear
                        ? "border-teal-300 bg-teal-400/10 shadow-[0_0_25px_rgba(45,212,191,0.18)]"
                        : "border-white/10 bg-black/20 hover:border-teal-400/40"
                    }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm sm:text-base font-semibold text-teal-300">
                          {day}
                        </p>

                        <button
                          className="hidden sm:flex text-xs px-2 py-1 rounded-full bg-white/10 items-center justify-center"
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
                              className={`h-5 px-2 rounded-full flex items-center text-black text-[9px] sm:text-[10px] font-semibold truncate border border-black/5 shadow-sm ${colorClass}`}
                            >
                              {p.caption}
                              {p.recurring && p.recurring !== "none" && (
                                <span className="ml-1 opacity-70">
                                  ↻
                                </span>
                              )}
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

                      {item.assignedTo && item.assignedTo.length > 0 && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-teal-400/20 border border-teal-400/20 px-3 py-1 text-sm text-teal-200">
                          <span>👤</span>
                          <div className="flex flex-wrap gap-1">
                            {item.assignedTo.map((person) => (
                              <span
                                key={person}
                                className="px-2 py-1 rounded-full bg-black/20"
                              >
                                {person}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
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


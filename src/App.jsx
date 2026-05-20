import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
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

const glass = "bg-white/5 border border-white/10 backdrop-blur-2xl";
const button = "h-12 rounded-2xl transition-all duration-300";

const gradients = {
  pink: "bg-gradient-to-r from-fuchsia-600 to-pink-500",
  cyan: "bg-gradient-to-r from-cyan-500 to-blue-500",
  lime: "bg-gradient-to-r from-lime-500 to-emerald-500",
  orange: "bg-gradient-to-r from-orange-500 to-amber-500"
};

function GlassCard({ children, className = "" }) {
  return (
    <div className={`rounded-[1.8rem] p-5 ${glass} ${className}`}>
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Scheduled: "bg-cyan-500/20 text-cyan-100 border border-cyan-300/20",
    Draft: "bg-fuchsia-500/20 text-fuchsia-100 border border-fuchsia-300/20"
  };

  return (
    <div className={`px-3 py-1 rounded-full text-xs uppercase ${styles[status] || styles.Draft}`}>
      {status}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [view, setView] = useState("feed");
  const [caption, setCaption] = useState("");
  const [date, setDate] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [contentType, setContentType] = useState("Post");
  const [fileLink, setFileLink] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [authError, setAuthError] = useState("");
  const [costumes, setCostumes] = useState([]);
  const [propsList, setPropsList] = useState([]);
  const [promoItems, setPromoItems] = useState([]);
  const [newCostume, setNewCostume] = useState("");
  const [newProp, setNewProp] = useState("");
  const [promoTitle, setPromoTitle] = useState("");
  const [promoLink, setPromoLink] = useState("");
  const [contacts, setContacts] = useState([]);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [tiktokCaption, setTiktokCaption] = useState("");
  const [tiktokVideoLink, setTiktokVideoLink] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("Funny Panto");
  const [openPropMenu, setOpenPropMenu] = useState(null);
  const [editingPropId, setEditingPropId] = useState(null);
  const [editingPropText, setEditingPropText] = useState("");
  const [openCostumeMenu, setOpenCostumeMenu] = useState(null);
  const [editingCostumeId, setEditingCostumeId] = useState(null);
  const [editingCostumeText, setEditingCostumeText] = useState("");

  const hashtagPresets = {
    "Funny Panto": [
      "#Pantomime",
      "#TheatreTok",
      "#ComedyTheatre",
      "#OhYesItIs"
    ],
    "Milton Theatre": [
      "#MiltonON",
      "#MiltonOntario",
      "#CommunityTheatre",
      "#OntarioTheatre"
    ],
    "Backstage Chaos": [
      "#Backstage",
      "#StageLife",
      "#CastLife",
      "#TechWeek"
    ],
    Nostalgic: [
      "#Throwback",
      "#TheatreMemories",
      "#PastShows",
      "#PantoMagic"
    ]
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(collection(db, "posts"), (snapshot) => {
      setItems(
        snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data()
        }))
      );
    });

    return () => unsub();
  }, [user]);

  const login = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const addPost = async () => {
    if (!caption || !date) return;

    const payload = {
      caption,
      date,
      platform,
      type: contentType,
      fileLink,
      status: "Scheduled",
      createdAt: Date.now()
    };

    if (editingId) {
      await updateDoc(doc(db, "posts", editingId), payload);
    } else {
      await addDoc(collection(db, "posts"), payload);
    }

    setCaption("");
    setDate("");
    setPlatform("Instagram");
    setContentType("Post");
    setFileLink("");
    setEditingId(null);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setCaption(item.caption || "");
    setDate(item.date || "");
    setPlatform(item.platform || "Instagram");
    setFileLink(item.fileLink || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const assignProp = (id) => {
    const person = prompt("Assign to:");
    if (!person) return;

    setPropsList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              assignedTo: person
            }
          : item
      )
    );
  };

  const deleteProp = (id) => {
    setPropsList((prev) => prev.filter((item) => item.id !== id));
  };

  const startPropEdit = (item) => {
    setEditingPropId(item.id);
    setEditingPropText(item.text);
    setOpenPropMenu(null);
  };

  const savePropEdit = () => {
    setPropsList((prev) =>
      prev.map((item) =>
        item.id === editingPropId
          ? {
              ...item,
              text: editingPropText
            }
          : item
      )
    );

    setEditingPropId(null);
    setEditingPropText("");
  };

  const assignCostume = (id) => {
    const person = prompt("Assign costume to:");
    if (!person) return;

    setCostumes((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              assignedTo: person
            }
          : item
      )
    );
  };

  const deleteCostume = (id) => {
    setCostumes((prev) => prev.filter((item) => item.id !== id));
  };

  const startCostumeEdit = (item) => {
    setEditingCostumeId(item.id);
    setEditingCostumeText(item.text);
    setOpenCostumeMenu(null);
  };

  const saveCostumeEdit = () => {
    setCostumes((prev) =>
      prev.map((item) =>
        item.id === editingCostumeId
          ? {
              ...item,
              text: editingCostumeText
            }
          : item
      )
    );

    setEditingCostumeId(null);
    setEditingCostumeText("");
  };

  const addSimpleItem = (setter, value, reset) => {
    if (!value.trim()) return;

    setter((prev) => [...prev, { id: Date.now(), text: value }]);
    reset("");
  };

  const addContact = () => {
    if (!contactName) return;

    setContacts((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: contactName,
        phone: contactPhone,
        email: contactEmail
      }
    ]);

    setContactName("");
    setContactPhone("");
    setContactEmail("");
  };

  const addPromo = () => {
    if (!promoTitle || !promoLink) return;

    setPromoItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: promoTitle,
        link: promoLink
      }
    ]);

    setPromoTitle("");
    setPromoLink("");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white p-6">
        <GlassCard className="max-w-md w-full text-center grid gap-6">
          <div>
            <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-200 bg-clip-text text-transparent">
              Brightside
            </h1>

            <p className="text-cyan-200/70 uppercase tracking-[0.3em] text-xs mt-3">
              Delivering Laughs On Time
            </p>
          </div>

          {authError && (
            <div className="rounded-2xl bg-red-500/10 border border-red-300/20 p-4 text-red-100 text-sm">
              {authError}
            </div>
          )}

          <button
            onClick={login}
            className={`${button} ${gradients.cyan} text-white font-bold`}
          >
            Continue with Google
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto grid gap-5">
        <GlassCard>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-200 bg-clip-text text-transparent">
                Brightside
              </h1>

              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70 mt-2">
                Delivering Laughs On Time
              </p>
            </div>

            <button
              onClick={logout}
              className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5"
            >
              ✦
            </button>
          </div>

          <div className="flex gap-2 flex-wrap mt-5">
            <button
              onClick={() => setView("feed")}
              className={`${button} px-5 ${view === "feed" ? gradients.pink : glass}`}
            >
              Feed
            </button>

            <button
              onClick={() => setView("calendar")}
              className={`${button} px-5 ${view === "calendar" ? gradients.cyan : glass}`}
            >
              Calendar
            </button>

            <button
              onClick={() => setView("costumes")}
              className={`${button} px-5 ${view === "costumes" ? gradients.orange : glass}`}
            >
              Costumes
            </button>

            <button
              onClick={() => setView("props")}
              className={`${button} px-5 ${view === "props" ? gradients.lime : glass}`}
            >
              Props
            </button>

            <button
              onClick={() => setView("promo")}
              className={`${button} px-5 ${view === "promo" ? gradients.pink : glass}`}
            >
              Promo
            </button>

            <button
              onClick={() => setView("contacts")}
              className={`${button} px-5 ${view === "contacts" ? gradients.cyan : glass}`}
            >
              Contacts
            </button>

            
          </div>
        </GlassCard>

        {view === "feed" && (
          <>
            <GlassCard>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  {["Post", "Task"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setContentType(type)}
                      className={`
                        ${button}
                        border
                        font-bold
                        transition-all
                        ${
                          contentType === type
                            ? type === "Post"
                              ? "border-fuchsia-300 text-fuchsia-100 shadow-[0_0_20px_rgba(217,70,239,0.55)] bg-fuchsia-500/10"
                              : "border-cyan-300 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.55)] bg-cyan-500/10"
                            : "border-white/10 bg-white/5 text-white/70"
                        }
                      `}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write caption..."
                  className="min-h-[140px] rounded-3xl bg-black/30 border border-white/10 p-5"
                />

                <input
                  value={fileLink}
                  onChange={(e) => setFileLink(e.target.value)}
                  placeholder="IMGUR or Icedrive link"
                  className={`${button} bg-black/30 px-4`}
                />

                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`${button} bg-black/30 px-4`}
                />

                <div className="grid grid-cols-3 gap-2">
                  {["Instagram", "Facebook", "TikTok"].map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPlatform(p);
                        if (p === "TikTok") {
                          setView("tiktok-inline");
                        } else {
                          setView("feed");
                        }
                      }}
                      className={`
                        ${button}
                        border
                        font-bold
                        transition-all
                        ${
                          platform === p
                            ? p === "Instagram"
                              ? "border-fuchsia-300 text-fuchsia-100 shadow-[0_0_20px_rgba(217,70,239,0.55)] bg-fuchsia-500/10"
                              : p === "Facebook"
                              ? "border-cyan-300 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.55)] bg-cyan-500/10"
                              : "border-orange-300 text-orange-100 shadow-[0_0_20px_rgba(251,146,60,0.55)] bg-orange-500/10"
                            : "border-white/10 bg-white/5 text-white/70"
                        }
                      `}
                    >
                      {p}
                    </button>
                  ))}

                  {platform === "TikTok" && (
                    <div className="col-span-3 mt-3 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                      <GlassCard className="xl:col-span-2 grid gap-4">
                        <div>
                          <h2 className="text-4xl font-black bg-gradient-to-r from-pink-300 via-fuchsia-300 to-orange-300 bg-clip-text text-transparent">
                            TikTok Dashboard
                          </h2>

                          <p className="text-white/50 mt-2">
                            Build captions, hashtags and prep videos for posting.
                          </p>
                        </div>

                        <textarea
                          value={tiktokCaption}
                          onChange={(e) => setTiktokCaption(e.target.value)}
                          placeholder="Write TikTok caption..."
                          className="min-h-[180px] rounded-3xl bg-black/30 border border-white/10 p-5"
                        />

                        <input
                          value={tiktokVideoLink}
                          onChange={(e) => setTiktokVideoLink(e.target.value)}
                          placeholder="Icedrive video link"
                          className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
                        />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.keys(hashtagPresets).map((preset) => (
                            <button
                              key={preset}
                              onClick={() => setSelectedPreset(preset)}
                              className={`h-12 rounded-2xl border transition-all ${
                                selectedPreset === preset
                                  ? "border-fuchsia-300 bg-fuchsia-500/20 text-fuchsia-100"
                                  : "border-white/10 bg-white/5"
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>

                        <div className="rounded-[1.8rem] border border-fuchsia-300/20 bg-fuchsia-500/10 p-5">
                          <div className="text-sm uppercase tracking-[0.2em] text-fuchsia-200/70 mb-3">
                            Suggested Hashtags
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {hashtagPresets[selectedPreset].map((tag) => (
                              <div
                                key={tag}
                                className="px-3 py-2 rounded-2xl bg-black/30 border border-white/10 text-sm"
                              >
                                {tag}
                              </div>
                            ))}
                          </div>
                        </div>
                      </GlassCard>

                      <GlassCard className="aspect-square flex flex-col justify-between">
                        <div>
                          <h3 className="text-3xl font-black bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
                            Posting Checklist
                          </h3>

                          <p className="text-white/50 mt-2 text-sm">
                            Prep everything before upload.
                          </p>
                        </div>

                        <div className="grid gap-3 text-sm">
                          {[
                            "Vertical video",
                            "Strong opening 3 seconds",
                            "Caption added",
                            "Hashtags selected",
                            "Thumbnail checked",
                            "Sound tested"
                          ].map((item) => (
                            <div
                              key={item}
                              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3"
                            >
                              <div className="w-5 h-5 rounded-full border border-fuchsia-300/30 bg-fuchsia-500/20" />
                              <div>{item}</div>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    </div>
                  )}
                </div>

                <button
                  onClick={addPost}
                  className={`${button} ${gradients.pink} text-white font-bold`}
                >
                  {editingId ? "Update Post" : "Add Post"}
                </button>
              </div>
            </GlassCard>

            <div className="grid gap-4">
              {items.map((item) => (
                <GlassCard key={item.id}>
                  {item.fileLink && (
                    <img
                      src={item.fileLink}
                      alt="post"
                      className="rounded-3xl mb-4 max-h-[320px] w-full object-cover"
                    />
                  )}

                  <div className="flex justify-between gap-4 flex-wrap">
                    <div className="grid gap-3">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {item.caption}
                        </h2>

                        <p className="text-white/50 text-sm mt-2">
                          {new Date(item.date).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <StatusBadge status={item.status} />

                        <div
                          className={`px-3 py-1 rounded-full text-xs uppercase border ${
                            item.type === "Task"
                              ? "border-cyan-300/20 bg-cyan-500/10 text-cyan-100"
                              : "border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100"
                          }`}
                        >
                          {item.type || "Post"}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="h-11 px-4 rounded-2xl border border-cyan-300/20 bg-cyan-400/10"
                      >
                        Edit
                      </button>

                      <button
                        onClick={async () => {
                          await deleteDoc(doc(db, "posts", item.id));
                        }}
                        className="h-11 px-4 rounded-2xl border border-red-300/20 bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </>
        )}

        {view === "calendar" && (
          <GlassCard>
            <div className="grid gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
                  Content Calendar
                </h2>

                <div className="text-cyan-200/60 text-sm uppercase tracking-[0.25em]">
                  {today.toLocaleString("default", {
                    month: "long"
                  })}
                </div>
              </div>

              <div className="grid grid-cols-7 gap-3">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs uppercase tracking-[0.2em] text-cyan-200/50 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-3">
                {calendarDays.map((day, i) => {
                  const matchingPosts = items.filter((item) => {
                    if (!item.date || !day) return false;

                    const itemDate = new Date(item.date);

                    return (
                      itemDate.getDate() === day &&
                      itemDate.getMonth() === currentMonth &&
                      itemDate.getFullYear() === currentYear
                    );
                  });

                  return (
                    <div
                      key={i}
                      className={`min-h-[140px] rounded-[1.8rem] border p-3 transition-all ${
                        day === today.getDate()
                          ? "border-fuchsia-300 shadow-[0_0_24px_rgba(236,72,153,0.45)] bg-fuchsia-500/10"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      <div className="text-sm font-bold text-cyan-100 mb-3">
                        {day || ""}
                      </div>

                      <div className="grid gap-2">
                        {matchingPosts.map((post) => (
                          <div
                            key={post.id}
                            className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-2 text-xs"
                          >
                            <div className="font-bold text-cyan-100 truncate">
                              {post.platform}
                            </div>

                            <div className="text-white/70 truncate">
                              {post.caption?.slice(0, 18)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        )}

        {view === "costumes" && (
          <div className="grid gap-5">
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              <GlassCard className="aspect-square flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl font-black bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent">
                    Costume List
                  </h2>

                  <p className="text-white/50 mt-2 text-sm">
                    Track costumes, fittings and assignments.
                  </p>
                </div>

                <div className="grid gap-3">
                  <input
                    value={newCostume}
                    onChange={(e) => setNewCostume(e.target.value)}
                    placeholder="Add costume item"
                    className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
                  />

                  <button
                    onClick={() => addSimpleItem(setCostumes, newCostume, setNewCostume)}
                    className={`${button} ${gradients.orange} text-white font-bold`}
                  >
                    Add Costume
                  </button>
                </div>
              </GlassCard>

              {costumes.map((item) => (
                <GlassCard
                  key={item.id}
                  className="aspect-square flex flex-col justify-between relative"
                >
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() =>
                        setOpenCostumeMenu(
                          openCostumeMenu === item.id ? null : item.id
                        )
                      }
                      className="w-10 h-10 rounded-2xl border border-white/10 bg-black/30 text-white/70"
                    >
                      ⋮
                    </button>

                    {openCostumeMenu === item.id && (
                      <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-white/10 bg-[#0f172a] shadow-[0_0_25px_rgba(0,0,0,0.35)] overflow-hidden z-20">
                        <button
                          onClick={() => assignCostume(item.id)}
                          className="w-full text-left px-4 py-3 hover:bg-white/5 text-cyan-100"
                        >
                          Assign
                        </button>

                        <button
                          onClick={() => startCostumeEdit(item)}
                          className="w-full text-left px-4 py-3 hover:bg-white/5 text-fuchsia-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteCostume(item.id)}
                          className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {editingCostumeId === item.id ? (
                    <div className="grid gap-3 mt-12">
                      <input
                        value={editingCostumeText}
                        onChange={(e) => setEditingCostumeText(e.target.value)}
                        className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
                      />

                      <button
                        onClick={saveCostumeEdit}
                        className={`${button} ${gradients.orange} text-white font-bold`}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-orange-100 mt-10 text-center">
                        {item.text}
                      </div>

                      {item.assignedTo && (
                        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-3 text-center text-sm text-cyan-100">
                          Assigned to: {item.assignedTo}
                        </div>
                      )}
                    </>
                  )}
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {view === "props" && (
          <div className="grid gap-5">
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              <GlassCard className="aspect-square flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl font-black bg-gradient-to-r from-lime-300 to-emerald-300 bg-clip-text text-transparent">
                    Prop List
                  </h2>

                  <p className="text-white/50 mt-2 text-sm">
                    Track all stage props.
                  </p>
                </div>

                <div className="grid gap-3">
                  <input
                    value={newProp}
                    onChange={(e) => setNewProp(e.target.value)}
                    placeholder="Add prop item"
                    className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
                  />

                  <button
                    onClick={() => addSimpleItem(setPropsList, newProp, setNewProp)}
                    className={`${button} ${gradients.lime} text-white font-bold`}
                  >
                    Add Prop
                  </button>
                </div>
              </GlassCard>

              {propsList.map((item) => (
                <GlassCard
                  key={item.id}
                  className="aspect-square flex flex-col justify-between relative"
                >
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() =>
                        setOpenPropMenu(
                          openPropMenu === item.id ? null : item.id
                        )
                      }
                      className="w-10 h-10 rounded-2xl border border-white/10 bg-black/30 text-white/70"
                    >
                      ⋮
                    </button>

                    {openPropMenu === item.id && (
                      <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-white/10 bg-[#0f172a] shadow-[0_0_25px_rgba(0,0,0,0.35)] overflow-hidden z-20">
                        <button
                          onClick={() => assignProp(item.id)}
                          className="w-full text-left px-4 py-3 hover:bg-white/5 text-cyan-100"
                        >
                          Assign
                        </button>

                        <button
                          onClick={() => startPropEdit(item)}
                          className="w-full text-left px-4 py-3 hover:bg-white/5 text-fuchsia-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteProp(item.id)}
                          className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {editingPropId === item.id ? (
                    <div className="grid gap-3 mt-12">
                      <input
                        value={editingPropText}
                        onChange={(e) => setEditingPropText(e.target.value)}
                        className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
                      />

                      <button
                        onClick={savePropEdit}
                        className={`${button} ${gradients.lime} text-white font-bold`}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-lime-100 mt-10 text-center">
                        {item.text}
                      </div>

                      {item.assignedTo && (
                        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-3 text-center text-sm text-cyan-100">
                          Assigned to: {item.assignedTo}
                        </div>
                      )}
                    </>
                  )}
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {view === "promo" && (
          <div className="grid gap-5">
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              <GlassCard className="aspect-square flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl font-black bg-gradient-to-r from-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                    Promo Materials
                  </h2>

                  <p className="text-white/50 mt-2 text-sm">
                    Posters, graphics and downloadable assets.
                  </p>
                </div>

                <div className="grid gap-3">
                  <input
                    value={promoTitle}
                    onChange={(e) => setPromoTitle(e.target.value)}
                    placeholder="Promo title"
                    className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
                  />

                  <input
                    value={promoLink}
                    onChange={(e) => setPromoLink(e.target.value)}
                    placeholder="Image or Icedrive link"
                    className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
                  />

                  <button
                    onClick={addPromo}
                    className={`${button} ${gradients.pink} text-white font-bold`}
                  >
                    Add Promo
                  </button>
                </div>
              </GlassCard>

              {promoItems.map((item) => (
                <GlassCard
                  key={item.id}
                  className="aspect-square overflow-hidden p-0"
                >
                  <img
                    src={item.link}
                    alt={item.title}
                    className="w-full h-[70%] object-cover"
                  />

                  <div className="p-4">
                    <div className="text-xl font-bold truncate">
                      {item.title}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {view === "contacts" && (
          <div className="grid gap-5">
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              <GlassCard className="aspect-square flex flex-col justify-between">
                <div>
                  <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                    Contacts
                  </h2>

                  <p className="text-white/50 mt-2 text-sm">
                    Cast, crew and production contacts.
                  </p>
                </div>

                <div className="grid gap-3">
                  <input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Name"
                    className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
                  />

                  <input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Phone"
                    className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
                  />

                  <input
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Email"
                    className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
                  />

                  <button
                    onClick={addContact}
                    className={`${button} ${gradients.cyan} text-white font-bold`}
                  >
                    Add Contact
                  </button>
                </div>
              </GlassCard>

              {contacts.map((contact) => (
                <GlassCard
                  key={contact.id}
                  className="aspect-square flex flex-col justify-center"
                >
                  <div className="text-2xl font-black text-cyan-100">
                    {contact.name}
                  </div>

                  <div className="mt-4 grid gap-2 text-sm">
                    <div className="text-white/70">
                      {contact.phone}
                    </div>

                    <a
                      href={`mailto:${contact.email}`}
                      className="text-cyan-300 break-all underline underline-offset-4 hover:text-cyan-200 transition-all"
                    >
                      {contact.email}
                    </a>

                    <a
                      href={`mailto:${contact.email}`}
                      className="mt-3 inline-flex items-center justify-center h-11 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-100 font-bold"
                    >
                      Email Contact
                    </a>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
}

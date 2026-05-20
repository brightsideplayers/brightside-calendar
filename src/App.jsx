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
                      onClick={() => setPlatform(p)}
                      className={`${button} ${platform === p ? gradients.orange : glass}`}
                    >
                      {p}
                    </button>
                  ))}
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

                      <StatusBadge status={item.status} />
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
            <div className="text-4xl font-bold mb-5">Content Calendar</div>
            <div className="grid grid-cols-7 gap-3">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs uppercase tracking-[0.2em] text-cyan-200/50">
                  {day}
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {view === "costumes" && (
          <GlassCard>
            <div className="grid gap-4">
              <h2 className="text-4xl font-bold">Costume List</h2>
              <div className="flex gap-2">
                <input
                  value={newCostume}
                  onChange={(e) => setNewCostume(e.target.value)}
                  placeholder="Add costume item"
                  className="flex-1 h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
                />
                <button
                  onClick={() => addSimpleItem(setCostumes, newCostume, setNewCostume)}
                  className={`${button} px-5 ${gradients.orange}`}
                >
                  Add
                </button>
              </div>

              <div className="grid gap-3">
                {costumes.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        )}

        {view === "props" && (
          <GlassCard>
            <div className="grid gap-4">
              <h2 className="text-4xl font-bold">Prop List</h2>
              <div className="flex gap-2">
                <input
                  value={newProp}
                  onChange={(e) => setNewProp(e.target.value)}
                  placeholder="Add prop item"
                  className="flex-1 h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
                />
                <button
                  onClick={() => addSimpleItem(setPropsList, newProp, setNewProp)}
                  className={`${button} px-5 ${gradients.lime}`}
                >
                  Add
                </button>
              </div>

              <div className="grid gap-3">
                {propsList.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        )}

        {view === "promo" && (
          <GlassCard>
            <div className="grid gap-4">
              <h2 className="text-4xl font-bold">Promo Materials</h2>

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
                Add Promo Material
              </button>

              <div className="grid md:grid-cols-2 gap-4">
                {promoItems.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
                    <img src={item.link} alt={item.title} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="text-xl font-bold">{item.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        )}

        {view === "contacts" && (
          <GlassCard>
            <div className="grid gap-4">
              <h2 className="text-4xl font-bold">Contacts</h2>

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

              <div className="grid gap-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xl font-bold">{contact.name}</div>
                    <div className="text-white/70 text-sm mt-2">{contact.phone}</div>
                    <div className="text-cyan-300 text-sm">{contact.email}</div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

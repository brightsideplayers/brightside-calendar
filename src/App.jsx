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
const [showCalendarModal, setShowCalendarModal] = useState(false);
const [selectedCalendarDate, setSelectedCalendarDate] = useState("");
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
  const [contactSkill, setContactSkill] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [emailGroup, setEmailGroup] = useState("All");

  const openCalendarQuickAdd = (day) => {
  const selectedDate = new Date(currentYear, currentMonth, day);

  const formatted = selectedDate.toISOString().slice(0, 16);

  setDate(formatted);
  setSelectedCalendarDate(formatted);
  setShowCalendarModal(true);
};

const copyEmailsBySkill = (skill) => {
    const filtered = contacts.filter((contact) =>
      skill === "All"
        ? contact.email
        : contact.skill === skill && contact.email
    );

    const emails = filtered.map((c) => c.email).join(", ");

    navigator.clipboard.writeText(emails);

    alert(
      emails.length
        ? `Copied ${filtered.length} email(s) to clipboard`
        : "No emails found"
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto grid gap-5">
        {view === "calendar" && (
  <GlassCard>
    <div className="grid gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl leading-tight pb-2 font-bold bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">
          Content Calendar
        </h2>
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
              className={`min-h-[160px] rounded-[1.8rem] border p-3 transition-all relative ${
                day === today.getDate()
                  ? "border-fuchsia-300 shadow-[0_0_24px_rgba(236,72,153,0.45)] bg-fuchsia-500/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-cyan-100">
                  {day || ""}
                </div>

                {day && (
                  <button
                    onClick={() => openCalendarQuickAdd(day)}
                    className="w-8 h-8 rounded-xl border border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100 text-lg font-bold hover:scale-105 transition-all"
                  >
                    +
                  </button>
                )}
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

    {showCalendarModal && (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#020617] p-6 grid gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl leading-tight pb-2 font-black bg-gradient-to-r from-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              Quick Add
            </h2>

            <button
              onClick={() => setShowCalendarModal(false)}
              className="w-10 h-10 rounded-2xl border border-white/10 bg-white/5"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {["Post", "Task"].map((type) => (
              <button
                key={type}
                onClick={() => setContentType(type)}
                className={`${button} border ${
                  contentType === type
                    ? type === "Post"
                      ? "border-fuchsia-300 bg-fuchsia-500/10 text-fuchsia-100"
                      : "border-cyan-300 bg-cyan-500/10 text-cyan-100"
                    : "border-white/10 bg-white/5 text-white/70"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write caption or task..."
            className="min-h-[140px] rounded-3xl bg-black/30 border border-white/10 p-5"
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
                className={`${button} border ${
                  platform === p
                    ? "border-fuchsia-300 bg-fuchsia-500/10 text-fuchsia-100"
                    : "border-white/10 bg-white/5 text-white/70"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={async () => {
              await addPost();
              setShowCalendarModal(false);
            }}
            className={`${button} ${gradients.pink} text-white font-bold`}
          >
            Add To Calendar
          </button>
        </div>
      </div>
    )}
  </GlassCard>
)}

{view === "contacts" && (
          <div className="grid gap-5">
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
              {[
                "All",
                "Actor",
                "Executive",
                "Set Design",
                "Costumes",
                "Stage Crew"
              ].map((group) => (
                <button
                  key={group}
                  onClick={() => {
                    setEmailGroup(group);
                    copyEmailsBySkill(group);
                  }}
                  className={`h-11 px-4 rounded-2xl border transition-all whitespace-nowrap ${
                    emailGroup === group
                      ? "border-fuchsia-300 text-fuchsia-100 shadow-[0_0_20px_rgba(217,70,239,0.45)] bg-fuchsia-500/10"
                      : "border-white/10 bg-white/5 text-white/70"
                  }`}
                >
                  Copy {group} Emails
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
              {[
                "All",
                "Actor",
                "Executive",
                "Set Design",
                "Costumes",
                "Stage Crew"
              ].map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  className={`h-11 px-4 rounded-2xl border transition-all whitespace-nowrap ${
                    selectedSkill === skill
                      ? "border-cyan-300 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.45)] bg-cyan-500/10"
                      : "border-white/10 bg-white/5 text-white/70"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>

            <GlassCard>
              <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-3">
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

                <input
                  value={contactSkill}
                  onChange={(e) => setContactSkill(e.target.value)}
                  placeholder="Skill"
                  className="h-12 rounded-2xl bg-black/30 border border-white/10 px-4"
                />
              </div>
            </GlassCard>

            <div className="grid gap-3">
              {contacts
                .filter((contact) =>
                  selectedSkill === "All"
                    ? true
                    : contact.skill === selectedSkill
                )
                .map((contact) => (
                  <div
                    key={contact.id}
                    className="rounded-[1.8rem] border border-white/10 bg-white/5 backdrop-blur-2xl px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div className="grid gap-2 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="text-xl font-black text-cyan-100 truncate">
                          {contact.name}
                        </div>

                        {contact.skill && (
                          <div className="px-3 py-1 rounded-full border border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100 text-xs uppercase tracking-[0.2em]">
                            {contact.skill}
                          </div>
                        )}
                      </div>

                      <div className="text-white/70 text-sm">
                        {contact.phone}
                      </div>

                      <div className="text-cyan-300 text-sm break-all">
                        {contact.email}
                      </div>
                    </div>

                    <div className="flex gap-2 md:flex-shrink-0">
                      <a
                        href={`tel:${contact.phone}`}
                        className="h-11 px-4 rounded-2xl border border-lime-300/20 bg-lime-500/10 text-lime-100 flex items-center justify-center font-bold"
                      >
                        Call
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

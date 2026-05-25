import {
  useState,
  useEffect
} from "react";

import {
  collection,
  addDoc,
  onSnapshot
} from "firebase/firestore";

import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

import {
  db,
  auth,
  provider
} from "./firebase";

import FeedView from "./components/feed/FeedView";
import CalendarView from "./components/calendar/CalendarView";
import QuickAddModal from "./components/calendar/QuickAddModal";
import ContactsView from "./components/contacts/ContactsView";
import CostumesView from "./components/costumes/CostumesView";
import PropsView from "./components/props/PropsView";
import SetView from "./components/sets/SetView";
import PromoView from "./components/promo/PromoView";
import RehearsalsView from "./components/rehearsals/RehearsalsView";

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const [view, setView] = useState("feed");

  const [productions, setProductions] = useState([
    "The Little Mermaid",
    "Robin Hood"
  ]);

  const [currentProduction, setCurrentProduction] =
    useState("The Little Mermaid");

  const [showProductionMenu, setShowProductionMenu] =
    useState(false);

  const [newProductionName, setNewProductionName] =
    useState("");

  const [items, setItems] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [quickAddDate, setQuickAddDate] = useState(null);

  useEffect(() => {
    getRedirectResult(auth)
      .then(() => {
        setAuthError("");
      })
      .catch((error) => {
        console.error("Google redirect sign-in error:", error);
        setAuthError(error.message);
      });

    const unsub = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
      }
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(
      collection(db, "productions"),
      (snapshot) => {
        const loadedProductions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        if (loadedProductions.length === 0) {
          setProductions([
            "The Little Mermaid",
            "Robin Hood"
          ]);
          return;
        }

        const names = loadedProductions
          .map((item) => item.name)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));

        setProductions(names);

        if (!names.includes(currentProduction)) {
          setCurrentProduction(names[0]);
        }
      }
    );

    return () => unsub();
  }, [user, currentProduction]);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(
      collection(db, "posts"),
      (snapshot) => {
        setItems(
          snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data()
            }))
            .filter((item) =>
              item.production === currentProduction
            )
        );
      }
    );

    return () => unsub();
  }, [user, currentProduction]);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(
      collection(db, "contacts"),
      (snapshot) => {
        setContacts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }))
        );
      }
    );

    return () => unsub();
  }, [user]);

  const handleGoogleSignIn = async () => {
    try {
      setAuthError("");
      setAuthLoading(true);

      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Popup sign-in error:", error);

      if (
        error.code === "auth/popup-blocked" ||
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      ) {
        await signInWithRedirect(auth, provider);
        return;
      }

      setAuthError(error.message);
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const addProduction = async () => {
    if (!newProductionName.trim()) return;

    await addDoc(
      collection(db, "productions"),
      {
        name: newProductionName.trim(),
        createdAt: Date.now()
      }
    );

    setCurrentProduction(newProductionName.trim());
    setNewProductionName("");
    setShowProductionMenu(false);
  };

  const openQuickAdd = (day) => {
    const date = new Date();
    date.setDate(day);
    setQuickAddDate(date);
  };

  const views = {
    feed: (
      <FeedView
        items={items}
        setItems={setItems}
        currentProduction={currentProduction}
      />
    ),

    calendar: (
      <CalendarView
        posts={items}
        setItems={setItems}
        openCalendarQuickAdd={openQuickAdd}
        currentProduction={currentProduction}
      />
    ),

    contacts: (
      <ContactsView contacts={contacts} />
    ),

    costumes: (
      <CostumesView
        currentProduction={currentProduction}
      />
    ),

    props: (
      <PropsView
        currentProduction={currentProduction}
      />
    ),

    set: (
      <SetView
        currentProduction={currentProduction}
      />
    ),

    promo: (
      <PromoView
        currentProduction={currentProduction}
      />
    ),

    rehearsals: (
      <RehearsalsView
        currentProduction={currentProduction}
      />
    )
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6">
        <div className="text-cyan-100/60">
          Loading Brightside...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020617] text-white px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 grid gap-6 text-center">
          <div>
            <h1 className="text-5xl font-black leading-[1.15] pb-2 bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-200 bg-clip-text text-transparent">
              Brightside
            </h1>

            <div className="text-cyan-100/60 mt-3">
              Production Dashboard
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="h-14 rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-orange-400 text-black font-black hover:scale-[1.02] transition-all"
          >
            Sign in with Google
          </button>

          {authError && (
            <div className="rounded-2xl border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100 text-left">
              {authError}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#020617] text-white px-3 py-4 sm:px-4 md:p-6">
      <div className="w-full max-w-7xl mx-auto grid gap-5 min-w-0">
        <div className="w-full min-w-0 rounded-[1.5rem] sm:rounded-[1.8rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-4 sm:p-5 overflow-visible">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 min-w-0">
            <div className="min-w-0 w-full">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl leading-tight pb-3 font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-200 bg-clip-text text-transparent break-words">
                    Brightside
                  </h1>

                  <div className="text-cyan-100/70">
                    Production Dashboard
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="h-10 px-4 rounded-xl border border-white/10 bg-white/5 text-white/70 text-sm hover:bg-white/10 transition-all"
                >
                  Sign Out
                </button>
              </div>

              <div className="pt-4 grid grid-cols-[1fr_56px] sm:flex sm:items-center gap-3 w-full">
                <select
                  value={currentProduction}
                  onChange={(e) =>
                    setCurrentProduction(e.target.value)
                  }
                  className="w-full h-12 rounded-2xl bg-black/30 border border-fuchsia-300/20 px-4 text-white font-medium shadow-[0_0_25px_rgba(217,70,239,0.12)] min-w-0"
                >
                  {productions.map((production) => (
                    <option key={production}>
                      {production}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <button
                    onClick={() =>
                      setShowProductionMenu(!showProductionMenu)
                    }
                    className="w-14 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-xl"
                  >
                    ⋯
                  </button>

                  {showProductionMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() =>
                          setShowProductionMenu(false)
                        }
                      />

                      <div className="absolute right-0 mt-2 w-72 rounded-[1.6rem] bg-[#071018] border border-white/10 p-3 grid gap-3 z-50 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
                        <div className="text-xs uppercase tracking-[0.2em] text-white/40">
                          Add Production
                        </div>

                        <input
                          value={newProductionName}
                          onChange={(e) =>
                            setNewProductionName(e.target.value)
                          }
                          placeholder="Production name..."
                          className="h-11 rounded-xl bg-black/30 border border-white/10 px-3 text-white"
                        />

                        <button
                          onClick={addProduction}
                          className="h-11 rounded-xl border border-cyan-300/20 bg-cyan-500/10 text-cyan-100 font-bold hover:bg-cyan-500/20 transition-all"
                        >
                          Save Production
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5">
            <div className="grid grid-cols-4 gap-2">
              {Object.keys(views).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`h-16 rounded-[1.4rem] border transition-all capitalize flex flex-col items-center justify-center gap-1 text-[11px] ${
                    view === v
                      ? "border-fuchsia-300/30 bg-fuchsia-500/20 text-white"
                      : "border-white/10 bg-white/5 text-white/60"
                  }`}
                >
                  <div className="text-lg">
                    {{
                      feed: "📰",
                      calendar: "📅",
                      contacts: "👥",
                      costumes: "👗",
                      props: "🎭",
                      set: "🪵",
                      promo: "✨",
                      rehearsals: "🎬"
                    }[v]}
                  </div>

                  <div>{v}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full min-w-0">
          {views[view]}
        </div>

        <QuickAddModal
          quickAddDate={quickAddDate}
          setQuickAddDate={setQuickAddDate}
          setItems={setItems}
          currentProduction={currentProduction}
        />
      </div>
    </div>
  );
}

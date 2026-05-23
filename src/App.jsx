import {
  useState,
  useEffect
} from "react";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import { db } from "./firebase";

import FeedView from "./components/feed/FeedView";

import CalendarView from "./components/calendar/CalendarView";

import QuickAddModal from "./components/calendar/QuickAddModal";

import ContactsView from "./components/contacts/ContactsView";

import CostumesView from "./components/costumes/CostumesView";

import PropsView from "./components/props/PropsView";

import PromoView from "./components/promo/PromoView";

export default function App() {
  const [view, setView] =
    useState("feed");

  const [
    currentProduction,
    setCurrentProduction
  ] = useState(
    "The Little Mermaid"
  );

  const [
    showProductionMenu,
    setShowProductionMenu
  ] = useState(false);

  const [items, setItems] =
    useState([]);

  const [contacts, setContacts] =
    useState([]);

  const [
    quickAddDate,
    setQuickAddDate
  ] = useState(null);

  // POSTS
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "posts"),
      (snapshot) => {
        setItems(
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data()
            })
          )
        );
      }
    );

    return () => unsub();
  }, []);

  // CONTACTS
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "contacts"),
      (snapshot) => {
        setContacts(
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data()
            })
          )
        );
      }
    );

    return () => unsub();
  }, []);

  const openQuickAdd = (
    day
  ) => {
    const date = new Date();

    date.setDate(day);

    setQuickAddDate(date);
  };

  const views = {
    feed: (
      <FeedView
        items={items}
        setItems={setItems}
      />
    ),

    calendar: (
      <CalendarView
        posts={items}
        setItems={setItems}
        openCalendarQuickAdd={
          openQuickAdd
        }
      />
    ),

    contacts: (
      <ContactsView
        contacts={contacts}
      />
    ),

    costumes: <CostumesView />,

    props: <PropsView />,

    promo: <PromoView />
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto grid gap-5">
        {/* HEADER */}
        <div className="rounded-[1.8rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-6xl leading-tight pb-3 font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-200 bg-clip-text text-transparent">
                Brightside
              </h1>

              <div className="text-cyan-100/70">
                Production Dashboard
              </div>

              <div className="pt-4 flex items-center gap-3">
                <select
                  value={
                    currentProduction
                  }
                  onChange={(e) =>
                    setCurrentProduction(
                      e.target.value
                    )
                  }
                  className="h-12 rounded-2xl bg-black/30 border border-fuchsia-300/20 px-5 text-white font-medium shadow-[0_0_25px_rgba(217,70,239,0.12)]"
                >
                  <option>
                    The Little Mermaid
                  </option>

                  <option>
                    Robin Hood
                  </option>
                </select>

                <div className="relative">
                  <button
                    onClick={() =>
                      setShowProductionMenu(
                        !showProductionMenu
                      )
                    }
                    className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-xl"
                  >
                    ⋯
                  </button>

                  {showProductionMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() =>
                          setShowProductionMenu(
                            false
                          )
                        }
                      />

                      <div className="absolute right-0 mt-2 w-56 rounded-[1.6rem] bg-[#071018] border border-white/10 p-3 grid gap-2 z-50 shadow-[0_0_40px_rgba(0,0,0,0.45)]">
                        <button className="h-11 rounded-xl border border-cyan-300/20 bg-cyan-500/10 text-cyan-100">
                          Add Production
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* NAV */}
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap pt-5">
            {Object.keys(
              views
            ).map((v) => (
              <button
                key={v}
                onClick={() =>
                  setView(v)
                }
                className={`h-12 px-5 rounded-2xl border transition-all capitalize ${
                  view === v
                    ? "border-fuchsia-300/30 bg-fuchsia-500/20 text-white"
                    : "border-white/10 bg-white/5 text-white/70"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* ACTIVE VIEW */}
        {views[view]}

        {/* QUICK ADD */}
        <QuickAddModal
          quickAddDate={
            quickAddDate
          }
          setQuickAddDate={
            setQuickAddDate
          }
          setItems={setItems}
        />
      </div>
    </div>
  );
}

import { useState } from "react";

import FeedView from "./components/feed/FeedView";
import CalendarView from "./components/calendar/CalendarView";
import QuickAddModal from "./components/calendar/QuickAddModal";

import ContactsView from "./components/contacts/ContactsView";
import CostumesView from "./components/costumes/CostumesView";
import PropsView from "./components/props/PropsView";
import PromoView from "./components/promo/PromoView";
import TikTokView from "./components/tiktok/TikTokView";

export default function App() {
  const [view, setView] = useState("feed");

  const [items, setItems] = useState([]);

  const [quickAddDate, setQuickAddDate] = useState(null);

  const openCalendarQuickAdd = (day) => {
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
        items={items}
        setItems={setItems}
        openCalendarQuickAdd={openCalendarQuickAdd}
      />
    ),

    contacts: <ContactsView />,

    costumes: <CostumesView />,

    props: <PropsView />,

    promo: <PromoView />,

    tiktok: <TikTokView />
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto grid gap-5">
        <div className="rounded-[1.8rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-6xl leading-tight pb-3 font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-200 bg-clip-text text-transparent">
                Brightside
              </h1>

              <div className="text-cyan-100/70">
                Production Dashboard
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto whitespace-nowrap pt-5">
            {Object.keys(views).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
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

        {views[view]}

        <QuickAddModal
          quickAddDate={quickAddDate}
          setQuickAddDate={setQuickAddDate}
          setItems={setItems}
        />
      </div>
    </div>
  );
}

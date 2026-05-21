
import { useState } from "react";
import FeedView from "./components/feed/FeedView";
import CalendarView from "./components/calendar/CalendarView";
import ContactsView from "./components/contacts/ContactsView";
import CostumesView from "./components/costumes/CostumesView";
import PropsView from "./components/props/PropsView";
import PromoView from "./components/promo/PromoView";
import TikTokView from "./components/tiktok/TikTokView";

export default function App() {
  const [view, setView] = useState("feed");
  const openCalendarQuickAdd = (day) => {
  const date = new Date();

  date.setDate(day);

  setQuickAddDate(date);
};
  const views = {
  feed: <FeedView />,

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
        <div className="flex gap-2 overflow-x-auto">
          {Object.keys(views).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="h-12 px-5 rounded-2xl border border-white/10 bg-white/5 capitalize"
            >
              {v}
            </button>
          ))}
        </div>

        {views[view]}
      </div>
    </div>
  );
}

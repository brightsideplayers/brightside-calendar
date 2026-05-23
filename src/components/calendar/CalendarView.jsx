import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
} from "lucide-react";

export default function CalendarView({ posts = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayItems, setSelectedDayItems] = useState([]);

  const today = new Date();

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();

  const calendarDays = useMemo(() => {
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [startDay, daysInMonth]);

  const getPostsForDay = (day) => {
    if (!day) return [];

    return posts.filter((post) => {
      if (!post.date) return false;

      const postDate = new Date(post.date);

      return (
        postDate.getDate() === day &&
        postDate.getMonth() === month &&
        postDate.getFullYear() === year
      );
    });
  };

  const openDay = (day) => {
    setSelectedDay(day);
    setSelectedDayItems(getPostsForDay(day));
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="w-full">
      <div className="grid gap-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <Calendar className="w-8 h-8 text-cyan-400" />
              Content Calendar
            </h1>

            <p className="text-white/50 mt-1">
              Organize your social media schedule.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={previousMonth}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={nextMonth}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* MONTH */}
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white">
            {monthNames[month]} {year}
          </h2>
        </div>

        {/* CALENDAR */}
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] overflow-hidden">
          {/* WEEKDAYS */}
          <div className="grid grid-cols-7 border-b border-white/10">
            {weekDays.map((day) => (
              <div
                key={day}
                className="p-4 text-center text-sm font-bold text-cyan-300 border-r border-white/5 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* DAYS */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const items = getPostsForDay(day);

              const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();

              return (
                <button
                  key={index}
                  onClick={() => day && openDay(day)}
                  className="min-h-[120px] md:min-h-[150px] p-3 border-r border-b border-white/5 text-left hover:bg-cyan-400/5 transition-all"
                >
                  {day && (
                    <>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black mb-2 ${
                          isToday
                            ? "bg-cyan-400 text-black"
                            : "text-white"
                        }`}
                      >
                        {day}
                      </div>

                      <div className="grid gap-2">
                        {items.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl bg-cyan-400/10 border border-cyan-400/20 p-2 text-xs text-white truncate"
                          >
                            {item.platform || "Post"}
                          </div>
                        ))}

                        {items.length > 3 && (
                          <div className="text-xs text-cyan-300 font-semibold">
                            +{items.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FULLSCREEN DAY VIEW */}
      {selectedDay && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl overflow-y-auto p-4 flex items-start md:items-center justify-center">
          <div className="w-full md:max-w-3xl bg-[#071018] border border-white/10 rounded-[2rem] p-6 relative max-h-[90vh] overflow-y-auto">
            {/* CLOSE */}
            <button
              onClick={() => {
                setSelectedDay(null);
                setSelectedDayItems([]);
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-cyan-400 text-black font-black text-xl hover:scale-110 transition-all"
            >
              ✕
            </button>

            {/* TITLE */}
            <div className="mb-6 pr-14">
              <h2 className="text-4xl font-black text-white">
                {monthNames[month]} {selectedDay}
              </h2>

              <p className="text-white/50 mt-2">
                {selectedDayItems.length} scheduled post
                {selectedDayItems.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* POSTS */}
            <div className="grid gap-4 pb-6">
              {selectedDayItems.length > 0 ? (
                selectedDayItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 grid gap-4"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-sm font-bold uppercase">
                        {item.platform || "SOCIAL POST"}
                      </div>

                      {item.time && (
                        <div className="text-sm text-white/50">
                          {item.time}
                        </div>
                      )}
                    </div>

                    {item.title && (
                      <h3 className="text-2xl font-black text-white">
                        {item.title}
                      </h3>
                    )}

                    {item.caption && (
                      <div className="rounded-2xl bg-black/20 border border-white/5 p-4 text-white/80 whitespace-pre-wrap leading-relaxed">
                        {item.caption}
                      </div>
                    )}

                    {item.hashtags && (
                      <div className="text-cyan-300 text-sm whitespace-pre-wrap">
                        {item.hashtags}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-12 text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-cyan-300" />
                  </div>

                  <h3 className="text-2xl font-black text-white">
                    No Posts Scheduled
                  </h3>

                  <p className="text-white/50 mt-2">
                    There are no scheduled posts for this day yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

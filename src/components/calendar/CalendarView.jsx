import { useMemo, useState } from "react";

export default function CalendarView({
  posts = [],
  openCalendarQuickAdd
}) {
  const [currentDate, setCurrentDate] =
    useState(new Date());

  const [selectedDay, setSelectedDay] =
    useState(null);

  const [
    selectedDayItems,
    setSelectedDayItems
  ] = useState([]);

  const today = new Date();

  const month =
    currentDate.getMonth();

  const year =
    currentDate.getFullYear();

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

  const weekDays = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];

  const firstDay = new Date(
    year,
    month,
    1
  );

  const lastDay = new Date(
    year,
    month + 1,
    0
  );

  const daysInMonth =
    lastDay.getDate();

  const startDay =
    firstDay.getDay();

  const calendarDays = useMemo(
    () => {
      const days = [];

      for (
        let i = 0;
        i < startDay;
        i++
      ) {
        days.push(null);
      }

      for (
        let day = 1;
        day <= daysInMonth;
        day++
      ) {
        days.push(day);
      }

      return days;
    },
    [startDay, daysInMonth]
  );

  const getPostsForDay = (
    day
  ) => {
    if (!day) return [];

    return posts.filter(
      (post) => {
        const rawDate =
          post.date ||
          post.scheduledFor;

        if (!rawDate)
          return false;

        const postDate =
          new Date(rawDate);

        return (
          postDate.getDate() ===
            day &&
          postDate.getMonth() ===
            month &&
          postDate.getFullYear() ===
            year
        );
      }
    );
  };

  const openDay = (day) => {
    setSelectedDay(day);

    setSelectedDayItems(
      getPostsForDay(day)
    );
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );
  };

  return (
    <div className="w-full pb-32">
      <div className="grid gap-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white flex items-center gap-3">
              <span className="text-cyan-400">
                📅
              </span>

              Calendar
            </h1>

            <p className="text-white/50 mt-2">
              Schedule your
              productions, social
              posts & rehearsal
              tasks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={
                previousMonth
              }
              className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center"
            >
              ←
            </button>

            <button
              onClick={nextMonth}
              className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center"
            >
              →
            </button>
          </div>
        </div>

        {/* MONTH */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl md:text-6xl font-black bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-orange-200 bg-clip-text text-transparent">
            {monthNames[month]}{" "}
            {year}
          </h2>
        </div>

        {/* WEEK DAYS */}
        <div className="grid grid-cols-7 gap-2 md:gap-3">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-white/50 text-sm md:text-base font-bold py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* CALENDAR */}
        <div className="grid grid-cols-7 gap-2 md:gap-3">
          {calendarDays.map(
            (day, index) => {
              const items =
                getPostsForDay(
                  day
                );

              const isToday =
                day ===
                  today.getDate() &&
                month ===
                  today.getMonth() &&
                year ===
                  today.getFullYear();

              return (
                <button
                  key={index}
                  onClick={() => {
                    if (!day)
                      return;

                    openDay(day);
                  }}
                  className={`relative h-[140px] md:h-[180px] rounded-[1.5rem] p-2 md:p-3 text-left overflow-hidden transition-all ${
                    day
                      ? "bg-[#060b16] border border-white/[0.03] hover:bg-cyan-500/[0.04]"
                      : "bg-transparent"
                  }`}
                >
                  {day && (
                    <>
                      {/* DATE */}
                      {/* DATE */}
<div
  className={`absolute top-3 left-3 text-lg md:text-2xl font-black z-10 ${
    isToday
      ? "text-cyan-300"
      : "text-white"
  }`}
>
  {day}
</div>

                      {/* EVENTS */}
                     {/* EVENTS */}
                     <div className="grid gap-1.5 pt-9">
                        {items
                          .slice(
                            0,
                            4
                          )
                          .map(
                            (
                              item,
                              idx
                            ) => (
                             <div
  key={idx}
  className={`rounded-lg px-2 py-1 text-[11px] md:text-xs text-white truncate border ${
    item.type === "task"
      ? "bg-amber-400/20 border-amber-300/20 text-amber-100"

      : item.platform === "Instagram"
      ? "bg-fuchsia-500/20 border-fuchsia-300/20 text-fuchsia-100"

      : item.platform === "Facebook"
      ? "bg-cyan-500/20 border-cyan-300/20 text-cyan-100"

      : item.platform === "TikTok"
      ? "bg-white/10 border-white/10 text-white"

      : item.platform === "YouTube"
      ? "bg-red-500/20 border-red-300/20 text-red-100"

      : "bg-white/10 border-white/10 text-white"
  }`}
>
  {item.platform ||
    item.title ||
    "Post"}
</div>
                            )
                          )}

                        {items.length >
                          4 && (
                          <div className="text-[11px] text-cyan-300 font-semibold pl-1">
                            +
                            {items.length -
                              4}{" "}
                            more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* FLOATING ADD BUTTON */}
      <button
        onClick={() => {
          const today =
            new Date();

          if (
            openCalendarQuickAdd
          ) {
            openCalendarQuickAdd(
              today.getDate()
            );
          }
        }}
        className="fixed bottom-8 right-8 z-[90] w-20 h-20 rounded-[2rem] bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-black text-5xl font-light shadow-[0_0_40px_rgba(34,211,238,0.45)] hover:scale-105 transition-all flex items-center justify-center"
      >
        +
      </button>

      {/* DAY MODAL */}
      {selectedDay && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl overflow-y-auto p-4 flex items-start md:items-center justify-center">
          <div className="w-full md:max-w-3xl bg-[#071018] border border-white/10 rounded-[2rem] p-6 relative max-h-[90vh] overflow-y-auto shadow-[0_0_60px_rgba(0,255,255,0.08)]">
            {/* CLOSE */}
            <button
              onClick={() => {
                setSelectedDay(
                  null
                );

                setSelectedDayItems(
                  []
                );
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-cyan-400 text-black font-black text-xl hover:scale-110 transition-all"
            >
              ✕
            </button>

            {/* TITLE */}
            <div className="mb-6 pr-14">
              <h2 className="text-4xl md:text-5xl font-black text-white">
                {
                  monthNames[
                    month
                  ]
                }{" "}
                {selectedDay}
              </h2>

              <p className="text-white/50 mt-2">
                {
                  selectedDayItems.length
                }{" "}
                scheduled item
                {selectedDayItems.length !==
                1
                  ? "s"
                  : ""}
              </p>
            </div>

            {/* POSTS */}
            <div className="grid gap-4 pb-6">
              {selectedDayItems.length >
              0 ? (
                selectedDayItems.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 grid gap-4"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-sm font-bold uppercase">
                          {item.platform ||
                            "POST"}
                        </div>

                        {(item.date ||
                          item.scheduledFor) && (
                          <div className="text-sm text-white/50">
                            {new Date(
                              item.date ||
                                item.scheduledFor
                            ).toLocaleTimeString(
                              [],
                              {
                                hour:
                                  "numeric",
                                minute:
                                  "2-digit",
                              }
                            )}
                          </div>
                        )}
                      </div>

                      {item.title && (
                        <h3 className="text-2xl font-black text-white">
                          {
                            item.title
                          }
                        </h3>
                      )}

                      {(item.caption ||
                        item.description) && (
                        <div className="rounded-2xl bg-black/20 border border-white/5 p-4 text-white/80 whitespace-pre-wrap leading-relaxed">
                          {item.caption ||
                            item.description}
                        </div>
                      )}

                      {item.hashtags && (
                        <div className="text-cyan-300 text-sm whitespace-pre-wrap">
                          {
                            item.hashtags
                          }
                        </div>
                      )}
                    </div>
                  )
                )
              ) : (
                <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-12 text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                    <span className="text-cyan-300 text-3xl">
                      +
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white">
                    Nothing Scheduled
                  </h3>

                  <p className="text-white/50 mt-2">
                    There are no
                    scheduled posts or
                    tasks for this day.
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

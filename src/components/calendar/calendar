
import { useState } from "react";
import GlassCard from "../layout/GlassCard";

export default function CalendarView() {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  const currentMonth = calendarDate.getMonth();
  const currentYear = calendarDate.getFullYear();

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  const changeMonth = (direction) => {
    setCalendarDate((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + direction);
      return next;
    });
  };

  const handleDrop = (e, day) => {
    const id = e.dataTransfer.getData("eventId");

    setEvents((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, day }
          : item
      )
    );
  };

  return (
    <GlassCard>
      <div className="grid gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-black">Content Calendar</h2>

          <div className="flex items-center gap-3">
            <button
              onClick={() => changeMonth(-1)}
              className="w-10 h-10 rounded-2xl border border-white/10"
            >
              ←
            </button>

            <div>
              {calendarDate.toLocaleString("default", {
                month: "long",
                year: "numeric"
              })}
            </div>

            <button
              onClick={() => changeMonth(1)}
              className="w-10 h-10 rounded-2xl border border-white/10"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {calendarDays.map((day, i) => (
            <div
              key={i}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, day)}
              className="min-h-[160px] rounded-3xl border border-white/10 p-3 bg-white/5"
            >
              <div className="flex justify-between mb-3">
                <div>{day}</div>

                {day && (
                  <button
                    onClick={() =>
                      setEvents((prev) => [
                        ...prev,
                        {
                          id: String(Date.now()),
                          title: "New Post",
                          day
                        }
                      ])
                    }
                    className="w-8 h-8 rounded-xl bg-orange-500/20"
                  >
                    +
                  </button>
                )}
              </div>

              <div className="grid gap-2">
                {events
                  .filter((event) => event.day === day)
                  .map((event) => (
                    <div
                      key={event.id}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData("eventId", event.id)
                      }
                      className="rounded-2xl bg-fuchsia-500/10 border border-fuchsia-300/20 p-2 text-sm cursor-move"
                    >
                      {event.title}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

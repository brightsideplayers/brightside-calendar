
import GlassCard from "../components/GlassCard";

export default function CalendarView({
  items
}: {
  items: any[];
}) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const firstDayOfMonth = new Date(
    currentYear,
    currentMonth,
    1
  ).getDay();

  const daysInMonth = new Date(
    currentYear,
    currentMonth + 1,
    0
  ).getDate();

  const calendarDays = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  const weekDays = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat"
  ];

  return (
    <GlassCard>
      <div className="grid gap-5">
        <h2 className="text-4xl font-bold">
          Content Calendar
        </h2>

        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs text-cyan-200/60"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3">
          {calendarDays.map((day, i) => {
            const isToday =
              day === today.getDate();

            return (
              <div
                key={i}
                className={`min-h-[120px] rounded-3xl border p-3 ${
                  isToday
                    ? "border-fuchsia-300 shadow-[0_0_24px_rgba(236,72,153,0.45)]"
                    : "border-white/10"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}

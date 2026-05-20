
export default function GlassCard({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[1.75rem] p-5 bg-white/5 border border-white/10 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,0,0,0.22)] ${className}`}
    >
      {children}
    </div>
  );
}


export default function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-[1.8rem] p-5 bg-white/5 border border-white/10 backdrop-blur-2xl ${className}`}
    >
      {children}
    </div>
  );
}

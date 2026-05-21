
import GlassCard from "../layout/GlassCard";

export default function FeedView() {
  return (
    <div className="grid gap-4">
      <GlassCard>
        <textarea
          placeholder="Write caption..."
          className="w-full min-h-[180px] rounded-3xl bg-black/30 border border-white/10 p-5"
        />
      </GlassCard>
    </div>
  );
}

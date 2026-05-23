import { useMemo } from "react";

export default function TikTokView({
  posts = [],
  openCalendarQuickAdd
}) {
  const tiktokPosts =
    posts.filter(
      (post) =>
        post.platform ===
        "TikTok"
    );

  const generateHashtags = (
    text
  ) => {
    if (!text) return "";

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .split(" ")
      .filter(
        (word) =>
          word.length > 3
      )
      .slice(0, 5);

    const tags = words.map(
      (word) => `#${word}`
    );

    tags.push(
      "#fyp",
      "#theatre",
      "#acting",
      "#stage",
      "#behindthescenes"
    );

    return [
      ...new Set(tags)
    ].join(" ");
  };

  return (
    <div className="grid gap-6 pb-32">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl md:text-5xl font-black text-white">
          🎵 TikTok Studio
        </h1>

        <p className="text-white/50 mt-2">
          Create, refine, and plan
          your TikTok content.
        </p>
      </div>

      {/* POSTS */}
      <div className="grid gap-5">
        {tiktokPosts.length >
        0 ? (
          tiktokPosts.map(
            (post, index) => {
              const hashtags =
                generateHashtags(
                  post.caption
                );

              return (
                <div
                  key={index}
                  className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 grid gap-4"
                >
                  {/* CAPTION */}
                  <div className="rounded-2xl bg-black/20 border border-white/5 p-4 text-white whitespace-pre-wrap">
                    {
                      post.caption
                    }
                  </div>

                  {/* HASHTAGS */}
                  <div className="text-cyan-300 text-sm whitespace-pre-wrap">
                    {hashtags}
                  </div>
                </div>
              );
            }
          )
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-12 text-center">
            <h3 className="text-2xl font-black text-white">
              No TikTok Posts Yet
            </h3>

            <p className="text-white/50 mt-2">
              Create a TikTok post in
              your calendar to see it
              here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";

            {/* POSTS */}
            <div className="grid gap-4 pb-8">
              {selectedDayItems.length > 0 ? (
                selectedDayItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 grid gap-4"
                  >
                    {/* PLATFORM */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="rounded-full bg-cyan-400/15 border border-cyan-400/20 px-4 py-2 text-sm font-bold text-cyan-300 uppercase tracking-wide">
                        {item.platform || "SOCIAL POST"}
                      </div>

                      {item.time && (
                        <div className="text-sm text-white/50">
                          {item.time}
                        </div>
                      )}
                    </div>

                    {/* TITLE */}
                    {item.title && (
                      <div>
                        <h3 className="text-xl font-black text-white">
                          {item.title}
                        </h3>
                      </div>
                    )}

                    {/* CAPTION */}
                    {item.caption && (
                      <div className="rounded-2xl bg-black/20 border border-white/5 p-4 text-white/80 whitespace-pre-wrap leading-relaxed">
                        {item.caption}
                      </div>
                    )}

                    {/* HASHTAGS */}
                    {item.hashtags && (
                      <div className="text-cyan-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {item.hashtags}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-12 text-center grid gap-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-cyan-300" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-white">
                      No Posts Scheduled
                    </h3>

                    <p className="text-white/50 mt-2">
                      There are no scheduled posts for this day yet.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

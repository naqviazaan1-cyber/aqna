import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

const ACCENT = "hsl(220,15%,75%)";

type VideoEntry =
  | { kind: "short";  id: string; title: string; youtubeId: string }
  | { kind: "local";  id: string; title: string; src: string };

const videos: VideoEntry[] = [
  { kind: "local",  id: "lv1", title: "Edit",    src: "/videos/featured-edit.mp4" },
  { kind: "short",  id: "s1",  title: "Edit #1", youtubeId: "XSMXk3If28w" },
  { kind: "short",  id: "s2",  title: "Edit #2", youtubeId: "irV6LlVNCk8" },
  { kind: "short",  id: "s3",  title: "Edit #3", youtubeId: "vJLDlrxtXg0" },
  { kind: "short",  id: "s4",  title: "Edit #4", youtubeId: "IKY0KtYGgCA" },
  { kind: "short",  id: "s5",  title: "Edit #5", youtubeId: "wIEp17APlV4" },
  { kind: "short",  id: "s6",  title: "Edit #6", youtubeId: "2aWTN_53KHs" },
];

function VideoModal({ video, onClose }: { video: Extract<VideoEntry, { kind: "short" }>; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      {/* Player — tall portrait, stops click bubbling to backdrop */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{ width: "min(400px, 90vw)", height: "min(711px, 90vh)" }}
        onClick={e => e.stopPropagation()}
      >
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&vq=hd1080`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          style={{ border: "none" }}
        />
      </div>

      <p className="absolute bottom-6 left-0 right-0 text-center text-xs tracking-widest uppercase text-white/30">
        {video.title} · Press Esc to close
      </p>
    </motion.div>
  );
}

function ShortCard({ video, onOpen }: { video: Extract<VideoEntry, { kind: "short" }>; onOpen: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden group cursor-pointer"
      onClick={onOpen}
    >
      {/* 9:16 portrait thumbnail */}
      <div className="relative w-full" style={{ paddingTop: "177.78%" }}>
        <div className="absolute inset-0 bg-black">
          <img
            src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
            alt={video.title}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-95 transition-opacity duration-300"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-xs font-semibold text-white/60 truncate">{video.title}</p>
      </div>
    </motion.div>
  );
}

function LocalVideoCard({ video }: { video: Extract<VideoEntry, { kind: "local" }> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center"
    >
      <div
        className="rounded-2xl overflow-hidden border border-white/[0.07] bg-black"
        style={{ width: "min(340px, 100%)" }}
      >
        <video
          src={video.src}
          controls
          playsInline
          preload="metadata"
          style={{ display: "block", width: "100%", aspectRatio: "9/16", objectFit: "contain", background: "#000" }}
        />
      </div>
    </motion.div>
  );
}

function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="text-[10px] tracking-[0.4em] uppercase text-white/25 font-medium mb-5">Graphic Work</p>
        <h2 className="text-6xl md:text-8xl font-black tracking-tight" style={{ color: ACCENT, opacity: 0.9 }}>
          COMING
        </h2>
        <h2 className="text-6xl md:text-8xl font-black tracking-tight" style={{ color: ACCENT, opacity: 0.9 }}>
          SOON
        </h2>
        <p className="mt-6 text-white/20 text-sm max-w-xs mx-auto">
          Working on something great. Check back soon.
        </p>
      </motion.div>
      <div className="flex gap-2 mt-4">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: ACCENT }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"videos" | "graphics">("videos");
  const [openVideo, setOpenVideo] = useState<Extract<VideoEntry, { kind: "short" }> | null>(null);

  const locals = videos.filter(v => v.kind === "local") as Extract<VideoEntry, { kind: "local" }>[];
  const shorts  = videos.filter(v => v.kind === "short")  as Extract<VideoEntry, { kind: "short" }>[];

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans overflow-x-hidden select-none">
      <AnimatePresence>
        {openVideo && <VideoModal video={openVideo} onClose={() => setOpenVideo(null)} />}
      </AnimatePresence>
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-10"
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-sm tracking-wider"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back
          </button>
          <div className="flex-1 h-px bg-white/[0.06]" />
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/20">AQNA97123</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/30 font-medium mb-2">aqna97123</p>
          <h1 className="text-4xl font-black italic text-white mb-8">Portfolio</h1>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit mb-8">
            {(["videos", "graphics"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="relative px-5 py-2 rounded-lg text-xs tracking-widest uppercase font-semibold transition-colors duration-200"
                style={{ color: tab === t ? "#fff" : "rgba(255,255,255,0.3)" }}
              >
                {tab === t && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.1]"
                  />
                )}
                <span className="relative z-10">
                  {t === "videos" ? "Videos" : "Graphic Work"}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {tab === "videos" ? (
            <motion.div
              key="videos"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="space-y-8"
            >
              {/* Local video — featured at the top */}
              {locals.length > 0 && (
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-white/20 font-medium mb-4">Featured</p>
                  <LocalVideoCard video={locals[0]} />
                </div>
              )}

              {/* YouTube Shorts — 3-column portrait grid */}
              {shorts.length > 0 && (
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-white/20 font-medium mb-4">Edits</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {shorts.map((v, i) => (
                      <motion.div
                        key={v.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <ShortCard video={v} onOpen={() => setOpenVideo(v)} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="graphics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <ComingSoon />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

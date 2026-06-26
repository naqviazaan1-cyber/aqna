import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

const ACCENT = "hsl(220,15%,75%)";

type VideoEntry = { kind: "local"; id: string; title: string; src: string };

const videos: VideoEntry[] = [
  { kind: "local", id: "lv1", title: "Edit",    src: "/videos/featured-edit.mp4" },
  { kind: "local", id: "lv2", title: "Edit #1", src: "/videos/edit-1.mp4" },
  { kind: "local", id: "lv3", title: "Edit #2", src: "/videos/edit-2.mp4" },
  { kind: "local", id: "lv4", title: "Edit #3", src: "/videos/edit-3.mp4" },
  { kind: "local", id: "lv5", title: "Edit #4", src: "/videos/edit-4.mp4" },
  { kind: "local", id: "lv6", title: "Edit #5", src: "/videos/edit-5.mp4" },
  { kind: "local", id: "lv7", title: "Edit #6", src: "/videos/edit-6.mp4" },
];

function VideoModal({ video, onClose, isLandscape = false }: { video: VideoEntry; onClose: () => void; isLandscape?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Pause Spotify when modal opens, resume when it closes
  useEffect(() => {
    window.dispatchEvent(new Event("spotify-pause"));
    return () => window.dispatchEvent(new Event("spotify-resume"));
  }, []);

  const modalStyle: React.CSSProperties = isLandscape
    ? { width: "min(860px, 94vw)", aspectRatio: "16/9" }
    : { width: "min(380px, 90vw)", height: "min(675px, 90vh)" };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <div
        className="relative rounded-2xl overflow-hidden shadow-2xl bg-black"
        style={modalStyle}
        onClick={e => e.stopPropagation()}
      >
        <video
          ref={el => {
            if (!el) return;
            el.play().catch(() => {});
            const resume = () => { el.play().catch(() => {}); };
            el.addEventListener("stalled", resume);
            el.addEventListener("waiting", resume);
          }}
          src={video.src}
          controls
          playsInline
          disablePictureInPicture
          controlsList="nodownload noremoteplayback"
          onContextMenu={e => e.preventDefault()}
          style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
        />
      </div>

      <p className="absolute bottom-6 left-0 right-0 text-center text-xs tracking-widest uppercase text-white/30">
        {video.title} · Press Esc to close
      </p>
    </motion.div>
  );
}

function VideoCard({ video, onOpen }: { video: VideoEntry; onOpen: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden group cursor-pointer"
      onClick={onOpen}
    >
      <div className="relative w-full bg-black" style={{ paddingTop: "177.78%" }}>
        <div className="absolute inset-0">
          <video
            ref={el => {
              if (!el) return;
              el.addEventListener("loadedmetadata", () => { el.currentTime = 0.5; }, { once: true });
            }}
            src={video.src}
            preload="metadata"
            playsInline
            muted
            disablePictureInPicture
            controlsList="nodownload noremoteplayback"
            onContextMenu={e => e.preventDefault()}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-95 transition-opacity duration-300"
            style={{ pointerEvents: "none" }}
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

function FeaturedVideoCard({ video, onOpen }: { video: VideoEntry; onOpen: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center"
    >
      <div
        className="rounded-2xl overflow-hidden border border-white/[0.07] bg-black group cursor-pointer relative"
        style={{ width: "min(640px, 100%)" }}
        onClick={onOpen}
      >
        <video
          ref={el => {
            if (!el) return;
            el.addEventListener("loadedmetadata", () => { el.currentTime = 0.5; }, { once: true });
          }}
          src={video.src}
          preload="metadata"
          playsInline
          muted
          disablePictureInPicture
          controlsList="nodownload noremoteplayback"
          onContextMenu={e => e.preventDefault()}
          style={{ display: "block", width: "100%", aspectRatio: "16/9", objectFit: "cover", background: "#000", pointerEvents: "none" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
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

type ReviewData = { id: number; name: string; rating: number; content: string; createdAt: string };

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="text-2xl transition-transform duration-100 hover:scale-110"
          style={{ color: n <= (hovered || value) ? "#facc15" : "rgba(255,255,255,0.15)" }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewData }) {
  const date = new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 space-y-2"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-white/80 truncate">{review.name}</p>
        <p className="text-[10px] text-white/25 shrink-0">{date}</p>
      </div>
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(n => (
          <span key={n} style={{ color: n <= review.rating ? "#facc15" : "rgba(255,255,255,0.12)", fontSize: 14 }}>★</span>
        ))}
      </div>
      <p className="text-sm text-white/50 leading-relaxed">{review.content}</p>
    </motion.div>
  );
}

function ReviewsSection() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [alreadyReviewed] = useState(() => localStorage.getItem("fc_reviewed") === "1");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyReviewed);
  const [error, setError] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Please select a star rating."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, rating, content }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setError("You've already left a review. Thanks!");
        localStorage.setItem("fc_reviewed", "1");
        setSubmitted(true);
      } else if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        localStorage.setItem("fc_reviewed", "1");
        setSubmitted(true);
        setReviews(prev => [data.review, ...prev]);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-16 space-y-8"
    >
      <div>
        <p className="text-[10px] tracking-[0.25em] uppercase text-white/20 font-medium mb-1">Client Reviews</p>
        <h2 className="text-2xl font-black italic text-white">What people say</h2>
      </div>

      {/* Submit form */}
      {!submitted ? (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
          <p className="text-xs text-white/40 tracking-wide">Leave a review — only one per person.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              maxLength={80}
              className="w-full rounded-lg bg-white/[0.05] border border-white/[0.08] px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/20 transition-colors"
            />
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email (not shown publicly)"
              className="w-full rounded-lg bg-white/[0.05] border border-white/[0.08] px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <StarPicker value={rating} onChange={setRating} />
          <textarea
            required
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Share your experience working with aqna97123..."
            minLength={5}
            maxLength={500}
            rows={3}
            className="w-full rounded-lg bg-white/[0.05] border border-white/[0.08] px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/20 transition-colors resize-none"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-lg text-xs font-semibold tracking-widest uppercase bg-white text-black hover:bg-white/90 disabled:opacity-40 transition-all duration-200"
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </form>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-center"
        >
          <p className="text-2xl mb-1">🙌</p>
          <p className="text-sm font-semibold text-white/70">Thanks for your review!</p>
        </motion.div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-white/20 text-center py-8">No reviews yet — be the first!</p>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </motion.div>
  );
}

export default function Portfolio() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"videos" | "graphics">("videos");
  const [openVideo, setOpenVideo] = useState<VideoEntry | null>(null);
  const [openVideoLandscape, setOpenVideoLandscape] = useState(false);
  const featured = videos[0];
  const edits = videos.slice(1);

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans overflow-x-hidden select-none">
      <AnimatePresence>
        {openVideo && <VideoModal video={openVideo} onClose={() => { setOpenVideo(null); setOpenVideoLandscape(false); }} isLandscape={openVideoLandscape} />}
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
              {/* Featured video */}
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-white/20 font-medium mb-4">Featured</p>
                <FeaturedVideoCard video={featured} onOpen={() => { setOpenVideo(featured); setOpenVideoLandscape(true); }} />
              </div>

              {/* Edits grid */}
              {edits.length > 0 && (
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-white/20 font-medium mb-4">Edits</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {edits.map((v, i) => (
                      <motion.div
                        key={v.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <VideoCard video={v} onOpen={() => setOpenVideo(v)} />
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

        <ReviewsSection />
      </div>

    </div>
  );
}

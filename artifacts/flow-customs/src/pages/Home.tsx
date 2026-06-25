import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

const DISCORD_USER_ID = "1510998253603262496";
const DISCORD_AVATAR_HASH = "64da3dd9a7152682ec26464f48e99024";
const tools = [
  { name: "Canva",         logo: "/logos/canva.png" },
  { name: "Photopea",      logo: "/logos/photopea.svg" },
  { name: "Alight Motion", logo: "/logos/alightmotion.png" },
  { name: "CapCut",        logo: "/logos/capcut.png" },
  { name: "After Effects", logo: "/logos/aftereffects.png" },
  { name: "Spotify",       logo: "/logos/spotify.svg" },
];

type DiscordStatus = "online" | "idle" | "dnd" | "offline";

function useDiscordStatus(userId: string) {
  const [status, setStatus] = useState<DiscordStatus>("offline");
  const [avatarUrl, setAvatarUrl] = useState<string>(
    `https://cdn.discordapp.com/avatars/${DISCORD_USER_ID}/${DISCORD_AVATAR_HASH}.png?size=128`
  );

  useEffect(() => {
    if (!userId || userId === "PASTE_YOUR_DISCORD_USER_ID_HERE") return;

    fetch(`https://api.lanyard.rest/v1/users/${userId}`)
      .then(r => r.json())
      .then(json => {
        if (json.data) {
          const d = json.data;
          setStatus(d.discord_status);
          if (d.discord_user?.avatar) {
            setAvatarUrl(`https://cdn.discordapp.com/avatars/${userId}/${d.discord_user.avatar}.png?size=128`);
          }
        }
      })
      .catch(() => {});

    const ws = new WebSocket("wss://api.lanyard.rest/socket");
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.op === 1) {
        ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }));
      }
      if (msg.op === 0 && (msg.t === "INIT_STATE" || msg.t === "PRESENCE_UPDATE")) {
        setStatus(msg.d.discord_status);
        if (msg.d.discord_user?.avatar) {
          setAvatarUrl(`https://cdn.discordapp.com/avatars/${userId}/${msg.d.discord_user.avatar}.png?size=128`);
        }
      }
    };

    return () => ws.close();
  }, [userId]);

  return { status, avatarUrl };
}

const statusColor: Record<DiscordStatus, string> = {
  online: "#23a55a",
  idle:   "#f0b232",
  dnd:    "#f23f43",
  offline:"#80848e",
};

const statusLabel: Record<DiscordStatus, string> = {
  online: "Online",
  idle:   "Idle",
  dnd:    "Do Not Disturb",
  offline:"Offline",
};

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const raw  = time.getHours();
  const hh   = String(raw % 12 || 12).padStart(2, "0");
  const mm   = String(time.getMinutes()).padStart(2, "0");
  const ss   = String(time.getSeconds()).padStart(2, "0");
  const ampm = raw >= 12 ? "PM" : "AM";
  const day  = time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] tracking-[0.25em] uppercase text-white/30 font-medium">Timezone</p>
      <p className="text-3xl font-bold tabular-nums text-white tracking-tight">
        {hh}:{mm}:{ss} <span className="text-base font-normal text-white/40">{ampm}</span>
      </p>
      <p className="text-xs text-white/30">{day}</p>
    </div>
  );
}

function SideLines() {
  const bars = Array.from({ length: 18 });
  return (
    <>
      <div className="fixed left-4 top-0 bottom-0 flex flex-col justify-center gap-4 pointer-events-none z-0">
        {bars.map((_, i) => (
          <motion.div
            key={i}
            className="w-px bg-white/[0.04]"
            style={{ height: `${(i % 5) * 8 + 10}px` }}
            animate={{ opacity: [0.04, 0.12, 0.04], scaleY: [1, 1.4, 1] }}
            transition={{ duration: 2 + i * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.08 }}
          />
        ))}
      </div>
      <div className="fixed right-4 top-0 bottom-0 flex flex-col justify-center gap-4 pointer-events-none z-0">
        {bars.map((_, i) => (
          <motion.div
            key={i}
            className="w-px bg-white/[0.04]"
            style={{ height: `${(i % 5) * 8 + 10}px` }}
            animate={{ opacity: [0.04, 0.12, 0.04], scaleY: [1, 1.4, 1] }}
            transition={{ duration: 2 + i * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 + 0.5 }}
          />
        ))}
      </div>
    </>
  );
}

export default function Home({ onEnter, entered }: { onEnter?: () => void; entered?: boolean }) {
  const [, navigate] = useLocation();
  const { status, avatarUrl } = useDiscordStatus(DISCORD_USER_ID);

  const isPlaceholder = (DISCORD_USER_ID as string) === "PASTE_YOUR_DISCORD_USER_ID_HERE";

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans overflow-x-hidden select-none">

      <AnimatePresence mode="wait">
        {!entered ? (
          <motion.div
            key="entry"
            exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080808] cursor-pointer"
            onClick={() => onEnter?.()}
            data-testid="entry-screen"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="text-sm md:text-base tracking-[0.5em] uppercase text-white/50 hover:text-white transition-colors duration-300"
            >
              click to enter
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative min-h-screen flex flex-col items-center justify-center py-10 px-6"
            data-testid="main-content"
          >
            <SideLines />

            <div className="relative z-10 w-full max-w-3xl flex flex-col gap-3">

              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 flex items-center gap-5"
              >
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full border border-white/10 overflow-hidden bg-white/[0.06] flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="aqna" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-black text-white/20 tracking-tighter">aq</span>
                    )}
                  </div>
                  <span
                    className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#080808]"
                    style={{ backgroundColor: statusColor[status] }}
                    title={statusLabel[status]}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] tracking-[0.25em] uppercase text-white/30 font-medium mb-1">Graphics & Editor</p>
                  <h1 className="text-2xl font-black italic text-white leading-none mb-2">
                    aqna97123
                  </h1>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.07] rounded-full px-3 py-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: statusColor[status],
                        boxShadow: status === "online" ? `0 0 6px ${statusColor[status]}` : "none",
                      }}
                    />
                    <span className="text-[10px] tracking-widest uppercase text-white/50">
                      {isPlaceholder ? "Open for work" : statusLabel[status]}
                    </span>
                  </div>
                  <a
                    href="https://discord.com/users/1510998253603262496"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] tracking-widest uppercase text-white/20 hover:text-white/50 transition-colors border border-white/[0.07] rounded-full px-3 py-1"
                    data-testid="link-discord"
                  >
                    @aqna97123 →
                  </a>
                </div>
              </motion.div>

              {/* Tools Marquee + Discord Server Row */}
              <div className="grid grid-cols-5 gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="col-span-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 overflow-hidden"
                >
                  <p className="text-[10px] tracking-[0.25em] uppercase text-white/30 font-medium mb-4">Stack</p>
                  <div className="flex flex-col gap-2 overflow-hidden">
                    {[0, 1].map(row => (
                      <div key={row} className="overflow-hidden">
                        <div className={`flex gap-2 w-max ${row === 0 ? "marquee-left" : "marquee-right"}`}>
                          {[...tools, ...tools, ...tools, ...tools, ...tools, ...tools].map((tool, i) => (
                            <span
                              key={`${row}-${i}`}
                              className="shrink-0 flex items-center gap-1.5 text-[11px] border border-white/[0.08] bg-white/[0.03] text-white/50 rounded-full px-3 py-1 whitespace-nowrap"
                            >
                              <img src={tool.logo} alt={tool.name} className="w-4 h-4 rounded-sm object-contain shrink-0" />
                              {tool.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.a
                  href="https://discord.gg/MFPqs8Em9s"
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.25 }}
                  className="col-span-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 flex flex-col justify-between group hover:border-[hsl(220,15%,75%)]/30 transition-colors duration-300 cursor-pointer"
                  data-testid="link-server"
                >
                  <p className="text-[10px] tracking-[0.25em] uppercase text-white/30 font-medium mb-4">Discord Server</p>
                  <div className="flex flex-col gap-3">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img src="/images/server-logo.png" alt="Flow Customs" className="w-full h-full object-contain" style={{ mixBlendMode: "screen" }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-none mb-1">Flow Customs</p>
                      <p className="text-[11px] text-white/35">.gg/MFPqs8Em9s</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[hsl(220,15%,75%)] group-hover:gap-3 transition-all duration-300">
                    <span className="text-[11px] tracking-widest uppercase font-semibold">Join Server</span>
                    <span className="text-xs">→</span>
                  </div>
                </motion.a>
              </div>

              {/* Services + Clock Row */}
              <div className="grid grid-cols-5 gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="col-span-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5"
                >
                  <p className="text-[10px] tracking-[0.25em] uppercase text-white/30 font-medium mb-4">Services</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { name: "Graphic Design", tags: ["BRANDING", "ASSETS"] },
                      { name: "Video Editing",  tags: ["CLIPS", "EDITS"] },
                    ].map(item => (
                      <div key={item.name} className="flex items-center justify-between border border-white/[0.06] bg-white/[0.02] rounded-xl px-4 py-3">
                        <p className="text-sm font-semibold text-white/80">{item.name}</p>
                        <div className="flex gap-1.5">
                          {item.tags.map(tag => (
                            <span key={tag} className="text-[9px] tracking-widest uppercase text-[hsl(220,15%,75%)] border border-[hsl(220,15%,75%)]/30 rounded-full px-2 py-0.5">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.35 }}
                  className="col-span-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 flex items-center justify-center"
                >
                  <LiveClock />
                </motion.div>
              </div>

              {/* Portfolio Card */}
              <motion.button
                onClick={() => navigate("/portfolio")}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.38 }}
                className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 flex items-center justify-between group hover:border-[hsl(220,15%,75%)]/30 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer text-left"
              >
                <div>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-white/30 font-medium mb-1">Work</p>
                  <p className="text-base font-bold text-white">View Portfolio</p>
                  <p className="text-xs text-white/30 mt-0.5">Videos · Graphic Design</p>
                </div>
                <svg
                  className="w-5 h-5 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-300"
                  fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </motion.button>

              {/* Connect Card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 pb-24"
              >
                <p className="text-[10px] tracking-[0.25em] uppercase text-white/30 font-medium mb-3">Connect</p>
                <h2 className="text-2xl font-black text-white mb-5">Got a vision? Let's make it real.</h2>
                <div className="flex gap-3">
                  <a
                    href="https://discord.com/users/1510998253603262496"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center text-xs tracking-[0.15em] uppercase font-semibold border border-[hsl(220,15%,75%)]/40 text-[hsl(220,15%,75%)] hover:bg-[hsl(220,15%,75%)] hover:text-white transition-all duration-300 rounded-full py-2.5"
                    data-testid="link-discord-dm"
                  >
                    Discord →
                  </a>
                </div>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

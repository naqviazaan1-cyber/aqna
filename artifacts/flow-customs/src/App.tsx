import { Switch, Route, Router as WouterRouter } from "wouter";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Portfolio from "@/pages/Portfolio";

const queryClient = new QueryClient();

const PLAYLIST_URI = "spotify:playlist:46wmGTamOub4ZRpROQQ25X";

function SpotifyPlayer({ visible }: { visible: boolean }) {
  const playlistId = PLAYLIST_URI.replace("spotify:playlist:", "");
  return (
    <div
      className="fixed bottom-4 right-4 z-50 rounded-xl overflow-hidden shadow-2xl transition-all duration-700"
      style={{
        width: 320,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <iframe
        src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0&autoplay=1`}
        width="320"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        style={{ display: "block" }}
      />
    </div>
  );
}

function Router({ onEnter, entered }: { onEnter: () => void; entered: boolean }) {
  return (
    <Switch>
      <Route path="/" component={() => <Home onEnter={onEnter} entered={entered} />} />
      <Route path="/portfolio" component={Portfolio} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [entered, setEntered] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router onEnter={() => setEntered(true)} entered={entered} />
        </WouterRouter>
        <Toaster />
        <SpotifyPlayer visible={entered} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

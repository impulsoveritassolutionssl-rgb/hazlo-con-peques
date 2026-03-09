import { GameEmbed } from "@/components/GameEmbed";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "4 en Raya | Juegos Peques",
  description:
    "Juega al clásico 4 en raya (Connect Four) contra otro jugador. Un juego de estrategia divertido para niños y familias.",
  openGraph: {
    title: "4 en Raya | Juegos Peques",
    description:
      "Juega al clásico 4 en raya (Connect Four) contra otro jugador. Un juego de estrategia divertido para niños y familias.",
  },
};

// Claude artifact URL - may be blocked by X-Frame-Options
const CONNECT4_EXTERNAL_URL =
  "https://claude.ai/public/artifacts/d8ecdb7f-0494-4c80-aed0-076cfca8108a";

// Local fallback URL (same-origin, won't be blocked)
const CONNECT4_LOCAL_URL = "/games/connect4/index.html";

export default function Connect4GamePage() {
  return (
    <GameEmbed
      srcUrl={CONNECT4_EXTERNAL_URL}
      fallbackUrl={CONNECT4_LOCAL_URL}
      title="4 en Raya"
      backUrl="/games"
    />
  );
}

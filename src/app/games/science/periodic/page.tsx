import { PeriodicTableEmbed } from "@/components/PeriodicTableEmbed";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tabla Periódica Interactiva | Juegos Peques",
  description:
    "Explora los elementos químicos de forma interactiva. Aprende sobre átomos, números atómicos y propiedades de los elementos jugando.",
  openGraph: {
    title: "Tabla Periódica Interactiva | Juegos Peques",
    description:
      "Explora los elementos químicos de forma interactiva. Aprende sobre átomos, números atómicos y propiedades de los elementos jugando.",
  },
};

const PERIODIC_TABLE_URL =
  "https://studio--studio-7562023643-58b09.us-central1.hosted.app";

export default function PeriodicTableGamePage() {
  return (
    <PeriodicTableEmbed
      srcUrl={PERIODIC_TABLE_URL}
      title="Tabla Periódica Interactiva"
      backUrl="/games"
    />
  );
}

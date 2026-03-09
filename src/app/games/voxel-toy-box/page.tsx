import { VoxelToyBoxEmbed } from "@/components/VoxelToyBoxEmbed";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Caja de Bloques 3D | Hazlo con Peques",
  description:
    "Construye como con bloques mágicos. Arrastra, gira y crea tus propias construcciones 3D en este divertido juego educativo.",
  openGraph: {
    title: "Caja de Bloques 3D | Hazlo con Peques",
    description:
      "Construye como con bloques mágicos. Arrastra, gira y crea tus propias construcciones 3D en este divertido juego educativo.",
  },
};

const VOXEL_TOY_BOX_URL = "https://ai.studio/apps/bundled/voxel_toy_box";

export default function VoxelToyBoxGamePage() {
  return (
    <VoxelToyBoxEmbed
      srcUrl={VOXEL_TOY_BOX_URL}
      title="¡Caja de Bloques 3D!"
      backUrl="/games"
    />
  );
}

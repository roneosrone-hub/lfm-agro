import dynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const MapaPage = dynamic(() => import("../produtor/mapa/page"), { ssr: false });

export default function Page() {
  return <MapaPage />;
}

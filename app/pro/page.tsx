import dynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const Mapa = dynamic(() => import("../produtor/mapa/page"), {
  ssr: false,
});

export default function Page() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Mapa />
    </div>
  );
}

import dynamic from "next/dynamic";

export const dynamic = "force-dynamic";

const ProdutorMapa = dynamic(() => import("./produtor-mapa"), {
  ssr: false,
});

export default function Page() {
  return <ProdutorMapa />;
}

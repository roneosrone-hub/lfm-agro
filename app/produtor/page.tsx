"use client";

import dynamic from "next/dynamic";

const ProdutorMapa = dynamic(() => import("./produtor-mapa"), {
  ssr: false,
});

export default function Page() {
  return <ProdutorMapa />;
}

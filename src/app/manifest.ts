import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Brasa",
    short_name: "Brasa",
    description: "Recupera tu atención y tu energía, un poco cada día.",
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    background_color: "#F5F7F4",
    theme_color: "#1E3A2F",
    lang: "es",
    icons: [
      { src: `${base}/icons/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${base}/icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `${base}/icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Brasa",
    short_name: "Brasa",
    description: "Recupera tu atención y tu energía, un poco cada día.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F7F4",
    theme_color: "#1E3A2F",
    lang: "es",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}

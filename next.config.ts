import type { NextConfig } from "next";

// Se publica en GitHub Pages como https://juandag7.github.io/brasa/
const basePath = process.env.NODE_ENV === "production" ? "/brasa" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // El indicador de desarrollo tapa la barra de navegación en el celular.
  devIndicators: false,
};

export default nextConfig;

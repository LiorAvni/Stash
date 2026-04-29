import type { MetadataRoute } from "next";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Stash";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: "Your private personal storage and organization system.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#101014",
    theme_color: "#5b5cf6",
    icons: [
      { src: "/icon.png",       sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon.png",       sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}

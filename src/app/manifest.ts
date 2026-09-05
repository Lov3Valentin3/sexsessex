import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "North Pole Pen Pals",
    short_name: "Elf Mail",
    description: "Magical elf pen pal letters from Santa’s workshop for kids.",
    start_url: "/",
    display: "standalone",
    background_color: "#07040a",
    theme_color: "#07040a",
    icons: [
      {
        src: "/images/app-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

import type { Project as Project } from "../types";
import ImgGifex from "../assets/images/gifex.png";
import ImgRetos from "../assets/images/retos.png";
import ImgFlacow from "../assets/images/flacow.png";

const projects: Project[] = [
  {
    name: "Retos web",
    descripcion:
      "Es una plataforma web que permite a los usuarios consultar y ver desplegado los retos de programación que he resuelto de diferentes plataformas o propios.",
    links: [
      {
        name: "Ver proyecto",
        url: "https://retos.redflox.com/",
        icon: "fas fa-eye",
      },
      {
        name: "Ver código",
        url: "https://github.com/redflox/retos-app",
        icon: "fab fa-github",
      },
    ],
    technologies: ["Nginx", "Javascript", "Express"],
    image: ImgRetos,
  },
  {
    name: "GiffexApp",
    descripcion:
      "Es una aplicacion web que permite buscar y ver gifs animados, consumiendo la API de Giphy.",
    links: [
      {
        name: "Ver proyecto",
        url: "https://gifex.bfmu.dev",
        icon: "fas fa-eye",
      },
      {
        name: "Ver código",
        url: "https://github.com/redflox/gifex-app",
        icon: "fab fa-github",
      },
    ],
    technologies: ["React"],
    image: ImgGifex,
  },
  {
    name: "Flacow",
    descripcion:
      "La mejor aplicación para registrar tu progreso en el gimnasio y lograr tus objetivos de fuerza.",
    links: [
      {
        name: "Ver proyecto",
        url: "https://flacow.bfmu.dev/",
        icon: "",
      },
      {
        name: "Ver código",
        url: "https://github.com/redflox/progresapp-flacow",
        icon: "fab fa-github",
      },
    ],
    technologies: ["React", "NestJS", "MaterialUI"],
    image: ImgFlacow,
  },
];

export { projects };

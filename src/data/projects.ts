import type { Project as Project } from "../types";
import Gifex from '../assets/images/gifex.png';

const projects: Project[] = [
    {
        name: 'Retos web',
        descripcion: 'Es una plataforma web que permite a los usuarios consultar y ver desplegado los retos de programación que he resuelto de diferentes plataformas o propios.',
        links: [
            {
                name: 'Ver proyecto',
                url: 'https://retos-web.vercel.app/',
                icon: 'fas fa-eye'
            },
            {
                name: 'Ver código',
                url: '#',
                icon: 'fab fa-github'
            },
        ],
        technologies: ['Nginx', 'Javascript', 'Express'],
        image: Gifex,
    },
    {
        name: 'GiffexApp',
        descripcion: 'Es una aplicacion web que permite buscar y ver gifs animados, consumiendo la API de Giphy.',
        links: [
            {
                name: 'Ver proyecto',
                url: 'https://portafolio-alejandro.vercel.app/',
                icon: 'fas fa-eye'
            },
            {
                name: 'Ver código',
                url: '#',
                icon: 'fab fa-github'
            },
        ],
        technologies: ['React'],
        image: Gifex,
    }

]

export { projects }
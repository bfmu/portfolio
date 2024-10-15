import type { Proyecto } from "../types";

const proyectos: Proyecto[] = [
    {
        nombre: 'Retos web',
        descripcion: 'Es una plataforma web que permite a los usuarios consultar y ver desplegado los retos de programación que he resuelto de diferentes plataformas o propios.',
        enlaces: [
            {
                nombre: 'Ver proyecto',
                url: 'https://retos-web.vercel.app/',
                icono: 'fas fa-eye'
            },
            {
                nombre: 'Ver código',
                url: '#',
                icono: 'fab fa-github'
            },
        ],
        tecnologias: ['Nginx', 'Javascript', 'Express'],
        imagen: 'retos-web.png',
    },
    {
        nombre: 'GiffexApp',
        descripcion: 'Es una aplicacion web que permite buscar y ver gifs animados, consumiendo la API de Giphy.',
        enlaces: [
            {
                nombre: 'Ver proyecto',
                url: 'https://portafolio-alejandro.vercel.app/',
                icono: 'fas fa-eye'
            },
            {
                nombre: 'Ver código',
                url: '#',
                icono: 'fab fa-github'
            },
        ],
        tecnologias: ['React'],
        imagen: 'giffexapp.png',
    }

]

export { proyectos }
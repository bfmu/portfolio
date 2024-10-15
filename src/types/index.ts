type Proyecto = {
    nombre: string;
    descripcion: string;
    enlaces: Enlace[];
    tecnologias: string[];
    imagen: string;
}

type Enlace = {
    nombre: string;
    url: string;
    icono: string;
}

export type { Proyecto, Enlace }
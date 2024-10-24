type Project = {
    name: string;
    descripcion: string;
    links: Link[];
    technologies: string[];
    image: ImageMetadata;
}

type Link = {
    name: string;
    url: string;
    icon: string;
}

export type { Project, Link }
interface ISize {
    width: number;
    height: number;
}

interface IElements extends ICategory {
    id: number;
    sX: number;
    sY: number;
    cX: number;
    cY: number;
}

interface ISelectedElement extends IElements {
    position?: string | null;
    startX?: number;
    startY?: number;
}

interface ICategory {
    color: string;
    title: string;
}

type Point = {
    x: number;
    y: number;
};

export type { ISize, IElements, ISelectedElement, Point, ICategory };

interface ISize {
    width: number;
    height: number;
}

interface IElements {
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
type Point = {
    x: number;
    y: number;
};

export type { ISize, IElements, ISelectedElement, Point };

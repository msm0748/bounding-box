interface ICanvasSize {
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

export type { ICanvasSize, IElements, ISelectedElement };

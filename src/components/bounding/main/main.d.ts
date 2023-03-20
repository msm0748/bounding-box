type Tool = "select" | "move" | "bounding";

type Zoom = "zoomIn" | "zoomOut" | "reset";

type Action = "none" | "moving" | "drawing" | "resizing";

interface IPosition {
    x: number;
    y: number;
}

interface ISize {
    width: number;
    height: number;
}

interface IImageInfo extends IPosition, ISize {
    src: string;
}

interface IOffset {
    offsetX: number;
    offsetY: number;
}

interface IElement extends ICategory {
    id: number;
    sX: number;
    sY: number;
    cX: number;
    cY: number;
}

interface ICategory {
    color: string;
    title: string;
}

interface ISelectedElement extends IElement, ICategory {
    position?: string | null;
    offsetX?: number;
    offsetY?: number;
}

interface ImageCanvasdRef {
    zoomMouseDown: (offsetX: number, offsetY: number) => void;
    zoomMouseMove: (offsetX: number, offsetY: number) => void;
    zoomMouseUp: () => void;
    zoomWheel: (e: React.WheelEvent) => void;
    draw: () => void;
}

interface LabelingCanvasdRef {
    labelingMouseDown: (zoomPosX: number, zoomPosY: number) => void;
    labelingMouseMove: (zoomPosX: number, zoomPosY: number) => void;
    labelingMouseUp: (zoomPosX: number, zoomPosY: number) => void;
    labelingWheel: () => void;
    draw: () => void;
}

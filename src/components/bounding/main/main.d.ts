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

interface IElement {
    id: number;
    sX: number;
    sY: number;
    cX: number;
    cY: number;
}

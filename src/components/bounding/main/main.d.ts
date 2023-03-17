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

interface ImageCanvasdRef {
    zoomMouseDown: (offsetX: number, offsetY: number) => void;
    zoomMouseMove: (offsetX: number, offsetY: number) => void;
    zoomMouseUp: () => void;
    zoomWheel: (e: React.WheelEvent) => void;
    draw: () => void;
}

type UpdateElementsFn = (elements: IElement[] | ((prev: IElement[]) => IElement[])) => void;

interface LabelingCanvasdRef {
    labelingMouseDown: (offsetX: number, offsetY: number) => void;
    labelingMouseMove: (offsetX: number, offsetY: number) => void;
    labelingMouseUp: () => void;
    labelingWheel: (e: React.WheelEvent) => void;
    draw: () => void;
}

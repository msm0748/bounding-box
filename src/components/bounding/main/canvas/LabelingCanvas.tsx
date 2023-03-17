import { useRef, forwardRef, useImperativeHandle, MutableRefObject, useEffect } from "react";
import styled from "styled-components";

interface Props {
    elements: IElement[];
    canvasSize: ISize;
    viewPosRef: MutableRefObject<IPosition>;
    scaleRef: MutableRefObject<number>;
    tool: Tool;
    getElements: (newElements: IElement[]) => void;
    selectedElement: ISelectedElement | null;
    getSelectedElement: (element: ISelectedElement | null) => void;
    imageInfo: IImageInfo | null;
    mouseCursorStyle: (name: string) => void;
    isImageMove: boolean;
}

function LabelingCanvas(
    { elements, canvasSize, getElements, viewPosRef, scaleRef, tool, selectedElement, getSelectedElement, imageInfo, mouseCursorStyle, isImageMove }: Props,
    ref: React.Ref<LabelingCanvasdRef>
) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const actionRef = useRef<Action>("none");
    const drawingElements = useRef<IElement[]>([]);

    // init
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
    }, [canvasSize]);

    const draw = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = canvasSize.width;
        ctx.setTransform(scaleRef.current, 0, 0, scaleRef.current, viewPosRef.current.x, viewPosRef.current.y);

        ctx.lineWidth = 2;

        drawingElements.current.forEach(({ id, sX, sY, cX, cY }) => {
            const width = cX - sX;
            const height = cY - sY;
            ctx.strokeRect(sX, sY, width, height);
        });
    };

    const createElement = ({ id, sX, sY, cX, cY }: IElement) => {
        return { id, sX, sY, cX, cY };
    };
    const nearPoint = (offsetX: number, offsetY: number, x: number, y: number, name: string, cX?: number, cY?: number) => {
        if (cX && cY) {
            switch (name) {
                case "t":
                case "b":
                    return x < offsetX && cX > offsetX && Math.abs(offsetY - y) < 5 ? name : null;
                case "l":
                case "r":
                    return y < offsetY && cY > offsetY && Math.abs(offsetX - x) < 5 ? name : null;
            }
        } else {
            return Math.abs(offsetX - x) < 5 && Math.abs(offsetY - y) < 5 ? name : null;
        }
    };

    const positionWithinElement = (x: number, y: number, element: IElement) => {
        const { id, sX, sY, cX, cY } = element;
        const topLeft = nearPoint(x, y, sX, sY, "tl");
        const topRight = nearPoint(x, y, cX, sY, "tr");
        const bottomLeft = nearPoint(x, y, sX, cY, "bl");
        const bottomRight = nearPoint(x, y, cX, cY, "br");

        const top = nearPoint(x, y, sX, sY, "t", cX, cY);
        const bottom = nearPoint(x, y, sX, cY, "b", cX, cY);
        const right = nearPoint(x, y, cX, sY, "r", cX, cY);
        const left = nearPoint(x, y, sX, sY, "l", cX, cY);

        const inside = x >= sX && x <= cX && y >= sY && y <= cY ? "inside" : null;

        if (selectedElement) {
            if (id === selectedElement.id) {
                return topLeft || topRight || bottomLeft || bottomRight || top || right || bottom || left || inside;
            }
        }

        return inside;
    };

    const cursorForPosition = (position: string) => {
        switch (position) {
            case "tl":
            case "br":
                return "nwse-resize";
            case "tr":
            case "bl":
                return "nesw-resize";
            case "t":
            case "b":
                return "row-resize";
            case "l":
            case "r":
                return "col-resize";
            default:
                return "move";
        }
    };

    const adjustElementCoordinates = (element: IElement) => {
        const { id, sX, sY, cX, cY } = element;
        const minX = Math.min(sX, cX);
        const maxX = Math.max(sX, cX);
        const minY = Math.min(sY, cY);
        const maxY = Math.max(sY, cY);
        return { id, sX: minX, sY: minY, cX: maxX, cY: maxY };
    };

    const getElementAtPosition = (x: number, y: number, elements: IElement[]) => {
        return elements.map((element) => ({ ...element, position: positionWithinElement(x, y, element) })).find((element) => element.position !== null);
    };

    const resizedCoordinates = (zoomPosX: number, zoomPosY: number, position: string, coordinates: IElement) => {
        const { id, sX, sY, cX, cY } = coordinates;

        switch (position) {
            case "tl":
                return { id, sX: zoomPosX, sY: zoomPosY, cX, cY };
            case "tr":
                return { id, sX, sY: zoomPosY, cX: zoomPosX, cY };
            case "br":
                return { id, sX, sY, cX: zoomPosX, cY: zoomPosY };
            case "bl":
                return { id, sX: zoomPosX, sY, cX, cY: zoomPosY };
            case "b":
                return { id, sX, sY, cX, cY: zoomPosY };
            case "t":
                return { id, sX, sY: zoomPosY, cX, cY };
            case "r":
                return { id, sX, sY, cX: zoomPosX, cY };
            case "l":
                return { id, sX: zoomPosX, sY, cX, cY };
            default:
                return { id, sX, sY, cX, cY };
        }
    };

    const updateElement = ({ id, sX, sY, cX, cY }: IElement) => {
        const updateElement = createElement({ id, sX, sY, cX, cY });

        const elementsCopy = [...drawingElements.current].map((element) => (element.id === id ? updateElement : element));
        drawingElements.current = elementsCopy;
    };

    const labelingMouseDown = (zoomPosX: number, zoomPosY: number) => {
        if (isImageMove === true) return;

        if (tool === "bounding") {
            if (actionRef.current !== "none") return;
            actionRef.current = "drawing";
            const id = +new Date();
            const element = createElement({ id, sX: zoomPosX, sY: zoomPosY, cX: zoomPosX, cY: zoomPosY });
            drawingElements.current = [...drawingElements.current, element];
        } else if (tool === "select") {
            const element = getElementAtPosition(zoomPosX, zoomPosY, drawingElements.current);

            if (element) {
                const offsetX = zoomPosX - element.sX;
                const offsetY = zoomPosY - element.sY;
                if (element.position === "inside") {
                    actionRef.current = "moving";
                } else {
                    actionRef.current = "resizing";
                }
                getSelectedElement({ ...element, offsetX, offsetY });
            } else {
                getSelectedElement(null);
                actionRef.current = "none";
            }
        }
        requestAnimationFrame(draw);
    };

    const labelingMouseMove = (zoomPosX: number, zoomPosY: number) => {
        if (tool === "bounding") {
            if (actionRef.current === "drawing") {
                if (!drawingElements.current) return;
                const index = drawingElements.current.length - 1;
                const { id, sX, sY } = drawingElements.current[index];
                updateElement({ id, sX, sY, cX: zoomPosX, cY: zoomPosY });
            }
        } else if (tool === "select") {
            const element = getElementAtPosition(zoomPosX, zoomPosY, drawingElements.current);
            if (actionRef.current === "none") {
                if (element) {
                    if (!element.position) return;
                    mouseCursorStyle(element ? cursorForPosition(element.position) : "default");
                } else {
                    mouseCursorStyle("default");
                }
            }
            if (actionRef.current === "moving") {
                if (!selectedElement) return;
                const { id, sX, sY, cX, cY, offsetX, offsetY } = selectedElement;

                if (!(offsetX && offsetY)) return;

                const width = cX - sX;
                const height = cY - sY;

                let newX = zoomPosX - offsetX;
                let newY = zoomPosY - offsetY;

                if (imageInfo) {
                    if (newX < 0) newX = 0;
                    if (newY < imageInfo.y) newY = imageInfo.y;
                    if (newX + width > imageInfo.width) newX = imageInfo.width - width;
                    if (newY + height > imageInfo.height + imageInfo.y) newY = imageInfo.height + imageInfo.y - height;
                }

                updateElement({ id, sX: newX, sY: newY, cX: newX + width, cY: newY + height });
            } else if (actionRef.current === "resizing") {
                if (!selectedElement) return;
                const { position, offsetX, offsetY, ...coordinates } = selectedElement;
                if (!position) return;
                if (!(offsetX && offsetY)) return;
                const { id, sX, sY, cX, cY } = resizedCoordinates(zoomPosX, zoomPosY, position, coordinates);
                updateElement({ id, sX, sY, cX, cY });
            }
        }
        requestAnimationFrame(draw);
    };

    const labelingMouseUp = (zoomPosX: number, zoomPosY: number) => {
        const index = drawingElements.current.length - 1;
        if (index < 0) return;
        if (tool === "bounding") {
            const { id, sX, sY, cX, cY } = adjustElementCoordinates(drawingElements.current[index]);
            if (Math.abs(sX - cX) < 5 || Math.abs(sY - cY) < 5) return; // Add the box drawing clicking feature
            updateElement({ id, sX, sY, cX, cY });
        } else if (tool === "select") {
            if (!selectedElement) return;
            const updateSelectedElement = [...elements].find((element) => element.id === selectedElement.id);
            if (updateSelectedElement) {
                getSelectedElement(updateSelectedElement);
            }
        }
        getElements(drawingElements.current);
        actionRef.current = "none";
        requestAnimationFrame(draw);
    };

    const labelingWheel = () => {
        requestAnimationFrame(draw);
    };

    useImperativeHandle(ref, () => ({
        labelingMouseDown,
        labelingMouseMove,
        labelingMouseUp,
        labelingWheel,
        draw,
    }));

    return <StyledCanvas ref={canvasRef}></StyledCanvas>;
}

export default forwardRef(LabelingCanvas);

const StyledCanvas = styled.canvas`
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
`;

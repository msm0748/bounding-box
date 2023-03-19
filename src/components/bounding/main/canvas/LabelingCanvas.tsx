import { useRef, forwardRef, useImperativeHandle, MutableRefObject, useEffect, useCallback } from "react";
import styled from "styled-components";
import { cursorForPosition, adjustElementCoordinates, resizedCoordinates, measurePaddingBoxSize, clamp } from "./utils/labelingUtils";
import { INITIAL_POSITION } from "../defaults";

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
    category: ICategory;
}

function LabelingCanvas(
    {
        elements,
        canvasSize,
        getElements,
        viewPosRef,
        scaleRef,
        tool,
        selectedElement,
        getSelectedElement,
        imageInfo,
        mouseCursorStyle,
        isImageMove,
        category,
    }: Props,
    ref: React.Ref<LabelingCanvasdRef>
) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const actionRef = useRef<Action>("none");
    const drawingElements = useRef<IElement[]>([]);
    const resizePointRef = useRef(9);
    const currentMousePos = useRef(INITIAL_POSITION);

    // init
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
    }, [canvasSize]);

    const crosshair = useCallback(
        (ctx: CanvasRenderingContext2D) => {
            if (tool !== "bounding") return;
            let x = currentMousePos.current.x;
            let y = currentMousePos.current.y;
            const viewPosX = viewPosRef.current.x;
            const viewPosY = viewPosRef.current.y;
            const scale = scaleRef.current;

            if (imageInfo) {
                if (x < viewPosX) x = viewPosX;
                if (x > viewPosX + canvasSize.width * scale) x = viewPosX + canvasSize.width * scale;
                if (y < viewPosY + imageInfo.y * scale) y = viewPosY + imageInfo.y * scale;
                if (y > viewPosY + (imageInfo.y + imageInfo.height) * scale) y = viewPosY + (imageInfo.y + imageInfo.height) * scale;
            }

            ctx.setLineDash([2, 5]);
            ctx.lineWidth = 1;
            ctx.globalAlpha = 1;
            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasSize.width, y);
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasSize.height);
            ctx.stroke();
            ctx.closePath();
            ctx.setLineDash([0]);
        },
        [canvasSize, tool, scaleRef, viewPosRef, imageInfo]
    );

    const draw = useCallback(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = canvasSize.width;
        crosshair(ctx);

        ctx.setTransform(scaleRef.current, 0, 0, scaleRef.current, viewPosRef.current.x, viewPosRef.current.y);

        ctx.lineWidth = 2 / scaleRef.current;

        drawingElements.current.forEach(({ id, sX, sY, cX, cY, color }) => {
            const width = cX - sX;
            const height = cY - sY;
            ctx.strokeStyle = color;
            ctx.strokeRect(sX, sY, width, height);

            if (selectedElement) {
                if (id === selectedElement.id) {
                    const resizePoint = resizePointRef.current / scaleRef.current + 3 / scaleRef.current;

                    ctx.fillStyle = "white";
                    measurePaddingBoxSize(ctx, sX, sY, cX, cY);

                    if (tool === "select") {
                        ctx.strokeRect(cX - resizePoint / 2, sY - resizePoint / 2, resizePoint, resizePoint);
                        ctx.fillRect(cX - resizePoint / 2, sY - resizePoint / 2, resizePoint, resizePoint);

                        ctx.strokeRect(sX - resizePoint / 2, sY - resizePoint / 2, resizePoint, resizePoint);
                        ctx.fillRect(sX - resizePoint / 2, sY - resizePoint / 2, resizePoint, resizePoint);

                        ctx.strokeRect(sX - resizePoint / 2, cY - resizePoint / 2, resizePoint, resizePoint);
                        ctx.fillRect(sX - resizePoint / 2, cY - resizePoint / 2, resizePoint, resizePoint);

                        ctx.strokeRect(cX - resizePoint / 2, cY - resizePoint / 2, resizePoint, resizePoint);
                        ctx.fillRect(cX - resizePoint / 2, cY - resizePoint / 2, resizePoint, resizePoint);
                    }
                }
            }
        });
    }, [canvasSize, scaleRef, selectedElement, tool, viewPosRef, crosshair]);
    console.log(elements);

    const createElement = ({ id, sX, sY, cX, cY, color, title }: IElement) => {
        if (imageInfo) {
            const clampedSX = clamp(sX, 0, imageInfo.width);
            const clampedSY = clamp(sY, imageInfo.y, imageInfo.height + imageInfo.y);
            const clampedCX = clamp(cX, 0, imageInfo.width);
            const clampedCY = clamp(cY, imageInfo.y, imageInfo.height + imageInfo.y);
            return { id, sX: clampedSX, sY: clampedSY, cX: clampedCX, cY: clampedCY, color, title };
        } else {
            return { id, sX, sY, cX, cY, color, title };
        }
    };

    const updateElement = ({ id, sX, sY, cX, cY, color, title }: IElement) => {
        const updateElement = createElement({ id, sX, sY, cX, cY, color, title });

        const elementsCopy = [...drawingElements.current].map((element) => (element.id === id ? updateElement : element));
        drawingElements.current = elementsCopy;
    };

    const nearPoint = (offsetX: number, offsetY: number, x: number, y: number, name: string, cX?: number, cY?: number) => {
        const resizePoint = resizePointRef.current / scaleRef.current;
        if (cX && cY) {
            switch (name) {
                case "t":
                case "b":
                    return x < offsetX && cX > offsetX && Math.abs(offsetY - y) < resizePoint ? name : null;
                case "l":
                case "r":
                    return y < offsetY && cY > offsetY && Math.abs(offsetX - x) < resizePoint ? name : null;
            }
        } else {
            return Math.abs(offsetX - x) < resizePoint && Math.abs(offsetY - y) < resizePoint ? name : null;
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

    const getElementAtPosition = (zoomPosX: number, zoomPosY: number, elements: IElement[]) => {
        let elementsCopy = [...elements];
        // Within the function, if the variable "selectedElement" exists, it is moved to the front of the array as the first element
        if (selectedElement) {
            const selectedElementCopy = elementsCopy.find((element) => element.id === selectedElement.id);
            elementsCopy = elementsCopy.filter((element) => element.id !== selectedElement.id);
            if (selectedElementCopy) {
                elementsCopy = [selectedElementCopy, ...elementsCopy];
                return elementsCopy
                    .map((element) => ({ ...element, position: positionWithinElement(zoomPosX, zoomPosY, element) }))
                    .find((element) => element.position !== null);
            }
        }

        return elementsCopy
            .reverse()
            .map((element) => ({ ...element, position: positionWithinElement(zoomPosX, zoomPosY, element) }))
            .find((element) => element.position !== null);
    };

    const labelingMouseDown = (zoomPosX: number, zoomPosY: number) => {
        if (isImageMove === true) return;

        if (tool === "bounding") {
            if (actionRef.current !== "none") return;
            actionRef.current = "drawing";
            const id = +new Date();
            const element = createElement({ id, sX: zoomPosX, sY: zoomPosY, cX: zoomPosX, cY: zoomPosY, color: category.color, title: category.title });
            getSelectedElement(element);
            drawingElements.current = [...drawingElements.current, element];
        } else if (tool === "select") {
            const element = getElementAtPosition(zoomPosX, zoomPosY, drawingElements.current);

            if (element) {
                if (element.position === "inside") {
                    actionRef.current = "moving";
                } else {
                    actionRef.current = "resizing";
                }
                getSelectedElement({ ...element, offsetX: zoomPosX, offsetY: zoomPosY });
            } else {
                getSelectedElement(null);
                actionRef.current = "none";
            }
        }
        requestAnimationFrame(draw);
    };

    const labelingMouseMove = (e: React.MouseEvent, zoomPosX: number, zoomPosY: number) => {
        const { offsetX, offsetY } = e.nativeEvent;
        currentMousePos.current = { x: offsetX, y: offsetY };

        if (isImageMove === false) {
            if (tool === "bounding") {
                if (actionRef.current === "drawing") {
                    if (!drawingElements.current) return;
                    const index = drawingElements.current.length - 1;
                    const { id, sX, sY, color, title } = drawingElements.current[index];
                    updateElement({ id, sX, sY, cX: zoomPosX, cY: zoomPosY, color, title });
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
                } else if (actionRef.current === "moving") {
                    if (!selectedElement) return;
                    const { id, sX, sY, cX, cY, offsetX, offsetY, color, title } = selectedElement;

                    if (!(offsetX && offsetY)) return;

                    const width = cX - sX;
                    const height = cY - sY;

                    const x = offsetX - sX;
                    const y = offsetY - sY;

                    let newX = zoomPosX - x;
                    let newY = zoomPosY - y;

                    if (imageInfo) {
                        if (newX < 0) newX = 0;
                        if (newY < imageInfo.y) newY = imageInfo.y;
                        if (newX + width > imageInfo.width) newX = imageInfo.width - width;
                        if (newY + height > imageInfo.height + imageInfo.y) newY = imageInfo.height + imageInfo.y - height;
                    }

                    updateElement({ id, sX: newX, sY: newY, cX: newX + width, cY: newY + height, color, title });
                } else if (actionRef.current === "resizing") {
                    if (!selectedElement) return;
                    const { position, offsetX, offsetY, ...coordinates } = selectedElement;
                    if (!position) return;
                    if (!(offsetX && offsetY)) return;
                    const { id, sX, sY, cX, cY, color, title } = resizedCoordinates(zoomPosX, zoomPosY, position, coordinates, offsetX, offsetY);
                    updateElement({ id, sX, sY, cX, cY, color, title });
                }
            }
        }
        requestAnimationFrame(draw);
    };

    const labelingMouseUp = (zoomPosX: number, zoomPosY: number) => {
        if (tool === "bounding") {
            const index = drawingElements.current.length - 1;
            if (index < 0) return;
            const { id, sX, sY, cX, cY, color, title } = adjustElementCoordinates(drawingElements.current[index]);
            if (Math.abs(sX - cX) < 5 || Math.abs(sY - cY) < 5) return; // Add the box drawing clicking feature
            updateElement({ id, sX, sY, cX, cY, color, title });
        } else if (tool === "select") {
            if (selectedElement) {
                if (actionRef.current === "resizing") {
                    const element = drawingElements.current.find((element) => element.id === selectedElement.id);
                    if (!element) return;
                    const { id, sX, sY, cX, cY, color, title } = adjustElementCoordinates(element);
                    updateElement({ id, sX, sY, cX, cY, color, title });
                }
                const updateSelectedElement = [...drawingElements.current].find((element) => element.id === selectedElement.id);
                if (updateSelectedElement) {
                    getSelectedElement(updateSelectedElement);
                }
            }
        }
        getElements(drawingElements.current);
        actionRef.current = "none";
        requestAnimationFrame(draw);
    };

    const labelingWheel = () => {
        requestAnimationFrame(draw);
    };

    useEffect(() => {
        if (tool === "bounding" && actionRef.current === "none") {
            getSelectedElement(null);
        }
        draw();
    }, [tool, getSelectedElement, draw]);

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

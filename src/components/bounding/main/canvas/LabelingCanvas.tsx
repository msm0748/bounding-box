import { useRef, useState, forwardRef, useImperativeHandle, MutableRefObject, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import { drawLine, cursorForPosition, adjustElementCoordinates, resizedCoordinates, measurePaddingBoxSize, clamp } from "./utils/labelingUtils";
import { INITIAL_POSITION } from "../defaults";

interface Props {
    elements: IElement[];
    canvasSize: ISize;
    viewPosRef: MutableRefObject<IPosition>;
    scaleRef: MutableRefObject<number>;
    tool: Tool;
    setElements: Dispatch<SetStateAction<IElement[]>>;
    selectedElement: ISelectedElement | null;
    setElementHandler: (element: ISelectedElement | null) => void;
    imageInfo: IImageInfo | null;
    mouseCursorStyle: (name: string) => void;
    isImageMove: boolean;
    category: ICategory;
    hoveredBoxId: number | undefined;
    highlightBox: (element: ISelectedElement | undefined) => void;
}

function LabelingCanvas(
    {
        elements,
        canvasSize,
        setElements,
        viewPosRef,
        scaleRef,
        tool,
        selectedElement,
        setElementHandler,
        imageInfo,
        mouseCursorStyle,
        isImageMove,
        category,
        hoveredBoxId,
        highlightBox,
    }: Props,
    ref: React.Ref<LabelingCanvasdRef>
) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [action, setAction] = useState<Action>("none");
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
            let { x, y } = currentMousePos.current;
            const { x: viewPosX, y: viewPosY } = viewPosRef.current;
            const scale = scaleRef.current;

            const startX = -viewPosX / scale;
            const width = -viewPosX / scale + canvasSize.width / scale;
            const startY = -viewPosY / scale;
            const height = -viewPosY / scale + canvasSize.height / scale;

            if (imageInfo) {
                if (x < imageInfo.x) x = imageInfo.x;
                if (x > imageInfo.width) x = imageInfo.width;
                if (y < imageInfo.y) y = imageInfo.y;
                if (y > imageInfo.y + imageInfo.height) y = imageInfo.y + imageInfo.height;
            }

            ctx.lineWidth = 2 / scale;

            ctx.globalAlpha = 0.6;
            ctx.strokeStyle = "white";
            drawLine(ctx, x, y, startX, startY, width, height);

            ctx.globalAlpha = 1;
            ctx.strokeStyle = "black";
            ctx.setLineDash([4 / scale, 5 / scale]);

            ctx.beginPath();
            drawLine(ctx, x, y, startX, startY, width, height);

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
        const scale = scaleRef.current;
        ctx.setTransform(scale, 0, 0, scale, viewPosRef.current.x, viewPosRef.current.y);

        ctx.lineWidth = 2 / scale;

        elements.forEach(({ id, sX, sY, cX, cY, color }) => {
            const width = cX - sX;
            const height = cY - sY;
            ctx.strokeStyle = color;
            ctx.strokeRect(sX, sY, width, height);

            if (hoveredBoxId) {
                if (hoveredBoxId === id) {
                    if (!selectedElement || selectedElement.id !== hoveredBoxId) {
                        ctx.globalAlpha = 0.5;
                        ctx.fillStyle = color;
                        ctx.fillRect(sX, sY, width, height);
                        ctx.globalAlpha = 1;
                    }
                }
            }

            if (selectedElement) {
                if (id === selectedElement.id) {
                    const resizePoint = resizePointRef.current / scale + 3 / scale;

                    ctx.fillStyle = "white";
                    measurePaddingBoxSize(ctx, sX, sY, cX, cY, scale);

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
        crosshair(ctx);
    }, [canvasSize, scaleRef, selectedElement, tool, viewPosRef, crosshair, hoveredBoxId, elements]);

    const createElement = (id: number, sX: number, sY: number, cX: number, cY: number, color: string = category.color, title: string = category.title) => {
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
        const updateElement = createElement(id, sX, sY, cX, cY, color, title);

        const elementsCopy = [...elements].map((element) => (element.id === id ? updateElement : element));
        setElements(elementsCopy);
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
            if (action !== "none") return;
            setAction("drawing");
            const id = +new Date();
            const element = createElement(id, zoomPosX, zoomPosY, zoomPosX, zoomPosY);
            setElements((prev) => [...prev, element]);
            setElementHandler(element);
        } else if (tool === "select") {
            const element = getElementAtPosition(zoomPosX, zoomPosY, elements);

            if (element) {
                if (element.position === "inside") {
                    setAction("moving");
                } else {
                    setAction("resizing");
                }
                setElementHandler({ ...element, offsetX: zoomPosX, offsetY: zoomPosY });
            } else {
                setElementHandler(null);
                setAction("none");
            }
        }
        requestAnimationFrame(draw);
    };

    const labelingMouseMove = (zoomPosX: number, zoomPosY: number) => {
        currentMousePos.current = { x: zoomPosX, y: zoomPosY };

        if (tool === "move" || tool === "bounding") {
            highlightBox(undefined);
        }

        if (isImageMove === false) {
            if (tool === "bounding") {
                highlightBox(undefined);
                if (action === "drawing") {
                    if (!elements) return;
                    const index = elements.length - 1;
                    const { id, sX, sY, color, title } = elements[index];
                    updateElement({ id, sX, sY, cX: zoomPosX, cY: zoomPosY, color, title });
                }
            } else if (tool === "select") {
                const element = getElementAtPosition(zoomPosX, zoomPosY, elements);
                highlightBox(element);
                if (action === "none") {
                    if (element) {
                        if (!element.position) return;
                        mouseCursorStyle(element ? cursorForPosition(element.position) : "default");
                    } else {
                        mouseCursorStyle("default");
                    }
                } else if (action === "moving") {
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
                } else if (action === "resizing") {
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

    const labelingMouseUp = () => {
        if (tool === "bounding") {
            const index = elements.length - 1;
            if (index < 0) return;
            const { id, sX, sY, cX, cY, color, title } = adjustElementCoordinates(elements[index]);
            if (Math.abs(sX - cX) < 5 || Math.abs(sY - cY) < 5) return; // Add the box drawing clicking feature
            updateElement({ id, sX, sY, cX, cY, color, title });
        } else if (tool === "select") {
            if (selectedElement) {
                if (action === "resizing") {
                    const element = elements.find((element) => element.id === selectedElement.id);
                    if (!element) return;
                    const { id, sX, sY, cX, cY, color, title } = adjustElementCoordinates(element);
                    updateElement({ id, sX, sY, cX, cY, color, title });
                }
                const updateSelectedElement = [...elements].find((element) => element.id === selectedElement.id);
                if (updateSelectedElement) {
                    setElementHandler(updateSelectedElement);
                }
            }
        }
        setAction("none");
        requestAnimationFrame(draw);
    };

    const labelingWheel = () => {
        requestAnimationFrame(draw);
    };

    useEffect(() => {
        draw();
    }, [tool, draw]);

    useEffect(() => {
        const handleCancel = (e: KeyboardEvent) => {
            if (action === "drawing") {
                const id = elements[elements.length - 1].id;
                if (e.code === "Escape") {
                    setElements((elements) => elements.filter((element) => element.id !== id));
                    setElementHandler(null);
                    setAction("none");
                }
            } else {
                setElementHandler(null);
            }
        };
        document.addEventListener("keydown", handleCancel);
        return () => {
            document.removeEventListener("keydown", handleCancel);
        };
    }, [action, setElementHandler, setElements, elements]);

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

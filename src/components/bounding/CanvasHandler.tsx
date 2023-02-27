import { useRef, useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import { ISize, IElements, ISelectedElement, Point } from "./index.type";

interface Props {
    tool: "select" | "move" | "bounding";
    canvasSize: ISize;
    elements: IElements[];
    setElements: Dispatch<SetStateAction<IElements[]>>;
    selectedElement: ISelectedElement | null;
    setSelectedElement: Dispatch<SetStateAction<ISelectedElement | null>>;
    handleWheel: (event: React.WheelEvent) => void;
    handleZoomMouseDown: (event: React.MouseEvent) => void;
    handleZoomMouseMove: (event: React.MouseEvent) => void;
    handleZoomMouseUp: () => void;
    isImageMove: boolean;
    mouseCursorStyle: (name: string) => void;
    RESIZE_POINT: number;
    viewportTopLeft: Point;
    scale: number;
    drawImageSize: ISize;
    getMouseOverElement: (element: ISelectedElement | undefined) => void;
}

const StyledCanvas = styled.canvas`
    position: absolute;
    top: 0;
    left: 0;
    z-index: 3;
`;

const ORIGIN = { x: 0, y: 0 };

const createElement = (id: number, sX: number, sY: number, cX: number, cY: number) => {
    return { id, sX, sY, cX, cY };
};

const adjustElementCoordinates = (element: IElements) => {
    //오른쪽에서 왼쪽으로 그릴때 좌표값 제대로  잡아주기
    const { sX, sY, cX, cY, ...rest } = element;
    const minX = Math.min(sX, cX);
    const maxX = Math.max(sX, cX);
    const minY = Math.min(sY, cY);
    const maxY = Math.max(sY, cY);
    return { sX: minX, sY: minY, cX: maxX, cY: maxY, ...rest };
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

const resizedCoordinates = (offsetX: number, offsetY: number, position: string, coordinates: IElements, startX: number, startY: number) => {
    const { sX, sY, cX, cY } = coordinates;

    //마우스 위치에서 부터 자연스럽게 이동
    switch (position) {
        case "tl": {
            const x = startX - sX;
            const y = startY - sY;
            const newX = offsetX - x;
            const newY = offsetY - y;
            return { sX: newX, sY: newY, cX, cY };
        }
        case "tr": {
            const x = startX - cX;
            const y = startY - sY;
            const newX = offsetX - x;
            const newY = offsetY - y;
            return { sX, sY: newY, cX: newX, cY };
        }
        case "br": {
            const x = startX - cX;
            const y = startY - cY;
            const newX = offsetX - x;
            const newY = offsetY - y;
            return { sX, sY, cX: newX, cY: newY };
        }
        case "bl": {
            const x = startX - sX;
            const y = startY - cY;
            const newX = offsetX - x;
            const newY = offsetY - y;
            return { sX: newX, sY, cX, cY: newY };
        }
        case "b": {
            const y = startY - cY;
            const newY = offsetY - y;
            return { sX, sY, cX, cY: newY };
        }
        case "t": {
            const y = startY - sY;
            const newY = offsetY - y;
            return { sX, sY: newY, cX, cY };
        }
        case "r": {
            const x = startX - cX;
            const newX = offsetX - x;
            return { sX, sY, cX: newX, cY };
        }
        case "l": {
            const x = startX - sX;
            const newX = offsetX - x;
            return { sX: newX, sY, cX, cY };
        }
        default:
            return { sX, sY, cX, cY };
    }
};

function Canvas({
    tool,
    canvasSize,
    elements,
    setElements,
    selectedElement,
    setSelectedElement,
    handleZoomMouseDown,
    handleZoomMouseMove,
    handleZoomMouseUp,
    handleWheel,
    isImageMove,
    mouseCursorStyle,
    RESIZE_POINT,
    viewportTopLeft,
    scale,
    drawImageSize,
    getMouseOverElement,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [action, setAction] = useState<"none" | "moving" | "drawing" | "resizing">("none");
    const mousePosRef = useRef<Point>(ORIGIN);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;

        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;

        const context = canvas.getContext("2d");
        setCtx(context);
    }, [canvasSize]);

    const nearPoint = useCallback(
        (offsetX: number, offsetY: number, x: number, y: number, name: string, cX?: number, cY?: number) => {
            if (cX && cY) {
                switch (name) {
                    case "t":
                    case "b":
                        return x < offsetX && cX > offsetX && Math.abs(offsetY - y) < RESIZE_POINT ? name : null;
                    case "l":
                    case "r":
                        return y < offsetY && cY > offsetY && Math.abs(offsetX - x) < RESIZE_POINT ? name : null;
                }
            } else {
                return Math.abs(offsetX - x) < RESIZE_POINT && Math.abs(offsetY - y) < RESIZE_POINT ? name : null;
            }
        },
        [RESIZE_POINT]
    );

    const positionWithinElement = useCallback(
        (offsetX: number, offsetY: number, element: IElements) => {
            const { sX, sY, cX, cY, id } = element;
            const topLeft = nearPoint(offsetX, offsetY, sX, sY, "tl");
            const topRight = nearPoint(offsetX, offsetY, cX, sY, "tr");
            const bottomLeft = nearPoint(offsetX, offsetY, sX, cY, "bl");
            const bottomRight = nearPoint(offsetX, offsetY, cX, cY, "br");

            const top = nearPoint(offsetX, offsetY, sX, sY, "t", cX, cY);
            const bottom = nearPoint(offsetX, offsetY, sX, cY, "b", cX, cY);
            const right = nearPoint(offsetX, offsetY, cX, sY, "r", cX, cY);
            const left = nearPoint(offsetX, offsetY, sX, sY, "l", cX, cY);

            const inside = offsetX >= sX && offsetX <= cX && offsetY >= sY && offsetY <= cY ? "inside" : null;

            if (selectedElement) {
                if (id === selectedElement.id) {
                    return topLeft || topRight || bottomLeft || bottomRight || top || right || bottom || left || inside;
                }
            }

            return inside;
        },
        [nearPoint, selectedElement]
    );

    const getZoomPosition = useCallback(
        (offsetX: number, offsetY: number) => {
            const canvas = canvasRef.current!;
            let zoomPosX = offsetX / scale + viewportTopLeft.x;
            let zoomPosY = offsetY / scale + viewportTopLeft.y;
            if (zoomPosX < 0) zoomPosX = 0;
            if (zoomPosY < (canvas.height - drawImageSize.height) / 2) zoomPosY = (canvas.height - drawImageSize.height) / 2;
            if (zoomPosX > canvas.width) zoomPosX = canvas.width;
            if (zoomPosY > (canvas.height + drawImageSize.height) / 2) zoomPosY = (canvas.height + drawImageSize.height) / 2;
            // drawImage 이탈 금지
            return { zoomPosX, zoomPosY };
        },
        [viewportTopLeft, scale, drawImageSize]
    );

    const getElementPosition = useCallback(
        (offsetX: number, offsetY: number) => {
            const { zoomPosX, zoomPosY } = getZoomPosition(offsetX, offsetY);

            let elementsCopy = [...elements];
            if (selectedElement) {
                // 현재 selectedElement가 있으면 1순위로 수정되게끔
                const selectedElementCopy = elementsCopy.find((element) => element.id === selectedElement.id); // 최신 selectedElement값 가져오기 위한 복사(마우스 움직일때 selectedElement는 최신값이 아님)
                elementsCopy = elementsCopy.filter((element) => element.id !== selectedElement.id); //현재 selectedElement값을 없애고 밑에서 최신 selectedElement를 넣어줌
                if (selectedElementCopy) {
                    elementsCopy = [selectedElementCopy, ...elementsCopy]; //
                    return elementsCopy
                        .map((element) => ({ ...element, position: positionWithinElement(zoomPosX, zoomPosY, element) }))
                        .find((element) => element.position !== null);
                }
            }

            return elementsCopy
                .reverse()
                .map((element) => ({ ...element, position: positionWithinElement(zoomPosX, zoomPosY, element) }))
                .find((element) => element.position !== null); // selectedElement 가 없으면 마지막 rect 값 가져옴
        },
        [elements, selectedElement, positionWithinElement, getZoomPosition]
    );

    const updateElement = useCallback(
        (id: number, sX: number, sY: number, cX: number, cY: number) => {
            const updateElement = createElement(id, sX, sY, cX, cY);

            const elementsCopy = [...elements].map((element) => (element.id === id ? updateElement : element));
            setElements(elementsCopy);
        },
        [elements, setElements]
    );
    const crosshair = useCallback(() => {
        const canvas = canvasRef.current!;
        let x = mousePosRef.current.x;
        let y = mousePosRef.current.y;

        if (x / scale + viewportTopLeft.x < 0) {
            x = -viewportTopLeft.x * scale;
        }
        if (y / scale + (viewportTopLeft.y - (canvas.height - drawImageSize.height) / 2) < 0) {
            y = -(viewportTopLeft.y - (canvas.height - drawImageSize.height) / 2) * scale;
        }
        if (x / scale + viewportTopLeft.x > canvas.width) {
            x = (-viewportTopLeft.x + canvas.width) * scale;
        }
        if (y / scale + (viewportTopLeft.y + (canvas.height - drawImageSize.height) / 2) > canvas.height) {
            y = (-viewportTopLeft.y + canvas.height - (canvas.height - drawImageSize.height) / 2) * scale;
        }

        ctx?.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        if (tool !== "bounding") return;
        ctx?.setLineDash([2, 5]);
        ctx!.lineWidth = 1;
        ctx!.globalAlpha = 1;
        ctx!.strokeStyle = "black";
        ctx?.beginPath();
        ctx?.moveTo(0, y);
        ctx?.lineTo(canvas.offsetWidth, y);
        ctx?.stroke();
        ctx?.closePath();

        ctx?.beginPath();
        ctx?.moveTo(x, 0);
        ctx?.lineTo(x, canvas.offsetHeight);
        ctx?.stroke();
        ctx?.closePath();
    }, [ctx, tool, viewportTopLeft, scale, drawImageSize]);

    useEffect(() => {
        crosshair();
    }, [crosshair]);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            handleZoomMouseDown(e);
            if (isImageMove) return;
            const { offsetX, offsetY } = e.nativeEvent;
            if (tool === "bounding") {
                setAction("drawing");
                if (action !== "none") return;
                const id = +new Date();
                const { zoomPosX, zoomPosY } = getZoomPosition(offsetX, offsetY);
                const element = createElement(id, zoomPosX, zoomPosY, zoomPosX, zoomPosY);
                setElements((prev) => [...prev, element]);
                setSelectedElement(element);
            } else if (tool === "select") {
                const element = getElementPosition(offsetX, offsetY);
                const { zoomPosX, zoomPosY } = getZoomPosition(offsetX, offsetY);

                if (element) {
                    if (element.position === "inside") {
                        setAction("moving");
                    } else {
                        setAction("resizing");
                    }
                    setSelectedElement({ ...element, startX: zoomPosX, startY: zoomPosY });
                } else {
                    setSelectedElement(null);
                }
            }
        },
        [tool, action, isImageMove, setElements, getElementPosition, setSelectedElement, handleZoomMouseDown, getZoomPosition]
    );
    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            const { offsetX, offsetY } = e.nativeEvent;
            mousePosRef.current.x = offsetX;
            mousePosRef.current.y = offsetY;
            crosshair();
            handleZoomMouseMove(e);
            if (isImageMove) return;
            if (tool === "bounding") {
                if (action === "drawing") {
                    const { zoomPosX, zoomPosY } = getZoomPosition(offsetX, offsetY);
                    const index = elements.length - 1;
                    const { id, sX, sY } = elements[index];
                    updateElement(id, sX, sY, zoomPosX, zoomPosY);
                }
            } else if (tool === "select") {
                const element = getElementPosition(offsetX, offsetY);
                getMouseOverElement(element);
                if (action === "none") {
                    mouseCursorStyle(element ? cursorForPosition(element.position!) : "default");
                }

                if (action === "moving") {
                    const canvas = canvasRef.current!;
                    if (!selectedElement) return;
                    const { id, sX, sY, cX, cY, startX, startY } = selectedElement;
                    if (!(startX && startY)) return;
                    const { zoomPosX, zoomPosY } = getZoomPosition(offsetX, offsetY);

                    const width = cX - sX;
                    const height = cY - sY;

                    const x = startX - sX;
                    const y = startY - sY;
                    let newX = zoomPosX - x;
                    let newY = zoomPosY - y;
                    //마우스 위치에서 부터 자연스럽게 이동

                    if (newX < 0) newX = 0;
                    if (newY < (canvas.height - drawImageSize.height) / 2) newY = (canvas.height - drawImageSize.height) / 2;
                    if (newX + width > canvas.width) newX = canvas.width - width;
                    if (newY + height > (canvas.height + drawImageSize.height) / 2) newY = (canvas.height + drawImageSize.height) / 2 - height;
                    //canvas 이탈 금지

                    updateElement(id, newX, newY, newX + width, newY + height);
                } else if (action === "resizing") {
                    if (!selectedElement) return;
                    const { position, startX, startY, ...coordinates } = selectedElement;
                    const { id } = selectedElement;
                    const { zoomPosX, zoomPosY } = getZoomPosition(offsetX, offsetY);

                    if (!position) return;
                    if (!(startX && startY)) return;
                    const { sX, sY, cX, cY } = resizedCoordinates(zoomPosX, zoomPosY, position, coordinates, startX, startY);

                    updateElement(id, sX, sY, cX, cY);
                }
            }
        },
        [
            tool,
            action,
            isImageMove,
            elements,
            updateElement,
            getElementPosition,
            selectedElement,
            handleZoomMouseMove,
            mouseCursorStyle,
            getZoomPosition,
            drawImageSize,
            crosshair,
            getMouseOverElement,
        ]
    );
    const handleMouseUp = useCallback(
        (e: React.MouseEvent) => {
            handleZoomMouseUp();
            if (isImageMove) return;
            const { offsetX, offsetY } = e.nativeEvent;
            if (tool === "bounding") {
                const index = elements.length - 1;
                const { id, sX, sY, cX, cY } = adjustElementCoordinates(elements[index]);
                const { zoomPosX, zoomPosY } = getZoomPosition(offsetX, offsetY);
                if (Math.abs(sX - zoomPosX) < 5 && Math.abs(sY - zoomPosY) < 5) return; // 마우스 클릭으로도 그릴 수 있게
                updateElement(id, sX, sY, cX, cY);
            } else if (tool === "select") {
                if (selectedElement) {
                    if (action === "resizing") {
                        const element = elements.find((element) => element.id === selectedElement.id);
                        if (!element) return;
                        const { id, sX, sY, cX, cY } = adjustElementCoordinates(element);
                        updateElement(id, sX, sY, cX, cY);
                    }
                    const updateSelectedElement = [...elements].find((element) => element.id === selectedElement.id);
                    if (updateSelectedElement) {
                        setSelectedElement(updateSelectedElement);
                    }
                }
            }
            setAction("none");
        },
        [tool, action, isImageMove, selectedElement, setSelectedElement, elements, updateElement, handleZoomMouseUp, getZoomPosition]
    );

    useEffect(() => {
        const canvas = canvasRef.current!;
        const preventDefault = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
            }
        };
        canvas.addEventListener("wheel", preventDefault, { passive: false });
        return () => {
            canvas.removeEventListener("wheel", preventDefault);
        };
    }, []);

    return (
        <StyledCanvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
        ></StyledCanvas>
    );
}

export default Canvas;

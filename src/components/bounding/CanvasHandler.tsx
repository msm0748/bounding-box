import { useRef, useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import { ICanvasSize, IElements, ISelectedElement } from "./index.type";

interface Props {
    tool: "select" | "move" | "bounding";
    elements: IElements[];
    setElements: Dispatch<SetStateAction<IElements[]>>;
    selectedElement: ISelectedElement | null;
    setSelectedElement: Dispatch<SetStateAction<ISelectedElement | null>>;
}

const StyledWrap = styled.div`
    position: relative;
    width: 100%;
`;

type Point = {
    x: number;
    y: number;
};

const ORIGIN = { x: 0, y: 0 };
const RESIZE_POINT = 9;

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

function Canvas({ tool, elements, setElements, selectedElement, setSelectedElement }: Props) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState<ICanvasSize>({ width: 0, height: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [action, setAction] = useState<"none" | "moving" | "drawing" | "resizing">("none");
    const mousePosRef = useRef<Point>(ORIGIN);

    useEffect(() => {
        if (!wrapRef.current) return;
        setCanvasSize({ width: wrapRef.current.offsetWidth, height: wrapRef.current.offsetHeight });
    }, []);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;

        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;

        const context = canvas.getContext("2d");
        setCtx(context);
    }, [canvasSize]);

    const draw = useCallback(() => {
        if (!ctx) return;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const resizePointRect = RESIZE_POINT + 3;
        elements.forEach(({ id, sX, sY, cX, cY }) => {
            const width = cX - sX;
            const height = cY - sY;
            ctx.strokeRect(sX, sY, width, height);
            if (selectedElement) {
                // 현재 선택중인 rect 색상 변경
                if (id === selectedElement.id) {
                    ctx.fillStyle = "white";

                    if (tool === "select") {
                        ctx.strokeRect(cX - resizePointRect / 2, sY - resizePointRect / 2, resizePointRect, resizePointRect);
                        ctx.fillRect(cX - resizePointRect / 2, sY - resizePointRect / 2, resizePointRect, resizePointRect);

                        ctx.strokeRect(sX - resizePointRect / 2, sY - resizePointRect / 2, resizePointRect, resizePointRect);
                        ctx.fillRect(sX - resizePointRect / 2, sY - resizePointRect / 2, resizePointRect, resizePointRect);

                        ctx.strokeRect(sX - resizePointRect / 2, cY - resizePointRect / 2, resizePointRect, resizePointRect);
                        ctx.fillRect(sX - resizePointRect / 2, cY - resizePointRect / 2, resizePointRect, resizePointRect);

                        ctx.strokeRect(cX - resizePointRect / 2, cY - resizePointRect / 2, resizePointRect, resizePointRect);
                        ctx.fillRect(cX - resizePointRect / 2, cY - resizePointRect / 2, resizePointRect, resizePointRect);
                    }
                }
            }
        });
    }, [ctx, tool, elements, selectedElement]);

    //draw
    useEffect(() => {
        draw();
    }, [draw]);

    const nearPoint = useCallback((offsetX: number, offsetY: number, x: number, y: number, name: string, cX?: number, cY?: number) => {
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
    }, []);

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

    const getElementPosition = useCallback(
        (offsetX: number, offsetY: number) => {
            let elementsCopy = [...elements];
            if (selectedElement) {
                // 현재 selectedElement가 있으면 1순위로 수정되게끔
                const selectedElementCopy = elementsCopy.find((element) => element.id === selectedElement.id); // 최신 selectedElement값 가져오기 위한 복사(마우스 움직일때 selectedElement는 최신값이 아님)
                elementsCopy = elementsCopy.filter((element) => element.id !== selectedElement.id); //현재 selectedElement값을 없애고 밑에서 최신 selectedElement를 넣어줌
                if (selectedElementCopy) {
                    elementsCopy = [selectedElementCopy, ...elementsCopy]; //
                    return elementsCopy
                        .map((element) => ({ ...element, position: positionWithinElement(offsetX, offsetY, element) }))
                        .find((element) => element.position !== null);
                }
            }

            return elementsCopy
                .reverse()
                .map((element) => ({ ...element, position: positionWithinElement(offsetX, offsetY, element) }))
                .find((element) => element.position !== null); // selectedElement 가 없으면 마지막 rect 값 가져옴
        },
        [elements, selectedElement, positionWithinElement]
    );

    const updateElement = useCallback(
        (id: number, sX: number, sY: number, cX: number, cY: number) => {
            const updateElement = createElement(id, sX, sY, cX, cY);

            const elementsCopy = [...elements].map((element) => (element.id === id ? updateElement : element));
            setElements(elementsCopy);
        },
        [elements, setElements]
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            const { offsetX, offsetY } = e.nativeEvent;
            if (tool === "bounding") {
                setAction("drawing");
                if (action !== "none") return;
                const id = +new Date();
                const element = createElement(id, offsetX, offsetY, offsetX, offsetY);
                setElements((prev) => [...prev, element]);
            } else if (tool === "select") {
                const element = getElementPosition(offsetX, offsetY);
                if (element) {
                    if (element.position === "inside") {
                        setAction("moving");
                    } else {
                        setAction("resizing");
                    }
                    setSelectedElement({ ...element, startX: offsetX, startY: offsetY });
                } else {
                    setSelectedElement(null);
                }
            }
        },
        [tool, action, setElements, getElementPosition, setSelectedElement]
    );
    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            const { offsetX, offsetY } = e.nativeEvent;
            mousePosRef.current.x = offsetX;
            mousePosRef.current.y = offsetY;
            if (tool === "bounding") {
                if (action === "drawing") {
                    const index = elements.length - 1;
                    const { id, sX, sY } = elements[index];
                    updateElement(id, sX, sY, offsetX, offsetY);
                }
            } else if (tool === "select") {
                const element = getElementPosition(offsetX, offsetY);
                if (action === "none") {
                    canvasRef.current!.style.cursor = element ? cursorForPosition(element.position!) : "default";
                }

                if (action === "moving") {
                    const canvas = canvasRef.current!;
                    if (!selectedElement) return;
                    const { id, sX, sY, cX, cY, startX, startY } = selectedElement;
                    if (!(startX && startY)) return;

                    const width = cX - sX;
                    const height = cY - sY;

                    const x = startX - sX;
                    const y = startY - sY;
                    let newX = offsetX - x;
                    let newY = offsetY - y;
                    //마우스 위치에서 부터 자연스럽게 이동

                    if (newX < 0) newX = 0;
                    if (newY < 0) newY = 0;
                    if (newX + width > canvas.width) newX = canvas.width - width;
                    if (newY + height > canvas.height) newY = canvas.height - height;
                    //canvas 이탈 금지

                    updateElement(id, newX, newY, newX + width, newY + height);
                } else if (action === "resizing") {
                    if (!selectedElement) return;
                    const { position, startX, startY, ...coordinates } = selectedElement;
                    const { id } = selectedElement;

                    if (!position) return;
                    if (!(startX && startY)) return;
                    const { sX, sY, cX, cY } = resizedCoordinates(offsetX, offsetY, position, coordinates, startX, startY);

                    updateElement(id, sX, sY, cX, cY);
                }
            }
        },
        [tool, action, elements, updateElement, getElementPosition, selectedElement]
    );
    const handleMouseUp = useCallback(
        (e: React.MouseEvent) => {
            const { offsetX, offsetY } = e.nativeEvent;
            if (tool === "bounding") {
                const index = elements.length - 1;
                const { id, sX, sY, cX, cY } = adjustElementCoordinates(elements[index]);
                if (Math.abs(sX - offsetX) < 5 && Math.abs(sY - offsetY) < 5) return; // 마우스 클릭으로도 그릴 수 있게
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
        [tool, action, selectedElement, setSelectedElement, elements, updateElement]
    );

    return (
        <StyledWrap ref={wrapRef}>
            <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}></canvas>
        </StyledWrap>
    );
}

export default Canvas;

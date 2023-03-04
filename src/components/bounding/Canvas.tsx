import React from "react";
import { useRef, useState, useEffect, useLayoutEffect, useCallback, Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import { ISize, IElements, ISelectedElement, Point, ICategory } from "./index.type";
import CanvasHandler from "./CanvasHandler";
import CategoryDropDown from "./category";

interface Props {
    tool: "select" | "move" | "bounding";
    elements: IElements[];
    setElements: Dispatch<SetStateAction<IElements[]>>;
    selectedElement: ISelectedElement | null;
    setSelectedElement: Dispatch<SetStateAction<ISelectedElement | null>>;
    isReset: boolean;
    setIsReset: Dispatch<SetStateAction<boolean>>;
    category: ICategory;
    setCategory: Dispatch<SetStateAction<ICategory>>;
    categoryList: ICategory[];
    image: HTMLImageElement;
    drawImageSize: ISize;
    setDrawImageSize: Dispatch<SetStateAction<ISize>>;
    canvasSize: ISize;
    setCanvasSize: Dispatch<SetStateAction<ISize>>;
    mouseOverElement: ISelectedElement | undefined;
    setMouseOverElement: Dispatch<SetStateAction<ISelectedElement | undefined>>;
}

const StyledWrap = styled.div`
    position: relative;
    width: 100%;
    background: gray;
`;

const StyledCanvas = styled.canvas`
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
`;

function diffPoints(p1: Point, p2: Point) {
    return { x: p1.x - p2.x, y: p1.y - p2.y };
}

function addPoints(p1: Point, p2: Point) {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
}

function scalePoint(p1: Point, scale: number) {
    return { x: p1.x / scale, y: p1.y / scale };
}
const ORIGIN = { x: 0, y: 0 };

const ZOOM_SENSITIVITY = 500; // bigger for lower zoom per scroll
const MAX_SCALE = 4;
const MIN_SCALE = 0.1;

function Canvas({
    tool,
    elements,
    setElements,
    selectedElement,
    setSelectedElement,
    isReset,
    setIsReset,
    category,
    setCategory,
    categoryList,
    image,
    setDrawImageSize,
    drawImageSize,
    canvasSize,
    setCanvasSize,
    mouseOverElement,
    setMouseOverElement,
}: Props) {
    const wrapRef = useRef<HTMLDivElement>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [scale, setScale] = useState<number>(1);
    const [offset, setOffset] = useState<Point>(ORIGIN);
    const [viewportTopLeft, setViewportTopLeft] = useState<Point>(ORIGIN);
    const [isImageMove, setIsImageMove] = useState<boolean>(false);
    const [isGrabbing, setIsGrabbing] = useState<boolean>(false);
    const mousePosRef = useRef<Point>(ORIGIN);
    const lastMousePosRef = useRef<Point>(ORIGIN);
    const lastOffsetRef = useRef<Point>(ORIGIN);
    const RESIZE_POINT = 9 / scale;

    useEffect(() => {
        if (!wrapRef.current) return;
        setCanvasSize({ width: wrapRef.current.offsetWidth, height: wrapRef.current.offsetHeight });
        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d");
        setCtx(context);
    }, [setCanvasSize]);

    // update last offset
    useEffect(() => {
        lastOffsetRef.current = offset;
    }, [offset]);

    // reset
    useEffect(() => {
        if (!ctx) return;
        if (isReset) {
            ctx.canvas.width = canvasSize.width;
            ctx.canvas.height = canvasSize.height;

            ctx.scale(1, 1);
            setScale(1);

            // reset state and refs
            setOffset(ORIGIN);
            setViewportTopLeft(ORIGIN);
            mousePosRef.current = ORIGIN;
            lastOffsetRef.current = ORIGIN;
            lastMousePosRef.current = ORIGIN;
        }
    }, [ctx, canvasSize, isReset]);
    // functions for panning

    const calculateMouse = useCallback((event: React.MouseEvent) => {
        const { offsetX, offsetY } = event.nativeEvent;
        if (canvasRef.current) {
            const viewportMousePos = { x: offsetX, y: offsetY };
            const topLeftCanvasPos = {
                x: canvasRef.current.offsetLeft,
                y: canvasRef.current.offsetTop,
            };
            mousePosRef.current = diffPoints(viewportMousePos, topLeftCanvasPos);
        }
    }, []);

    const handleZoomMouseDown = useCallback(
        (event: React.MouseEvent) => {
            const { offsetX, offsetY } = event.nativeEvent;
            lastMousePosRef.current = { x: offsetX, y: offsetY };
            if (isImageMove === true || tool === "move") {
                setIsGrabbing(true);
            }
        },
        [isImageMove, tool]
    );

    const handleZoomMouseMove = useCallback(
        (event: React.MouseEvent) => {
            const { offsetX, offsetY } = event.nativeEvent;
            calculateMouse(event);

            if (isImageMove === true || tool === "move") {
                if (!isGrabbing) return;
                const lastMousePos = lastMousePosRef.current;
                const currentMousePos = { x: offsetX, y: offsetY }; // use document so can pan off element
                lastMousePosRef.current = currentMousePos;

                const mouseDiff = diffPoints(currentMousePos, lastMousePos);
                setOffset((prevOffset) => addPoints(prevOffset, mouseDiff));
            }
        },
        [calculateMouse, tool, isGrabbing, isImageMove]
    );

    const handleZoomMouseUp = useCallback(() => {
        if (isImageMove === true || tool === "move") {
            setIsGrabbing(false);
        }
    }, [tool, isImageMove]);

    const handleWheel = useCallback(
        (event: React.WheelEvent) => {
            calculateMouse(event);
            if (!ctx) return;

            if (event.ctrlKey === true || event.metaKey === true) {
                const zoom = 1 - event.deltaY / ZOOM_SENSITIVITY;

                const newScale = scale * zoom;
                if (MIN_SCALE > newScale || newScale > MAX_SCALE) return;

                const viewportTopLeftDelta = {
                    x: (mousePosRef.current.x / scale) * (1 - 1 / zoom),
                    y: (mousePosRef.current.y / scale) * (1 - 1 / zoom),
                };
                const newViewportTopLeft = addPoints(viewportTopLeft, viewportTopLeftDelta);

                ctx.translate(viewportTopLeft.x, viewportTopLeft.y);
                ctx.scale(zoom, zoom);
                ctx.translate(-newViewportTopLeft.x, -newViewportTopLeft.y);

                setViewportTopLeft(newViewportTopLeft);
                setScale(newScale);
            } else {
                setOffset((prev) => ({ x: prev.x - event.deltaX, y: prev.y - event.deltaY }));
            }
            setIsReset(false);
        },
        [ctx, viewportTopLeft, scale, calculateMouse, setIsReset]
    );

    // pan when offset or scale changes
    useLayoutEffect(() => {
        if (ctx && lastOffsetRef.current) {
            const offsetDiff = scalePoint(diffPoints(offset, lastOffsetRef.current), scale);
            ctx.translate(offsetDiff.x, offsetDiff.y);
            setViewportTopLeft((prevVal) => diffPoints(prevVal, offsetDiff));
            setIsReset(false);
        }
    }, [ctx, offset, scale, setIsReset, canvasSize]);

    const mouseCursorStyle = useCallback((name: string) => {
        if (!wrapRef.current) return;
        wrapRef.current.style.cursor = name;
    }, []);

    const cutLineStroke = useCallback(
        (sX: number, sY: number, cX: number, cY: number) => {
            if (!ctx) return;
            ctx.setLineDash([5, 5]);
            const width = Math.abs(cX - sX);
            const height = Math.abs(cY - sY);
            const cutLineX = width - width * 0.95;
            const cutLineY = height - height * 0.95;

            const cutLine = Math.min(cutLineX, cutLineY);

            ctx.strokeRect(Math.min(sX, cX) + cutLine / 2, Math.min(sY, cY) + cutLine / 2, width - cutLine, height - cutLine);
        },
        [ctx]
    );

    // 초기 이미지 렌더링
    useEffect(() => {
        if (!ctx) return;
        const imageWidth = canvasSize.width;
        const imageHeight = (canvasSize.width * image.height) / image.width;

        setDrawImageSize({ width: imageWidth, height: imageHeight });
        image.onload = () => {
            ctx.drawImage(image, 0, (canvasSize.height - imageHeight) / 2, imageWidth, imageHeight);
        };
    }, [image, ctx, canvasSize, setDrawImageSize, isReset]);

    // draw
    useEffect(() => {
        if (!ctx) return;
        // clear canvas but maintain transform
        const storedTransform = ctx.getTransform();
        ctx.canvas.width = ctx.canvas.width!;
        ctx.canvas.style.background = "gray";
        ctx.setTransform(storedTransform);

        ctx.drawImage(image, 0, (canvasSize.height - drawImageSize.height) / 2, drawImageSize.width, drawImageSize.height);

        const resizePointRect = RESIZE_POINT + 3 / scale;
        elements.forEach(({ id, sX, sY, cX, cY, color }) => {
            const width = cX - sX;
            const height = cY - sY;
            ctx.setLineDash([0]);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2 / scale;
            ctx.strokeRect(sX, sY, width, height);

            if (mouseOverElement) {
                if (mouseOverElement.id === id) {
                    if (!selectedElement || selectedElement.id !== mouseOverElement.id) {
                        ctx.globalAlpha = 0.5;
                        ctx.fillStyle = color;
                        ctx.fillRect(sX, sY, width, height);
                        ctx.globalAlpha = 1;
                    }
                }
            }

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
                    cutLineStroke(sX, sY, cX, cY);
                }
            }
        });
    }, [ctx, scale, offset, RESIZE_POINT, canvasSize, cutLineStroke, elements, tool, selectedElement, mouseOverElement, image, isReset, drawImageSize]);

    //mouse cursor style
    useEffect(() => {
        if (tool === "move" || isImageMove === true) {
            mouseCursorStyle("grab");
            if (isGrabbing === true) {
                mouseCursorStyle("grabbing");
            }
        } else {
            mouseCursorStyle("default");
        }
    }, [tool, isImageMove, isGrabbing, mouseCursorStyle]);

    //image move
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                setIsImageMove(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                setIsImageMove(false);
                setIsGrabbing(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    return (
        <StyledWrap ref={wrapRef}>
            {tool === "bounding" && <CategoryDropDown category={category} setCategory={setCategory} categoryList={categoryList} isAbsolute={true} />}
            <StyledCanvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height}></StyledCanvas>
            <CanvasHandler
                tool={tool}
                canvasSize={canvasSize}
                handleZoomMouseDown={handleZoomMouseDown}
                handleZoomMouseMove={handleZoomMouseMove}
                handleZoomMouseUp={handleZoomMouseUp}
                handleWheel={handleWheel}
                elements={elements}
                setElements={setElements}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
                isImageMove={isImageMove}
                mouseCursorStyle={mouseCursorStyle}
                RESIZE_POINT={RESIZE_POINT}
                viewportTopLeft={viewportTopLeft}
                scale={scale}
                drawImageSize={drawImageSize}
                setMouseOverElement={setMouseOverElement}
                category={category}
            ></CanvasHandler>
        </StyledWrap>
    );
}

export default Canvas;

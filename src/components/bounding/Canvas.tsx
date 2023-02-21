import React from "react";
import { useRef, useState, useEffect, useLayoutEffect, useCallback, Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import { ICanvasSize, IElements, ISelectedElement } from "./index.type";
import test from "../../assets/images/test.jpg";

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

const image = new Image();
image.src = test;

function Canvas({ tool, elements, setElements, selectedElement, setSelectedElement }: Props) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState<ICanvasSize>({ width: 0, height: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [scale, setScale] = useState<number>(1);
    const [offset, setOffset] = useState<Point>(ORIGIN);
    const [viewportTopLeft, setViewportTopLeft] = useState<Point>(ORIGIN);

    const [isImageMove, setIsImageMove] = useState<boolean>(false);
    const [isGrabbing, setIsGrabbing] = useState<boolean>(false);
    // const isImageMoveRef = useRef<boolean>(false);
    // const isGrabbingRef = useRef<boolean>(false);

    const mousePosRef = useRef<Point>(ORIGIN);
    const isResetRef = useRef<boolean>(false);
    const lastMousePosRef = useRef<Point>(ORIGIN);
    const lastOffsetRef = useRef<Point>(ORIGIN);

    useEffect(() => {
        if (!wrapRef.current) return;
        setCanvasSize({ width: wrapRef.current.offsetWidth, height: wrapRef.current.offsetHeight });
    }, []);

    // update last offset
    useEffect(() => {
        lastOffsetRef.current = offset;
    }, [offset]);

    // reset
    const reset = useCallback(
        (ctx: CanvasRenderingContext2D) => {
            if (ctx && !isResetRef.current) {
                ctx.canvas.width = canvasSize.width;
                ctx.canvas.height = canvasSize.height;
                ctx.scale(1, 1);
                setScale(1);

                // reset state and refs
                setCtx(ctx);
                setOffset(ORIGIN);
                setViewportTopLeft(ORIGIN);
                mousePosRef.current = ORIGIN;
                lastOffsetRef.current = ORIGIN;
                lastMousePosRef.current = ORIGIN;

                // this thing is so multiple resets in a row don't clear canvas
                isResetRef.current = true;
            }
        },
        [canvasSize]
    );

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

    const handleMouseDown = useCallback(
        (event: React.MouseEvent) => {
            const { offsetX, offsetY } = event.nativeEvent;
            lastMousePosRef.current = { x: offsetX, y: offsetY };
            if (isImageMove === true || tool === "move") {
                setIsGrabbing(true);
            }
        },
        [isImageMove, tool]
    );

    const handleMouseMove = useCallback(
        (event: React.MouseEvent) => {
            const { offsetX, offsetY } = event.nativeEvent;
            calculateMouse(event);
            if (!ctx) return;

            if (isImageMove === true || tool === "move") {
                if (!isGrabbing) return;
                const lastMousePos = lastMousePosRef.current;
                const currentMousePos = { x: offsetX, y: offsetY }; // use document so can pan off element
                lastMousePosRef.current = currentMousePos;

                const mouseDiff = diffPoints(currentMousePos, lastMousePos);
                setOffset((prevOffset) => addPoints(prevOffset, mouseDiff));
            }
        },
        [ctx, calculateMouse, tool, isGrabbing, isImageMove]
    );

    const handleMouseUp = useCallback(() => {
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
            isResetRef.current = false;
        },
        [ctx, viewportTopLeft, scale, calculateMouse]
    );

    // setup canvas and set ctx
    useLayoutEffect(() => {
        if (canvasRef.current) {
            // get new drawing ctx
            const renderCtx = canvasRef.current.getContext("2d");

            if (renderCtx) {
                reset(renderCtx);
            }
        }
    }, [reset, canvasSize]);

    // pan when offset or scale changes
    useLayoutEffect(() => {
        if (ctx && lastOffsetRef.current) {
            const offsetDiff = scalePoint(diffPoints(offset, lastOffsetRef.current), scale);
            ctx.translate(offsetDiff.x, offsetDiff.y);
            setViewportTopLeft((prevVal) => diffPoints(prevVal, offsetDiff));
            isResetRef.current = false;
        }
    }, [ctx, offset, scale]);

    //mouse cursor style
    useEffect(() => {
        if (!wrapRef.current) return;
        if (tool === "move" || isImageMove === true) {
            wrapRef.current.style.cursor = "grab";
            if (isGrabbing === true) {
                wrapRef.current.style.cursor = "grabbing";
            }
        } else {
            wrapRef.current.style.cursor = "default";
        }
    }, [tool, isImageMove, isGrabbing]);

    // draw
    useLayoutEffect(() => {
        if (!ctx) return;
        // clear canvas but maintain transform
        const storedTransform = ctx.getTransform();
        ctx.canvas.width = ctx.canvas.width!;
        ctx.canvas.style.background = "gray";
        ctx.setTransform(storedTransform);

        const imageWidth = canvasSize.width;
        const imageHeight = (canvasSize.width * image.height) / image.width;

        ctx.drawImage(image, 0, (canvasSize.height - imageHeight) / 2, imageWidth, imageHeight);
    }, [ctx, scale, offset, canvasSize]);

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
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
            ></canvas>
        </StyledWrap>
    );
}

export default Canvas;

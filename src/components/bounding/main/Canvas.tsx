import { MutableRefObject, RefObject, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { INITIAL_POSITION } from "./defaults";

interface Props {
    canvasRef: RefObject<HTMLCanvasElement>;
    imageRef: MutableRefObject<HTMLImageElement>;
    reset: boolean;
    setIsReset: (isReset: boolean) => void;
    tool: Tool;
    ctx: CanvasRenderingContext2D | null;
    scaleRef: MutableRefObject<number>;
    setScaleRef: (type: Zoom) => void;
    viewPosRef: MutableRefObject<Position>;
    setViewPosRef: ({ x, y }: Position) => void;
    updateCanvasSize: ({ width, height }: Size) => void;
    draw: () => void;
}

function Canvas({ canvasRef, imageRef, ctx, reset, setIsReset, tool, scaleRef, setScaleRef, viewPosRef, setViewPosRef, updateCanvasSize, draw }: Props) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const isTouchRef = useRef(false);
    const startPosRef = useRef(INITIAL_POSITION);
    const [isImageMove, setIsImageMove] = useState(false);
    const [isGrabbing, setIsGrabbing] = useState(false);

    // setting canvasSize
    useEffect(() => {
        if (!wrapperRef.current) return;
        const width = wrapperRef.current.offsetWidth;
        const height = wrapperRef.current.offsetHeight;
        updateCanvasSize({ width, height });
    }, [updateCanvasSize]);

    const resetCanvas = useCallback(() => {
        setScaleRef("reset");
        isTouchRef.current = false;
        setViewPosRef(INITIAL_POSITION);
        startPosRef.current = INITIAL_POSITION;
        draw();
    }, [draw, setScaleRef, setViewPosRef]);

    // reset
    useEffect(() => {
        resetCanvas();
        setIsReset(false);
    }, [resetCanvas, reset, setIsReset, imageRef]);

    const setImagePositionOnMouseDown = (offsetX: number, offsetY: number) => {
        startPosRef.current = {
            x: offsetX - viewPosRef.current.x,
            y: offsetY - viewPosRef.current.y,
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;
        setImagePositionOnMouseDown(offsetX, offsetY);

        isTouchRef.current = true;
        if (isImageMove === true || tool === "move") {
            setIsGrabbing(true);
        }
    };

    const moveImageByMousePosition = (offsetX: number, offsetY: number) => {
        if (isTouchRef.current === false) return;
        const x = offsetX - startPosRef.current.x;
        const y = offsetY - startPosRef.current.y;
        setViewPosRef({ x, y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;
        if (isGrabbing === true || tool === "move") {
            moveImageByMousePosition(offsetX, offsetY);
        }

        requestAnimationFrame(draw);
    };

    const handleMouseUp = () => {
        isTouchRef.current = false;
        setIsGrabbing(false);
    };

    const zoomImageByWheel = (offsetX: number, offsetY: number, deltaY: number) => {
        const xs = (offsetX - viewPosRef.current.x) / scaleRef.current;
        const ys = (offsetY - viewPosRef.current.y) / scaleRef.current;

        if (deltaY > 0) {
            setScaleRef("zoomIn");
        } else if (deltaY < 0) {
            setScaleRef("zoomOut");
        }
        const x = offsetX - xs * scaleRef.current;
        const y = offsetY - ys * scaleRef.current;
        setViewPosRef({ x, y });
    };

    const moveImageByWheel = (deltaY: number, deltaX: number) => {
        const x = viewPosRef.current.x + deltaX;
        const y = viewPosRef.current.y + deltaY;
        setViewPosRef({ x, y });
    };

    const handleWheel = (e: React.WheelEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;

        const deltaY = -e.deltaY;
        const deltaX = -e.deltaX;

        if (e.ctrlKey === true || e.metaKey === true) {
            zoomImageByWheel(offsetX, offsetY, deltaY);
        } else {
            moveImageByWheel(deltaY, deltaX);
        }

        requestAnimationFrame(draw);
    };

    const mouseCursorStyle = useCallback((name: string) => {
        if (!wrapperRef.current) return;
        wrapperRef.current.style.cursor = name;
    }, []);

    // Setting mouse cursor style
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

    // Deciding whether to move an image.
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

    // Preventing the entire web page from zooming in when using a laptop touchpad to zoom in an image.
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const preventDefault = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
            }
        };
        canvas.addEventListener("wheel", preventDefault, { passive: false });
        return () => {
            canvas.removeEventListener("wheel", preventDefault);
        };
    }, [canvasRef]);

    return (
        <StyledWrapper ref={wrapperRef}>
            <StyledCanvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
            ></StyledCanvas>
        </StyledWrapper>
    );
}

export default Canvas;

const StyledWrapper = styled.div`
    flex: 1;
`;

const StyledCanvas = styled.canvas`
    background: gray;
`;

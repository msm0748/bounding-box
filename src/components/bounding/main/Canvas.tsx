import { Dispatch, MutableRefObject, RefObject, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { INITIAL_POSITION } from "./defaults";
import { zoomMouseDown, zoomMouseMove, zoomMouseUp, zoomWheel } from "./utils/imageZoomUtils";

interface Props {
    canvasRef: RefObject<HTMLCanvasElement>;
    imageRef: MutableRefObject<HTMLImageElement>;
    reset: boolean;
    setIsReset: (isReset: boolean) => void;
    tool: Tool;
    ctx: CanvasRenderingContext2D | null;
    scaleRef: MutableRefObject<number>;
    handleZoom: (type: Zoom) => void;
    viewPosRef: MutableRefObject<IPosition>;
    setViewPosRef: ({ x, y }: IPosition) => void;
    updateCanvasSize: ({ width, height }: ISize) => void;
    draw: () => void;
    newElementRef: MutableRefObject<IElement | null>;
    createElement: ({ id, sX, sY, cX, cY }: IElement) => void;
    imageInfo: IImageInfo | null;
    setElements: Dispatch<SetStateAction<IElement[]>>;
}

function Canvas({
    canvasRef,
    imageRef,
    ctx,
    reset,
    setIsReset,
    tool,
    scaleRef,
    handleZoom,
    viewPosRef,
    setViewPosRef,
    updateCanvasSize,
    draw,
    newElementRef,
    createElement,
    imageInfo,
    setElements,
}: Props) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const isTouchRef = useRef(false);
    const startPosRef = useRef(INITIAL_POSITION);
    const [isImageMove, setIsImageMove] = useState(false);
    const [isGrabbing, setIsGrabbing] = useState(false);
    const actionRef = useRef<Action>("none");

    // setting canvasSize
    useEffect(() => {
        if (!wrapperRef.current) return;
        const width = wrapperRef.current.offsetWidth;
        const height = wrapperRef.current.offsetHeight;
        updateCanvasSize({ width, height });
    }, [updateCanvasSize]);

    // reset
    useEffect(() => {
        handleZoom("reset");
        isTouchRef.current = false;
        setViewPosRef(INITIAL_POSITION);
        startPosRef.current = INITIAL_POSITION;
        setIsReset(false);
    }, [reset, setIsReset, handleZoom, setViewPosRef]);

    // reset draw
    useEffect(() => {
        draw();
    }, [draw, reset]);

    const handleMouseDown = (e: React.MouseEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;
        zoomMouseDown({ offsetX, offsetY, startPosRef, viewPosRef, isTouchRef });
        if (isImageMove === true || tool === "move") {
            setIsGrabbing(true);
        }
        if (isImageMove === true) return;

        if (tool === "bounding") {
            if (actionRef.current !== "none") return;
            actionRef.current = "drawing";
            const id = +new Date();
            createElement({ id, sX: offsetX, sY: offsetY, cX: offsetX, cY: offsetY });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;
        if (isGrabbing === true || tool === "move") {
            zoomMouseMove({ offsetX, offsetY, isTouchRef, startPosRef })(setViewPosRef);
        }

        if (tool === "bounding") {
            if (actionRef.current === "drawing") {
                if (!newElementRef.current) return;
                const { id, sX, sY } = newElementRef.current;
                newElementRef.current = { id, sX, sY, cX: offsetX, cY: offsetY };
            }
        }

        requestAnimationFrame(draw);
    };

    const handleMouseUp = () => {
        zoomMouseUp(isTouchRef);
        setIsGrabbing(false);

        if (isImageMove === true) return;

        if (tool === "bounding") {
            if (!newElementRef.current) return;
            const element = newElementRef.current;
            setElements((prev) => [...prev, element]);
            actionRef.current = "none";
            newElementRef.current = null;
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        zoomWheel(handleZoom)({ e, viewPosRef, scaleRef })(setViewPosRef);
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

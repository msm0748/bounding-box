import { Dispatch, MutableRefObject, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { INITIAL_POSITION } from "./defaults";
import { zoomMouseDown, zoomMouseMove, zoomMouseUp, zoomWheel } from "./utils/imageZoomUtils";

interface Props {
    imageRef: MutableRefObject<HTMLImageElement>;
    reset: boolean;
    tool: Tool;
    scaleRef: MutableRefObject<number>;
    handleZoom: (type: Zoom) => void;
    viewPosRef: MutableRefObject<IPosition>;
    setViewPosRef: ({ x, y }: IPosition) => void;
    canvasSize: ISize;
    updateCanvasSize: ({ width, height }: ISize) => void;
    imageInfo: IImageInfo | null;
    elements: IElement[];
    setElements: Dispatch<SetStateAction<IElement[]>>;
    getDrawFn: (fn: () => void) => void;
}

function Canvas({
    imageRef,
    reset,
    tool,
    scaleRef,
    handleZoom,
    viewPosRef,
    setViewPosRef,
    canvasSize,
    updateCanvasSize,
    imageInfo,
    elements,
    setElements,
    getDrawFn,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const newElementRef = useRef<IElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const isTouchRef = useRef(false);
    const startPosRef = useRef(INITIAL_POSITION);
    const [isImageMove, setIsImageMove] = useState(false);
    const [isGrabbing, setIsGrabbing] = useState(false);
    const actionRef = useRef<Action>("none");

    // init
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
    }, [canvasSize]);

    const drawElements = useCallback(
        (ctx: CanvasRenderingContext2D) => {
            ctx.lineWidth = 2;

            elements.forEach(({ id, sX, sY, cX, cY }) => {
                const width = cX - sX;
                const height = cY - sY;
                ctx.strokeRect(sX, sY, width, height);
            });

            if (!newElementRef.current) return;
            const { sX, sY, cX, cY } = newElementRef.current;

            const width = cX - sX;
            const height = cY - sY;

            ctx.strokeRect(sX, sY, width, height);
        },
        [elements]
    );

    const draw = useCallback(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        ctx.setTransform(scaleRef.current, 0, 0, scaleRef.current, viewPosRef.current.x, viewPosRef.current.y);
        if (!imageInfo) return;
        ctx.drawImage(imageRef.current, imageInfo.x, imageInfo.y, imageInfo.width, imageInfo.height);
        drawElements(ctx);
    }, [canvasSize, imageInfo, imageRef, scaleRef, viewPosRef, drawElements]);

    useEffect(() => {
        getDrawFn(draw);
    }, [draw, getDrawFn]);

    const createElement = ({ id, sX, sY, cX, cY }: IElement) => {
        newElementRef.current = { id, sX, sY, cX, cY };
    };

    // setting canvasSize
    useEffect(() => {
        if (!wrapperRef.current) return;
        const width = wrapperRef.current.offsetWidth;
        const height = wrapperRef.current.offsetHeight;
        updateCanvasSize({ width, height });
    }, [updateCanvasSize]);

    const getZoomMousePosition = ({ offsetX, offsetY }: IOffset) => {
        const viewPos = viewPosRef.current;
        const scale = scaleRef.current;
        let zoomPosX = (offsetX - viewPos.x) / scale;
        let zoomPosY = (offsetY - viewPos.y) / scale;

        //If the mouse goes out of the image area, replace the mouse position with the image position value.
        if (imageInfo) {
            zoomPosX = Math.max(0, Math.min(zoomPosX, imageInfo.width));
            zoomPosY = Math.max(imageInfo.y, Math.min(zoomPosY, imageInfo.height + imageInfo.y));
        }

        return { zoomPosX, zoomPosY };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;
        zoomMouseDown({ offsetX, offsetY, startPosRef, viewPosRef, isTouchRef });
        if (isImageMove === true || tool === "move") {
            setIsGrabbing(true);
        }
        if (isImageMove === true) return;

        const { zoomPosX, zoomPosY } = getZoomMousePosition({ offsetX, offsetY });

        if (tool === "bounding") {
            if (actionRef.current !== "none") return;
            actionRef.current = "drawing";
            const id = +new Date();
            createElement({ id, sX: zoomPosX, sY: zoomPosY, cX: zoomPosX, cY: zoomPosY });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;
        if (isGrabbing === true || tool === "move") {
            zoomMouseMove({ offsetX, offsetY, isTouchRef, startPosRef })(setViewPosRef);
        }

        const { zoomPosX, zoomPosY } = getZoomMousePosition({ offsetX, offsetY });

        if (tool === "bounding") {
            if (actionRef.current === "drawing") {
                if (!newElementRef.current) return;
                const { id, sX, sY } = newElementRef.current;
                newElementRef.current = { id, sX, sY, cX: zoomPosX, cY: zoomPosY };
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

    // reset
    useEffect(() => {
        handleZoom("reset");
        isTouchRef.current = false;
        setViewPosRef(INITIAL_POSITION);
        startPosRef.current = INITIAL_POSITION;
    }, [reset, handleZoom, setViewPosRef]);

    // reset draw
    useEffect(() => {
        draw();
    }, [draw, reset]);

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

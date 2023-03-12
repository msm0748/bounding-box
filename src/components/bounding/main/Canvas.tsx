import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const StyledWrapper = styled.div`
    flex: 1;
`;

const img = new Image();
const MIN_SCALE = 0.1;
const MAX_SCALE = 10;

function Canvas() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const isTouchRef = useRef(false);
    const viewPosRef = useRef({ x: 0, y: 0 });
    const startPosRef = useRef({ x: 0, y: 0 });
    const scaleRef = useRef(1);

    // init
    useEffect(() => {
        if (!wrapperRef.current || !canvasRef.current) return;
        const width = wrapperRef.current.offsetWidth;
        const height = wrapperRef.current.offsetHeight;
        setCanvasSize({ width, height });
        const canvas = canvasRef.current;
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        setCtx(context);
    }, []);

    // setting image
    useEffect(() => {
        if (!ctx) return;
        img.onload = function () {
            ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height);
        };
        img.src = "https://s3.marpple.co/files/u_218933/2020/1/original/14474423ccd1acb63fab43dc936ab01302c64b547577e2e.png";
    }, [canvasSize, ctx]);

    const draw = () => {
        if (!ctx) return;
        const scale = scaleRef.current;
        const { x: viewPosX, y: viewPosY } = viewPosRef.current;
        ctx.canvas.width = canvasSize.width;
        ctx.setTransform(scale, 0, 0, scale, viewPosX, viewPosY);
        ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;

        startPosRef.current = {
            x: offsetX - viewPosRef.current.x,
            y: offsetY - viewPosRef.current.y,
        };

        isTouchRef.current = true;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;

        if (isTouchRef.current) {
            viewPosRef.current = {
                x: offsetX - startPosRef.current.x,
                y: offsetY - startPosRef.current.y,
            };
        }

        draw();
    };

    const handleMouseUp = () => {
        isTouchRef.current = false;
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const { offsetX, offsetY } = e.nativeEvent;

        const xs = (offsetX - viewPosRef.current.x) / scaleRef.current;
        const ys = (offsetY - viewPosRef.current.y) / scaleRef.current;

        const delta = -e.deltaY;
        const ZOOM_SENSITIVITY = 1.025;

        if (delta > 0 && scaleRef.current < MAX_SCALE) {
            scaleRef.current *= ZOOM_SENSITIVITY;
        } else if (delta < 0 && scaleRef.current > MIN_SCALE) {
            scaleRef.current /= ZOOM_SENSITIVITY;
        }

        viewPosRef.current = {
            x: offsetX - xs * scaleRef.current,
            y: offsetY - ys * scaleRef.current,
        };

        draw();
    };

    return (
        <StyledWrapper ref={wrapperRef}>
            <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onWheel={handleWheel}></canvas>
        </StyledWrapper>
    );
}

export default Canvas;

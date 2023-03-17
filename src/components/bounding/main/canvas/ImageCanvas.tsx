import { useRef, forwardRef, useEffect, useImperativeHandle, MutableRefObject } from "react";
import styled from "styled-components";

interface Props {
    canvasSize: ISize;
    imageRef: MutableRefObject<HTMLImageElement>;
    startPosRef: MutableRefObject<IPosition>;
    viewPosRef: MutableRefObject<IPosition>;
    isTouchRef: MutableRefObject<boolean>;
    scaleRef: MutableRefObject<number>;
    setViewPosRef: ({ x, y }: IPosition) => void;
    handleZoom: (type: Zoom) => void;
    imageInfo: IImageInfo | null;
}

function ImageCanvas(
    { canvasSize, imageRef, startPosRef, viewPosRef, isTouchRef, scaleRef, setViewPosRef, handleZoom, imageInfo }: Props,
    ref: React.Ref<ImageCanvasdRef>
) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // init
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
    }, [canvasSize]);

    const draw = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        ctx.setTransform(scaleRef.current, 0, 0, scaleRef.current, viewPosRef.current.x, viewPosRef.current.y);
        if (!imageInfo) return;
        ctx.drawImage(imageRef.current, imageInfo.x, imageInfo.y, imageInfo.width, imageInfo.height);
    };

    const zoomMouseDown = (offsetX: number, offsetY: number) => {
        startPosRef.current = {
            x: offsetX - viewPosRef.current.x,
            y: offsetY - viewPosRef.current.y,
        };

        isTouchRef.current = true;
    };

    const zoomMouseMove = (offsetX: number, offsetY: number) => {
        if (isTouchRef.current === false) return;
        const x = offsetX - startPosRef.current.x;
        const y = offsetY - startPosRef.current.y;

        setViewPosRef({ x, y });
        requestAnimationFrame(draw);
    };

    const zoomMouseUp = () => {
        isTouchRef.current = false;
    };

    const zoomImageByWheel = (offsetX: number, offsetY: number, deltaY: number) => {
        const xs = (offsetX - viewPosRef.current.x) / scaleRef.current;
        const ys = (offsetY - viewPosRef.current.y) / scaleRef.current;

        deltaY > 0 ? handleZoom("zoomIn") : handleZoom("zoomOut");

        const x = offsetX - xs * scaleRef.current;
        const y = offsetY - ys * scaleRef.current;
        setViewPosRef({ x, y });
        requestAnimationFrame(draw);
    };

    const moveImageByWheel = (deltaX: number, deltaY: number) => {
        const x = viewPosRef.current.x + deltaX;
        const y = viewPosRef.current.y + deltaY;
        setViewPosRef({ x, y });
    };

    const zoomWheel = (e: React.WheelEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;

        const deltaY = -e.deltaY;
        const deltaX = -e.deltaX;

        if (e.ctrlKey === true || e.metaKey === true) {
            zoomImageByWheel(offsetX, offsetY, deltaY);
        } else {
            moveImageByWheel(deltaX, deltaY);
        }
        requestAnimationFrame(draw);
    };

    useImperativeHandle(ref, () => ({
        zoomMouseDown,
        zoomMouseMove,
        zoomMouseUp,
        zoomWheel,
        draw,
    }));

    return <StyledCanvas ref={canvasRef}></StyledCanvas>;
}
export default forwardRef(ImageCanvas);

const StyledCanvas = styled.canvas`
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    background: gray;
`;

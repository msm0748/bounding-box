import { useCallback, useEffect, useState, useRef } from "react";
import styled from "styled-components";
import Canvas from "./Canvas";
import LeftBar from "./LeftBar";
import { INITIAL_POSITION, INITIAL_SIZE, MIN_SCALE, MAX_SCALE, ZOOM_SENSITIVITY, INITIAL_SCALE } from "./defaults";

function Main() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(new Image());
    const [canvasSize, setCanvasSize] = useState(INITIAL_SIZE);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [tool, setTool] = useState<Tool>("select");
    const [reset, setReset] = useState(false);
    const scaleRef = useRef(INITIAL_SCALE);
    const viewPosRef = useRef(INITIAL_POSITION);
    const newElementRef = useRef<IElement | null>(null);
    const [elements, setElements] = useState<IElement[]>([]);
    const [imageInfo, setImageInfo] = useState<IImageInfo | null>(null);

    // init
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
        const context = canvas.getContext("2d");
        setCtx(context);
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
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        ctx.setTransform(scaleRef.current, 0, 0, scaleRef.current, viewPosRef.current.x, viewPosRef.current.y);

        if (!imageInfo) return;
        ctx.drawImage(imageRef.current, imageInfo.x, imageInfo.y, imageInfo.width, imageInfo.height);
        drawElements(ctx);
    }, [ctx, canvasSize, imageInfo, drawElements]);

    const createElement = ({ id, sX, sY, cX, cY }: IElement) => {
        newElementRef.current = { id, sX, sY, cX, cY };
    };

    // setting image
    useEffect(() => {
        const img = imageRef.current;
        img.src = "https://s3.marpple.co/files/u_218933/2020/1/original/14474423ccd1acb63fab43dc936ab01302c64b547577e2e.png";
        img.onload = () => {
            const imageWidth = canvasSize.width;
            const imageHeight = (canvasSize.width * img.height) / img.width;
            const imagePosX = 0;
            const imagePosY = (canvasSize.height - imageHeight) / 2;
            setImageInfo({ src: img.src, x: imagePosX, y: imagePosY, width: imageWidth, height: imageHeight });
        };
    }, [canvasSize]);

    const updateCanvasSize = useCallback(({ width, height }: ISize) => {
        setCanvasSize({ width, height });
    }, []);

    const handleZoom = useCallback((type: Zoom) => {
        switch (type) {
            case "zoomIn":
                if (scaleRef.current < MAX_SCALE) {
                    scaleRef.current = scaleRef.current * ZOOM_SENSITIVITY;
                }
                break;
            case "zoomOut":
                if (scaleRef.current > MIN_SCALE) {
                    scaleRef.current = scaleRef.current / ZOOM_SENSITIVITY;
                }
                break;
            case "reset":
                scaleRef.current = INITIAL_SCALE;
                break;
            default:
                break;
        }
    }, []);

    const setViewPosRef = useCallback(({ x, y }: IPosition) => {
        viewPosRef.current = {
            x,
            y,
        };
    }, []);

    const handleToolChange = useCallback((newTool: Tool) => {
        setTool(newTool);
    }, []);
    const setIsReset = useCallback((isReset: boolean) => {
        setReset(isReset);
    }, []);

    return (
        <StyledMain>
            <LeftBar
                tool={tool}
                onToolChange={handleToolChange}
                setIsReset={setIsReset}
                viewPosRef={viewPosRef}
                canvasSize={canvasSize}
                scaleRef={scaleRef}
                handleZoom={handleZoom}
                draw={draw}
                setViewPosRef={setViewPosRef}
            />
            <Canvas
                canvasRef={canvasRef}
                imageRef={imageRef}
                ctx={ctx}
                tool={tool}
                reset={reset}
                setIsReset={setIsReset}
                scaleRef={scaleRef}
                handleZoom={handleZoom}
                viewPosRef={viewPosRef}
                setViewPosRef={setViewPosRef}
                updateCanvasSize={updateCanvasSize}
                draw={draw}
                newElementRef={newElementRef}
                createElement={createElement}
                imageInfo={imageInfo}
                setElements={setElements}
            />
        </StyledMain>
    );
}
export default Main;

const StyledMain = styled.main`
    display: flex;
    height: calc(100% - 48px);
`;

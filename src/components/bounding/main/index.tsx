import { useCallback, useEffect, useState, useRef } from "react";
import styled from "styled-components";
import Canvas from "./canvas";
import LeftBar from "./LeftBar";
import RightBar from "./RightBar";
import { INITIAL_POSITION, INITIAL_SIZE, MIN_SCALE, MAX_SCALE, ZOOM_SENSITIVITY, INITIAL_SCALE } from "./defaults";
import test from "../../../assets/images/test1.jpg";

const categoryList = [
    {
        title: "강아지",
        color: "rgb(0, 192, 108)",
    },
    {
        title: "고양이",
        color: "rgb(255, 91, 208)",
    },
];

function Main() {
    const drawFnRef = useRef<() => void>();
    const imageRef = useRef<HTMLImageElement>(new Image());
    const [canvasSize, setCanvasSize] = useState(INITIAL_SIZE);
    const [tool, setTool] = useState<Tool>("select");
    const [reset, setReset] = useState(false);
    const scaleRef = useRef(INITIAL_SCALE);
    const viewPosRef = useRef(INITIAL_POSITION);
    const [elements, setElements] = useState<IElement[]>([]);
    const [selectedElement, setSelectedElement] = useState<ISelectedElement | null>(null);
    const [imageInfo, setImageInfo] = useState<IImageInfo | null>(null);
    const [hoveredBoxId, setHoverBoxId] = useState<number | undefined>();

    // setting image
    useEffect(() => {
        const img = imageRef.current;
        img.src = test;
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

    const setViewPosRef = useCallback(
        ({ x, y }: IPosition) => {
            const maxViewPosX = Math.min(Math.max(x, -(canvasSize.width * scaleRef.current)), canvasSize.width);
            const maxViewPosY = Math.min(Math.max(y, -(canvasSize.height * scaleRef.current)), canvasSize.height);

            viewPosRef.current = {
                x: maxViewPosX,
                y: maxViewPosY,
            };
        },
        [canvasSize]
    );

    const getDrawFn = useCallback((fn: () => void) => {
        drawFnRef.current = fn;
    }, []);

    const handleToolChange = useCallback((newTool: Tool) => {
        setTool(newTool);
    }, []);

    const setIsReset = useCallback(() => {
        setReset((prev) => !prev);
    }, []);

    const getElements = useCallback((newElements: IElement[]) => {
        setElements(newElements);
    }, []);

    const getSelectedElement = useCallback((element: ISelectedElement | null) => {
        setSelectedElement(element);
    }, []);

    const highlightBox = useCallback((element: ISelectedElement | undefined) => {
        if (element) {
            setHoverBoxId(element.id);
        } else {
            setHoverBoxId(undefined);
        }
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
                setViewPosRef={setViewPosRef}
                drawFnRef={drawFnRef}
            />
            <Canvas
                imageRef={imageRef}
                tool={tool}
                reset={reset}
                scaleRef={scaleRef}
                handleZoom={handleZoom}
                viewPosRef={viewPosRef}
                setViewPosRef={setViewPosRef}
                canvasSize={canvasSize}
                updateCanvasSize={updateCanvasSize}
                imageInfo={imageInfo}
                elements={elements}
                getDrawFn={getDrawFn}
                getElements={getElements}
                selectedElement={selectedElement}
                getSelectedElement={getSelectedElement}
                categoryList={categoryList}
                hoveredBoxId={hoveredBoxId}
                highlightBox={highlightBox}
            />
            <RightBar elements={elements}></RightBar>
        </StyledMain>
    );
}
export default Main;

const StyledMain = styled.main`
    display: flex;
    height: calc(100% - 48px);
`;

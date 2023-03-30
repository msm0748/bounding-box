import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { INITIAL_POSITION } from "../defaults";
import ImageCanvas from "./ImageCanvas";
import LabelingCanvas from "./LabelingCanvas";
import CategoryDropDown from "../../../common/category";
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
    setElements: (action: IElement[] | ((prevState: IElement[]) => IElement[]), overwrite?: boolean | undefined) => void;
    getDrawFn: (fn: () => void) => void;
    selectedElement: ISelectedElement | null;
    setElementHandler: (element: ISelectedElement | null) => void;
    categoryList: ICategory[];
    hoveredBoxId: number | undefined;
    highlightBox: (element: ISelectedElement | undefined) => void;
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
    getDrawFn,
    setElements,
    selectedElement,
    setElementHandler,
    categoryList,
    hoveredBoxId,
    highlightBox,
}: Props) {
    const handleImageCanvasRef = useRef<ImageCanvasdRef>(null);
    const handleLabelingCanvasRef = useRef<LabelingCanvasdRef>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const isTouchRef = useRef(false);
    const startPosRef = useRef(INITIAL_POSITION);
    const [isImageMove, setIsImageMove] = useState(false);
    const [isGrabbing, setIsGrabbing] = useState(false);
    const [category, setCategory] = useState<ICategory>(categoryList[0]);

    const onChangeCategory = (selectedCategory: ICategory) => {
        setCategory(selectedCategory);
    };

    const draw = useCallback(() => {
        if (handleImageCanvasRef.current) {
            handleImageCanvasRef.current.draw();
        }
        if (handleLabelingCanvasRef.current) {
            handleLabelingCanvasRef.current.draw();
        }
    }, []);

    useEffect(() => {
        getDrawFn(draw);
    }, [getDrawFn, draw]);

    // setting canvasSize
    useEffect(() => {
        if (!wrapperRef.current) return;
        const width = wrapperRef.current.offsetWidth;
        const height = wrapperRef.current.offsetHeight;
        updateCanvasSize({ width, height });
    }, [updateCanvasSize]);

    const getZoomMousePosition = (offsetX: number, offsetY: number) => {
        const viewPos = viewPosRef.current;
        const scale = scaleRef.current;
        const zoomPosX = (offsetX - viewPos.x) / scale;
        const zoomPosY = (offsetY - viewPos.y) / scale;

        return { zoomPosX, zoomPosY };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;
        if (handleImageCanvasRef.current) {
            handleImageCanvasRef.current.zoomMouseDown(offsetX, offsetY);
        }
        if (isImageMove === true || tool === "move") {
            setIsGrabbing(true);
        }

        const { zoomPosX, zoomPosY } = getZoomMousePosition(offsetX, offsetY);

        if (handleLabelingCanvasRef.current) {
            handleLabelingCanvasRef.current.labelingMouseDown(zoomPosX, zoomPosY);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;
        if (isGrabbing === true || tool === "move") {
            if (handleImageCanvasRef.current) {
                handleImageCanvasRef.current.zoomMouseMove(offsetX, offsetY);
            }
        }
        const { zoomPosX, zoomPosY } = getZoomMousePosition(offsetX, offsetY);

        if (handleLabelingCanvasRef.current) {
            handleLabelingCanvasRef.current.labelingMouseMove(zoomPosX, zoomPosY);
        }
    };

    const handleMouseUp = () => {
        if (handleImageCanvasRef.current) {
            handleImageCanvasRef.current.zoomMouseUp();
        }
        setIsGrabbing(false);

        if (isImageMove === true) return;

        if (handleLabelingCanvasRef.current) {
            handleLabelingCanvasRef.current.labelingMouseUp();
        }
    };

    const handleMouseLeave = () => {
        setIsGrabbing(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (handleImageCanvasRef.current) {
            handleImageCanvasRef.current.zoomWheel(e);
        }
        if (handleLabelingCanvasRef.current) {
            handleLabelingCanvasRef.current.labelingWheel();
        }
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
    }, [draw, reset, imageInfo]);

    // Setting mouse cursor style
    useEffect(() => {
        if (tool === "move" || isImageMove === true) {
            isGrabbing === true ? mouseCursorStyle("grabbing") : mouseCursorStyle("grab");
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
        if (!wrapperRef.current) return;
        const wrapper = wrapperRef.current;
        const preventDefault = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
            }
        };
        wrapper.addEventListener("wheel", preventDefault, { passive: false });
        return () => {
            wrapper.removeEventListener("wheel", preventDefault);
        };
    }, []);

    return (
        <>
            <StyledWrapper ref={wrapperRef}>
                {tool === "bounding" && (
                    <CategoryDropDown category={category} onChangeCategory={onChangeCategory} categoryList={categoryList} isAbsolute={true} />
                )}
                <div
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onWheel={handleWheel}
                    onMouseLeave={handleMouseLeave}
                >
                    <ImageCanvas
                        ref={handleImageCanvasRef}
                        imageRef={imageRef}
                        canvasSize={canvasSize}
                        startPosRef={startPosRef}
                        viewPosRef={viewPosRef}
                        isTouchRef={isTouchRef}
                        scaleRef={scaleRef}
                        setViewPosRef={setViewPosRef}
                        handleZoom={handleZoom}
                        imageInfo={imageInfo}
                    ></ImageCanvas>
                    <LabelingCanvas
                        ref={handleLabelingCanvasRef}
                        canvasSize={canvasSize}
                        elements={elements}
                        viewPosRef={viewPosRef}
                        scaleRef={scaleRef}
                        tool={tool}
                        setElements={setElements}
                        selectedElement={selectedElement}
                        setElementHandler={setElementHandler}
                        imageInfo={imageInfo}
                        mouseCursorStyle={mouseCursorStyle}
                        isImageMove={isImageMove}
                        category={category}
                        hoveredBoxId={hoveredBoxId}
                        highlightBox={highlightBox}
                    ></LabelingCanvas>
                </div>
            </StyledWrapper>
        </>
    );
}

export default Canvas;

const StyledWrapper = styled.div`
    position: relative;
    flex: 1;
`;

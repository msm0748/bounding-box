import { useRef, forwardRef, useImperativeHandle, MutableRefObject, useEffect } from "react";
import styled from "styled-components";

interface Props {
    elements: IElement[];
    canvasSize: ISize;
    viewPosRef: MutableRefObject<IPosition>;
    scaleRef: MutableRefObject<number>;
    tool: Tool;
    updateElements: (newElements: IElement[]) => void;
    selectedElement: ISelectedElement | null;
    getSelectedElement: (element: ISelectedElement) => void;
    imageInfo: IImageInfo | null;
    mouseCursorStyle: (name: string) => void;
    isImageMove: boolean;
}

function LabelingCanvas(
    { elements, canvasSize, updateElements, viewPosRef, scaleRef, tool, selectedElement, getSelectedElement, imageInfo, mouseCursorStyle, isImageMove }: Props,
    ref: React.Ref<LabelingCanvasdRef>
) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const actionRef = useRef<Action>("none");
    const drawingElements = useRef<IElement[]>([]);

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
        canvas.width = canvasSize.width;
        ctx.setTransform(scaleRef.current, 0, 0, scaleRef.current, viewPosRef.current.x, viewPosRef.current.y);

        ctx.lineWidth = 2;

        drawingElements.current.forEach(({ id, sX, sY, cX, cY }) => {
            const width = cX - sX;
            const height = cY - sY;
            ctx.strokeRect(sX, sY, width, height);
        });
    };

    const createElement = ({ id, sX, sY, cX, cY }: IElement) => {
        return { id, sX, sY, cX, cY };
    };

    const isWithinElement = (x: number, y: number, element: IElement) => {
        const { sX, sY, cX, cY } = element;
        const minX = Math.min(sX, cX);
        const maxX = Math.max(sX, cX);
        const minY = Math.min(sY, cY);
        const maxY = Math.max(sY, cY);
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
    };

    const getElementAtPosition = (x: number, y: number, elements: IElement[]) => {
        return elements.find((element) => isWithinElement(x, y, element));
    };

    const updateElement = ({ id, sX, sY, cX, cY }: IElement) => {
        const updateElement = createElement({ id, sX, sY, cX, cY });

        const elementsCopy = [...drawingElements.current].map((element) => (element.id === id ? updateElement : element));
        drawingElements.current = elementsCopy;
    };

    const labelingMouseDown = (zoomPosX: number, zoomPosY: number) => {
        if (isImageMove === true) return;
        if (tool === "bounding") {
            if (actionRef.current !== "none") return;
            actionRef.current = "drawing";
            const id = +new Date();
            const element = createElement({ id, sX: zoomPosX, sY: zoomPosY, cX: zoomPosX, cY: zoomPosY });
            drawingElements.current = [...drawingElements.current, element];
        } else if (tool === "select") {
            const element = getElementAtPosition(zoomPosX, zoomPosY, elements);

            if (element) {
                const offsetX = zoomPosX - element.sX;
                const offsetY = zoomPosY - element.sY;
                getSelectedElement({ ...element, offsetX, offsetY });
                actionRef.current = "moving";
            }
        }
    };
    const labelingMouseMove = (zoomPosX: number, zoomPosY: number) => {
        if (tool === "bounding") {
            if (actionRef.current === "drawing") {
                if (!drawingElements.current) return;
                const index = drawingElements.current.length - 1;
                const { id, sX, sY } = drawingElements.current[index];
                updateElement({ id, sX, sY, cX: zoomPosX, cY: zoomPosY });
            }
        } else if (tool === "select") {
            if (isImageMove === false) {
                mouseCursorStyle(getElementAtPosition(zoomPosX, zoomPosY, drawingElements.current) ? "move" : "default");
            }
            if (actionRef.current === "moving") {
                if (!selectedElement) return;
                const { id, sX, sY, cX, cY, offsetX, offsetY } = selectedElement;

                if (!(offsetX && offsetY)) return;

                const width = cX - sX;
                const height = cY - sY;

                let newX = zoomPosX - offsetX;
                let newY = zoomPosY - offsetY;

                if (imageInfo) {
                    if (newX < 0) newX = 0;
                    if (newY < imageInfo.y) newY = imageInfo.y;
                    if (newX + width > imageInfo.width) newX = imageInfo.width - width;
                    if (newY + height > imageInfo.height + imageInfo.y) newY = imageInfo.height + imageInfo.y - height;
                }

                updateElement({ id, sX: newX, sY: newY, cX: newX + width, cY: newY + height });
            }
        }
        requestAnimationFrame(draw);
    };

    const labelingMouseUp = () => {
        updateElements(drawingElements.current);
        actionRef.current = "none";
    };

    const labelingWheel = () => {
        requestAnimationFrame(draw);
    };

    useImperativeHandle(ref, () => ({
        labelingMouseDown,
        labelingMouseMove,
        labelingMouseUp,
        labelingWheel,
        draw,
    }));

    return <StyledCanvas ref={canvasRef}></StyledCanvas>;
}

export default forwardRef(LabelingCanvas);

const StyledCanvas = styled.canvas`
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
`;

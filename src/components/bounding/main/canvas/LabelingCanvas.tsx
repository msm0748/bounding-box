import { useRef, useCallback, forwardRef, useImperativeHandle, MutableRefObject, useEffect } from "react";
import styled from "styled-components";

interface Props {
    elements: IElement[];
    canvasSize: ISize;
    viewPosRef: MutableRefObject<IPosition>;
    scaleRef: MutableRefObject<number>;
    tool: Tool;
    updateElements: UpdateElementsFn;
}

function LabelingCanvas({ elements, canvasSize, updateElements, viewPosRef, scaleRef, tool }: Props, ref: React.Ref<LabelingCanvasdRef>) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const newElementRef = useRef<IElement | null>(null);
    const actionRef = useRef<Action>("none");

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
        drawElements(ctx);
    };

    const createElement = ({ id, sX, sY, cX, cY }: IElement) => {
        newElementRef.current = { id, sX, sY, cX, cY };
    };

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

    const labelingMouseDown = (zoomPosX: number, zoomPosY: number) => {
        if (tool === "bounding") {
            if (actionRef.current !== "none") return;
            actionRef.current = "drawing";
            const id = +new Date();
            createElement({ id, sX: zoomPosX, sY: zoomPosY, cX: zoomPosX, cY: zoomPosY });
        }
    };
    const labelingMouseMove = (zoomPosX: number, zoomPosY: number) => {
        if (tool === "bounding") {
            if (actionRef.current === "drawing") {
                if (!newElementRef.current) return;
                const { id, sX, sY } = newElementRef.current;
                newElementRef.current = { id, sX, sY, cX: zoomPosX, cY: zoomPosY };
            }
        }
        requestAnimationFrame(draw);
    };
    const labelingMouseUp = () => {
        if (tool === "bounding") {
            if (!newElementRef.current) return;
            const element = newElementRef.current;
            updateElements((prev) => [...prev, element]);
            actionRef.current = "none";
            newElementRef.current = null;
        }
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

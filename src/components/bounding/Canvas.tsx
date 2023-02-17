import { useRef, useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import { ICanvasSize, IElements } from "./index.type";

interface Props {
    tool: "select" | "move" | "bounding";
    elements: IElements[];
    setElements: Dispatch<SetStateAction<IElements[]>>;
}

type Point = {
    x: number;
    y: number;
};

const ORIGIN = { x: 0, y: 0 };

const createElement = (id: number, sX: number, sY: number, cX: number, cY: number) => {
    return { id, sX, sY, cX, cY };
};

const StyledWrap = styled.div`
    position: relative;
    width: 100%;
`;

function Canvas({ tool, elements, setElements }: Props) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState<ICanvasSize>({ width: 0, height: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [action, setAction] = useState<"none" | "moving" | "drawing" | "resizing">("none");
    const mousePosRef = useRef<Point>(ORIGIN);

    useEffect(() => {
        if (!wrapRef.current) return;
        setCanvasSize({ width: wrapRef.current.offsetWidth, height: wrapRef.current.offsetHeight });
    }, []);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;

        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;

        const context = canvas.getContext("2d");
        setCtx(context);
    }, [canvasSize]);

    const draw = useCallback(() => {
        if (!ctx) return;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        elements.forEach(({ id, sX, sY, cX, cY }) => {
            const width = cX - sX;
            const height = cY - sY;
            ctx.strokeRect(sX, sY, width, height);
        });
    }, [ctx, elements]);

    //draw
    useEffect(() => {
        draw();
    }, [draw]);

    const updateElement = useCallback(
        (id: number, sX: number, sY: number, cX: number, cY: number) => {
            const updateElement = createElement(id, sX, sY, cX, cY);

            const elementsCopy = [...elements].map((element) => (element.id === id ? updateElement : element));
            setElements(elementsCopy);
        },
        [elements, setElements]
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            const { offsetX, offsetY } = e.nativeEvent;
            if (tool === "bounding") {
                setAction("drawing");
                if (action !== "none") return;
                const id = +new Date();
                const element = createElement(id, offsetX, offsetY, offsetX, offsetY);
                setElements((prev) => [...prev, element]);
            }
        },
        [tool, action, setElements]
    );
    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            const { offsetX, offsetY } = e.nativeEvent;
            mousePosRef.current.x = offsetX;
            mousePosRef.current.y = offsetY;
            if (tool === "bounding") {
                if (action === "drawing") {
                    const index = elements.length - 1;
                    const { id, sX, sY } = elements[index];
                    updateElement(id, sX, sY, offsetX, offsetY);
                }
            }
        },
        [tool, action, elements, updateElement]
    );
    const handleMouseUp = useCallback(
        (e: React.MouseEvent) => {
            const { offsetX, offsetY } = e.nativeEvent;
            if (tool === "bounding") {
                const index = elements.length - 1;
                const { sX, sY } = elements[index];
                if (Math.abs(sX - offsetX) < 5 && Math.abs(sY - offsetY) < 5) return; // 마우스 클릭으로도 그릴 수 있게
            }
            setAction("none");
        },
        [tool, elements]
    );

    return (
        <StyledWrap ref={wrapRef}>
            <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}></canvas>
        </StyledWrap>
    );
}

export default Canvas;

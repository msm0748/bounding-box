import { useRef, useCallback } from "react";

interface Props {
    elements: IElement[];
}

function LabelingCanvas({ elements }: Props) {
    const newElementRef = useRef<IElement | null>(null);
    const actionRef = useRef<Action>("none");

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

    return <canvas></canvas>;
}

export default LabelingCanvas;

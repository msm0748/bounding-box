import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const StyledWrapper = styled.div`
    flex: 1;
`;

function Canvas() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    //init
    useEffect(() => {
        if (!wrapperRef.current || !canvasRef.current) return;
        const width = wrapperRef.current.offsetWidth;
        const height = wrapperRef.current.offsetHeight;
        setCanvasSize({ width, height });
        const canvas = canvasRef.current;
        canvas.width = width;
        canvas.height = height;
    }, []);

    return (
        <StyledWrapper ref={wrapperRef}>
            <canvas ref={canvasRef}></canvas>
        </StyledWrapper>
    );
}

export default Canvas;

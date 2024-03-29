export const drawLine = (ctx: CanvasRenderingContext2D, x: number, y: number, startX: number, startY: number, width: number, height: number) => {
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(width, y);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, height);
    ctx.stroke();
    ctx.closePath();
};

export const cursorForPosition = (position: string) => {
    switch (position) {
        case "tl":
        case "br":
            return "nwse-resize";
        case "tr":
        case "bl":
            return "nesw-resize";
        case "t":
        case "b":
            return "row-resize";
        case "l":
        case "r":
            return "col-resize";
        default:
            return "move";
    }
};

export const adjustElementCoordinates = (element: IElement) => {
    const { id, sX, sY, cX, cY, color, title } = element;
    const minX = Math.min(sX, cX);
    const maxX = Math.max(sX, cX);
    const minY = Math.min(sY, cY);
    const maxY = Math.max(sY, cY);
    return { id, sX: minX, sY: minY, cX: maxX, cY: maxY, color, title };
};

export const resizedCoordinates = (zoomPosX: number, zoomPosY: number, position: string, coordinates: IElement, offsetX: number, offsetY: number) => {
    const { id, sX, sY, cX, cY, color, title } = coordinates;
    const dx = zoomPosX - offsetX;
    const dy = zoomPosY - offsetY;

    switch (position) {
        case "tl":
            return { id, sX: sX + dx, sY: sY + dy, cX, cY, color, title };
        case "tr":
            return { id, sX, sY: sY + dy, cX: cX + dx, cY, color, title };
        case "br":
            return { id, sX, sY, cX: cX + dx, cY: cY + dy, color, title };
        case "bl":
            return { id, sX: sX + dx, sY, cX, cY: cY + dy, color, title };
        case "b":
            return { id, sX, sY, cX, cY: cY + dy, color, title };
        case "t":
            return { id, sX, sY: sY + dy, cX, cY, color, title };
        case "r":
            return { id, sX, sY, cX: cX + dx, cY, color, title };
        case "l":
            return { id, sX: sX + dx, sY, cX, cY, color, title };
        default:
            return coordinates;
    }
};

export const measurePaddingBoxSize = (ctx: CanvasRenderingContext2D, sX: number, sY: number, cX: number, cY: number, scale: number) => {
    ctx.setLineDash([5 / scale, 5 / scale]);
    const width = Math.abs(cX - sX);
    const height = Math.abs(cY - sY);
    const cutLineX = width - width * 0.95;
    const cutLineY = height - height * 0.95;

    const paadingBox = Math.min(cutLineX, cutLineY);

    ctx.strokeRect(Math.min(sX, cX) + paadingBox / 2, Math.min(sY, cY) + paadingBox / 2, width - paadingBox, height - paadingBox);
    ctx.setLineDash([0]);
};

export const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
};

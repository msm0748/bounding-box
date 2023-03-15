import { MutableRefObject } from "react";

interface OffsetPosition {
    offsetX: number;
    offsetY: number;
}

interface ZoomDownParams extends OffsetPosition {
    startPosRef: MutableRefObject<Position>;
    viewPosRef: MutableRefObject<Position>;
    isTouchRef: MutableRefObject<boolean>;
}

export const zoomMouseDown = ({ offsetX, offsetY, startPosRef, viewPosRef, isTouchRef }: ZoomDownParams) => {
    startPosRef.current = {
        x: offsetX - viewPosRef.current.x,
        y: offsetY - viewPosRef.current.y,
    };

    isTouchRef.current = true;
};

interface ZoomMouseMoveParams extends OffsetPosition {
    isTouchRef: MutableRefObject<boolean>;
    startPosRef: MutableRefObject<Position>;
}

export const zoomMouseMove =
    ({ offsetX, offsetY, isTouchRef, startPosRef }: ZoomMouseMoveParams) =>
    (setViewPosRef: ({ x, y }: Position) => void) => {
        if (isTouchRef.current === false) return;
        const x = offsetX - startPosRef.current.x;
        const y = offsetY - startPosRef.current.y;

        setViewPosRef({ x, y });
    };

export const zoomMouseUp = (isTouchRef: MutableRefObject<boolean>) => {
    isTouchRef.current = false;
};

interface ZoomImageByWheelParams extends OffsetPosition {
    deltaY: number;
    viewPosRef: MutableRefObject<Position>;
    scaleRef: MutableRefObject<number>;
}

const zoomImageByWheel =
    (handleZoom: (type: Zoom) => void) =>
    ({ offsetX, offsetY, deltaY, viewPosRef, scaleRef }: ZoomImageByWheelParams) =>
    (setViewPosRef: ({ x, y }: Position) => void) => {
        const xs = (offsetX - viewPosRef.current.x) / scaleRef.current;
        const ys = (offsetY - viewPosRef.current.y) / scaleRef.current;

        if (deltaY > 0) {
            handleZoom("zoomIn");
        } else if (deltaY < 0) {
            handleZoom("zoomOut");
        }
        const x = offsetX - xs * scaleRef.current;
        const y = offsetY - ys * scaleRef.current;
        setViewPosRef({ x, y });
    };

interface MoveImageByWheelParams {
    deltaY: number;
    deltaX: number;
    viewPosRef: MutableRefObject<Position>;
}

const moveImageByWheel =
    ({ deltaX, deltaY, viewPosRef }: MoveImageByWheelParams) =>
    (setViewPosRef: ({ x, y }: Position) => void) => {
        const x = viewPosRef.current.x + deltaX;
        const y = viewPosRef.current.y + deltaY;
        setViewPosRef({ x, y });
    };

interface ZoomWheelParams {
    e: React.WheelEvent;
    viewPosRef: MutableRefObject<Position>;
    scaleRef: MutableRefObject<number>;
}

export const zoomWheel =
    (handleZoom: (type: Zoom) => void) =>
    ({ e, viewPosRef, scaleRef }: ZoomWheelParams) =>
    (setViewPosRef: ({ x, y }: Position) => void) => {
        const { offsetX, offsetY } = e.nativeEvent;

        const deltaY = -e.deltaY;
        const deltaX = -e.deltaX;

        if (e.ctrlKey === true || e.metaKey === true) {
            zoomImageByWheel(handleZoom)({ offsetX, offsetY, deltaY, viewPosRef, scaleRef })(setViewPosRef);
        } else {
            moveImageByWheel({ deltaY, deltaX, viewPosRef })(setViewPosRef);
        }
    };

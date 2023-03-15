import { useEffect, MutableRefObject, useCallback } from "react";
import styled from "styled-components";
import Button from "../../common/button";
import Tooltip from "../../common/tooltip";

interface Props {
    tool: Tool;
    onToolChange: (newTool: Tool) => void;
    setIsReset: (isReset: boolean) => void;
    scaleRef: MutableRefObject<number>;
    handleZoom: (type: Zoom) => void;
    draw: () => void;
    canvasSize: Size;
    viewPosRef: MutableRefObject<Position>;
    setViewPosRef: ({ x, y }: Position) => void;
}

const buttonProps = {
    width: 32,
    height: 32,
};

const topButtonProps = {
    ...buttonProps,
    hoverBg: "rgb(235, 236, 239)",
};

function LeftBar({ tool, onToolChange, setIsReset, scaleRef, handleZoom, draw, canvasSize, viewPosRef, setViewPosRef }: Props) {
    const zoomPoint = useCallback(
        (type: Zoom) => {
            const currentImageMedianX = viewPosRef.current.x + (canvasSize.width * scaleRef.current) / 2;
            const currentImageMedianY = viewPosRef.current.y + (canvasSize.height * scaleRef.current) / 2;
            const xs = (currentImageMedianX - viewPosRef.current.x) / scaleRef.current;
            const ys = (currentImageMedianY - viewPosRef.current.y) / scaleRef.current;

            handleZoom(type);

            const x = currentImageMedianX - xs * scaleRef.current;
            const y = currentImageMedianY - ys * scaleRef.current;

            setViewPosRef({ x, y });
            requestAnimationFrame(draw);
        },
        [canvasSize, scaleRef, handleZoom, setViewPosRef, viewPosRef, draw]
    );

    const handleZoomIn = useCallback(() => {
        zoomPoint("zoomIn");
    }, [zoomPoint]);
    const handleZoomOut = useCallback(() => {
        zoomPoint("zoomOut");
    }, [zoomPoint]);
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.code) {
                case "KeyV":
                    onToolChange("select");
                    break;
                case "KeyM":
                    onToolChange("move");
                    break;
                case "KeyB":
                    onToolChange("bounding");
                    break;
                case "Digit1":
                    if (e.shiftKey) {
                        setIsReset(true);
                    }
                    break;
                case "Equal":
                    handleZoomIn();
                    break;
                case "Minus":
                    handleZoomOut();
                    break;
                default:
                    break;
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onToolChange, setIsReset, handleZoomIn, handleZoomOut]);

    return (
        <StyledWrapper>
            <StyledTopWrap>
                <Tooltip text="선택하기 V">
                    <Button onClick={() => onToolChange("select")} active={tool === "select"} {...topButtonProps}>
                        <svg width="24" height="24" fill="#50555A" xmlns="http://www.w3.org/2000/svg" fillOpacity="1" viewBox="0 0 96 96">
                            <path
                                d="M29.713 10.757c-.623-.638-1.7-.188-1.694.707l.461 63.255c.007.905 1.11 1.334 1.718.668l12.814-14.038a.986.986 0 0 1 1.643.294l9.937 24.199c.209.509.788.75 1.293.54l6.644-2.777a1 1 0 0 0 .535-1.302l-9.94-24.2a.996.996 0 0 1 .956-1.378l18.906.786c.897.037 1.376-1.05.746-1.695L29.713 10.757Z"
                                fill="current"
                                fillOpacity="current"
                            ></path>
                        </svg>
                    </Button>
                </Tooltip>
                <Tooltip text="이동하기 M">
                    <Button onClick={() => onToolChange("move")} active={tool === "move"} {...topButtonProps}>
                        <svg width="24" height="24" fill="#50555A" xmlns="http://www.w3.org/2000/svg" fillOpacity="1" viewBox="0 0 96 96">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M43.053 9.294C44.43 8.43 46.093 8 48 8s3.57.43 4.947 1.294c1.377.863 2.267 2.035 2.829 3.195a9.5 9.5 0 0 1 .65 1.814c.964-.313 2.025-.47 3.174-.47 1.907 0 3.57.431 4.947 1.294 1.377.864 2.268 2.035 2.829 3.195.641 1.327.882 2.713.971 3.772a8.337 8.337 0 0 1 2.853-.483c2.193 0 3.99.761 5.353 1.979 1.299 1.161 2.068 2.614 2.533 3.862.47 1.26.692 2.478.8 3.352a15.691 15.691 0 0 1 .112 1.423l.002.104v.056s0 .002-3 .002h3v33.055c0 3.753-1.79 8.305-4.813 11.897C72.106 81.004 67.457 84 61.533 84H34.467c-2.95 0-5.563-1.469-7.661-3.315-2.127-1.872-4.01-4.375-5.566-7.047C18.166 68.356 16 61.758 16 56.694V38.222h3c-3 0-3-.003-3-.003v-.062a6.431 6.431 0 0 1 .019-.398c.017-.239.05-.56.112-.939.123-.742.375-1.778.908-2.85.538-1.084 1.394-2.261 2.737-3.161 1.363-.914 3.046-1.42 5.024-1.42 1.012 0 1.946.132 2.8.384v-7.18c-.001-.837-.004-3.117 1.024-5.243.561-1.16 1.452-2.332 2.83-3.195 1.375-.863 3.039-1.294 4.946-1.294 1.256 0 2.406.187 3.438.56.109-.31.237-.623.386-.932.561-1.16 1.452-2.332 2.83-3.195ZM39.2 22.667c0-.851-.036-1.9-.426-2.704-.164-.34-.36-.565-.615-.725-.255-.16-.766-.377-1.759-.377-.993 0-1.505.217-1.76.377-.254.16-.45.386-.614.725-.39.805-.426 1.853-.426 2.704v20.416a3 3 0 0 1-6 0V38.25l-.004-.066a4.193 4.193 0 0 0-.046-.383 4.204 4.204 0 0 0-.361-1.16c-.187-.375-.418-.655-.707-.849-.268-.18-.76-.403-1.682-.403-.922 0-1.413.223-1.682.403-.289.194-.52.474-.707.849a4.208 4.208 0 0 0-.36 1.16 4.225 4.225 0 0 0-.05.449L22 56.694c0 3.688 1.7 9.242 4.426 13.925 1.345 2.31 2.845 4.243 4.343 5.562C32.296 77.524 33.55 78 34.467 78h27.066c3.743 0 6.828-1.865 9.063-4.522C72.89 70.751 74 67.525 74 65.444V32.376l-.007-.162a9.635 9.635 0 0 0-.06-.67 9.047 9.047 0 0 0-.469-1.996c-.26-.697-.578-1.188-.91-1.485-.27-.24-.647-.452-1.354-.452-.707 0-1.084.211-1.354.452-.332.297-.65.788-.91 1.485a9.047 9.047 0 0 0-.468 1.996 9.635 9.635 0 0 0-.068.832V43.57a3 3 0 1 1-6 0V23.64c0-.851-.036-1.899-.426-2.704-.164-.34-.36-.565-.615-.724-.255-.16-.766-.378-1.759-.378-.993 0-1.505.218-1.76.378-.254.159-.45.385-.614.724-.39.805-.426 1.853-.426 2.704v19.444a3 3 0 1 1-6 0V17.806c0-.852-.036-1.9-.426-2.705-.164-.338-.36-.565-.615-.724-.255-.16-.766-.377-1.759-.377-.993 0-1.505.217-1.76.377-.254.16-.45.386-.614.724-.39.806-.426 1.853-.426 2.705V42.11a3 3 0 0 1-6 0V22.667Z"
                                fill="current"
                                fillOpacity="current"
                            ></path>
                        </svg>
                    </Button>
                </Tooltip>

                <StyledLine />

                <Tooltip text="바운딩 박스 B">
                    <Button onClick={() => onToolChange("bounding")} active={tool === "bounding"} {...topButtonProps}>
                        <svg width="24" height="24" fill="#50555A" xmlns="http://www.w3.org/2000/svg" fillOpacity="1" viewBox="0 0 96 96">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M75.5 62.285v-28.57C80.37 32.583 84 28.215 84 23c0-6.075-4.925-11-11-11-5.215 0-9.583 3.63-10.715 8.5h-28.57C32.583 15.63 28.215 12 23 12c-6.075 0-11 4.925-11 11 0 5.215 3.63 9.583 8.5 10.715v28.57C15.63 63.417 12 67.785 12 73c0 6.075 4.925 11 11 11 4.852 0 8.97-3.14 10.431-7.5H62.57C64.03 80.86 68.148 84 73 84c6.075 0 11-4.925 11-11 0-5.215-3.63-9.583-8.5-10.715ZM29 23a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-3.5 10.715v28.57a11.01 11.01 0 0 1 8.399 9.215H62.1a11.01 11.01 0 0 1 8.399-9.215v-28.57a11.016 11.016 0 0 1-8.215-8.215h-28.57a11.016 11.016 0 0 1-8.215 8.215ZM73 29a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM23 79a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm56-6a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
                                fill="current"
                                fillOpacity="current"
                            ></path>
                        </svg>
                    </Button>
                </Tooltip>
            </StyledTopWrap>

            <StyledBottomWrap>
                <Tooltip text="확대하기 +">
                    <Button onClick={handleZoomIn} {...buttonProps}>
                        <svg width="24" height="24" fill="rgba(26,26,26,0.8)" fillOpacity="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M45 18c-14.912 0-27 12.088-27 27s12.088 27 27 27 27-12.088 27-27-12.088-27-27-27ZM12 45c0-18.225 14.775-33 33-33s33 14.775 33 33c0 8.032-2.87 15.395-7.64 21.117L83.12 78.88a3 3 0 1 1-4.242 4.242L66.117 70.36A32.866 32.866 0 0 1 45 78c-18.225 0-33-14.775-33-33Zm33-17a3 3 0 0 1 3 3v12h12a3 3 0 1 1 0 6H48v12a3 3 0 1 1-6 0V49H30a3 3 0 1 1 0-6h12V31a3 3 0 0 1 3-3Z"
                            ></path>
                        </svg>
                    </Button>
                </Tooltip>
                <Tooltip text="축소하기 -">
                    <Button onClick={handleZoomOut} {...buttonProps}>
                        <svg width="24" height="24" fill="rgba(26,26,26,0.8)" fillOpacity="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M45 18c-14.912 0-27 12.088-27 27s12.088 27 27 27 27-12.088 27-27-12.088-27-27-27ZM12 45c0-18.225 14.775-33 33-33s33 14.775 33 33c0 8.032-2.87 15.395-7.64 21.117L83.12 78.88a3 3 0 1 1-4.242 4.242L66.117 70.36A32.866 32.866 0 0 1 45 78c-18.225 0-33-14.775-33-33Zm14 1a3 3 0 0 1 3-3h32a3 3 0 1 1 0 6H29a3 3 0 0 1-3-3Z"
                            ></path>
                        </svg>
                    </Button>
                </Tooltip>

                <StyledLine />

                <Tooltip text="선택한 라벨로 이동하기 Shift + 2">
                    <Button {...buttonProps}>
                        <svg width="24" height="24" fill="rgba(26,26,26,0.8)" xmlns="http://www.w3.org/2000/svg" fillOpacity="1" viewBox="0 0 96 96">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M48 8a3 3 0 0 1 3 3v1h26a7 7 0 0 1 7 7v26h1a3 3 0 1 1 0 6h-1v26a7 7 0 0 1-7 7H51v1a3 3 0 1 1-6 0v-1H19a7 7 0 0 1-7-7V51h-1a3 3 0 1 1 0-6h1V19a7 7 0 0 1 7-7h26v-1a3 3 0 0 1 3-3Zm-3 10H19a1 1 0 0 0-1 1v26h27V18Zm0 33H18v26a1 1 0 0 0 1 1h26V51Zm6 27V51h27v26a1 1 0 0 1-1 1H51Zm27-33H51V18h26a1 1 0 0 1 1 1v26Z"
                                fill="current"
                                fillOpacity="current"
                            ></path>
                        </svg>
                    </Button>
                </Tooltip>
                <Tooltip text="화면 기본 크기 Shift + 1">
                    <Button onClick={() => setIsReset(true)} {...buttonProps}>
                        <svg width="24" height="24" fill="rgba(26,26,26,0.8)" fillOpacity="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M59 15a3 3 0 0 1 3-3h15a7 7 0 0 1 7 7v15a3 3 0 1 1-6 0V22.243L64.121 36.12a3 3 0 1 1-4.242-4.242L73.757 18H62a3 3 0 0 1-3-3Zm-47 4a7 7 0 0 1 7-7h15a3 3 0 1 1 0 6H22.243L36.12 31.879a3 3 0 1 1-4.242 4.242L18 22.243V34a3 3 0 1 1-6 0V19Zm0 43a3 3 0 1 1 6 0v11.757L31.879 59.88a3 3 0 1 1 4.242 4.242L22.243 78H34a3 3 0 1 1 0 6H19a7 7 0 0 1-7-7V62Zm69-3a3 3 0 0 1 3 3v15a7 7 0 0 1-7 7H62a3 3 0 1 1 0-6h11.757L59.88 64.121a3 3 0 1 1 4.242-4.242L78 73.757V62a3 3 0 0 1 3-3Z"
                            ></path>
                        </svg>
                    </Button>
                </Tooltip>
            </StyledBottomWrap>
        </StyledWrapper>
    );
}

export default LeftBar;

const StyledWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 48px;
    height: 100%;
    padding: 24px 8px;
`;

const StyledLine = styled.div`
    margin: 8px 4px;
    border-bottom: 1px solid rgb(224, 225, 228);
`;

const StyledTopWrap = styled.div`
    & > div:first-child {
        margin-bottom: 8px;
    }
`;

const StyledBottomWrap = styled.div`
    & > div:not(:last-child) {
        margin-bottom: 8px;
    }
`;

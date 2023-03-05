import { useEffect, useState } from "react";
import styled from "styled-components";
import LeftBar from "./LeftBar";
import Canvas from "./Canvas";
import RightBar from "./RightBar";
import { ICategory, IElements, ISelectedElement, ISize } from "./index.type";
import test1 from "../../assets/images/mission/test1.jpg";
import test2 from "../../assets/images/mission/test2.jpg";
import test3 from "../../assets/images/mission/test3.jpg";

const StyledWrap = styled.main`
    display: flex;
    width: 100%;
    height: calc(100% - 48px);
    position: relative;
`;

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

const image = new Image();
const imageList = [test1, test2, test3];

function Main() {
    const [elements, setElements] = useState<IElements[]>([]);
    const [tool, setTool] = useState<"select" | "move" | "bounding">("select");
    const [selectedElement, setSelectedElement] = useState<ISelectedElement | null>(null);
    const [isReset, setIsReset] = useState<boolean>(false);
    const [category, setCategory] = useState<ICategory>(categoryList[0]);
    const [canvasSize, setCanvasSize] = useState<ISize>({ width: 0, height: 0 });
    const [drawImageSize, setDrawImageSize] = useState<ISize>({ width: 0, height: 0 });
    const [mouseOverElement, setMouseOverElement] = useState<ISelectedElement | undefined>(undefined);
    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        image.src = imageList[imageIndex];
        image.onload = () => {
            const imageWidth = canvasSize.width;
            const imageHeight = (canvasSize.width * image.height) / image.width;

            setDrawImageSize({ width: imageWidth, height: imageHeight });
        };
    }, [canvasSize, imageIndex]);

    return (
        <StyledWrap>
            <LeftBar tool={tool} setTool={setTool} setIsReset={setIsReset} />
            <Canvas
                tool={tool}
                category={category}
                setCategory={setCategory}
                categoryList={categoryList}
                elements={elements}
                setElements={setElements}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
                isReset={isReset}
                setIsReset={setIsReset}
                image={image}
                drawImageSize={drawImageSize}
                canvasSize={canvasSize}
                setCanvasSize={setCanvasSize}
                mouseOverElement={mouseOverElement}
                setMouseOverElement={setMouseOverElement}
            />
            <RightBar
                elements={elements}
                setElements={setElements}
                categoryList={categoryList}
                tool={tool}
                setTool={setTool}
                selectedElement={selectedElement}
                setSelectedElement={setSelectedElement}
                setIsReset={setIsReset}
                image={image}
                drawImageSize={drawImageSize}
                canvasSize={canvasSize}
                mouseOverElement={mouseOverElement}
                setMouseOverElement={setMouseOverElement}
                imageList={imageList}
                imageIndex={imageIndex}
                setImageIndex={setImageIndex}
            ></RightBar>
        </StyledWrap>
    );
}

export default Main;

import { useState } from "react";
import styled from "styled-components";
import LeftBar from "./LeftBar";
import Canvas from "./Canvas";
import RightBar from "./RightBar";
import { ICategory, IElements, ISelectedElement } from "./index.type";

const StyledWrap = styled.main`
    display: flex;
    width: 100%;
    height: calc(100% - 48px);
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

function Main() {
    const [elements, setElements] = useState<IElements[]>([]);
    const [tool, setTool] = useState<"select" | "move" | "bounding">("select");
    const [selectedElement, setSelectedElement] = useState<ISelectedElement | null>(null);
    const [isReset, setIsReset] = useState<boolean>(false);
    const [category, setCategory] = useState<ICategory>(categoryList[0]);

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
            ></RightBar>
        </StyledWrap>
    );
}

export default Main;

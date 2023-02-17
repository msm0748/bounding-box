import { useState } from "react";
import styled from "styled-components";
import LeftBar from "./LeftBar";
import Canvas from "./Canvas";
import { IElements } from "./index.type";

const StyledWrap = styled.main`
    display: flex;
    width: 100%;
    height: calc(100% - 48px);
`;
function Main() {
    const [elements, setElements] = useState<IElements[]>([]);
    const [tool, setTool] = useState<"select" | "move" | "bounding">("select");
    const [isReset, setIsReset] = useState<boolean>(false);

    return (
        <StyledWrap>
            <LeftBar tool={tool} setTool={setTool} setIsReset={setIsReset} />
            <Canvas tool={tool} elements={elements} setElements={setElements} />
        </StyledWrap>
    );
}

export default Main;

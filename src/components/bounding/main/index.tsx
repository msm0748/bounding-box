import styled from "styled-components";
import Canvas from "./Canvas";
import LeftBar from "./LeftBar";
import { useState } from "react";

const StyledMain = styled.main`
    display: flex;
    height: calc(100% - 48px);
`;

function Main() {
    const [tool, setTool] = useState<Tool>("select");
    const handleToolChange = (newTool: Tool) => {
        setTool(newTool);
    };

    return (
        <StyledMain>
            <LeftBar tool={tool} onToolChange={handleToolChange} />
            <Canvas />
        </StyledMain>
    );
}
export default Main;

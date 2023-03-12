import styled from "styled-components";
import Canvas from "./Canvas";
import LeftBar from "./LeftBar";
import { useCallback, useState } from "react";

const StyledMain = styled.main`
    display: flex;
    height: calc(100% - 48px);
`;

function Main() {
    const [tool, setTool] = useState<Tool>("select");
    const [reset, setReset] = useState(false);

    const handleToolChange = useCallback((newTool: Tool) => {
        setTool(newTool);
    }, []);
    const setIsReset = useCallback((isReset: boolean) => {
        setReset(isReset);
    }, []);

    return (
        <StyledMain>
            <LeftBar tool={tool} onToolChange={handleToolChange} setIsReset={setIsReset} />
            <Canvas reset={reset} setIsReset={setIsReset} />
        </StyledMain>
    );
}
export default Main;

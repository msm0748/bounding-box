import styled from "styled-components";
import Canvas from "./Canvas";
import LeftBar from "./LeftBar";
import { useCallback, useState } from "react";

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
            <Canvas tool={tool} reset={reset} setIsReset={setIsReset} />
        </StyledMain>
    );
}
export default Main;

const StyledMain = styled.main`
    display: flex;
    height: calc(100% - 48px);
`;

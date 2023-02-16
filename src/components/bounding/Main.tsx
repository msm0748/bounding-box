import { useState } from "react";
import styled from "styled-components";
import LeftBar from "./LeftBar";

const StyledWrap = styled.main`
    height: calc(100% - 48px);
`;
function Main() {
    const [tool, setTool] = useState<"select" | "move" | "bounding">("select");
    const [isReset, setIsReset] = useState<boolean>(false);

    return (
        <StyledWrap>
            <LeftBar tool={tool} setTool={setTool} setIsReset={setIsReset} />
        </StyledWrap>
    );
}

export default Main;

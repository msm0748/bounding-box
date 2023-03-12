import styled from "styled-components";
import Canvas from "./Canvas";
import LeftBar from "./LeftBar";

const StyledMain = styled.main`
    display: flex;
    height: calc(100% - 48px);
`;

function Main() {
    return (
        <StyledMain>
            <LeftBar />
            <Canvas />
        </StyledMain>
    );
}
export default Main;

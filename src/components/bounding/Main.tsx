import styled from "styled-components";
import Canvas from "./Canvas";

const StyledMain = styled.main`
    display: flex;
    height: calc(100% - 48px);
`;

function Main() {
    return (
        <StyledMain>
            <Canvas />
        </StyledMain>
    );
}
export default Main;

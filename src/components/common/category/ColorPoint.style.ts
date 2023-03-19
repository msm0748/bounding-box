import styled from "styled-components";

const StyledColorPoint = styled.div<{ color: string }>`
    width: 14px;
    height: 14px;
    border-radius: 7px;
    margin-right: 10px;
    background: ${(props) => props.color};
`;

export default StyledColorPoint;

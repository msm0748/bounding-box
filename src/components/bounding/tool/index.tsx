import { ReactNode, useState } from "react";
import styled from "styled-components";

interface Props {
    children: ReactNode;
    text: string;
}

const StyledWrap = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 4px 0;
`;

const StyledTooltip = styled.span<{ isShow: boolean }>`
    display: flex;
    width: max-content;
    visibility: ${({ isShow }) => (isShow ? "visible" : "hidden")};
    background: rgb(235, 236, 239);
    position: absolute;
    padding: 8px 15px;
    font-size: 14px;
    border-radius: 5px;
    left: 55px;
    &:before {
        display: block;
        left: -18px;
        border-top: 8px solid transparent;
        border-right: 12px solid rgb(235, 236, 239);
        border-bottom: 8px solid transparent;
        border-left: 8px solid transparent;
    }
`;

const StyledBlock = styled.div`
    position: relative;
    z-index: 1;
    border-radius: 4px;
    overflow: hidden;
`;

function Tooltip({ children, text }: Props) {
    const [show, setShow] = useState(false);

    return (
        <StyledWrap>
            <StyledBlock onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
                {children}
            </StyledBlock>
            <StyledTooltip isShow={show}>{text}</StyledTooltip>
        </StyledWrap>
    );
}

export default Tooltip;

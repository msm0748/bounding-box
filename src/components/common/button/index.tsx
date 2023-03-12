import { ReactNode, ButtonHTMLAttributes } from "react";
import styled from "styled-components";

interface Props extends ButtonProps {
    children: ReactNode;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    width: number;
    height: number;
    active?: boolean;
    hoverBg?: string;
}

const StyledButton = styled.button<ButtonProps>`
    width: ${({ width }) => width}px;
    height: ${({ height }) => height}px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    background-color: ${(props) => (props.active ? "rgb(235, 236, 239)" : "")};
    &:hover {
        background: ${({ hoverBg }) => hoverBg};
    }
`;

function Button({ children, width, height, hoverBg, active, ...rest }: Props) {
    return (
        <StyledButton width={width} height={height} hoverBg={hoverBg} active={active} {...rest}>
            {children}
        </StyledButton>
    );
}

export default Button;

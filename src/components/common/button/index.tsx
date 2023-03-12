import { ReactNode, ButtonHTMLAttributes } from "react";
import styled from "styled-components";

interface Props extends ButtonProps {
    children: ReactNode;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    width: number;
    height: number;
    hoverBg?: string;
}

const StyledButton = styled.button<ButtonProps>`
    width: ${({ width }) => width}px;
    height: ${({ height }) => height}px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    &:hover {
        background: ${({ hoverBg }) => hoverBg};
    }
`;

function Button({ children, width, height, hoverBg, ...rest }: Props) {
    return (
        <StyledButton width={width} height={height} hoverBg={hoverBg} {...rest}>
            {children}
        </StyledButton>
    );
}

export default Button;

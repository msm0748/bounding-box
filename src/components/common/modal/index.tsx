import { ReactNode, useState } from "react";
import styled from "styled-components";

interface Props {
    children: ReactNode;
}

function Modal({ children }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenModal = () => {
        setIsOpen(true);
    };

    const handleCloseModal = () => {
        setIsOpen(false);
    };
    return (
        <>
            <StyledVideoWrap onClick={handleOpenModal}>{children}</StyledVideoWrap>
            {isOpen ? (
                <StyledOverlay onClick={handleCloseModal}>
                    <StyledWrap onClick={(e) => e.stopPropagation()}>
                        <StyledHeader>
                            <StyledButton onClick={handleCloseModal}>
                                <svg width="30" height="30" fill="rgba(26,26,26,0.8)" fillOpacity="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M14.879 14.879a3 3 0 0 1 4.242 0L48 43.757 76.879 14.88a3 3 0 1 1 4.242 4.242L52.243 48 81.12 76.879a3 3 0 1 1-4.242 4.242L48 52.243 19.121 81.12a3 3 0 1 1-4.242-4.242L43.757 48 14.88 19.121a3 3 0 0 1 0-4.242Z"
                                    ></path>
                                </svg>
                            </StyledButton>
                        </StyledHeader>
                        <div>{children}</div>
                    </StyledWrap>
                </StyledOverlay>
            ) : null}
        </>
    );
}

export default Modal;

const StyledOverlay = styled.div`
    position: fixed;
    z-index: 1000;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.72);
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const StyledWrap = styled.div`
    width: 87%;
    overflow: auto;
    border-radius: 5px;
`;

const StyledHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: end;
    height: 50px;
    background: #fff;
`;

const StyledButton = styled.button`
    display: flex;
    margin-right: 15px;
`;
const StyledVideoWrap = styled.div`
    cursor: pointer;
`;

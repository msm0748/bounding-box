import styled from "styled-components";
import Button from "../common/button";

function Header() {
    return (
        <header>
            <StyledWrapper>
                <Button width={40} height={40} hoverBg="rgba(0, 0, 0, 0.08)">
                    <svg width="24" height="24" fill="rgba(26,26,26,0.8)" xmlns="http://www.w3.org/2000/svg" fillOpacity="1" viewBox="0 0 96 96">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M16 19c0-6.075 4.925-11 11-11h50a3 3 0 0 1 3 3v58a3 3 0 0 1-3 3h-1a5 5 0 0 0 0 10h1a3 3 0 1 1 0 6H27c-6.075 0-11-4.925-11-11V19Zm6 58a5 5 0 0 0 5 5h39.2c-.767-1.5-1.2-3.2-1.2-5 0-1.8.433-3.5 1.2-5H27a5 5 0 0 0-5 5Zm52-11H27c-1.8 0-3.5.433-5 1.2V19a5 5 0 0 1 5-5h47v52Z"
                            fill="current"
                            fillOpacity="current"
                        ></path>
                    </svg>
                </Button>
            </StyledWrapper>
        </header>
    );
}

export default Header;

const StyledWrapper = styled.header`
    display: flex;
    justify-content: end;
    align-items: center;
    height: 48px;
    padding: 0 15px;
`;

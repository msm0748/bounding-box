import styled from "styled-components";
import ColorPoint from "../../common/category/ColorPoint";

interface Props {
    elements: IElement[];
}

function RightBar({ elements }: Props) {
    return (
        <StyledWrap>
            <div>
                {elements.length < 1 && <StyledTextWrap>왼쪽 작업 화면에서 라벨을 생성해주세요 !</StyledTextWrap>}
                <StyledElementsListWrap>
                    <ul>
                        {elements.map((element) => (
                            <StyledItem key={element.id}>
                                <StyledBlock>
                                    <ColorPoint color={element.color} title={element.title} />
                                </StyledBlock>
                                <StyledSvgBlock>
                                    <svg
                                        width="16"
                                        height="16"
                                        fill="rgba(26,26,26,0.8)"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fillOpacity="1"
                                        viewBox="0 0 96 96"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="m23.992 26.778 3.725 50.296a1 1 0 0 0 .998.926h38.57a1 1 0 0 0 .998-.926l3.725-50.296 5.984.444-3.726 50.295A7 7 0 0 1 67.286 84H28.714a7 7 0 0 1-6.981-6.483l-3.726-50.295 5.984-.444Z"
                                            fill="current"
                                            fillOpacity="current"
                                        ></path>
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M12 27a3 3 0 0 1 3-3h66a3 3 0 1 1 0 6H15a3 3 0 0 1-3-3ZM34.74 43.011a3 3 0 0 1 3.249 2.73l2 23a3 3 0 1 1-5.978.519l-2-23a3 3 0 0 1 2.73-3.249ZM45 69V46a3 3 0 1 1 6 0v23a3 3 0 1 1-6 0ZM58.74 71.989a3 3 0 0 1-2.729-3.249l2-23a3 3 0 1 1 5.978.52l-2 23a3 3 0 0 1-3.249 2.729Z"
                                            fill="current"
                                            fillOpacity="current"
                                        ></path>
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M38.389 18a1 1 0 0 0-.987.836l-1.443 8.657-5.918-.986 1.443-8.658A7 7 0 0 1 38.388 12h19.224a7 7 0 0 1 6.904 5.85l1.443 8.657-5.918.986-1.443-8.657a1 1 0 0 0-.986-.836H38.388Z"
                                            fill="current"
                                            fillOpacity="current"
                                        ></path>
                                    </svg>
                                </StyledSvgBlock>
                            </StyledItem>
                        ))}
                    </ul>
                </StyledElementsListWrap>
            </div>
            <div>
                <StyledSubmitWrap>
                    <StyledSubmitBtn>제출하기</StyledSubmitBtn>
                </StyledSubmitWrap>
            </div>
        </StyledWrap>
    );
}

export default RightBar;

const StyledWrap = styled.section`
    display: flex;
    width: 360px;
    height: 100%;
    flex-direction: column;
    justify-content: space-between;
`;

const StyledElementsListWrap = styled.div`
    height: 360px;
    overflow-y: overlay;
`;

const StyledItem = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    cursor: pointer;
    &.hover {
        background: rgba(0, 0, 0, 0.04);
    }
    &.active {
        background: rgba(0, 0, 0, 0.08);
    }
`;

const StyledBlock = styled.div`
    display: flex;
    align-items: center;
`;

const StyledSvgBlock = styled.div`
    &:hover svg {
        fill: rgb(12, 95, 219);
    }
`;

const StyledTextWrap = styled.div`
    margin-top: 170px;
    text-align: center;
    color: rgb(123, 126, 133);
    font-size: 14px;
`;

const StyledSubmitWrap = styled.div`
    border-top: 1px solid rgb(235, 236, 239);
    padding: 16px;
`;

const StyledSubmitBtn = styled.button`
    background: rgb(26, 26, 26);
    border-radius: 4px;
    width: 100%;
    height: 56px;
    color: white;
`;

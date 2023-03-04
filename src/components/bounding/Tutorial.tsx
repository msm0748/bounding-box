import { Dispatch, SetStateAction } from "react";
import { Transition, TransitionStatus } from "react-transition-group";
import styled from "styled-components";

interface Props {
    isShowTutorial: boolean;
    setIsShowTutorial: Dispatch<SetStateAction<boolean>>;
}

const StyledWrap = styled.div<{ state: TransitionStatus }>`
    position: fixed;
    z-index: 1000;
    top: 48px;
    width: 100%;
    height: calc(100% - 48px);
    transition: all 0.3s ease 0s;
    background: rgba(0, 0, 0, 0);

    background: ${({ state }) => {
        switch (state) {
            case "entered":
                return "rgba(0, 0, 0, 0.56);";
        }
    }};
`;

const StyledContainer = styled.div<{ state: TransitionStatus }>`
    width: calc(100% - 320px);
    max-width: 800px;
    padding: 0 24px 24px;
    overflow: auto;
    height: calc(100% - 48px);
    position: absolute;
    z-index: 1000;
    top: 48px;
    right: -100%;
    background: #fff;
    transition: all 0.3s ease-in-out;

    right: ${({ state }) => {
        switch (state) {
            case "entered":
                return "0";
        }
    }};
`;

const StyledH2 = styled.h2`
    font-size: 24px;
    margin: 40px 0 30px;
`;

const StyledH3 = styled.h3`
    font-size: 18px;
    margin: 28px 0 14px;
`;

const StyledList = styled.ul`
    li {
        font-size: 16px;
        padding-left: 10px;
        position: relative;
        color: #a6a6ad;
        margin-bottom: 8px;
    }
`;

const StyledSpan = styled.span<{ color?: string }>`
    color: ${({ color }) => (color ? color : "black")};
`;

const StyledTable = styled.table`
    width: 100%;
    * {
        text-align: center;
        border: 1px solid;
    }
    th {
        font-weight: bold;
    }
    th,
    td {
        padding: 20px;
    }
`;

const StyledVideo = styled.video`
    width: 100%;
    cursor: pointer;
`;

function Tutorial({ isShowTutorial, setIsShowTutorial }: Props) {
    return (
        <>
            <Transition in={isShowTutorial} timeout={300} unmountOnExit>
                {(state) => <StyledWrap state={state} onClick={() => setIsShowTutorial(false)}></StyledWrap>}
            </Transition>
            <Transition in={isShowTutorial} timeout={300} unmountOnExit>
                {(state) => (
                    <StyledContainer state={state}>
                        <StyledH2>진행 방법</StyledH2>
                        <StyledH3>1. 박스 그리기</StyledH3>
                        <StyledList>
                            <li>
                                · 화면 왼쪽 도구 메뉴에서 <StyledSpan>[바운딩 박스] 아이콘</StyledSpan>을 눌러 주세요.
                            </li>
                            <li>
                                · 이미지에 포함된 <StyledSpan>박스 대상을 [클릭 + 드래그]</StyledSpan>해 박스를 그립니다.
                            </li>
                            <li>
                                · 박스를 그리면 등장하는 <StyledSpan>실선과 점선 사이에 박스 대상의 외곽선이 포함</StyledSpan>되어야 합니다.
                            </li>
                        </StyledList>
                        <StyledH3>2. 박스 수정하기</StyledH3>
                        <StyledList>
                            <li>
                                · 화면 왼쪽 도구 메뉴에서 <StyledSpan>[선택하기] 아이콘</StyledSpan>을 눌러 주세요.
                            </li>
                            <li>
                                · 수정할 <StyledSpan>박스 대상을 클릭</StyledSpan>해 박스를 수정합니다.
                            </li>
                        </StyledList>
                        <StyledH3>3. 카테고리 선택하기</StyledH3>
                        <StyledList>
                            <li>
                                · 박스를 그린 후 박스 대상이 속하는 <StyledSpan>카테고리를 선택</StyledSpan>합니다.
                            </li>
                        </StyledList>
                        <StyledH3>4. 제출하기</StyledH3>
                        <StyledList>
                            <li>· 완성된 라벨은 오른쪽 아래 [제출하기]를 눌러 제출합니다.</li>
                        </StyledList>
                        <StyledVideo muted loop autoPlay>
                            <source
                                src="https://firebasestorage.googleapis.com/v0/b/cashmission-9f672.appspot.com/o/tutorial%2Ftutorial.webm?alt=media&token=de51246a-81bb-4b35-a615-03e6f81e27ea"
                                type="video/webm"
                            />
                        </StyledVideo>
                        <StyledH2>단축키</StyledH2>
                        <StyledTable>
                            <colgroup>
                                <col />
                                <col />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>기능</th>
                                    <th>단축키</th>
                                    <th>기능</th>
                                    <th>단축키</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>박스 생성</td>
                                    <td>B</td>
                                    <td>선택하기</td>
                                    <td>V</td>
                                </tr>
                                <tr>
                                    <td>이동하기</td>
                                    <td>M</td>
                                    <td>작업중 이동하기</td>
                                    <td>Space + 드래그</td>
                                </tr>
                                <tr>
                                    <td>확대하기 / 축소하기</td>
                                    <td>Ctrl(Cmd) + Scroll</td>
                                    <td>좌우 스크롤</td>
                                    <td>Shift + Scroll</td>
                                </tr>
                                <tr>
                                    <td>삭제하기</td>
                                    <td>Del</td>
                                    <td>화면 기본 크기</td>
                                    <td>Shift + 1</td>
                                </tr>
                            </tbody>
                        </StyledTable>
                    </StyledContainer>
                )}
            </Transition>
        </>
    );
}

export default Tutorial;

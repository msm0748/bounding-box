import { useRef } from "react";
import styled from "styled-components";
import { Transition, TransitionStatus } from "react-transition-group";
import Modal from "../common/modal";

interface Props {
    isShowTutorial: boolean;
    handleTutorialToggle: () => void;
}

function Tutorial({ isShowTutorial, handleTutorialToggle }: Props) {
    const backgroundRef = useRef(null);
    const tutorialRef = useRef(null);

    return (
        <>
            <Transition in={isShowTutorial} timeout={300} unmountOnExit nodeRef={backgroundRef}>
                {(state) => <StyledWrap state={state} ref={backgroundRef} onClick={handleTutorialToggle}></StyledWrap>}
            </Transition>
            <Transition in={isShowTutorial} timeout={300} unmountOnExit nodeRef={tutorialRef}>
                {(state) => (
                    <StyledContainer state={state} ref={tutorialRef}>
                        <StyledH1>바운딩 박스</StyledH1>
                        <StyledP>
                            데이터 라벨링은 인공지능이 학습할 수 있는 형태로 데이터를 가공하는 것입니다. 그중 객체 검출에서 가장 흔하게 사용되는 라벨링 방법 중
                            하나가 바운딩 박스입니다. 바운딩 박스는 객체 주변에 사각형 모양의 박스를 그리는 것으로, 이를 통해 인공지능은 사진 속에서 어떤 객체가
                            어디에 있는지 인식할 수 있게 됩니다.
                        </StyledP>
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
                        <Modal>
                            <StyledVideo muted loop autoPlay>
                                <source
                                    src="https://firebasestorage.googleapis.com/v0/b/cashmission-9f672.appspot.com/o/tutorial%2Fcreate.mp4?alt=media&token=a7322ed4-4254-4e18-aa1c-30a8e82addaf"
                                    type="video/mp4"
                                />
                            </StyledVideo>
                        </Modal>
                        <StyledH3>2. 박스 수정하기</StyledH3>
                        <StyledList>
                            <li>
                                · 화면 왼쪽 도구 메뉴에서 <StyledSpan>[선택하기] 아이콘</StyledSpan>을 눌러 주세요.
                            </li>
                            <li>
                                · 수정할 <StyledSpan>박스 대상을 클릭</StyledSpan>해 박스를 수정합니다.
                            </li>
                        </StyledList>
                        <Modal>
                            <StyledVideo muted loop autoPlay>
                                <source
                                    src="https://firebasestorage.googleapis.com/v0/b/cashmission-9f672.appspot.com/o/tutorial%2Fupdate.mp4?alt=media&token=06417b88-0592-4d8d-828e-b91dd084f74d"
                                    type="video/mp4"
                                />
                            </StyledVideo>
                        </Modal>
                        <StyledH3>3. 카테고리 선택하기</StyledH3>
                        <StyledList>
                            <li>
                                · 박스를 그리기 전/후 박스 대상이 속하는 <StyledSpan>카테고리를 선택</StyledSpan>합니다.
                            </li>
                        </StyledList>

                        <StyledH3>4. 다운로드</StyledH3>
                        <StyledList>
                            <li>· 완성된 라벨은 오른쪽 아래 [다운로드]를 눌러 json 파일 형식으로 결과값을 다운받을 수 있습니다.</li>
                        </StyledList>

                        <StyledH3>5. 제출하기</StyledH3>
                        <StyledList>
                            <li>· 완성된 라벨은 오른쪽 아래 [제출하기]를 눌러 제출합니다.</li>
                        </StyledList>
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
                                <tr>
                                    <td>작업 취소</td>
                                    <td>ESC</td>
                                    <td>실행 취소</td>
                                    <td>Ctrl(Cmd) + Z</td>
                                </tr>
                                <tr>
                                    <td>실행 취소 되돌리기</td>
                                    <td>Ctrl(Cmd) + Shift + Z</td>
                                    <td></td>
                                    <td></td>
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
    max-width: 900px;
    padding: 0 24px 40px;
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

const StyledH1 = styled.h1`
    font-size: 32px;
    margin: 40px 0 30px;
`;

const StyledH2 = styled.h2`
    font-size: 24px;
    margin: 40px 0 30px;
`;

const StyledH3 = styled.h3`
    font-size: 18px;
    margin: 32px 0 14px;
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

const StyledP = styled.p`
    font-size: 18px;
    line-height: 22px;
    word-break: keep-all;
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
`;

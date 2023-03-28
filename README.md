# 바운딩 박스

홈페이지 주소  
<http://43.201.20.178/>

## 프로젝트 소개

바운딩 박스를 그리는 인터페이스를 제공하여 사용자가 객체 인식 작업을 더욱 효율적으로 수행할 수 있도록 도와줍니다.
<br/><br/>

## 바운딩 박스란?

데이터 라벨링은 인공지능이 학습할 수 있는 형태로 데이터를 가공하는 것입니다. 그중 객체 검출에서 가장 흔하게 사용되는 라벨링 방법 중 하나가 바운딩 박스입니다. 바운딩 박스는 객체 주변에 사각형 모양의 박스를 그리는 것으로, 이를 통해 인공지능은 사진 속에서 어떤 객체가 어디에 있는지 인식할 수 있게 됩니다.
<br/><br/>

## 사용 기술

`React`, `TypeScript`, `Styled-Components`, `Canvas`
<br/><br/>

## 기능
![bounding-box](https://user-images.githubusercontent.com/78075709/228297892-c5b5ea0f-75b4-4c2e-bc8c-40821a59aa6a.png)
<br/><br/>
1. **바운딩 박스 그리기 기능**
    - 이미지 위에서 자신이 인식하고자 하는 객체 주위에 바운딩 박스를 그릴 수 있습니다.
2. **바운딩 박스 수정 기능**
    - 그려진 바운딩 박스를 클릭하여 수정할 수 있습니다.
    - 해당 바운딩 박스를 수정하여 정확한 위치와 크기를 지정할 수 있습니다.
3. **바운딩 박스 삭제 기능**
    - 그려진 바운딩 박스를 삭제할 수 있습니다.
4. **이미지 확대 기능**
    - 마우스 위치에서 이미지를 확대하여 더욱 정확한 바운딩 박스를 그릴 수 있습니다.
      <br/><br/>

## 프로젝트 구조

📦src  
 ┣ 📂components  
 ┃ ┣ 📂bounding  
 ┃ ┃ ┣ 📂main  
 ┃ ┃ ┃ ┣ 📂canvas  
 ┃ ┃ ┃ ┃ ┣ 📂utils  
 ┃ ┃ ┃ ┃ ┃ ┗ 📜labelingUtils.ts  
 ┃ ┃ ┃ ┃ ┣ 📜ImageCanvas.tsx  
 ┃ ┃ ┃ ┃ ┣ 📜LabelingCanvas.tsx  
 ┃ ┃ ┃ ┃ ┗ 📜index.tsx  
 ┃ ┃ ┃ ┣ 📜LeftBar.tsx  
 ┃ ┃ ┃ ┣ 📜RightBar.tsx  
 ┃ ┃ ┃ ┣ 📜defaults.ts  
 ┃ ┃ ┃ ┣ 📜index.tsx  
 ┃ ┃ ┃ ┗ 📜main.d.ts  
 ┃ ┃ ┣ 📜Header.tsx  
 ┃ ┃ ┣ 📜Tutorial.tsx  
 ┃ ┃ ┗ 📜index.tsx  
 ┃ ┣ 📂common  
 ┃ ┃ ┣ 📂button  
 ┃ ┃ ┃ ┗ 📜index.tsx  
 ┃ ┃ ┣ 📂category  
 ┃ ┃ ┃ ┣ 📜CategoryItem.tsx  
 ┃ ┃ ┃ ┣ 📜ColorPoint.style.ts  
 ┃ ┃ ┃ ┣ 📜ColorPoint.tsx  
 ┃ ┃ ┃ ┗ 📜index.tsx  
 ┃ ┃ ┣ 📂modal  
 ┃ ┃ ┃ ┗ 📜index.tsx  
 ┃ ┃ ┗ 📂tooltip  
 ┃ ┃&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┗ 📜index.tsx  
 ┣ 📂styles  
 ┃ ┗ 📜global.ts  
 ┣ 📜App.tsx  
 ┣ 📜index.tsx

<br/><br/>

## 어려웠던 점

바운딩 박스 그리기 기능에서 불필요한 렌더링이 빈번하게 발생하는 문제가 있었습니다.
<br/><br/>

## 해결 방안

-   **이미지 캔버스와 바운딩 박스 캔버스를 분리**
    -   이미지를 보여주는 캔버스와 바운딩 박스를 그리는 캔버스를 분리함으로써, 바운딩 박스를 그릴 때는 바운딩 박스 캔버스만 다시 그리도록 하였습니다.
-   **이미지 캔버스에서 useRef를 사용하여 상태값 관리**
    -   이미지 확대 기능과 이미지 이동 기능을 구현할 때, 이미지 캔버스에서 useState 대신 useRef 훅을 사용하여 상태값을 관리하여 렌더링을 최적화하였습니다.
-   **React.memo를 사용한 컴포넌트 최적화**
    -   React.memo로 컴포넌트를 최적화하여 마우스 이벤트로 인한 불필요한 렌더링을 줄이고 성능을 개선할 수 있었습니다.
        <br/><br/>

## Convention 종류

| 태그이름 | 설명                                    |
| :------- | :-------------------------------------- |
| feat     | 새로운 기능 추가                        |
| fix      | 버그 수정                               |
| design   | css 등 사용자 UI 디자인 수정            |
| refactor | 코드 리팩토링                           |
| comment  | 필요한 주석 추가 및 변경                |
| docs     | 문서 수정                               |
| chore    | 패키지 매니저 설정                      |
| rename   | 파일 혹은 폴더명 수정하거나 옮기는 작업 |
| remove   | 파일을 삭제하는 작업만 하는 경우        |

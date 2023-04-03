# 바운딩 박스

홈페이지 주소  
<https://bounding-box-five.vercel.app/>

## 프로젝트 소개

바운딩 박스를 그리는 인터페이스를 제공하여 사용자가 객체 인식 작업을 더욱 효율적으로 수행할 수 있도록 도와줍니다.
<br/><br/>

## 바운딩 박스란?

데이터 라벨링은 인공지능이 학습할 수 있는 형태로 데이터를 가공하는 것입니다. 그중 객체 검출에서 가장 흔하게 사용되는 라벨링 방법 중 하나가 바운딩 박스입니다. 바운딩 박스는 객체 주변에 사각형 모양의 박스를 그리는 것으로, 이를 통해 인공지능은 사진 속에서 어떤 객체가 어디에 있는지 인식할 수 있게 됩니다.
<br/><br/>

## 프로젝트 목적

1. 사용자의 마우스 움직임과 연속적으로 발생하는 이벤트에 따른 빈번한 렌더링이 발생할 때, 이를 최적화하는 방법을 학습하고 구현해보는 것이 목표입니다.
2. 이번 프로젝트를 통해 타입스크립트를 처음 도입하게 되었는데, 타입스크립트의 장점과 이를 활용한 개발 방법을 경험하고자 합니다.
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
4. **이미지 축소/확대 및 이동 기능**
    - 마우스 위치에서 이미지를 축소/확대하여 더욱 정확한 바운딩 박스를 그릴 수 있으며, 이미지를 이동하여 원하는 위치에 바운딩 박스를 그릴 수 있습니다.
5. **되돌리기 기능**
    - 그려진 바운딩 박스를 수정하거나 삭제한 내용을 되돌릴 수 있습니다. 이전에 수행한 작업으로 되돌아갈 수 있습니다.
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

### 성능 최적화

-   사용자의 마우스 움직임과 연속적으로 발생하는 이벤트에 따른 빈번한 렌더링이 발생
    <br/><br/>

## 해결 방안

1. **이미지 캔버스와 라벨링 캔버스를 분리**
    - 구조
        ```
         📂canvas
         ┣ 📜ImageCanvas.tsx
         ┣ 📜LabelingCanvas.tsx
         ┗ 📜index.tsx
        ```
    - 이미지 캔버스와 라벨링 캔버스를 별도의 컴포넌트로 구성하여 index 컴포넌트에서 마우스 이벤트를 처리
    - useImperativeHandle을 사용하여 필요한 경우에만 해당 컴포넌트의 함수를 호출
    - 이렇게 함으로써 각각의 컴포넌트는 자신의 관심사에만 집중할 수 있게 되고, 코드의 가독성과 유지 보수성이 높아지는 장점
2. **useState와 useRef를 각각의 목적에 맞게 사용**

    - useRef 사용 사례

        - 이미지 이동 및 확대 : 상태 변경이 실시간으로 반영되어야 하지만, 다른 컴포넌트의 UI에 영향을 주지 않기 때문에 requestAnimationFrame을 사용하여 캔버스를 업데이트하는 방식으로 구현

    - useState 사용 사례
        - 바운딩 박스 정보 : 다른 컴포넌트에서 바운딩 박스 개수나 상태에 따라 특정 UI 요소를 표시하는 경우, 바운딩 박스 정보가 변경될 때마다 관련된 컴포넌트가 리렌더링되어 변경 사항을 즉시 반영

3. **React.memo를 사용한 컴포넌트 최적화**
    - React.memo로 컴포넌트를 최적화하여 마우스 이벤트로 인한 불필요한 렌더링을 줄이고 성능을 개선
      <br/><br/>

## 개선 사항

-   박스를 그리고 있을 때 렌더링 최적화 필요

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

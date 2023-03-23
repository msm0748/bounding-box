# 바운딩 박스

<http://43.201.20.178/>

## 프로젝트 소개

바운딩 박스를 그리는 인터페이스를 제공하여 사용자가 객체 인식 작업을 더욱 효율적으로 수행할 수 있도록 도와줍니다.

## 바운딩 박스란?

데이터 라벨링은 인공지능이 학습할 수 있는 형태로 데이터를 가공하는 것입니다. 그중 객체 검출에서 가장 흔하게 사용되는 라벨링 방법 중 하나가 바운딩 박스입니다. 바운딩 박스는 객체 주변에 사각형 모양의 박스를 그리는 것으로, 이를 통해 인공지능은 사진 속에서 어떤 객체가 어디에 있는지 인식할 수 있게 됩니다.

## 시작하게 된 계기

데이터 라벨링 사이트에서 라벨링 작업을 하면서 화면에서 도형을 그릴 수 있는 것이 신기했고, 이 기술이 어떻게 구현되는지 궁금해졌습니다.  
검색을 통해 Canvas라는 Web API를 알게 되었는데, 이 기술을 익히면 다양한 그래픽을 웹에서 구현할 수 있을 것 같아 이 프로젝트를 시작하게 되었습니다.

## 사용 기술

`React`, `TypeScript`, `Styled-Components`, `Canvas`

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

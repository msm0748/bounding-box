import { useEffect, useState } from 'react';
import Bounding from './components/bounding';
import styled from 'styled-components';

function App() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (/Android|iPhone/i.test(navigator.userAgent)) {
      setIsMobile(true);
    }
  }, []);
  return (
    <>
      {isMobile ? (
        <StyledContainer>
          <div>
            <span>죄송합니다만, 현재 이 사이트는 PC 환경에서만 이용 가능합니다.</span>
            <span>모바일 환경에서의 이용은 지원되지 않습니다.</span>
            <span>불편을 드려 죄송합니다.</span>
          </div>
        </StyledContainer>
      ) : (
        <Bounding />
      )}
    </>
  );
}

export default App;

const StyledContainer = styled.div`
  word-break: keep-all;
  text-align: center;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  span {
    display: block;
    margin-bottom: 10px;
    line-height: 20px;
  }
`;

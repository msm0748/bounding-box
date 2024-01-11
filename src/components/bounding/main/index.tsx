import { useCallback, useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import Canvas from './canvas';
import LeftBar from './LeftBar';
import RightBar from './RightBar';
import { INITIAL_POSITION, INITIAL_SIZE, MIN_SCALE, MAX_SCALE, ZOOM_SENSITIVITY, INITIAL_SCALE } from './defaults';
import useHistory from '../../../hooks/useHistory';
import test1 from '../../../assets/images/test1.jpg';
import test2 from '../../../assets/images/test2.jpg';
import test3 from '../../../assets/images/test3.jpg';

const categoryList = [
  {
    title: '강아지',
    color: 'rgb(0, 192, 108)',
  },
  {
    title: '고양이',
    color: 'rgb(255, 91, 208)',
  },
];

const imageList = [test1, test2, test3];

function Main() {
  const drawFnRef = useRef<() => void>();
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [canvasSize, setCanvasSize] = useState(INITIAL_SIZE);
  const [tool, setTool] = useState<Tool>('select');
  const [reset, setReset] = useState(false);
  const scaleRef = useRef(INITIAL_SCALE);
  const viewPosRef = useRef(INITIAL_POSITION);
  const [elements, setElements, undo, redo] = useHistory([]);
  const [selectedElement, setSelectedElement] = useState<ISelectedElement | null>(null);
  const [imageInfo, setImageInfo] = useState<IImageInfo | null>(null);
  const [hoveredBoxId, setHoverBoxId] = useState<number | undefined>();
  const [imageIndex, setImageIndex] = useState(0);

  // setting image
  useEffect(() => {
    const img = imageRef.current;
    img.src = imageList[imageIndex];
    img.onload = () => {
      const imageWidth = canvasSize.width;
      const imageHeight = (canvasSize.width * img.height) / img.width;
      const imagePosX = 0;
      const imagePosY = (canvasSize.height - imageHeight) / 2;
      const originalImageSize = { width: img.width, height: img.height };
      setImageInfo({
        src: img.src,
        x: imagePosX,
        y: imagePosY,
        width: imageWidth,
        height: imageHeight,
        originalImageSize,
      });
    };
  }, [canvasSize, imageIndex]);

  const updateCanvasSize = useCallback(({ width, height }: ISize) => {
    setCanvasSize({ width, height });
  }, []);

  const handleZoom = useCallback((type: Zoom) => {
    switch (type) {
      case 'zoomIn':
        if (scaleRef.current < MAX_SCALE) {
          scaleRef.current = scaleRef.current * ZOOM_SENSITIVITY;
        }
        break;
      case 'zoomOut':
        if (scaleRef.current > MIN_SCALE) {
          scaleRef.current = scaleRef.current / ZOOM_SENSITIVITY;
        }
        break;
      case 'reset':
        scaleRef.current = INITIAL_SCALE;
        break;
      default:
        break;
    }
  }, []);

  const setViewPosRef = useCallback(
    ({ x, y }: IPosition) => {
      const maxViewPosX = Math.min(Math.max(x, -(canvasSize.width * scaleRef.current)), canvasSize.width);
      const maxViewPosY = Math.min(Math.max(y, -(canvasSize.height * scaleRef.current)), canvasSize.height);

      viewPosRef.current = {
        x: maxViewPosX,
        y: maxViewPosY,
      };
    },
    [canvasSize]
  );

  const getDrawFn = useCallback((fn: () => void) => {
    drawFnRef.current = fn;
  }, []);

  const handleToolChange = useCallback((newTool: Tool) => {
    setTool(newTool);
  }, []);

  const setIsReset = useCallback(() => {
    setReset((prev) => !prev);
  }, []);

  const setElementHandler = useCallback((element: ISelectedElement | null) => {
    setSelectedElement(element);
  }, []);

  const highlightBox = useCallback((element: ISelectedElement | undefined) => {
    if (element) {
      setHoverBoxId(element.id);
    } else {
      setHoverBoxId(undefined);
    }
  }, []);

  useEffect(() => {
    const deleteElement = (e: KeyboardEvent) => {
      if (!selectedElement) return;
      const { id } = selectedElement;
      if (e.code === 'Delete' || e.code === 'Backspace') {
        setElements((elements) => elements.filter((element) => element.id !== id));
        setSelectedElement(null);
      }
    };
    document.addEventListener('keydown', deleteElement);
    return () => {
      document.removeEventListener('keydown', deleteElement);
    };
  }, [selectedElement, setElements, setSelectedElement]);

  useEffect(() => {
    const undoRedoFunction = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        setSelectedElement(null);
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    document.addEventListener('keydown', undoRedoFunction);
    return () => {
      document.removeEventListener('keydown', undoRedoFunction);
    };
  }, [undo, redo]);

  return (
    <StyledMain>
      <LeftBar
        tool={tool}
        onToolChange={handleToolChange}
        setIsReset={setIsReset}
        viewPosRef={viewPosRef}
        canvasSize={canvasSize}
        scaleRef={scaleRef}
        handleZoom={handleZoom}
        setViewPosRef={setViewPosRef}
        drawFnRef={drawFnRef}
      />
      <Canvas
        imageRef={imageRef}
        tool={tool}
        reset={reset}
        scaleRef={scaleRef}
        handleZoom={handleZoom}
        viewPosRef={viewPosRef}
        setViewPosRef={setViewPosRef}
        canvasSize={canvasSize}
        updateCanvasSize={updateCanvasSize}
        imageInfo={imageInfo}
        elements={elements}
        getDrawFn={getDrawFn}
        setElements={setElements}
        selectedElement={selectedElement}
        setElementHandler={setElementHandler}
        categoryList={categoryList}
        hoveredBoxId={hoveredBoxId}
        highlightBox={highlightBox}
      />
      <RightBar
        elements={elements}
        selectedElement={selectedElement}
        setElementHandler={setElementHandler}
        hoveredBoxId={hoveredBoxId}
        highlightBox={highlightBox}
        onToolChange={handleToolChange}
        categoryList={categoryList}
        setElements={setElements}
        imageList={imageList}
        imageIndex={imageIndex}
        setImageIndex={setImageIndex}
        setIsReset={setIsReset}
        imageInfo={imageInfo}
      ></RightBar>
    </StyledMain>
  );
}
export default Main;

const StyledMain = styled.main`
  display: flex;
  height: calc(100% - 48px);
`;

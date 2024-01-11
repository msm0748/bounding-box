import { useCallback, useState } from 'react';

const useHistory = (
  initialState: IElement[]
): [
  IElement[],
  (action: IElement[] | ((prevState: IElement[]) => IElement[]), overwrite?: boolean) => void,
  () => void,
  () => void
] => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([initialState]);

  const setState = useCallback(
    (action: IElement[] | ((prevState: IElement[]) => IElement[]), overwrite = false) => {
      const newState = typeof action === 'function' ? action(history[index]) : action;
      if (overwrite) {
        const historyCopy = [...history];
        historyCopy[index] = newState;
        setHistory(historyCopy);
      } else {
        const updatedState = [...history].slice(0, index + 1);
        const newHistory = [...updatedState, newState];
        if (newHistory.length > 15) {
          newHistory.shift();
          setIndex((prevState) => prevState - 1);
        }
        setHistory(newHistory);
        setIndex((prevState) => prevState + 1);
      }
    },
    [history, index]
  );

  const undo = () => index > 0 && setIndex((prevState) => prevState - 1);
  const redo = () => index < history.length - 1 && setIndex((prevState) => prevState + 1);

  return [history[index], setState, undo, redo];
};

export default useHistory;

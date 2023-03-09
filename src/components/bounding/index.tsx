import { useEffect, useState } from "react";
import Header from "./Header";
import Main from "./Main";
import Tutorial from "./Tutorial";

function Bounding() {
    const [isShowTutorial, setIsShowTutorial] = useState<boolean>(false);

    useEffect(() => {
        const preventDefault = (e: MouseEvent) => {
            e.preventDefault();
        };
        document.addEventListener("contextmenu", preventDefault, { passive: false });
        return () => {
            document.removeEventListener("contextmenu", preventDefault);
        };
    }, []);
    return (
        <>
            <Header setIsShowTutorial={setIsShowTutorial} />
            <Main />
            <Tutorial isShowTutorial={isShowTutorial} setIsShowTutorial={setIsShowTutorial}></Tutorial>
        </>
    );
}

export default Bounding;

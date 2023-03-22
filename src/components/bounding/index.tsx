import { useEffect, useState } from "react";
import Header from "./Header";
import Main from "./main";
import Tutorial from "./Tutorial";

function Bounding() {
    const [isShowTutorial, setIsShowTutorial] = useState<boolean>(true);
    const handleTutorialToggle = () => {
        setIsShowTutorial((prevState) => !prevState);
    };
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
            <Header handleTutorialToggle={handleTutorialToggle} />
            <Main />
            <Tutorial isShowTutorial={isShowTutorial} handleTutorialToggle={handleTutorialToggle}></Tutorial>
        </>
    );
}

export default Bounding;

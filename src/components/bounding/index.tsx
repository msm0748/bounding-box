import { useState } from "react";
import Header from "./Header";
import Main from "./main";
import Tutorial from "./Tutorial";

function Bounding() {
    const [isShowTutorial, setIsShowTutorial] = useState<boolean>(false);
    const handleTutorialToggle = () => {
        setIsShowTutorial((prevState) => !prevState);
    };
    return (
        <>
            <Header handleTutorialToggle={handleTutorialToggle} />
            <Main />
            <Tutorial isShowTutorial={isShowTutorial} handleTutorialToggle={handleTutorialToggle}></Tutorial>
        </>
    );
}

export default Bounding;

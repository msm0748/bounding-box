import { useEffect } from "react";
import Header from "./Header";
import Main from "./Main";

function Bounding() {
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
            <Header />
            <Main />
        </>
    );
}

export default Bounding;

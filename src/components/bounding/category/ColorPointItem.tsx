import StyledColorPoint from "./ColorPoint.style";
import { ICategory } from "../index.type";

function StyledCategoryItem({ title, color }: ICategory) {
    return (
        <>
            <StyledColorPoint color={color} />
            <div>{title}</div>
        </>
    );
}

export default StyledCategoryItem;

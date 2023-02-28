import { Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import { ICategory } from "../index.type";
import StyledCategoryItem from "./ColorPointItem";

interface Props extends ICategory {
    setCategory: Dispatch<SetStateAction<ICategory>>;
    setIsDropDown: Dispatch<SetStateAction<boolean>>;
}

const StyledItem = styled.li`
    display: flex;
    align-items: center;
    padding: 15px;
    &: hover {
        background: rgba(0, 0, 0, 0.04);
    }
`;

function CategoryItem({ title, color, setCategory, setIsDropDown }: Props) {
    const hadleOnClick = () => {
        setCategory({ title, color });
        setIsDropDown((prev) => !prev);
    };
    return (
        <>
            <StyledItem onClick={hadleOnClick}>
                <StyledCategoryItem title={title} color={color} />
            </StyledItem>
        </>
    );
}

export default CategoryItem;

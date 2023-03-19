import { useState } from "react";
import styled, { css } from "styled-components";
import StyledColorPoint from "./ColorPoint.style";
import CategoryItem from "./CategoryItem";

interface Props {
    category: ICategory;
    onChangeCategory: (selectedCategory: ICategory) => void;
    categoryList: ICategory[];
    isAbsolute?: boolean;
}

function Category({ category, onChangeCategory, categoryList, isAbsolute }: Props) {
    const [isDropDown, setIsDropDown] = useState(false);
    const handleDropDown = () => {
        setIsDropDown((prev) => !prev);
    };
    return (
        <StyledDropDownWrap isAbsolute={isAbsolute}>
            <StyledCategory onClick={handleDropDown}>
                <StyledBlock>
                    <StyledColorPoint color={category.color} />
                    <StyledSelect>{category.title}</StyledSelect>
                </StyledBlock>
                {isDropDown ? (
                    <svg width="16" height="16" fill="#fff" xmlns="http://www.w3.org/2000/svg" fillOpacity="1" viewBox="0 0 96 96">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M48 25a3 3 0 0 1 2.183.942l33 35a3 3 0 1 1-4.366 4.116L48 32.373 17.183 65.058a3 3 0 0 1-4.366-4.116l33-35A3 3 0 0 1 48 25Z"
                            fill="current"
                            fillOpacity="current"
                        ></path>
                    </svg>
                ) : (
                    <svg width="16" height="16" fill="#fff" xmlns="http://www.w3.org/2000/svg" fillOpacity="1" viewBox="0 0 96 96">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M48 71a3 3 0 0 1-2.183-.942l-33-35a3 3 0 1 1 4.366-4.116L48 63.627l30.817-32.685a3 3 0 0 1 4.366 4.116l-33 35A3 3 0 0 1 48 71Z"
                            fill="current"
                            fillOpacity="current"
                        ></path>
                    </svg>
                )}
            </StyledCategory>
            {isDropDown && (
                <StyledList>
                    {categoryList.map((category, index) => (
                        <CategoryItem
                            key={index}
                            title={category.title}
                            color={category.color}
                            onChangeCategory={onChangeCategory}
                            handleDropDown={handleDropDown}
                        ></CategoryItem>
                    ))}
                </StyledList>
            )}
        </StyledDropDownWrap>
    );
}
export default Category;

const StyledDropDownWrap = styled.div<{ isAbsolute?: boolean }>`
    ${(props) =>
        props.isAbsolute &&
        css`
            position: absolute;
            top: 8px;
            left: 8px;
        `}

    z-index: 100;
    font-size: 18px;
    & > * {
        border-radius: 8px;
        cursor: pointer;
    }
`;

const StyledCategory = styled.div`
    background: rgba(0, 0, 0, 0.87);
    color: #fff;
    display: flex;
    align-items: center;
    padding: 15px;
    display: flex;
    justify-content: space-between;
`;
const StyledSelect = styled.div`
    margin-right: 15px;
`;

const StyledList = styled.ul`
    background: #fff;
    box-shadow: rgb(0 0 0 / 7%) 0px 4px 16px;
`;
const StyledBlock = styled.div`
    display: flex;
    align-items: center;
`;

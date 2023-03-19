import styled from "styled-components";
import StyledColorPoint from "./ColorPoint.style";

interface Props extends ICategory {
    onChangeCategory: (selectedCategory: ICategory) => void;
    handleDropDown: () => void;
}

function CategoryItem({ title, color, onChangeCategory, handleDropDown }: Props) {
    const hadleOnClick = () => {
        onChangeCategory({ title, color });
        handleDropDown();
    };
    return (
        <>
            <StyledItem onClick={hadleOnClick}>
                <StyledColorPoint color={color} />
                <div>{title}</div>
            </StyledItem>
        </>
    );
}

export default CategoryItem;

const StyledItem = styled.li`
    display: flex;
    align-items: center;
    padding: 15px;
    &: hover {
        background: rgba(0, 0, 0, 0.04);
    }
`;

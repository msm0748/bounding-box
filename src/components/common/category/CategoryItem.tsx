import styled from "styled-components";
import ColorPoint from "./ColorPoint";

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
                <ColorPoint title={title} color={color} />
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

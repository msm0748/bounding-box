import StyledColorPoint from "./ColorPoint.style";

function ColorPoint({ title, color }: ICategory) {
    return (
        <>
            <StyledColorPoint color={color} />
            <div>{title}</div>
        </>
    );
}

export default ColorPoint;

import reset from "styled-reset";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
    ${reset}
    *{
        box-sizing: border-box;
        font-size: 16px;
    }
    *:before, *:after{
        display:none;
        content:"";
        position: absolute;
    }
    html{
        height: 100%;
    }
    body{
        height: 100%;
        overflow: hidden;
    }
    #root{
        height: 100%;
    }
    a{
        text-decoration: none;
        color: inherit;
    }
    button{
        cursor: pointer;
    }
    button, input,  optgroup, select, textarea{
        padding: 0;
        border: none;
        background: inherit;
        color: inherit;
    }
    ::-webkit-scrollbar {
        width: 6px;
    }
    ::-webkit-scrollbar-thumb {
        background: #ccc;
    }
    ::-webkit-scrollbar-track {
        background: #FFFFFF;
        border: 1px solid #D8D8D8;
    }
`;

export default GlobalStyle;

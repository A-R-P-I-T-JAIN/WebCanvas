export default function codeErrorreductionPrompt(code = "", error = "") {
  return `

  ${
    error &&
    `This is the error->  ${error}, you have to remove it form this-> ${code}`
  }

  I am providing you the code which can have some error in it your work is to make that code error free and return the error free code

  **Strictkly remove this type of error and misstake from the code ->> Expected ',' or '}' after property value in JSON at position **

  **Strictkly If error Contain -> "Rollup failed to resolve import" than there is wrong import remove that import line from the file immedietly  **

  -do not write any explanation, write directly the code which is error free
  -Remove errors like this -> Bad control character in string literal 
  -Remove errors like this -> Failed to resolve import and all the errors related to importing the components
  -Remove errors like this -> Fixing Expected ',' or '}' after property value in code
  -Remove errors like this -> Unexpected non-whitespace character
  - if ${"``` json ```"} is written in the code remove it and if not then do not add it in the code
  -check components in JavaScript/React files, always ensure that the component is exported as a default export (using export default) if it is being imported as a default import. Alternatively, if using named exports, ensure the import statement matches the exact name of the exported component.
  -check in main.jsx if it is importing main.css file then replace it with index.css file

  ### Syntax Rules:
  -Do not use $ {} for variable interpolation; use {} instead.
  -Example: Write {product.price} instead of $ {product.price}.
  -Do not create this type of error ->Failed to resolve import "./main.css" from "src/main.jsx". Does the file exist?
  -Do not create this type of error ->Expected ',' or '}' after property value in JSON at position 1996 (line 13 column 345) in the code 
  -Do not create this type of error ->ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot
  if ${"``` json ```"} is written in the code remove it and if not then do not add it in the code

  remove this error or this type of error from the code if its there  -> Bad control character in string literal in JSON at position 3648 (line 6 column 327)

  remove any backticks from the code if its there

  -check components in JavaScript/React files, always ensure that the component is exported as a default export (using export default) if it is being imported as a default import. Alternatively, if using named exports, ensure the import statement matches the exact name of the exported component.

  check if the code is in the proper JSON format or not if not then remove the code and write the same code with proper JSON format code

  -check components in JavaScript/React files, always ensure that the component is exported as a default export (using export default) if it is being imported as a default import. Alternatively, if using named exports, ensure the import statement matches the exact name of the exported component.


  ### replace this -> import React from 'react' with this -> "" from every where from the code if its there

  ### Do not import anything from the node_modules folder if its there remove it '@heroicons/react/


  **Do not create this type of output ** ->   {"import Header from "./components/Header.jsx";
  import Footer from "./components/Footer.jsx";
  import ProductCard from "./components/ProductCard.jsx";
  import Banner from "./components/Banner.jsx";
  
  function App() {
    return ();
  }
  
  export default App;
  '''javascript
  import Image from "next/image";
  
  function Banner() {
    return ();
  }
  
  export default Banner;
  '''javascript
  function Footer() {
    return ();
  }
  
  export default Footer;
  '''javascript
  import { Fragment } from "react";
  
  function Header() {
    return ();
  }
  
  export default Header;
  '''javascript
  function ProductCard() {
    return ();
  }
  
  export default ProductCard;
  '''javascript
  import React from "react";
  import ReactDOM from "react-dom/client";
  import App from "./App.jsx";
  import "./index.css";
  
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
  '''css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
   "}

  Here is the code which might have some error in it or may not :- 

  ${code}

 `;
}

/* @refresh reload */
import { render } from "solid-js/web";
import { Main } from "./Main";
import './index.css';

render(() => <Main />, document.getElementById("root") as HTMLElement);

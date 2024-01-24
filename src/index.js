import { init, filterTool } from "./ol";
import { menuControl } from "./ui";

window.onload = () => {
    init();
    filterTool();
    menuControl();
}

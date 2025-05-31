import { Config } from "./controller.js";
import { Renderer } from "./track.js";

function start(mainContainer: HTMLDivElement) {
    document.querySelector("title").innerText = 'Trackstar Overlay';

    let cfg = new Config();
    mainContainer.appendChild(new Renderer(cfg));

    cfg.refresh();
}

export { start };
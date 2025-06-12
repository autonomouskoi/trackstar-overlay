import { bus, enumName } from "/bus.js";
import * as tspb from "/m/trackstar/pb/trackstar_pb.js";
import * as overlaypb from "/m/trackstar-overlay/pb/overlay_pb.js";
import { Config } from "./controller.js";

const TOPIC_EVENT = enumName(tspb.BusTopic, tspb.BusTopic.TRACKSTAR_EVENT);

interface TU {
    deckId: string;
    when: bigint;
    track?: {
        artist: string;
        title: string;
    };
}

class TrackUpdate extends HTMLElement {
    private _dev_track: HTMLDivElement;

    constructor() {
        super();
        this.innerHTML = `
<div id="track" class="track">
    <div class="artist">AutonomousKoi</div>
    <div class="title">Trackstar</div>
</div>
`;
        this._dev_track = this.querySelector('#track');
    }

    set trackUpdate(tu: TU) {
        this._dev_track.classList.remove('fadeIn');
        this._dev_track.classList.add('fadeOut');
        this._dev_track.addEventListener('animationend', () => {
            let when = new Date(Number(tu.when) * 1000);
            this._dev_track.innerHTML = `
<div class="before-deck-id"></div>
<div class="deck-id">${tu.deckId}</div>
<div class="before-when"></div>
<time class="when">${when}</time>
<div class="before-artist"></div>
<div class="artist">${tu.track.artist}</div>
<div class="before-title"></div>
<div class="title">${tu.track.title}</div>
<div class="before-end"></div>
`;
            this._dev_track.classList.remove('fadeOut');
            this._dev_track.classList.add('fadeIn');
        }, { once: true });
    }
}
customElements.define('trackstar-overlay-track-update', TrackUpdate);


const DEFAULT_STYLE = `
/* fadeOut/fadeIn describe animations used below */
@keyframes fadeOut {
    0% {
        opacity: 1.0;
    }
    100% {
        opacity: 0.0;
    }
}
@keyframes fadeIn {
    0% {
        opacity: 0.0;
    }
    100% {
        opacity: 1.0;
    }
}
/* an element with the fadeIn class will go from fully transparent to fully
   opaque over 3 seconds
*/
.fadeIn {
    animation-duration: 3s;
    animation-name: fadeIn;
}
/* an element with the fadeOut class will go from fully opaque to fully
   transparent over 1 seconds
*/
.fadeOut {
    animation-duration: 1s;
    animation-name: fadeOut;
}
/* track is a box containing all the track details.
    - This box is 200 pixels wide
    - It reserves space below it that's half as tall as the text
    - Make the text big and bold
    - Use text-shadow to create a px outline
*/
.track {
    width: 200px;
    padding-bottom: 0.5rem;
    font-size: 48px;
    font-weight: bolder;
    text-shadow: #FFF 0px 0 2px;
}

/* The before- let you introduce things between values */
.before-deck-id, .before-when, .before-artist, .before-title, .before-end {
    display: none;
}

/* The deck ID is meaningless for most so it is hidden */
.deck-id {
    display: none;
}
/* The timestamp of when the track is played isn't useful to most so it's hidden */
.when {
    display: none;
}
/* The track's artist
    - The height of its box is height of one line of text
    - The box is very wide to reduce the chance of wrapping
*/
.artist {
    height: 1em;
    width: 100vw;
}
/* The track's title
    - Make the title italicized to differentiate it from the artist
    - The height of its box is height of one line of text
    - The box is very wide to reduce the chance of wrapping
*/
.title {
    font-style: italic;
    height: 1em;
    width: 100vw;
}
`;

class Renderer extends HTMLElement {
    private _customCSS: HTMLStyleElement;
    private _tuElem: TrackUpdate;

    constructor(cfg: Config) {
        super();

        let style = document.createElement('style');
        style.textContent = DEFAULT_STYLE;
        this.appendChild(style);

        this._customCSS = document.createElement('style');
        this.appendChild(this._customCSS);

        this._tuElem = new TrackUpdate();
        this.appendChild(this._tuElem);

        cfg.subscribe((newCfg) => this._onConfigUpdated(newCfg));

        bus.subscribe(TOPIC_EVENT, (msg) => {
            if (msg.type !== tspb.MessageTypeEvent.TRACK_UPDATE) {
                return;
            }
            this._onTrackUpdate(tspb.TrackUpdate.fromBinary(msg.message));
        });
    }

    private _onConfigUpdated(cfg: overlaypb.Config) {
        if (cfg.customCss != this._customCSS.textContent) {
            this._customCSS.textContent = cfg.customCss;
        }
    }

    private _onTrackUpdate(tu: tspb.TrackUpdate) {
        this._tuElem.trackUpdate = tu;
    }
}
customElements.define('trackstar-overlay-default-renderer', Renderer);

export { Renderer };
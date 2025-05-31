import { Config } from "./controller.js";

function start(mainContainer: HTMLElement) {
    mainContainer.innerHTML = `
<h1>Trackstar Overlay Custom CSS</h1>
<textarea id="custom-css"
    style="display: block"
    cols="60"
    rows="20"
    autocorrect="off"
    autofocus="true"
    spellcheck="false"
></textarea>
<label for="color-picker">Handy Color Picker</label> <input type="color" id="color-picker"/>
<button>Save</button>
`;
    let customCSS = mainContainer.querySelector('textarea');
    // allow tabs in the textarea
    // https://stackoverflow.com/questions/6637341/use-tab-to-indent-in-textarea?page=1&tab=scoredesc#tab-top
    customCSS.addEventListener('keydown', (e) => {
        if (e.key != 'Tab') {
            return;
        }
        e.preventDefault();
        let start = customCSS.selectionStart;
        let end = customCSS.selectionEnd;
        customCSS.value = customCSS.value.substring(0, start) + '\t' + customCSS.value.substring(end);
        customCSS.selectionStart = customCSS.selectionEnd = start + 1;
    });

    let colorLabel = mainContainer.querySelector('label') as HTMLLabelElement;
    let colorInput = mainContainer.querySelector('input') as HTMLInputElement;
    colorInput.addEventListener('change', () => {
        if (!navigator.clipboard) {
            return;
        }
        navigator.clipboard.writeText(colorInput.value).then(() => {
            let originalText = colorLabel.innerText;
            colorLabel.innerText = 'Color copied!';
            setTimeout(() => { colorLabel.innerText = originalText }, 5000);
        });
    });

    let saveButton = mainContainer.querySelector('button');
    saveButton.disabled = true;

    let cfg = new Config();
    customCSS.value = cfg.last.customCss;
    cfg.subscribe((newCfg) => {
        customCSS.value = newCfg.customCss;
        saveButton.disabled = false;
    });

    saveButton.addEventListener('click', () => {
        saveButton.disabled = true;
        let newCfg = cfg.last.clone();
        newCfg.customCss = customCSS.value;
        cfg.save(newCfg);
    });
    cfg.refresh();
}

export { start };
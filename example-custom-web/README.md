# Custom Overlay

`trackstar-overlay` allows you to build fully-customized overlay renderers. All
content in `AutonomousKoi/plugins/data/trackstar-overlay/custom-web/` is served
at `/m/trackstar-overlay/custom-web/` by the AK web service. The renderer has
full access to the AK bus via websocket and can subscribe to any topic.

## Entry point

The included `index.html` will load a `custom-overlay.js` from the same directory
and call an exported `start(HTMLDivElement)` function. The `HTMLDivElement` will
be a `div` element in the overlay document. The `start()` function may also take
control of the document.

That `start()` function is expected to return a callback that accepts a `TrackUpdate`.
The `index.html` will subscribe to the topic for track updates and invoke this
callback whenever a new `TrackUpdate` is available.
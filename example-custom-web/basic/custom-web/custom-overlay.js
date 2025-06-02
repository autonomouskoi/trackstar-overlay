function start(container) {
    document.querySelector('title').innerText = 'Custom Overlay';
    return (tu) => {
        let track = document.createElement('div');
        track.style.paddingBottom = '1em';
        let artist = document.createElement('div');
        artist.innerText = tu.track.artist;
        let title = document.createElement('div');
        title.innerText = tu.track.title;
        title.style.fontStyle = 'italic';
        track.appendChild(artist);
        track.appendChild(title);
        container.insertBefore(track, container.firstChild);
        // should probably remove elements beyond the newest n
    };
}
export { start };


export function flashBrowserMessage(message, typeClass) {

    // Get the browser message div element.
    let browserMessageDiv = document.querySelector('.browser-message');

    // Create the browser message div element if it doesn't exist.
    if (!browserMessageDiv) {
        document.body.insertAdjacentHTML('afterbegin', `
            <div class="browser-message">
                <p></p>
            </div>
        `);
        browserMessageDiv = document.querySelector('.browser-message');
    }

    // Get the paragraph element within the div.
    const browserMessage = browserMessageDiv.querySelector('p');

    // Set the style and message.
    browserMessage.innerHTML = message;
    browserMessage.classList = typeClass;

    // Animate the div.
    browserMessageDiv.classList.remove('animating');
    void browserMessageDiv.offsetWidth;
    browserMessageDiv.classList.add('animating');
}

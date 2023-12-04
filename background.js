chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: 'OFF'
  });
});

// When the user clicks on the extension action
chrome.action.onClicked.addListener(async (tab) => {
  // We retrieve the action badge to check if the extension is 'ON' or 'OFF'
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  // Next state will always be the opposite
  const nextState = prevState === 'ON' ? 'OFF' : 'ON';

  // Set the action badge to the next state
  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState
  });

  if (nextState === 'ON') {
    // Insert the CSS file when the user turns the extension on
    await chrome.scripting.insertCSS({
      files: ['style.css'],
      target: { tabId: tab.id }
    });
    // get all the textarea in the document
    const textareas = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const textAreas = document.querySelectorAll('textarea');

        textAreas.forEach((textarea) => {
          // textarea.value += 'text area 🤩';
          // add an html element before the textarea
          const unlistedItems = document.createElement('ul');
          unlistedItems.id = 'chrome-extension-unlisted-items';
          unlistedItems.innerHTML = `
          <label for="emoji-search">Search:</label>
        <input id="emoji-search" class="">
        <button id="emoji-search-button">Search</button>
        <li id="chrome-extension-emojis"><emoji>🎄</emoji> Tree </li>
        <li id="chrome-extension-emojis"><emoji>❤️</emoji> heart </li>
        <li id="chrome-extension-emojis"><emoji>✨</emoji> stars </li>
        <li id="chrome-extension-emojis"><emoji>🎁</emoji> box</li>
        `;
          textarea.parentNode.insertBefore(unlistedItems, textarea);
        });

        let elements = document.querySelectorAll("#chrome-extension-unlisted-items > li");
        elements.forEach(element => {
          element.addEventListener("click", event => {
            textarea = event.target.parentElement.parentElement.querySelector("textarea");
            textarea.value += event.target.querySelector("emoji").innerText;
          });
        });
      }
    });
  } else if (nextState === 'OFF') {
    // Remove the CSS file when the user turns the extension off
    await chrome.scripting.removeCSS({
      files: ['style.css'],
      target: { tabId: tab.id }
    });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const unlistedItems = document.getElementById('chrome-extension-unlisted-items');
        unlistedItems.remove();
      }
    });
  }

});

// import access key file 
import { access_key } from "./access_key.js";

async function addEmojiList(tab, query, emojis, onlyCSS) {

  // Insert the CSS file when the user turns the extension on
  await chrome.scripting.insertCSS({
    files: ['style.css'],
    target: { tabId: tab.id }
  });

  if (onlyCSS) {
    return;
  }

  let emojiText = "";
  if (!query) {
    query = "";
  } 
  if (!emojis) {
    emojis = [];
  } else {
    emojis.forEach(emoji => {
      emojiText += `<li id="chrome-extension-emojis"><emoji>${emoji.character}</emoji> ${emoji.unicodeName}</li>`;
    });
  } 
  // get all the textarea in the document
  const textareas = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (query, emojiText) => {
      const textAreas = document.querySelectorAll('textarea');
      
      textAreas.forEach((textarea) => {
        // textarea.value += 'text area 🤩';
        // add an html element before the textarea
        const unlistedItems = document.createElement('ul');
        unlistedItems.id = 'chrome-extension-unlisted-items';
        unlistedItems.innerHTML = `
        <label for="emoji-search">Search:</label>
      <input id="emoji-search" class="">${query}</input>
      <button id="emoji-search-button">Search</button>`;

      let defaultEmojis = "";
      if (emojiText.length === 0) {
      defaultEmojis = `<li id="chrome-extension-emojis"><emoji>🎄</emoji> Tree </li>
      <li id="chrome-extension-emojis"><emoji>❤️</emoji> heart </li>
      <li id="chrome-extension-emojis"><emoji>✨</emoji> stars </li>
      <li id="chrome-extension-emojis"><emoji>🎁</emoji> box</li>
      `
      } else {
        defaultEmojis = emojiText;
      }
      unlistedItems.innerHTML += defaultEmojis;



        textarea.parentNode.insertBefore(unlistedItems, textarea);
      });

      let elements = document.querySelectorAll("#chrome-extension-unlisted-items > li");
      elements.forEach(element => {
        element.addEventListener("click", event => {
          textarea = event.target.parentElement.parentElement.querySelector("textarea");
          textarea.value += event.target.querySelector("emoji").innerText;
        });
      });
    },
    args: [query, emojiText]
  });
}

async function removeEmojiList(tab){
  // Remove the CSS file when the user turns the extension off
  await chrome.scripting.removeCSS({
    files: ['style.css'],
    target: { tabId: tab.id }
  });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const unlistedItems = document.getElementById('chrome-extension-unlisted-items');
      if (unlistedItems) unlistedItems.remove();
    }
  });
}

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
    addEmojiList(tab);
  } else if (nextState === 'OFF') {
    removeEmojiList(tab);
  }

});


// background script
chrome.runtime.onMessage.addListener(function (message, sender, senderResponse) {
  if (message.type === "emoji") {
    let myHeaders = new Headers();
    let requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
    fetch(`https://emoji-api.com/emojis?search=${message.query}&access_key=${access_key}`, requestOptions)
      .then(response => response.json())
      .then(result => {
        // get only the first 5 emojis
        result = result.slice(0, 5);
        addEmojiList(sender.tab, message.query, result, message.onlyCSS);
        senderResponse(result);
      })
      .catch(error => console.log('error', error));
  } else if (message.type === "remove-emoji") {
    removeEmojiList(sender.tab);
  }

  return true
});
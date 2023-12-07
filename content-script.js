console.log("content script running");
// get all text areas in the page 
const textareas = document.querySelectorAll('textarea');
// loop through all text areas
textareas.forEach((textarea) => {
  textarea.addEventListener("input", (event) => {
    console.log("Input event", event)

    // get the text area value
    const textAreaValue = event.target.value;

    // check if latest element is : 
    const lastElement = textAreaValue.lastIndexOf(":");
    // Check if ":" is found in the string
    if (lastElement !== -1) {
      // Extract the text after ":"
      const textArray = textAreaValue.substring(lastElement + 1).trim().split(" ");
      if (textArray.length > 1 || textArray[0] === "") {
        // chrome.runtime.sendMessage(
        //   { type: 'remove-emoji'}, response => {
        //     console.log(response)
        // })
        const unlistedItems = document.getElementById('chrome-extension-unlisted-items');
        if (unlistedItems) unlistedItems.remove();
        return;
      }
      let latestText = textArray[0];
      console.log(latestText)
      chrome.runtime.sendMessage(
        { type: 'emoji', query: latestText, onlyCSS: true }, response => {
          console.log(response)
          if(response) {
            addEmojiList(latestText, response, event.target);
          } else {
            document.querySelector("#chrome-extension-unlisted-items")?.remove();
          }
          
        })
    }
  });
});

function addEmojiList(query, emojis, target) {
  let emojiText = `<li id="chrome-extension-emojis"><emoji>🎄</emoji> Tree </li>
  <li id="chrome-extension-emojis"><emoji>❤️</emoji> heart </li>
  <li id="chrome-extension-emojis"><emoji>✨</emoji> stars </li>
  <li id="chrome-extension-emojis"><emoji>🎁</emoji> box</li>
  `;

  if (emojis) {
    emojiText = "";
    emojis.forEach(emoji => {
      let textOnly = emoji.unicodeName.replace(/^E\d+.\d+/g, "");
      emojiText += `<li id="chrome-extension-emojis"><emoji>${emoji.character}</emoji> ${textOnly}</li>`;
    })
  };
  
  const textAreas = [target];
  target.parentElement.querySelector("#chrome-extension-unlisted-items")?.remove();
  textAreas.forEach((textarea) => {
    // textarea.value += 'text area 🤩';
    // add an html element before the textarea
    const unlistedItems = document.createElement('ul');
    unlistedItems.id = 'chrome-extension-unlisted-items';
    unlistedItems.innerHTML = `
      <label for="emoji-search">Search:</label>
    <input id="emoji-search" class="">${query}</input>
    <button id="emoji-search-button">Search</button>`;

    unlistedItems.innerHTML += emojiText;

    textarea.parentNode.insertBefore(unlistedItems, textarea);
  });

  let elements = document.querySelectorAll("#chrome-extension-unlisted-items > li");
  elements.forEach(element => {
    element.addEventListener("click", event => {
      let theEmoji = "";
      if (event.target.tagName === "EMOJI") {
        theEmoji = event.target.innerText;
      } else {
        theEmoji = event.target.querySelector("emoji").innerText;
      } 
      
      textarea = event.target.closest("#chrome-extension-unlisted-items").parentElement.querySelector("textarea");
      textarea.value = textarea.value.replace(`:${query}`, theEmoji);
      element.parentElement.remove();
    });
  });
}
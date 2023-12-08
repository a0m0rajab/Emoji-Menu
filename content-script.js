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
    let coordinates = getCaretCoordinates(target, target.selectionEnd);
    let element = target;

    // textarea.value += 'text area 🤩';
    // add an html element before the textarea
    const unlistedItems = document.createElement('ul');
    unlistedItems.id = 'chrome-extension-unlisted-items';


    unlistedItems.innerHTML += emojiText;

    textarea.parentNode.insertBefore(unlistedItems, textarea);
    unlistedItems.style.top = element.offsetTop
          - element.scrollTop
          + coordinates.top
          + 'px';
    unlistedItems.style.left = element.offsetLeft
          - element.scrollLeft
          + coordinates.left 
          + 'px';
    unlistedItems.firstChild.focus();
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

// The properties that we copy into a mirrored div.
// Note that some browsers, such as Firefox,
// do not concatenate properties, i.e. padding-top, bottom etc. -> padding,
// so we have to do every single property specifically.
var properties = [
  'boxSizing',
  'width',  // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
  'height',
  'overflowX',
  'overflowY',  // copy the scrollbar for IE

  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',

  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',

  // https://developer.mozilla.org/en-US/docs/Web/CSS/font
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'lineHeight',
  'fontFamily',

  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration',  // might not make a difference, but better be safe

  'letterSpacing',
  'wordSpacing'
];

let isFirefox = !(window.mozInnerScreenX == null);
let mirrorDiv, computed, style;

getCaretCoordinates = function (element, position) {
  // mirrored div
  mirrorDiv = document.getElementById(element.nodeName + '--mirror-div');
  if (!mirrorDiv) {
    mirrorDiv = document.createElement('div');
    mirrorDiv.id = element.nodeName + '--mirror-div';
    document.body.appendChild(mirrorDiv);
  }

  style = mirrorDiv.style;
  computed = getComputedStyle(element);

  // default textarea styles
  style.whiteSpace = 'pre-wrap';
  if (element.nodeName !== 'INPUT')
    style.overflowWrap = 'break-word';  // only for textarea-s

  // position off-screen
  style.position = 'absolute';  // required to return coordinates properly
  style.top = element.offsetTop + parseInt(computed.borderTopWidth) + 'px';
  style.left = "400px";
  style.visibility = 'hidden';  // not 'display: none' because we want rendering

  // transfer the element's properties to the div
  properties.forEach(function (prop) {
    style[prop] = computed[prop];
  });

  if (isFirefox) {
    style.width = parseInt(computed.width) - 2 + 'px'  // Firefox adds 2 pixels to the padding - https://bugzilla.mozilla.org/show_bug.cgi?id=753662
    // Firefox lies about the overflow property for textareas: https://bugzilla.mozilla.org/show_bug.cgi?id=984275
    if (element.scrollHeight > parseInt(computed.height))
      style.overflowY = 'scroll';
  } else {
    style.overflow = 'hidden';  // for Chrome to not render a scrollbar; IE keeps overflowY = 'scroll'
  }  

  mirrorDiv.textContent = element.value.substring(0, position);
  // the second special handling for input type="text" vs textarea: spaces need to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
  if (element.nodeName === 'INPUT')
    mirrorDiv.textContent = mirrorDiv.textContent.replace(/\s/g, "\u00a0");

  var span = document.createElement('span');
  // Wrapping must be replicated *exactly*, including when a long word gets
  // onto the next line, with whitespace at the end of the line before (#7).
  // The  *only* reliable way to do that is to copy the *entire* rest of the
  // textarea's content into the <span> created at the caret position.
  // for inputs, just '.' would be enough, but why bother?
  span.textContent = element.value.substring(position) || '.';  // || because a completely empty faux span doesn't render at all
  span.style.backgroundColor = "lightgrey";
  mirrorDiv.appendChild(span);

  var coordinates = {
    top: span.offsetTop + parseInt(computed['borderTopWidth']),
    left: span.offsetLeft + parseInt(computed['borderLeftWidth'])
  };

  return coordinates;
}

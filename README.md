# emoji-chrome-extension
emoji-chrome-extension

Based on the https://developer.chrome.com/docs/extensions/mv3/getstarted/tut-focus-mode/ tutorial.

## To do: 

- Consume the emoji API, it needs to solve the CORS issue by having a server or something to work around it. Solved by using the background script
- add the search functionality, it's related to the API, we implemented this in the text input
- Improve the UI  to have something nice, we are kind of fine. 
- check the CTR+B option, it's working
- integrate the extension with the textarea and have an event listener for the two dots and enable the search for that, done yesterday.
- add the support for input fields
- the input event listener is working in the page but not in the content scripts.
- add white and black list for the extension
- improve the list and show only one list instead of multiple ones. 
- check the focus after creating the elemenet, and keyboard change
- add the list items after the text area cursor 
- focus on the input area after choosing the emoji
- add a white and black list websites for the extension 
- check if you have multiple emojis with the same text.
- handle twitter logic 
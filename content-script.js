console.log("content script running");
// get all text areas in the page 
const textareas = document.querySelectorAll('textarea');
// loop through all text areas
textareas.forEach((textarea) => {
  textarea.addEventListener("input", (event) => {

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
        { type: 'emoji', query: latestText }, response => {
          console.log(response)
        })
    }
  });
});
console.log("content script running");
// get all text areas in the page 
const textareas = document.querySelectorAll('textarea');
// loop through all text areas
textareas.forEach((textarea) => {
  textarea.addEventListener("input", (event) => {
    // get the text area value
    const textAreaValue = event.target.value;
    // check if latest element is : 
    const lastElement = textAreaValue[textAreaValue.length - 1];
    if (lastElement === ":") console.log("emoji time")
  });
});
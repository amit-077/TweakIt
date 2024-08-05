window.addEventListener("load", async () => {
  try {
    let localFile = chrome.runtime.getURL("injectedPage.html");
    console.log(localFile);
    let fileData = await fetch(localFile);
    const htmlContent = await fileData.text();
    const containerDiv = document.createElement("div");
    containerDiv.innerHTML = htmlContent;
    document.body.appendChild(containerDiv);

    function loadFonts() {
      const fontLink1 = document.createElement("link");
      fontLink1.rel = "preconnect";
      fontLink1.href = "https://fonts.googleapis.com";
      const fontLink2 = document.createElement("link");
      fontLink2.rel = "preconnect";
      fontLink2.href = "https://fonts.gstatic.com";
      fontLink2.crossOrigin = "anonymous";
      const fontLink3 = document.createElement("link");
      fontLink3.rel = "stylesheet";
      fontLink3.href =
        "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap";

      document.head.appendChild(fontLink1);
      document.head.appendChild(fontLink2);
      document.head.appendChild(fontLink3);
    }

    // Css file attach and fonts too.
    const cssLink = document.createElement("link");
    cssLink.href = chrome.runtime.getURL("styles.css");
    cssLink.rel = "stylesheet";
    document.head.appendChild(cssLink);

    loadFonts();

    let xyz = document.getElementById("draggable");
    xyz.style.display = "none";

    // toggle to show when clicked on extension icon
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "toggleModal") {
        console.log("Toggle modal message received"); // Debug log

        const draggable = document.getElementById("draggable");
        if (draggable) {
          if (draggable.style.display === "none") {
            draggable.style.display = "block";
          } else {
            draggable.style.display = "none";
          }
        }
      }
    });

    // Javascript code

    let draggable = document.getElementById("draggable");

    let offsetX, offsetY;
    let isDragging = false;

    // Mouse down event to start dragging
    draggable.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - draggable.getBoundingClientRect().left;
      offsetY = e.clientY - draggable.getBoundingClientRect().top;
    });

    // Mouse move event to update position while dragging
    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        draggable.style.left = `${e.clientX - offsetX}px`;
        draggable.style.top = `${e.clientY - offsetY}px`;
      }
    });

    // Mouse up event to stop dragging
    document.addEventListener("mouseup", () => {
      isDragging = false;
    });

    // ***************************************************************************************************************

    // Global variables

    let cursorSelected = false;
    let overlay = document.createElement("div");
    // let selectedElement = null;
    let selectedElements = [];
    let previousElement = null;
    let changeHistory = [];

    // Style the overlay element
    overlay.style.position = "absolute";
    overlay.style.backgroundColor = "rgba(164, 235, 239, 0.5)"; // Light blue with 50% opacity
    overlay.style.pointerEvents = "none"; // Allow clicks to pass through
    overlay.style.zIndex = "9999"; // Ensure it's on top

    // HTML File Javascript events

    // Click escape button to dis-select cursor

    const undoButton = document.getElementById("undoButton");
    undoButton.disabled = true;

    function updateUndoButtonState() {
      undoButton.disabled = !cursorSelected || changeHistory.length === 0;
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && cursorSelected === true) {
        cursorSelected = false;
        selectedElements = [];
        document.removeEventListener("mouseover", handleMouseOver);
        document.removeEventListener("click", handleClick, true); // Capture phase to prevent clicks
        document.getElementById("selectIcon").style.backgroundColor =
          "transparent";

        if (previousElement) {
          previousElement.style.outline = ""; // Remove border from previously selected element when cursor is deselected
        }
        overlay.remove(); // Remove the overlay

        updateUndoButtonState();
      }
    });

    // To give background color to selected element

    document.addEventListener("click", (e) => {
      if (cursorSelected) {
        let whatColor = e.target.classList[0];
        let selectedColor = e.target.classList[1];
        if (whatColor === "colorToSelect") {
          selectedElements.forEach((el) => {
            changeHistory.push({
              element: el,
              previousColor: el.style.color,
              previousBgColor: el.style.backgroundColor,
              previousBorderColor: el.style.borderColor,
            });
            el.style.color = selectedColor;
          });
        } else if (whatColor === "bgColorToSelect") {
          selectedElements.forEach((el) => {
            changeHistory.push({
              element: el,
              previousColor: el.style.color,
              previousBgColor: el.style.backgroundColor,
              previousBorderColor: el.style.borderColor,
            });
            el.style.backgroundColor = selectedColor;
          });
        } else if (whatColor === "borderColorToSelect") {
          selectedElements.forEach((el) => {
            changeHistory.push({
              element: el,
              previousColor: el.style.color,
              previousBgColor: el.style.backgroundColor,
              previousBorderColor: el.style.borderColor,
            });
            el.style.borderColor = selectedColor;
          });
        }

        updateUndoButtonState();
      }
    });

    document.getElementById("selectIconDiv").addEventListener("click", () => {
      // To change color of cursor if selecte by user.
      if (!cursorSelected) {
        cursorSelected = true;
        document.getElementById("selectIcon").style.backgroundColor =
          "rgba(135, 206, 235, 0.3)";
      } else {
        console.log("Removed cursor option");
        cursorSelected = false;
        document.getElementById("selectIcon").style.backgroundColor =
          "transparent";
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }

      // To change color of elements on hovered by user.
      if (cursorSelected) {
        document.addEventListener("mouseover", handleMouseOver);
        document.addEventListener("click", handleClick, true); // Capture phase to prevent clicks
      } else {
        document.removeEventListener("mouseover", handleMouseOver);
        document.removeEventListener("click", handleClick, true); // Capture phase to prevent clicks

        // if (previousElement) {
        //   previousElement.style.border = ""; // Remove border from previously selected element when cursor is deselected
        // }
        // overlay.remove(); // Remove the overlay
        selectedElements.forEach((el) => (el.style.outline = "")); // Remove border from all selected elements when cursor is deselected
        selectedElements = [];
        overlay.remove(); // Remove the overlay
      }

      updateUndoButtonState();
    });

    function handleMouseOver(e) {
      if (cursorSelected && !e.target.classList.contains("doNotTargetIt")) {
        let rect = e.target.getBoundingClientRect();
        let scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        let scrollLeft =
          window.pageXOffset || document.documentElement.scrollLeft;
        overlay.style.width = rect.width + "px";
        overlay.style.height = rect.height + "px";
        overlay.style.top = rect.top + scrollTop + "px";
        overlay.style.left = rect.left + scrollLeft + "px";

        if (!overlay.parentNode) {
          document.body.appendChild(overlay);
        }
      }
    }

    function handleClick(e) {
      if (cursorSelected && !e.target.classList.contains("doNotTargetIt")) {
        e.preventDefault();
        e.stopPropagation();
        if (!e.ctrlKey) {
          selectedElements.forEach((el) => (el.style.outline = "")); // Remove border from previously selected elements
          selectedElements = [];
        }

        let elementIndex = selectedElements.indexOf(e.target);
        if (elementIndex > -1) {
          // Element is already selected, remove it
          selectedElements[elementIndex].style.outline = "";
          selectedElements.splice(elementIndex, 1);
        } else {
          // Add the new element to the selection
          selectedElements.push(e.target);
          e.target.style.outline = "1px solid #A7E6FF";
        }

        previousElement = e.target;
      }
    }

    document
      .getElementById("chooseAnyBgColor")
      .addEventListener("input", (e) => {
        let bgColor = e.target.value;
        selectedElements.forEach((el) => {
          changeHistory.push({
            element: el,
            previousColor: el.style.color,
            previousBgColor: el.style.backgroundColor,
            previousBorderColor: el.style.borderColor,
          });
          el.style.backgroundColor = bgColor;
        });

        // Create a new color box dynamically
        let newMainBgColorDiv = document.createElement("div");
        newMainBgColorDiv.className = "doNotTargetIt";
        let newColorDiv = document.createElement("div");
        newColorDiv.style.border = "1px solid #333";
        newColorDiv.className = `bgColorToSelect ${bgColor} doNotTargetIt`;
        newColorDiv.style.backgroundColor = bgColor;

        let deleteButton = document.createElement("button");
        deleteButton.className = "doNotTargetIt";
        deleteButton.innerText = "x";
        deleteButton.style.marginLeft = 0;
        deleteButton.style.backgroundColor = "transparent";
        deleteButton.style.cursor = "pointer";
        deleteButton.style.color = "#000";
        deleteButton.style.padding = 0;
        deleteButton.style.paddingLeft = "5px";
        deleteButton.style.paddingRight = "5px";
        deleteButton.style.borderRadius = "20px";
        deleteButton.style.display = "flex";
        deleteButton.style.alignItems = "center";
        deleteButton.style.justifyContent = "center";
        deleteButton.style.transform = "scale(0.8)";
        deleteButton.style.border = "0.5px solid #ccc";

        newMainBgColorDiv.appendChild(newColorDiv);
        newMainBgColorDiv.appendChild(deleteButton);
        newMainBgColorDiv.style.display = "flex";
        newMainBgColorDiv.style.alignItems = "center";
        newMainBgColorDiv.style.marginBottom = "8px";

        // Append the new color box to the grid
        document.getElementById("bgColorsGrid").appendChild(newMainBgColorDiv);

        // Add event listener to delete button
        deleteButton.addEventListener("click", (event) => {
          event.stopPropagation();
          newMainBgColorDiv.remove(); // Remove the entire main div
        });

        // Trigger click event on the new color box to select it
        newColorDiv.click();
        updateUndoButtonState();
      });

    document.getElementById("chooseAnyColor").addEventListener("input", (e) => {
      let normalColor = e.target.value;
      selectedElements.forEach((el) => {
        changeHistory.push({
          element: el,
          previousColor: el.style.color,
          previousBgColor: el.style.backgroundColor,
          previousBorderColor: el.style.borderColor,
        });
        el.style.color = normalColor;
      });

      let newMainColorDiv = document.createElement("div");
      newMainColorDiv.className = "doNotTargetIt";
      let newColorDiv = document.createElement("div");
      newColorDiv.style.border = "1px solid #333";
      newColorDiv.className = `colorToSelect ${normalColor} doNotTargetIt`;
      newColorDiv.style.backgroundColor = normalColor;

      let deleteButton = document.createElement("button");
      deleteButton.className = "doNotTargetIt";
      deleteButton.innerText = "x";
      deleteButton.style.marginLeft = 0;
      deleteButton.style.backgroundColor = "transparent";
      deleteButton.style.cursor = "pointer";
      deleteButton.style.color = "#000";
      deleteButton.style.padding = 0;
      deleteButton.style.paddingLeft = "5px";
      deleteButton.style.paddingRight = "5px";
      deleteButton.style.borderRadius = "20px";
      deleteButton.style.display = "flex";
      deleteButton.style.alignItems = "center";
      deleteButton.style.justifyContent = "center";
      deleteButton.style.transform = "scale(0.8)";
      deleteButton.style.border = "0.5px solid #ccc";

      newMainColorDiv.appendChild(newColorDiv);
      newMainColorDiv.appendChild(deleteButton);
      newMainColorDiv.style.display = "flex";
      newMainColorDiv.style.alignItems = "center";
      newMainColorDiv.style.marginBottom = "8px";

      // Append the new color box to the grid
      document.getElementById("colorsGrid").appendChild(newMainColorDiv);

      // Add event listener to delete button
      deleteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        newMainColorDiv.remove(); // Remove the entire main div
      });

      // Trigger click event on the new color box to select it
      newColorDiv.click();

      updateUndoButtonState();
    });

    // Close modal

    document.getElementById("closeModal").addEventListener("click", () => {
      document.getElementById("draggable").style.display = "none";
    });

    document.getElementById("undoButton").addEventListener("click", () => {
      if (changeHistory.length > 0) {
        let lastChange = changeHistory.pop();
        lastChange.element.style.color = lastChange.previousColor;
        lastChange.element.style.backgroundColor = lastChange.previousBgColor;
        lastChange.element.style.borderColor = lastChange.previousBorderColor;
        updateUndoButtonState();
      }
    });

    function removeOverlayFromAllElements() {
      document.querySelectorAll(".overlay").forEach((el) => {
        el.classList.remove("overlay");
      });
    }

    draggable.addEventListener("mouseover", () => {
      removeOverlayFromAllElements();
      overlay.remove(); // Remove overlay when hovering over the draggable modal
    });
  } catch (e) {
    console.log(e);
  }
});

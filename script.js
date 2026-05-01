$(function() { // Makes sure that your function is called once all the DOM elements of the page are ready to be used.
    
  // Check and Update Pet Info in HTML when the page loads
  checkAndUpdatePetInfoInHtml();
  
  // When each button is clicked, it will "call" function for that button
  $('.treat-button').click(clickedTreatButton);
  $('.play-button').click(clickedPlayButton);
  $('.exercise-button').click(clickedExerciseButton);
  $('.drip-button').click(clickedDripButton);

  // Run startup logs in Chrome DevTools
  runStarupLogs();
})

// Pet Info Object
var pet_info = { 
    name: "Hound The Cat",
    weight: 5,
    happiness: 5,
    style: 5
}

// Global variables
var notificationActive = false;
var currentNotificationPriority = 0;
var lastAction = null; 

// Track Stat Limits 
var shownLimitMessages = { 
  weightMin: false, 
  weightMax: false,
  happinessMin: false,
  happinessMax: false,
  styleMin: false,
  styleMax: false
}

// Treat button
function clickedTreatButton() {
  lastAction = "treat";

  pet_info.happiness += 3; // Increase pet happiness
  pet_info.weight += 1; // Increase pet weight
  
  showNotification("Yummy! Gimme some more?", "Treat", 1); 
  checkAndUpdatePetInfoInHtml();
}

// Play Button
function clickedPlayButton() {
  lastAction = "play"; 

  pet_info.happiness += 2; // Increase pet happiness
  pet_info.weight -= 1; // Decrease pet weight
  pet_info.style -= 1; // Decrease pet style

  showNotification("This was so fun! Let's play again some time!", "Play", 1); 
  checkAndUpdatePetInfoInHtml();
}

// Exercise Button 
function clickedExerciseButton() {
  lastAction = "exercise";

  pet_info.happiness -= 2; // Decrease pet happiness
  pet_info.weight -= 1; // Decrease pet weight
  pet_info.style -= 1; // Decrease pet style

  showNotification("Are we done yet...? No more please...", "Exercise", 1); 
  checkAndUpdatePetInfoInHtml();
}

// Drip Button
function clickedDripButton() {
  lastAction = "drip";

  pet_info.style += 2; // Increase pet style
  pet_info.happiness += 1; // Increase pet happiness

  showNotification("Aren't I handsome?!", "Drip", 1); 
  checkAndUpdatePetInfoInHtml();
}

// Check & Update Pet Info in HTML
function checkAndUpdatePetInfoInHtml() {
  // Check and Update Stats and Limit Messages
  checkWeightAndHappinessBeforeUpdating();
  checkLimitMessages();
  updateButtonStates();
  updatePetInfoInHtml();

  // Change "Permanent" Sprite
  if (!notificationActive) {
    updatePermanentSprite();
  }
}

// Check Pet Info before updating HTML
function checkWeightAndHappinessBeforeUpdating() {
  // Key values must never go below zero 
  if (pet_info.weight < 0) pet_info.weight = 0;
  if (pet_info.happiness < 0) pet_info.happiness = 0;
  if (pet_info.style < 0) pet_info.style = 0;

  // Cap values (fall back)
  if (pet_info.weight > 10) pet_info.weight = 10;
  if (pet_info.happiness > 10) pet_info.happiness = 10;
  if (pet_info.style > 10) pet_info.style = 10;
}

// Check for Stat Limits to ensue special messages 
function checkLimitMessages() {
  // Weight Limits
  if (pet_info.weight === 0) { 
    showNotification("I'm starving over here! Feeeeeeed me!", null, 2);
    shownLimitMessages.weightMin = true;
  } else {
    shownLimitMessages.weightMin = false;
  }

  if (pet_info.weight === 10) {
    showNotification("Is it just me or do I look rounder than usual?", null, 2);
    shownLimitMessages.weightMax = true;
  } else { 
    shownLimitMessages.weightMax = false;
  }

  // Happiness Limits
  if (pet_info.happiness === 0) {
    showNotification("I'm so bored. You always make me exercise... Can't we do something fun?", null, 2);
    shownLimitMessages.happinessMin = true;
  } else {
    shownLimitMessages.happinessMin = false;
  }
  
  // Style Limits
  // Prevent spam and prioritize weight and happiness special messages
  if (pet_info.style === 0 && pet_info.weight > 0 && pet_info.weight < 10 && pet_info.happiness > 0) { 
    showNotification("I'm so battered, not even my mom would recognize my cute face!?!", null, 2);
    shownLimitMessages.styleMin = true;
  } else {
    shownLimitMessages.styleMin = false;
  }

  if (lastAction === "drip" && pet_info.style === 10 && pet_info.weight > 0 && pet_info.weight < 10 && pet_info.happiness > 0) {
    showNotification("It is I the drip Master! No other has more drip than me!", null, 2);
    shownLimitMessages.styleMax = true;
  } else {
    shownLimitMessages.styleMax = false;
  }
}

// Enables or Disables buttons based on current stats 
function updateButtonStates() {
  var states = {
    '.treat-button':    pet_info.weight === 10 || (pet_info.style === 0 && pet_info.weight !== 0),
    '.play-button':     pet_info.weight === 0 || pet_info.style === 0,
    '.exercise-button': pet_info.weight === 0 || pet_info.happiness === 0 || pet_info.style === 0,
    '.drip-button':     pet_info.style === 10
  };

  /*
    .each() is a JQuery method that iterates over a set of elements, executing a function for each. 
    Here it loops every button selector and applies disabled property and visual grey out.
  */
  $.each(states, function(selector, isDisabled) { 
    $(selector)
      /*
        .prop() is a JQuery method that allows you to get or set properties of HTML DOM elements. 
        Here it enables or disables buttons based on the current state of pet_info.
      */
      .prop('disabled', isDisabled)
      .toggleClass('disabled-btn', isDisabled);
  });

  
}

// Color based on stat bar values 
function colorCheck(colorA, colorB, ratio) {
  // Split the hex color into RGB components and convert to decimal
  var rA = parseInt(colorA.slice(1, 3), 16); 
  var gA = parseInt(colorA.slice(3, 5), 16); 
  var bA = parseInt(colorA.slice(5, 7), 16); 

  var rB = parseInt(colorB.slice(1, 3), 16); 
  var gB = parseInt(colorB.slice(3, 5), 16); 
  var bB = parseInt(colorB.slice(5, 7), 16); 

  // Linear interpolation (intermediate color) based on ratio between colorA and colorB
  var r = Math.round(rA + (rB - rA) * ratio); 
  var g = Math.round(gA + (gB - gA) * ratio);
  var b = Math.round(bA + (bB - bA) * ratio);

  return `rgb(${r}, ${g}, ${b})`;
}

// Color Fade for Stat Bar Fill
function statColor(value, lowColor, midColor, highColor) {
  if (value <= 5) {
    return colorCheck(lowColor, midColor, value / 5);
  } else {
    return colorCheck(midColor, highColor, (value - 5) / 5);
  }
}

// Change Sprite 
function setSprite(sprite) { 
  $('.pet-image').attr('src', `assets/${sprite}.png`);
}

// Updating Permanent Sprites 
function updatePermanentSprite() {
  if (pet_info.weight === 0) { 
    setSprite("Hungry");
  } else if (pet_info.weight === 10) { 
    setSprite("Full");
  } else if (pet_info.style === 10) { 
    setSprite("DripMaster");
  } else if (pet_info.happiness === 0) { 
    setSprite("Upset");
  } else { 
    setSprite("Default");
  }
}

// Updates your HTML with the current values in your pet_info object
function updatePetInfoInHtml() {
  var red   = '#8C001A';
  var green = '#317B22';
  var blue  = '#5C80BC';

  // Shiny Border when at Max Happiness
  if (pet_info.happiness === 10) {
    $('.pet-image').addClass('shiny');
  } else {
    $('.pet-image').removeClass('shiny');
  }

  // Inject variables into text
  $('.name').text(pet_info['name']);
  $('.weight').text(pet_info['weight']);
  $('.happiness').text(pet_info['happiness']);
  $('.style').text(pet_info['style']);

  // Meter fill widths
  $('.weight-fill').css('width', (pet_info.weight / 10 * 100) + '%');
  $('.happiness-fill').css('width', (pet_info.happiness / 10 * 100) + '%');
  $('.style-fill').css('width', (pet_info.style / 10 * 100) + '%');

  // Weight Bar Fill (Color) : Red (0) - Green (5) - Red (10)
  $('.weight-fill').css('background-color', statColor(pet_info.weight, red, green, red));

  // Happiness Bar Fill (Color) : Red (0) - Blue (5) - Green (10)
  $('.happiness-fill').css('background-color', statColor(pet_info.happiness, red, blue, green));

  // Style Bar Fill (Color) : Red (0) - Blue (5) - Green (10)
  $('.style-fill').css('background-color', statColor(pet_info.style, red, blue, green));
}

// Visual notifications 
function showNotification(message, reactiveSprite = null, priority = 0) {

  // Block only if this is LOWER priority than the current one
  if (priority < currentNotificationPriority) return;

  currentNotificationPriority = priority;
  notificationActive = true;

  var $note = $('.notification'); 
  $note.stop(true, true);

  $('.button-container button').prop('disabled', true); 

  // Temporary Sprite Change for Actions
  if (reactiveSprite) { 
    setSprite(reactiveSprite);
  }

  $note.text(message).show(); 

  $note
    .delay(4000)
    .fadeOut(500, function() {
      notificationActive = false;
      currentNotificationPriority = 0;
      updatePermanentSprite(); 
      updateButtonStates();
    });
}

// Chrome DevTools Demo Logs

// Startup logs 
function runStarupLogs() {
  console.log("%cWelcome to Gigapet JS!", "color: #a6e3a1; font-size: 18px; font-weight: bold;");
  console.log("%cThis is a simple virtual pet game built with JavaScript and jQuery.", "color: #89b4fa; font-size: 14px;");
  console.log("%cInteract with your pet using the buttons and watch its stats change!", "color: #cba6f7; font-size: 14px;");
}

// 1 Message Logging 

// 1.1 Log Info
function demoLogInfo() { 
  // console.info() outputs a message to the console at the "info" log level
  // In this case it reports the pet's current stats at time of button click
  console.info("GigaPet [Info] - Current Pet Info:", pet_info);
}

// 1.2 Log Warning
function demoLogWarning() { 
  // console.warn() outputs a warning message to the console at the "warning" log level
  // In this case it warns the user when they aproach (2 or 8) a stat limit (0 or 10)
  if (pet_info.weight <= 2) {
    console.warn("GigaPet [Warning] - Your pet has low weight! Please feed it some treats.");
  }
  if (pet_info.weight >= 8) {
    console.warn("GigaPet [Warning] - Your pet is overfed! Try playing or exercising to reduce weight.");
  }
  if (pet_info.happiness <= 2) {
    console.warn("GigaPet [Warning] - Your pet is unhappy! Try playing or giving it some treats to increase happiness.");
  }
  if (pet_info.style <= 2) {
    console.warn("GigaPet [Warning] - Your pet has low style! Try giving it some drip to increase style.");
  } 
}

// 1.3 Log Error
function demoLogError() { 
  // console.error() outputs an error message to the console at the "error" log level
  // In this case it simulates an error when trying to click a disabled button (stat limit reached)
  if (pet_info.weight === 0 && $('.play-button').prop('disabled')) {
    console.error("GigaPet [Error] - You cannot play nor exercise with your pet because it is starving! Please feed it some treats first.");
  }
  if (pet_info.weight === 10 && $('.treat-button').prop('disabled')) {
    console.error("GigaPet [Error] - You cannot feed your pet more treats because it is overfed! Try playing or exercising to reduce weight.");
  }
  if (pet_info.happiness === 0 && $('.exercise-button').prop('disabled')) {
    console.error("GigaPet [Error] - You cannot exercise with your pet because it is very unhappy! Try giving it some treats to increase happiness first.");
  }
  if (pet_info.style === 0 && $('.play-button').prop('disabled')) {
    console.error("GigaPet [Error] - You cannot give a treat, play nor exercise with your pet because it has no style! Try giving it some drip to increase style first.");
  }
  if (pet_info.style === 10 && $('.drip-button').prop('disabled')) {
    console.error("GigaPet [Error] - You cannot give your pet more drip because it is already a Drip Master! Try giving it some treats, playing, or making it exercise instead.");
  }
} 

// 1.4 Log Table 
function demoLogTable() {
  // console.table() displays tabular data as a table
  // In this case it shows the pet's stats in a clear table format for easy reading
  console.table(pet_info);
}

// 1.5 Log Group 
function demoLogGroup() {
  // console.group() creates a new inline group in the console log, allowing you to group related messages together
  // In this case it groups the Pet Info Table with any relevant warnings and errors
  console.group("GigaPet [Group] - Full Report");
    demoLogWarning();
    demoLogError();
    demoLogTable();
  console.groupEnd();
}

// 1.6 Log Custom 
function demoLogCustom() {
  // console.log() with CSS styling allows you to create custom styled log messages
  // In this case it creates a fun custom log message when the pet reaches max happiness
  if (pet_info.happiness === 10) {
    console.log("%cGigaPet [Custom Log] - Your pet is at maximum happiness! Keep up the good work!", "color: Red; font-weight: bold;");
  }
}

// 2 View Messages Loggged by the Browser 

// 2.1 Cause 404 Network Error 
function demoCause404() {
  // This function simulates a network error by trying to load a non-existent image
  // The browser will log a 404 error in the console (in the "Network" tab of DevTools)
  console.log("GigaPet [Network Error Demo] - Attempting to load a non-existent image to trigger a 404 error (Network tab)...");
  var img = new Image();
  img.src = "assets/non_existent_image.png"; // This image does not exist (404 error)
  document.body.appendChild(img);
  img.style.display = "none"; // Hide the broken image icon on the page
}

// 2.2 Cause TypeError
function demoTypeError() {
  // This function simulates a TypeError by trying to call a method on undefined 
  // The browser will log a TypeError in the console when this function is called
  console.log("GigaPet [TypeError Demo] - Attempting to call .toUpperCase() on undefined to trigger a TypeError...");
  undefined.toUpperCase(); // This will cause a TypeError because undefinedVariable is not an object
}

// 2.3 Cause Violation 
function demoViolation() {
  // This function simulates a violation by running a long loop on the main thread
  // The browser will log a violation in the console (in the "Performance" tab of DevTools) if it takes too long
  console.log("GigaPet [Performance Violation Demo] - Running a long loop to simulate a performance violation (Performance tab)...");
  setTimeout(function() {
    // 200 ms loop to block the main thread and trigger a performance violation warning in DevTools
    var start = Date.now();
    while (Date.now() - start < 200) {
      // Busy wait for 200 ms
    }
    console.log("GigaPet [Violation Demo] - Blocking loop finished.");
  }, 0);
}

// 3 Filter Messages 
function demoFilterMessages() {
  // Log level - one message for each level filter 
  console.log("GigaPet [Filter Demo] Log - Pet Name: " + pet_info.name); 
  console.info("GigaPet [Filter Demo] Info - Pet Age: " + pet_info.age); 
  console.warn("GigaPet [Filter Demo] Warn - Pet Weight: " + pet_info.weight);
  console.error("GigaPet [Filter Demo] Error - Pet Happiness: " + pet_info.happiness);

  console.log("GigaPet [Filter Demo] - Use the filter options in DevTools to show/hide specific log levels and test filtering! (Follow Filter Guide in DevTools Demo Panel if needed)");
}

// 4 Reproduce a Bug
var useFixedVersion = false; 

// Bug Helper function
function buggedAddition(a, b) {
  // Add happiness using string concatenation instead of numeric addition to simulate a common JavaScript bug
  return a + b; // # + "#" = ## instead of addition of # + #
}

// Fixed Helper function 
function fixedAddition(a, b) { 
  // Correctly add happiness using numeric addition
  return parseInt(a) + parseInt(b); // Convert inputs to integers before adding to ensure correct addition
}

// Bug Reproduction Function
function demoReproduceBug() {
  // Simulate the bug by trying to increase happiness using the buggy addition function
  var currentHappiness = pet_info.happiness;
  var addedAmount = "3"; // Add a string "3" instead of a number 3 to simulate the bug
 
  var result = buggedAddition(currentHappiness, addedAmount);
 
  console.group("GigaPet [Reproduce Bug] — String Concatenation instead of Addition");
    console.log("currentHappiness (number):", currentHappiness);
    console.log("addedAmount (string):", addedAmount);
    console.warn("Result of Bugged Addition:", result, "( Expected:", currentHappiness + 3, ") - Concatenation occurred instead of addition!");
  console.groupEnd();
 
  document.getElementById("bug-result").textContent =
    "Bug result: " + currentHappiness + " + '3' = \"" + result + "\"  (should be " + (currentHappiness + 3) + ")";
}

// 6 Pause the code with a breakpoint 
function demoBreakpoint() {
  console.log("GigaPet [Breakpoint Demo] - Pausing code execution with a breakpoint.");

  debugger; // This will pause execution in DevTools
}

// 9 Apply a Fix
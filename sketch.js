/*
 * 👋 Hello! This is an ml5.js example made and shared with ❤️.
 * Learn more about the ml5.js project: https://ml5js.org/
 * ml5.js license and Code of Conduct: https://github.com/ml5js/ml5-next-gen/blob/main/LICENSE.md
 *
 * This example demonstrates drawing skeletons on poses for the MoveNet model.
 */

let video;
let bodyPose;
let poses = [];
let connections;
let timeAccumulator = 0;
let registrationCorrectStatus = false;

let exampleStretchTimeSeries;
let stretchDataJson;
let stretchScore;

const poseSampleInterval = 200;
const stretchDetectionState = new StretchDetectionState();
let currentStateTime = stretchDetectionState.currentDuration();

let stretchDataTimeSeries = Array();
let registrationInfoText = "Move back with your arms stretched to the correct position.";
let gifimage;


function preload() {
  // Load the bodyPose model
  bodyPose = ml5.bodyPose();

  stretchDataJson = loadJSON('StretchData/stretchData_main.json');
  gifimage = loadImage("gifs/stretch_1.gif");
};

function setup() {
  // take this one
  createCanvas(853, 640);


  // Create the video and hide it
  video = createCapture(VIDEO);
  video.size(853, 640);
  video.hide();

  exampleStretchTimeSeries = Array.from(Object.values(stretchDataJson));

  // Start detecting poses in the webcam video
  bodyPose.detectStart(video, gotPoses);
  // Get the skeleton connection information
  connections = bodyPose.getSkeleton();

  //every seconds tick the timer
  setInterval(tickStateTimer, 1000);
}

const welcomeMessagesList = [
  { time: 1, message: "Welcome!" },
  { time: 3, message: "Let's Set You Up for Stretching Success!" },
  { time: 6, message: "Sit down and position yourself in front of the camera." },
  { time: 11, message: "Move far back until the top half of your body is fully visible, with some space around you." }
];

let elapsedTime = 0; // Track the elapsed time in the welcome state

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);

  // Update the elapsed time if in welcome state
  if (stretchDetectionState.currentType() === "welcome") {
    elapsedTime += deltaTime / 1000; // Convert milliseconds to seconds
  }

  // State handling logic
  switch(stretchDetectionState.currentType()) {
    case "welcome":
      // If time exceeds the last message time, move to the next message
      if (elapsedTime > welcomeMessagesList[welcomeMessagesList.length - 1].time) {
        stretchDetectionState.nextStep(); // Move to next state
        elapsedTime = 0; // Reset elapsed time
      }
      break;

    case "registration":
      processRegistrationFrame();
      break;

    case "countdown":
   // Determine the width and height of the GIF
    const gifWidth = 150;  // Desired width of the GIF
    const gifHeight = 200; // Desired height of the GIF

    // Calculate the position for the GIF near the right corner
    const xPos = width - gifWidth - 20; // 20 pixels from the right edge
    const yPos = height / 4; // Move closer to the top edge

    // Draw the GIF at the calculated position
    image(gifimage, xPos, yPos, gifWidth, gifHeight);
      break;

    case "stretch":
      processStretchFrame();
      break;
  }

  drawGreyBox();
  drawInfoText();
}


// Callback function for when bodyPose outputs data
function gotPoses(results) {
  // Save the output to the poses variable
  poses = results;
}

function tickStateTimer() {
  // only tick timer if the state is timed or the registration countdown has begun
  if (!stretchDetectionState.isTimedState() && !registrationCorrectStatus) return null;

  // decrement the time left for the state
  currentStateTime--;

  if(currentStateTime === 0) {
    // if a detection state save the stretch data and clear
    if(stretchDetectionState.isDetectionActive()) {
      saveAndClearStretchData();
    }

    // transition to the next step
    stretchDetectionState.nextStep();

    // set the timer to the duration of the new state
    currentStateTime = stretchDetectionState.currentDuration(); 
  }
}

// For Debugging 
// function drawBodyPoints() {
//   // Draw the skeleton connections
//   for (let i = 0; i < poses.length; i++) {
//     let pose = poses[i];
//     for (let j = 0; j < connections.length; j++) {
//       let pointAIndex = connections[j][0];
//       let pointBIndex = connections[j][1];
//       let pointA = pose.keypoints[pointAIndex];
//       let pointB = pose.keypoints[pointBIndex];
//       // Only draw a line if both points are confident enough
//       if (pointA.confidence > 0.1 && pointB.confidence > 0.1) {
//         stroke(255, 0, 0);
//         strokeWeight(2);
//         line(pointA.x, pointA.y, pointB.x, pointB.y);
//       }
//     }
//   }

  // Draw all the tracked landmark points
  // for (let i = 0; i < poses.length; i++) {
  //   let pose = poses[i];
  //   for (let j = 0; j < pose.keypoints.length; j++) {
  //     let keypoint = pose.keypoints[j];
  //     // Only draw a circle if the keypoint's confidence is bigger than 0.1
  //     if (keypoint.confidence > 0.1) {
  //       fill(0, 255, 0);
  //       noStroke();
  //       circle(keypoint.x, keypoint.y, 10);
  //     }
  //   }
  // }
// }

function drawInfoText() {
  noStroke();
  textSize(17);
  textAlign(CENTER);  // Center text horizontally
  fill(0, 0, 0);

  let baseY = height - 50; // Base Y position for the main text
  let mainTextY = baseY;   // Initialize the Y position for the main text

  textFont("Inter");
  // Determine the main text based on current state
  switch (stretchDetectionState.currentType()) {
    case "welcome":
      text(welcomeMessages(), width / 2, mainTextY);
      break;

    case "registration":
      text(registrationInfoText, width / 2, mainTextY);
      break;

    case "countdown":
      text('Now relax.. prepare for stretch', width / 2, mainTextY);
      // play gif
      break;

    case "stretch":
      text('Recording stretch', width / 2, mainTextY);
      break;

    case "score":
      text(`Final Result: ${stretchScore}`, width / 2, mainTextY);
      break;

    default:
      text('Not Stretching', width / 2, mainTextY);
  }

  // Calculate the height of the main text
  let textHeight = textAscent() + textDescent(); // Height of the drawn text

  // Check if in timed state to display the countdown
  if (stretchDetectionState.isTimedState() || registrationCorrectStatus) {
    mainTextY = baseY - textHeight - 40; 

    // Draw the countdown text 
    let countdownY = mainTextY + textHeight + 20; 
    text(currentStateTime, width / 2, countdownY);
  }
}




function drawGreyBox() {


  
  // Set fill color of box 
  fill(220, 220, 220, 200);
  noStroke(); // Disable stroke
  
  // Define box dimensions
  // take this one
  let boxWidth = 800; // Set the desired width of the box
  let boxHeight = 70; // Height of the box
  let cornerRadius = 10; // Radius for rounded corners

  // Calculate x position to center the box
  let xPos = (width - boxWidth) / 2; // Centering the box


  rect(xPos, height - boxHeight - 20, boxWidth, boxHeight, cornerRadius);

    // Set the shadow properties
    drawingContext.shadowColor = color(66, 66, 66, 20); // Set shadow color with alpha for transparency
    drawingContext.shadowBlur = 15; // Set shadow blur amount
    drawingContext.shadowOffsetX = 5; // Horizontal shadow offset
    drawingContext.shadowOffsetY = 5; // Vertical shadow offset
    // Draw a rectangle (x, y, width, height, radius)
    // test delete
}


// function to extract stretch data from the current pose
function extractStretchData(currentPose) {
  // extract stretch data from pose
  let stretchPoseData = new StretchPoseData(currentPose);

  // draw stretch data to canvas
  stretchPoseData.draw();

  // add the stretch data to the time series for the whole stretch
  stretchDataTimeSeries.push(stretchPoseData.featuresArray());
}

function saveAndClearStretchData() {
  // Output stretch data for debugging
  console.log("Data");
  console.log(stretchDataTimeSeries);
  console.log("DataLength");
  console.log(stretchDataTimeSeries.length);

  if(stretchDataTimeSeries.length != 0) {
    const dtwMovementComparison = new DTWMovementComparison(stretchDataTimeSeries, exampleStretchTimeSeries);

    console.log("Final Score");
    console.log(dtwMovementComparison.normalizedCost);

    stretchScore = dtwMovementComparison.normalizedCost;

    // Clear the stretch data time series to restart for the next stretch
    stretchDataTimeSeries.splice(0, stretchDataTimeSeries.length);
  }
}

// time keeper
function processStretchFrame() {
  // increment time every frame
  timeAccumulator += deltaTime;

  // if the sample time has been reached extract the stretch data for processing
  if(timeAccumulator >= poseSampleInterval && poses.length === 1) {
    extractStretchData(poses[0].keypoints);

    // set time accumalator back to zero for next frame
    timeAccumulator = 0;
  }
}

// Checking if in right place
function processRegistrationFrame() {
  // get newest registration status
  const newRegistrationCorrectStatus = isWithinCorrectPosition();

  // update the info text with the command of what next to do
  registrationInfoText = newRegistrationCorrectStatus ? "Great, you are in position." : "Move back to the correct position.";

  // if newly correct status then reset the state timer to 3 second countdown
  if(newRegistrationCorrectStatus && !registrationCorrectStatus) {
    currentStateTime = 3;
  }
  
  // update the global registration state variable
  registrationCorrectStatus = newRegistrationCorrectStatus;
}




function welcomeMessages() {
  // Find the appropriate message based on elapsed time
  for (let i = 0; i < welcomeMessagesList.length; i++) {
    if (elapsedTime < welcomeMessagesList[i].time) {
      return welcomeMessagesList[i].message; // Return the current message
    }
  }
  return "Welcome!"; // Default message if no valid message found
}

// Check if in right position
function isWithinCorrectPosition() {
  if(poses.length == 1) {
    // collect the new registration data
    registrationData = new RegistrationData(poses[0].keypoints);

    // return if within the correct position for registration
    return registrationData.isPositionCorrect && registrationData.areArmAnglesCorrect;
  } else {
    return false;
  }
}

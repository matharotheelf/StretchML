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

function preload() {
  // Load the bodyPose model
  bodyPose = ml5.bodyPose();

  stretchDataJson = loadJSON('StretchData/stretchData_main.json');
};

function setup() {
  createCanvas(640, 480);

  // Create the video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  exampleStretchTimeSeries = Array.from(Object.values(stretchDataJson));

  // Start detecting poses in the webcam video
  bodyPose.detectStart(video, gotPoses);
  // Get the skeleton connection information
  connections = bodyPose.getSkeleton();

  //every seconds tick the timer
  setInterval(tickStateTimer, 1000);
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);

  // if the current state is active stetch detection process the stretch data
  switch(stretchDetectionState.currentType()) {
    case "registration":
      processRegistrationFrame();

      break;
    case "countdown":
      break;
    case "score":
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

// TODO remove current Type
function drawInfoText() {
  noStroke();
  textSize(30);
  fill(0, 0, 0);

  switch(stretchDetectionState.currentType()) {
    case "registration":
      text(registrationInfoText, 6, 40);

      break;
    case "countdown":
      text('Now you can Relax your arms.. Prepare for stretch in:', 6, 40);

      break;
    case "stretch":
      text('Recording stretch', 6, 40);

      break;
    case "score":
      text(`Final Result: ${stretchScore}`, 6, 40);

      break;
    default:
      text('Not Stretching', 6, 40);
  }
 
  // if in timed state, print the current countdown time
  if(stretchDetectionState.isTimedState() || registrationCorrectStatus) {
    text(currentStateTime, 6, 85);
  }
}

function drawGreyBox(){
     
    // Set fill color of box 
    fill(80, 80, 80, 127);
    noStroke();    // Disable stroke
    // Draw a rectangle (x, y, width, height)
    rect(0, 0, 10000, 50);

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

class StretchPoseData {
  #nosePosition
  #leftShoulderPosition
  #rightShoulderPosition
  #midShoulderPosition
  #leftElbowPosition
  #rightElbowPosition
  #leftHandPosition
  #rightHandPosition

  constructor(keypoints) {
    // extract the keypoint data needed for classifying the upper body stretches
    // save them to vector objects for manipulation
    this.#nosePosition = createVector(keypoints[0].x, keypoints[0].y);
    this.#leftShoulderPosition = createVector(keypoints[5].x, keypoints[5].y);
    this.#rightShoulderPosition = createVector(keypoints[6].x, keypoints[6].y);
    this.#leftElbowPosition = createVector(keypoints[7].x, keypoints[7].y)
    this.#rightElbowPosition = createVector(keypoints[8].x, keypoints[8].y)
    this.#leftHandPosition = createVector(keypoints[9].x, keypoints[9].y)
    this.#rightHandPosition = createVector(keypoints[10].x, keypoints[10].y)

    // calculate the midpoint between the shoulders
    // this is used to calculate the head displacement from the shoulders
    this.#midShoulderPosition = this.calculateMidShoulderPosition()

    // calculate all the displacement vectors which are used in the stretch classification process 
    this.headDisplacement = this.calculateHeadDisplacement(keypoints);

    this.leftUpperArmDisplacement = this.calculateLeftUpperArmDisplacement(keypoints);
    this.leftLowerArmDisplacement = this.calculateLeftLowerArmDisplacement(keypoints);

    this.rightUpperArmDisplacement = this.calculateRightUpperArmDisplacement(keypoints);
    this.rightLowerArmDisplacement = this.calculateRightLowerArmDisplacement(keypoints);
  }
  
  calculateMidShoulderPosition() {
    // average position of the two shoulder keypoints
    return p5.Vector.add(this.#rightShoulderPosition, this.#leftShoulderPosition).div(2)
  }

  calculateHeadDisplacement() {
    // dispacement between nose and shoulder
    return p5.Vector.sub(this.#nosePosition, this.#midShoulderPosition);
  }

  calculateLeftUpperArmDisplacement() {
    // displacement between elbow and shoulder
    return p5.Vector.sub(this.#leftElbowPosition, this.#leftShoulderPosition);
  }

  calculateLeftLowerArmDisplacement() {
    // displacement between hand and elbow
    return p5.Vector.sub(this.#leftHandPosition, this.#leftElbowPosition);
  }

  calculateRightUpperArmDisplacement() {
    // displacement between shoulder and elbow
    return p5.Vector.sub(this.#rightElbowPosition, this.#rightShoulderPosition);
  }

  calculateRightLowerArmDisplacement() {
    // displacement between elbow and hand
    return p5.Vector.sub(this.#rightHandPosition, this.#rightElbowPosition);
  }

  // visualise all of the extracted displacement vectors
  draw() {
    stroke(255, 165, 0);
    strokeWeight(10);

    line(this.#midShoulderPosition.x, this.#midShoulderPosition.y, this.#nosePosition.x, this.#nosePosition.y);
    line(this.#leftShoulderPosition.x, this.#leftShoulderPosition.y, this.#leftElbowPosition.x, this.#leftElbowPosition.y);
    line(this.#leftElbowPosition.x, this.#leftElbowPosition.y, this.#leftHandPosition.x, this.#leftHandPosition.y);
    line(this.#rightShoulderPosition.x, this.#rightShoulderPosition.y, this.#rightElbowPosition.x, this.#rightElbowPosition.y);
    line(this.#rightElbowPosition.x, this.#rightElbowPosition.y, this.#rightHandPosition.x, this.#rightHandPosition.y);
  }

  // transform all the extracted data into a single array for classification
  featuresArray() {
    var featuresData = Array();

    featuresData.push(this.headDisplacement.x, this.headDisplacement.y);
    featuresData.push(this.leftUpperArmDisplacement.x, this.leftUpperArmDisplacement.y);
    featuresData.push(this.leftLowerArmDisplacement.x, this.leftLowerArmDisplacement.y);
    featuresData.push(this.rightUpperArmDisplacement.x, this.rightUpperArmDisplacement.y);
    featuresData.push(this.rightLowerArmDisplacement.x, this.rightLowerArmDisplacement.y);

    return featuresData;
  }
}

class RegistrationData {
  static confidenceThreshhold = 0.1;
  static angleThreshhold = 0.5;

  #leftShoulderPosition;
  #rightShoulderPosition;
  #midShoulderPosition;
  #leftElbowPosition;
  #rightElbowPosition;
  #leftHandPosition;
  #rightHandPosition;
  #leftUpperArmDisplacement;
  #leftLowerArmDisplacement;
  #rightUpperArmDisplacement;
  #rightLowerArmDisplacement;


  constructor(keypoints) {
    // check whether keypoint confidence is above the minimum threshold
    const isConfidenceAboveThreshold = (confidence) => confidence > RegistrationData.confidenceThreshhold;

    // use the key point confidence to determine whether the points are in frame 
    const keypointConfidences = [
      keypoints[0].confidence,
      keypoints[5].confidence,
      keypoints[6].confidence,
      keypoints[7].confidence,
      keypoints[8].confidence,
      keypoints[9].confidence,
      keypoints[10].confidence,
    ];

    // return whether all the keypoints are within the frame
    this.isPositionCorrect = keypointConfidences.every(isConfidenceAboveThreshold);

    // extract the keypoint data needed for classifying the upper body stretches
    // save them to vector objects for manipulation
    this.#leftShoulderPosition = createVector(keypoints[5].x, keypoints[5].y);
    this.#rightShoulderPosition = createVector(keypoints[6].x, keypoints[6].y);
    this.#leftElbowPosition = createVector(keypoints[7].x, keypoints[7].y);
    this.#rightElbowPosition = createVector(keypoints[8].x, keypoints[8].y);
    this.#leftHandPosition = createVector(keypoints[9].x, keypoints[9].y);
    this.#rightHandPosition = createVector(keypoints[10].x, keypoints[10].y);

    this.#leftUpperArmDisplacement = this.#calculateLeftUpperArmDisplacement(keypoints);
    this.#leftLowerArmDisplacement = this.#calculateLeftLowerArmDisplacement(keypoints);

    this.#rightUpperArmDisplacement = this.#calculateRightUpperArmDisplacement(keypoints);
    this.#rightLowerArmDisplacement = this.#calculateRightLowerArmDisplacement(keypoints);

    const leftUpperArmAngle = this.#calculateLeftUpperArmAngle();
    const leftLowerArmAngle = this.#calculateLeftLowerArmAngle();
    const rightUpperArmAngle = this.#calculateRightUpperArmAngle();
    const rightLowerArmAngle = this.#calculateRightLowerArmAngle();

    // check whether angle is below the threshold for registration
    const isAngleBelowThreshold = (ang) => Math.abs(ang) < RegistrationData.angleThreshhold;


    // collate all relevant arm angles
    const armAngles = [
      leftUpperArmAngle,
      leftLowerArmAngle,
      rightUpperArmAngle,
      rightLowerArmAngle
    ];

    // return whether all arm angles are in the correct range
    this.areArmAnglesCorrect = armAngles.every(isAngleBelowThreshold);
  }

  #calculateLeftUpperArmDisplacement() {
    // displacement between elbow and shoulder
    return p5.Vector.sub(this.#leftElbowPosition, this.#leftShoulderPosition);
  }

  #calculateLeftLowerArmDisplacement() {
    // displacement between hand and elbow
    return p5.Vector.sub(this.#leftHandPosition, this.#leftElbowPosition);
  }

  #calculateRightUpperArmDisplacement() {
    // displacement between shoulder and elbow
    return p5.Vector.sub(this.#rightElbowPosition, this.#rightShoulderPosition);
  }

  #calculateRightLowerArmDisplacement() {
    // displacement between elbow and hand
    return p5.Vector.sub(this.#rightHandPosition, this.#rightElbowPosition);
  }

  #calculateLeftUpperArmAngle() {
    // the angle between the left upper arm an horizontal
    return tan(this.#leftUpperArmDisplacement.y/this.#leftUpperArmDisplacement.x);
  }

  #calculateLeftLowerArmAngle() {
    // displacement between hand and elbow
    return tan(this.#leftLowerArmDisplacement.y/this.#leftLowerArmDisplacement.x);
  }

  #calculateRightUpperArmAngle() {
    // displacement between shoulder and elbow
    return tan(this.#rightUpperArmDisplacement.y/this.#rightUpperArmDisplacement.x);
  }

  #calculateRightLowerArmAngle() {
    // displacement between elbow and hand
    return tan(this.#rightLowerArmDisplacement.y/this.#rightLowerArmDisplacement.x);
  }
}

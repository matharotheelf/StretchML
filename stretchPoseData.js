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
    this.#nosePosition = createVector(keypoints[0].x, keypoints[0].y);
    this.#leftShoulderPosition = createVector(keypoints[5].x, keypoints[5].y);
    this.#rightShoulderPosition = createVector(keypoints[6].x, keypoints[6].y);
    this.#leftElbowPosition = createVector(keypoints[7].x, keypoints[7].y)
    this.#rightElbowPosition = createVector(keypoints[8].x, keypoints[8].y)
    this.#leftHandPosition = createVector(keypoints[9].x, keypoints[9].y)
    this.#rightHandPosition = createVector(keypoints[10].x, keypoints[10].y)

    this.#midShoulderPosition = this.calculateMidShoulderPosition()

    this.headDisplacement = this.calculateHeadDisplacement(keypoints);

    this.leftUpperArmDisplacement = this.calculateLeftUpperArmDisplacement(keypoints);
    this.leftLowerArmDisplacement = this.calculateLeftLowerArmDisplacement(keypoints);

    this.rightUpperArmDisplacement = this.calculateRightUpperArmDisplacement(keypoints);
    this.rightLowerArmDisplacement = this.calculateRightLowerArmDisplacement(keypoints);
  }
  
  calculateMidShoulderPosition() {
    return p5.Vector.add(p5.Vector.sub(this.#rightShoulderPosition, this.#leftShoulderPosition).div(2), this.#leftShoulderPosition)
  }

  calculateHeadDisplacement() {
    return p5.Vector.sub(this.#nosePosition, this.#midShoulderPosition);
  }

  calculateLeftUpperArmDisplacement() {
    return p5.Vector.sub(this.#leftElbowPosition, this.#leftShoulderPosition);
  }

  calculateLeftLowerArmDisplacement() {
    return p5.Vector.sub(this.#leftHandPosition, this.#leftElbowPosition);
  }

  calculateRightUpperArmDisplacement() {
    return p5.Vector.sub(this.#rightElbowPosition, this.#rightShoulderPosition);
  }

  calculateRightLowerArmDisplacement() {
    return p5.Vector.sub(this.#rightHandPosition, this.#rightElbowPosition);
  }

  draw() {
    push();
    translate(width / 2, height / 2);

    stroke(255, 165, 0);
    strokeWeight(10);

    line(0, 0, this.headDisplacement.x, this.headDisplacement.y);
    line(0, 0, this.leftUpperArmDisplacement.x, this.leftUpperArmDisplacement.y);
    line(0, 0, this.leftLowerArmDisplacement.x, this.leftLowerArmDisplacement.y);
    line(0, 0, this.rightUpperArmDisplacement.x, this.rightUpperArmDisplacement.y);
    line(0, 0, this.rightLowerArmDisplacement.x, this.rightLowerArmDisplacement.y);
    
    pop();
  }
}

class StretchDetectionState {
  // define all the allowed stretch detection states
  #stretchDetectionStates = {
    registration: "registration",
    startCountdown: "startCountdown",
    stretchNow: "stretchNow",
  };

  // define the configuration for the behavior of each state
  #stretchStatesConfig = {
    registration: {
      duration: null,
      nextStep: this.#stretchDetectionStates.startCountdown,
      type: "registration",
    },
    startCountdown: {
      duration: 30,
      nextStep: this.#stretchDetectionStates.stretchNow,
      type: "countdown",
    },
    stretchNow:  {
      duration: 30,
      nextStep: this.#stretchDetectionStates.startCountdown,
      type: "stretch",
    },
  };

  constructor() {
    // set the inital stretch state 
    this.currentStretchState = this.#stretchDetectionStates.registration;
  }

  // when nextStep is called move to the configured next state
  nextStep() {
    this.currentStretchState = this.#currentStateConfig().nextStep;
  }

  // defines whether the current state detects the users stretch
  isDetectionActive() {
    return this.#currentStateConfig().type === "stretch";
  }

  // returns whether the state has a fixed timing
  isTimedState() {
    return this.#currentStateConfig().duration !== null;
  }

  // returns the duration in time of the current state
  currentDuration() {
    return this.#currentStateConfig().duration;
  }

  // returns the type of the current state
  currentType() {
    return this.#currentStateConfig().type;
  }

  // gets the configuration object for the current state
  #currentStateConfig() {
    return this.#stretchStatesConfig[this.currentStretchState];
  }
}

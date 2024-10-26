class StretchDetectionState {
  // define all the allowed stretch detection states
  #stretchDetectionStates = {
    welcome: "welcome",
    registration: "registration",
    startCountdown: "startCountdown",
    stretchNow: "stretchNow",
    scoreDisplay: "scoreDisplay",
  };

  // define the configuration for the behavior of each state
  #stretchStatesConfig = {
    welcome: {
      duration: 11,
      nextStep: this.#stretchDetectionStates.registration,
      type: "welcome",
    },
    registration: {
      duration: null,
      nextStep: this.#stretchDetectionStates.startCountdown,
      type: "registration",
    },
    startCountdown: {
      duration: 1,
      nextStep: this.#stretchDetectionStates.stretchNow,
      type: "countdown",
    },
    stretchNow:  {
      duration: 30,
      nextStep: this.#stretchDetectionStates.scoreDisplay,
      type: "stretch",
    },
    scoreDisplay:  {
      duration: 30,
      nextStep: this.#stretchDetectionStates.startCountdown,
      type: "score",
    },
  };

  constructor() {
    // set the inital stretch state 
    this.currentStretchState = this.#stretchDetectionStates.welcome;
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

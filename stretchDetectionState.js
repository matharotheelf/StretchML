class StretchDetectionState {
  // define all the allowed stretch detection states
  #stretchDetectionStates = {
    startCountdown: "startCountdown",
    stretchNow: "stretchNow",
  };

  // define the configuration for the behavior of each state
  #stretchStatesConfig = {
    startCountdown: {
      duration: 30,
      transition: this.#stretchDetectionStates.stretchNow,
      type: "countdown",
    },
    stretchNow:  {
      duration: 30,
      transition: this.#stretchDetectionStates.startCountdown,
      type: "stretch",
    },
  };

  constructor() {
    // set the inital stretch state 
    this.currentStretchState = this.#stretchDetectionStates.startCountdown;
  }

  // when transition is called move to the configured next state
  transition() {
    this.currentStretchState = this.#currentStateConfig().transition;
  }

  // defines whether the current state detects the users stretch
  isDetectionActive() {
    return this.#currentStateConfig().type === "stretch";
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

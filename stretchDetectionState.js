class StretchDetectionState {
  #stretchDetectionStates = {
    startCountdown: "startCountdown",
    stretchNow: "stretchNow",
  };

  #stretchStatesConfig = {
    startCountdown: {
      duration: 40,
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
    this.currentStretchState = this.#stretchDetectionStates.startCountdown;
  }

  transition() {
    this.currentStretchState = this.#currentConfig().transition;
  }

  isDetectionActive() {
    return this.#currentConfig().type === "stretch";
  }

  currentDuration() {
    return this.#currentConfig().duration;
  }

  #currentConfig() {
    return this.#stretchStatesConfig[this.currentStretchState];
  }
}

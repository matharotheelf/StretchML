class StretchDetectionState {
  // define all the allowed stretch detection states
  stretchDetectionStates = {
    welcomeMessage1: "welcomeMessage1",
    welcomeMessage2: "welcomeMessage2",
    welcomeMessage3: "welcomeMessage3",
    welcomeMessage4: "welcomeMessage4",
    registration: "registration",
    startCountdown: "startCountdown",
    stretchNow: "stretchNow",
    scoreDisplay: "scoreDisplay",
  };

  // define the configuration for the behavior of each state
  #stretchStatesConfig = {
    welcomeMessage1: {
      duration: 3,
      nextStep: this.stretchDetectionStates.welcomeMessage2,
      message: "Welcome!",  
      type: "timedMessage",
    },
    welcomeMessage2: {
      duration: 6,
      nextStep: this.stretchDetectionStates.welcomeMessage3,
      message: "Let's Set You Up for Stretching Success!",  
      type: "timedMessage",
    },
    welcomeMessage3: {
      duration: 7,
      nextStep: this.stretchDetectionStates.welcomeMessage4,
      message: "Sit down and position yourself in front of the camera.",  
      type: "timedMessage",
    },
    welcomeMessage4: {
      duration: 10,
      nextStep: this.stretchDetectionStates.registration,
      message: "Move far back until the top half of your body is fully visible, with some space around you.",  
      type: "timedMessage",
    },
    welcomeMessage2: {
      duration: 6,
      nextStep: this.stretchDetectionStates.welcomeMessage3,
      message: "Perfect! Now let's capture your body.",  
      type: "timedMessage",
    },
    welcomeMessage3: {
      duration: 10,
      nextStep: this.stretchDetectionStates.welcomeMessage4,
      message: "Slowly extend your arms out to your sides like you're forming a 'T' shape",  
      type: "timedMessage",
    },
    welcomeMessage4: {
      duration: 5,
      nextStep: this.stretchDetectionStates.registration,
      message: "Ensure both hands are visible near the edges of the screen.",  
      type: "timedMessage",
    },

    registration: {
      duration: null,
      nextStep: this.stretchDetectionStates.stretchMessage5,
      message: "Registration",
      type: "registration",
    },
    stretchMessage5: {
      duration: 8,
      nextStep: this.stretchDetectionStates.startCountdown,
      message: "Ensure both hands are visible near the edges of the screen.",  
      type: "timedMessage",
    },
    startCountdown: {
      duration: 10,
      nextStep: this.stretchDetectionStates.stretchNow,
      message: "You're all set. Now relax your arms.",
      type: "countdown",
    },
    startCountdown: {
      duration: 10,
      nextStep: this.stretchDetectionStates.stretchNow,
      message: "Time to being the stetch",
      type: "countdown",
    },
    stretchNow:  {
      duration: 30,
      nextStep: this.stretchDetectionStates.scoreDisplay,
      message: "Match the stretch",
      type: "stretch",
    },
    scoreDisplay:  {
      duration: 30,
      nextStep: this.stretchDetectionStates.startCountdown,
      message: "Final Result",
      type: "score",
    },
  };

  constructor() {
    // set the inital stretch state 
    this.currentStretchState = this.stretchDetectionStates.welcomeMessage1;
  }

  // when nextStep is called move to the configured next state
  nextStep() {
    this.currentStretchState = this.#currentStateConfig().nextStep;
  }

  // when nextStep is called move to the configured next state
  message() {
    return this.#currentStateConfig().message;
  }

  // defines whether the current state detects the users stretch
  isDetectionActive() {
    return this.#currentStateConfig().type === "stretch";
  }

  // returns whether the state has a fixed timing
  isTimedState() {
    return this.#currentStateConfig().duration !== null;
  }

  // returns the type of the current state
  currentType() {
    return this.#currentStateConfig().type;
  }

  // returns the duration in time of the current state
  currentDuration() {
    return this.#currentStateConfig().duration;
  }

  // gets the configuration object for the current state
  #currentStateConfig() {
    return this.#stretchStatesConfig[this.currentStretchState];
  }
}

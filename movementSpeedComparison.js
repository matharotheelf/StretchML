class MovementSpeedComparison {
  constructor(recordedTimeSeries, idealStretchTimeSeries) {
    this.fastComparisonScore = this.#calculateFastDTWComparisonScore(recordedTimeSeries, idealStretchTimeSeries);
    this.comparisonScore = this.#calculatePerfectDTWComparisonScore(recordedTimeSeries, idealStretchTimeSeries);
  };

  // speed time series
  #speedSeries(positionTimeSeries) {
    return positionTimeSeries.map((position, positionIndex) => [this.#calculateSpeed(position, positionTimeSeries[Math.max(positionIndex - 1, 0)])]);
  }

  // fast speed time series
  #fastSpeedSeries(positionTimeSeries) {
    return positionTimeSeries.map((position, positionIndex) => [2*this.#calculateSpeed(position, positionTimeSeries[Math.max(positionIndex - 1, 0)])]);
  }

  // speed calculation
  #calculateSpeed(position1, position2) {
    return p5.Vector.sub(createVector(...position1), createVector(...position2)).magSq();
  }

  // fast DTW
  #calculateFastDTWComparisonScore(recordedTimeSeries, idealStretchTimeSeries) {
    const dtwComparison = new DTWMovementComparison(this.#speedSeries(recordedTimeSeries), this.#fastSpeedSeries(idealStretchTimeSeries), true);

    return dtwComparison.normalizedCost; 
  }
  
  // perfect DTW
  #calculatePerfectDTWComparisonScore(recordedTimeSeries, idealStretchTimeSeries) {
    const dtwComparison = new DTWMovementComparison(this.#speedSeries(recordedTimeSeries), this.#speedSeries(idealStretchTimeSeries), true);

    return dtwComparison.normalizedCost;

  }
}

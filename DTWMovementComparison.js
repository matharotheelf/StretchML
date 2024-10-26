class DTWMovementComparison {
  constructor(recordedTimeSeries, idealStretchTimeSeries, singleDimension = false) {
    this.singleDimension = singleDimension;
    this.normalizedCost = this.#calculateDTWComparisonCost(recordedTimeSeries, idealStretchTimeSeries);
  };

  // 3. Dynamic programming alignment path
  // Computes the optimal alignment path between x_seq and y_seq using dynamic programming.
  // Cost matrix is filled using a recurrence relation where each cell contains the minimum cost
  // to reach that point from the start, accounting for the distances between corresponding points in the sequences.
  #computeAlignmentPath(distMat) {

      const [rows, cols] = [distMat.length, distMat[0].length];
      
      // Initialize the cost matrix with "Infinity" to represent uncomputed values.
      const costMat = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
      
      // Base case: the cost to reach the first point (0,0) is simply the distance at that point.
      costMat[0][0] = distMat[0][0];

      // Fill in the first row and first column, which can only be reached by moving right or down.
      for (let i = 1; i < rows; i++) costMat[i][0] = costMat[i - 1][0] + distMat[i][0];
      for (let j = 1; j < cols; j++) costMat[0][j] = costMat[0][j - 1] + distMat[0][j];

      // Fill the rest of the cost matrix. Each cell depends on the minimum cost of the three neighboring cells.
      for (let i = 1; i < rows; i++) {
          for (let j = 1; j < cols; j++) {
              // Recurrence relation to compute the cost for reaching (i, j).
              costMat[i][j] = distMat[i][j] + Math.min(costMat[i - 1][j], costMat[i][j - 1], costMat[i - 1][j - 1]);
          }
      }

      // Backtrack to find the optimal path by moving through the matrix from the bottom-right to top-left.
      let [i, j] = [rows - 1, cols - 1], path = [[i, j]];  // Start at the bottom-right corner
      while (i > 0 || j > 0) {
          if (i === 0) j--;  // If at the top row, move left
          else if (j === 0) i--;  // If at the leftmost column, move up
          else {
              // Choose the direction that offers the lowest cost.
              const minCost = Math.min(costMat[i - 1][j], costMat[i][j - 1], costMat[i - 1][j - 1]);
              minCost === costMat[i - 1][j - 1] ? (i--, j--) : minCost === costMat[i - 1][j] ? i-- : j--;
          }
          path.push([i, j]);  // Add the step to the path
      }

      // Calculate the sequence lengths
      const M = distMat.length;
      const N = distMat[0].length;

      // The total cost of alignment is normalized by the length of both sequences.
      const normalizedCost = costMat[rows - 1][cols - 1] / (M + N);
      
      // Return the path, cost matrix, and normalized cost for further use.
      return { path: path.reverse(), costMat, normalizedCost };
  };

  // 5. Process stretch data after the detection is complete
  #calculateDTWComparisonCost(recordedStetchTimeSeries, idealStretchTimeSeries) {
      // 1. Cosine distance function
      // Computes cosine distance between two vectors a and b.
      // Cosine distance = 1 - cosine similarity. Used to measure the angular difference between two vectors.
      const cosineDistance = (a, b) => 1 - math.dot(a, b) / (math.norm(a) * math.norm(b));

      // 2. Calculate distance matrix
      // Computes the pairwise cosine distance between every pair of vectors in x_seq and y_seq.
      // Returns a 2D matrix where element (i, j) contains the cosine distance between x_seq[i] and y_seq[j].
      const computeMultivariateDistanceMatrix = (xSeq, ySeq) =>
        xSeq.map(x => ySeq.map(y => cosineDistance(x, y)));

    // 2. Calculate distance matrix
          // Computes the pairwise cosine distance between every pair of vectors in x_seq and y_seq.
          // Returns a 2D matrix where element (i, j) contains the cosine distance between x_seq[i] and y_seq[j].
      const computeDistanceMatrix = (xSeq, ySeq) =>
        xSeq.map(x => ySeq.map(y => x - y));

      const distMat = this.singleDimension ? computeDistanceMatrix(recordedStetchTimeSeries, idealStretchTimeSeries) : computeMultivariateDistanceMatrix(recordedStetchTimeSeries, idealStretchTimeSeries);

      // Call dp() to get the optimal alignment path and normalized cost
      const { path, costMat, normalizedCost } = this.#computeAlignmentPath(distMat);

      // Print the normalized cost for evaluation
      console.log("Normalized Cost:", normalizedCost);
      console.log("Distance Matrix:", distMat);
      console.log("Alignment Path:", path);

      //return normalizedCost.toFixed(5);
      return  normalizedCost.toFixed(5);



      switch (true) {
          case cost < 0.001:
              return "Perfect! 🎉";
          case cost < 0.005:
              return "Great 😊";
          case cost < 0.01:
              return "Good 🙂";
          case cost < 0.05:
              return "Okay 😐";
          default:
              return "Try Again 😕";
  }

  };
};


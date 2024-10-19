// 1. Cosine distance function
// Computes cosine distance between two vectors a and b.
const cosineDistance = (a, b) => 1 - math.dot(a, b) / (math.norm(a) * math.norm(b));

// 2. Calculate distance matrix
// Computes the pairwise cosine distance between every pair of vectors in xSeq and ySeq.
const computeDistanceMatrix = (xSeq, ySeq) =>
  xSeq.map(x => ySeq.map(y => cosineDistance(x, y)));

// 3. Dynamic programming alignment path (for optimal sequence alignment)
const dp = (distMat) => {
    const [rows, cols] = [distMat.length, distMat[0].length];
    const costMat = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    
    costMat[0][0] = distMat[0][0];

    // Fill the first row and first column
    for (let i = 1; i < rows; i++) costMat[i][0] = costMat[i - 1][0] + distMat[i][0];
    for (let j = 1; j < cols; j++) costMat[0][j] = costMat[0][j - 1] + distMat[0][j];

    // Fill the cost matrix using the recurrence relation
    for (let i = 1; i < rows; i++) {
        for (let j = 1; j < cols; j++) {
            costMat[i][j] = distMat[i][j] + Math.min(costMat[i - 1][j], costMat[i][j - 1], costMat[i - 1][j - 1]);
        }
    }

    // Backtrack to find the optimal path
    let [i, j] = [rows - 1, cols - 1], path = [[i, j]];
    while (i > 0 || j > 0) {
        if (i === 0) j--;  // If at the top row, move left
        else if (j === 0) i--;  // If at the leftmost column, move up
        else {
            const minCost = Math.min(costMat[i - 1][j], costMat[i][j - 1], costMat[i - 1][j - 1]);
            minCost === costMat[i - 1][j - 1] ? (i--, j--) : minCost === costMat[i - 1][j] ? i-- : j--;
        }
        path.push([i, j]);
    }

    const normalizedCost = costMat[rows - 1][cols - 1] / (rows + cols);
    
    return { path: path.reverse(), costMat, normalizedCost };
};

// 4. Function to create heatmap with alignment path as lines
function createHeatmapWithLines(distMat, path) {
    const data = [{
        z: distMat,
        type: 'heatmap',
        colorscale: 'Viridis'
    }];

    const shapes = path.map((p, i) => {
        if (i === path.length - 1) return null;  // Skip the last point
        const [x0, y0] = path[i];
        const [x1, y1] = path[i + 1];
        return {
            type: 'line',
            xref: 'x',
            yref: 'y',
            x0: y0,
            y0: x0,
            x1: y1,
            y1: y1,
            line: {
                color: 'black',
                width: 2
            }
        };
    }).filter(Boolean);

    const layout = {
        title: 'Cosine Distance Matrix and Alignment Path',
        xaxis: { title: 'Y Sequence' },
        yaxis: { title: 'X Sequence' },
        shapes: shapes
    };

    Plotly.newPlot('plot1', data, layout);
}

// 5. Process stretch data after the detection is complete
function processStretchData(stretchDataTimeSeries) {
    // Here, you can perform any preprocessing if needed
    // For now, we directly call compareStretchData with the collected data
    compareStretchData(stretchDataTimeSeries);
}

// 6. Compare the collected stretch data with a reference sequence
function compareStretchData(stretchDataTimeSeries) {
    const referenceSeq = [
        [0.5, 0.1, 0.4, 0.2, 0.3], 
        [0.6, 0.5, 0.4, 0.3, 0.2], 
        [0.4, 0.7, 0.1, 0.8, 0.6],
        // ... other reference sequences ...
    ];

    // Compute distance matrix between the stretch data and reference sequence
    const distMat = computeDistanceMatrix(stretchDataTimeSeries, referenceSeq);

    // Call dp() to get the optimal alignment path and normalized cost
    const { path, costMat, normalizedCost } = dp(distMat);

    // Print the normalized cost for evaluation
    console.log("Normalized Cost:", normalizedCost);

    // Visualize the result with a heatmap and path
    createHeatmapWithLines(distMat, path);

    // Transition to the next UI panel after detection ends
    showNextPanel();
}


// 1. Cosine distance function
// Computes cosine distance between two vectors a and b.
// Cosine distance = 1 - cosine similarity. Used to measure the angular difference between two vectors.
const cosineDistance = (a, b) => 1 - math.dot(a, b) / (math.norm(a) * math.norm(b));

// 2. Calculate distance matrix
// Computes the pairwise cosine distance between every pair of vectors in x_seq and y_seq.
// Returns a 2D matrix where element (i, j) contains the cosine distance between x_seq[i] and y_seq[j].
const computeDistanceMatrix = (xSeq, ySeq) =>
  xSeq.map(x => ySeq.map(y => cosineDistance(x, y)));

// 3. Dynamic programming alignment path
// Computes the optimal alignment path between x_seq and y_seq using dynamic programming.
// Cost matrix is filled using a recurrence relation where each cell contains the minimum cost
// to reach that point from the start, accounting for the distances between corresponding points in the sequences.
const dp = (distMat) => {
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

//4. Function to create heatmap with alignment path as lines
// The heatmap shows the pairwise cosine distances between elements of x_seq and y_seq.
// The optimal alignment path, computed using dynamic programming, is drawn on top as black lines.

function createHeatmapWithLines(distMat, path) {
    const data = [{
        z: distMat,  // The heatmap data corresponds to the distance matrix.
        type: 'heatmap',
        colorscale: 'Viridis'  // Color scale for the heatmap
    }];

    // Create lines connecting consecutive points in the alignment path.
    const shapes = path.map((p, i) => {
        if (i === path.length - 1) return null;  // Skip the last point as it has no next point to connect to
        const [x0, y0] = path[i];
        const [x1, y1] = path[i + 1];
        return {
            type: 'line',
            xref: 'x',  // Refer to the x-axis for horizontal positioning
            yref: 'y',  // Refer to the y-axis for vertical positioning
            x0: y0,
            y0: x0,
            x1: y1,
            y1: x1,
            line: {
                color: 'black',  // Line color to show the alignment path
                width: 2  // Line thickness
            }
        };
    }).filter(Boolean);  // Remove null values

    // Layout for the plot, including axis titles and the alignment path lines.
    const layout = {
        title: 'Cosine Distance Matrix and Alignment Path',
        xaxis: { title: 'Y Sequence', titlefont: {size: 14} },
        yaxis: { title: 'X Sequence', titlefont: {size: 14} },
        shapes: shapes  // Add the path lines to the plot
    };

    // Render the heatmap and the alignment path using Plotly
    Plotly.newPlot('plot1', data, layout);
}

// 5. Process stretch data after the detection is complete
function processStretchData(stretchDataTimeSeries) {
    // Here, you can perform any preprocessing if needed
    // For now, we directly call compareStretchData with the collected data
    compareStretchData(stretchDataTimeSeries);
}

// 6. Compare the collected stretch data with a reference sequence
async function compareStretchData(stretchDataTimeSeries) {
    const referenceSeq = await loadReferenceSeq();

    // Check if referenceSeq is loaded correctly
    if (!referenceSeq) {
        console.error("Failed to load reference sequence.");
        return;
    }
      
    // Compute distance matrix between the stretch data and reference sequence
    const distMat = computeDistanceMatrix(stretchDataTimeSeries, referenceSeq);

    // Call dp() to get the optimal alignment path and normalized cost
    const { path, costMat, normalizedCost } = dp(distMat);

    // Print the normalized cost for evaluation
    console.log("Normalized Cost:", normalizedCost);
    console.log("Distance Matrix:", distMat);
    console.log("Alignment Path:", path);

    // Visualize the result with a heatmap and path
    createHeatmapWithLines(distMat, path);

    // Transition to the next UI panel after detection ends
    showNextPanel();
}

// Function to load the reference sequence from a JSON file
async function loadReferenceSeq() {
    try {
        const response = await fetch('./ref.json'); // Path to your JSON file
        if (!response.ok) throw new Error('Network response was not ok'); // Error handling
        const referenceSeq = await response.json(); // Parse the JSON data
        return referenceSeq; // Return the parsed data
    } catch (error) {
        console.error('Error loading reference sequence:', error); // Log any errors
    }
}

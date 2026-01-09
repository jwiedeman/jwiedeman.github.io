            // ============================================
            // PATTERN RECOGNITION
            // ============================================
            const patternCanvas = document.getElementById("patternCanvas");
            const patternCtx = patternCanvas.getContext("2d");
            const weightsCanvas = document.getElementById("weightsCanvas");
            const weightsCtx = weightsCanvas.getContext("2d");
            const networkCanvas = document.getElementById("networkCanvas");
            const networkCtx = networkCanvas.getContext("2d");

            // Store current activations for live visualization
            let currentInputActivations = new Array(64).fill(0);
            let currentHiddenActivations = [];
            let currentOutputActivations = new Array(6).fill(0);

            const GRID_SIZE = 8;
            let trainingData = [];
            let W1 = []; // Input to hidden weights
            let b1 = []; // Hidden biases
            let W2 = []; // Hidden to output weights
            let b2 = []; // Output biases
            let hiddenUnits = 6;
            let patternLearningRate = 0.1;
            let patternIteration = 0;
            let patternRunning = false;
            let trainingSpeed = 0.2; // 0 to 1, controls steps per second multiplier
            let maxIterations = 0; // 0 = unlimited
            const NUM_CLASSES = 6; // Updated for new patterns
            let lastFrameTime = 0;
            let stepAccumulator = 0; // Fractional steps to carry over

            // Loss landscape tracking
            let trajectoryPoints = []; // Store [w1, w2, loss] for visualization
            const MAX_TRAJECTORY = 150; // Keep last N points

            // Current batch tracking for visualization
            let currentBatchIndices = [];

            // Track gradients for visualization
            let currentGradientsW1 = [];
            let currentGradientsW2 = [];
            let maxGradientNormW1 = 0;
            let maxGradientNormW2 = 0;
            const CALIBRATION_STEPS = 20; // Track max gradient for first N steps

            function updateNetworkDiagram() {
                // Update hidden layer count displays
                document.getElementById("hiddenCount").textContent =
                    hiddenUnits;
                document.getElementById("hiddenCountDraw").textContent =
                    hiddenUnits;
                // Redraw the live network canvas
                drawLiveNetwork();
            }

            function resizePatternCanvas() {
                const rect = patternCanvas.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;

                // Calculate required height based on samples
                const topPadding = 30;
                const cols = 25;
                const rows = Math.ceil((trainingData.length || 300) / cols);
                const cellSize = rect.width / cols;
                const requiredHeight = topPadding + (rows * cellSize);

                patternCanvas.width = rect.width * dpr;
                patternCanvas.height = requiredHeight * dpr;

                patternCtx.scale(dpr, dpr);

                if (trainingData.length > 0) {
                    updatePatternStats();
                    drawPattern();
                    visualizeWeights();
                }
            }
            resizePatternCanvas();
            resizeWeightsCanvas();
            resizeNetworkCanvas();
            window.addEventListener("resize", () => {
                resizePatternCanvas();
                resizeWeightsCanvas();
                resizeNetworkCanvas();
                resizeLossCanvas();
                drawLossLandscape();
                visualizeWeights();
                drawLiveNetwork();
            });

            function relu(x) {
                return Math.max(0, x);
            }

            function reluDerivative(x) {
                return x > 0 ? 1 : 0;
            }

            function sigmoid(x) {
                return 1 / (1 + Math.exp(-x));
            }

            function sigmoidDerivative(x) {
                const s = sigmoid(x);
                return s * (1 - s);
            }

            function generatePatterns() {
                trainingData = [];

                // Class 0: Horizontal stripes
                for (let i = 0; i < 50; i++) {
                    const pattern = new Array(GRID_SIZE * GRID_SIZE).fill(0);
                    const offset = Math.floor(Math.random() * 2); // Random 0 or 1
                    for (let row = 0; row < GRID_SIZE; row++) {
                        if ((row + offset) % 2 === 0) {
                            for (let col = 0; col < GRID_SIZE; col++) {
                                if (Math.random() > 0.15)
                                    pattern[row * GRID_SIZE + col] = 1;
                            }
                        } else {
                            for (let col = 0; col < GRID_SIZE; col++) {
                                if (Math.random() > 0.85)
                                    pattern[row * GRID_SIZE + col] = 1;
                            }
                        }
                    }
                    trainingData.push({ input: pattern, label: 0 });
                }

                // Class 1: Vertical stripes
                for (let i = 0; i < 50; i++) {
                    const pattern = new Array(GRID_SIZE * GRID_SIZE).fill(0);
                    const offset = Math.floor(Math.random() * 2); // Random 0 or 1
                    for (let row = 0; row < GRID_SIZE; row++) {
                        for (let col = 0; col < GRID_SIZE; col++) {
                            if ((col + offset) % 2 === 0) {
                                if (Math.random() > 0.15)
                                    pattern[row * GRID_SIZE + col] = 1;
                            } else {
                                if (Math.random() > 0.85)
                                    pattern[row * GRID_SIZE + col] = 1;
                            }
                        }
                    }
                    trainingData.push({ input: pattern, label: 1 });
                }

                // Class 2: Diagonal (both orientations)
                for (let i = 0; i < 50; i++) {
                    const pattern = new Array(GRID_SIZE * GRID_SIZE).fill(0);
                    const offset = Math.floor(Math.random() * 3) - 1; // Random -1, 0, or 1
                    const flipped = Math.random() > 0.5; // Randomly choose orientation

                    for (let row = 0; row < GRID_SIZE; row++) {
                        for (let col = 0; col < GRID_SIZE; col++) {
                            const dist = flipped
                                ? Math.abs(row + col - (GRID_SIZE - 1) - offset)
                                : Math.abs(row - col - offset);
                            if (dist <= 2) {
                                if (Math.random() > 0.2)
                                    pattern[row * GRID_SIZE + col] = 1;
                            } else {
                                if (Math.random() > 0.9)
                                    pattern[row * GRID_SIZE + col] = 1;
                            }
                        }
                    }
                    trainingData.push({ input: pattern, label: 2 });
                }

                // Class 3: Checkerboard
                for (let i = 0; i < 50; i++) {
                    const pattern = new Array(GRID_SIZE * GRID_SIZE).fill(0);
                    const offset = Math.floor(Math.random() * 2); // Random 0 or 1
                    for (let row = 0; row < GRID_SIZE; row++) {
                        for (let col = 0; col < GRID_SIZE; col++) {
                            if ((row + col + offset) % 2 === 0) {
                                if (Math.random() > 0.15)
                                    pattern[row * GRID_SIZE + col] = 1;
                            } else {
                                if (Math.random() > 0.85)
                                    pattern[row * GRID_SIZE + col] = 1;
                            }
                        }
                    }
                    trainingData.push({ input: pattern, label: 3 });
                }

                // Class 4: X/Cross pattern
                for (let i = 0; i < 50; i++) {
                    const pattern = new Array(GRID_SIZE * GRID_SIZE).fill(0);
                    const offset = Math.floor(Math.random() * 2) - 1;
                    for (let row = 0; row < GRID_SIZE; row++) {
                        for (let col = 0; col < GRID_SIZE; col++) {
                            // Main diagonal or anti-diagonal
                            const onMainDiag = Math.abs(row - col + offset) <= 1;
                            const onAntiDiag = Math.abs(row + col - (GRID_SIZE - 1) + offset) <= 1;
                            if (onMainDiag || onAntiDiag) {
                                if (Math.random() > 0.15)
                                    pattern[row * GRID_SIZE + col] = 1;
                            } else {
                                if (Math.random() > 0.9)
                                    pattern[row * GRID_SIZE + col] = 1;
                            }
                        }
                    }
                    trainingData.push({ input: pattern, label: 4 });
                }

                // Class 5: Frame/Border pattern
                for (let i = 0; i < 50; i++) {
                    const pattern = new Array(GRID_SIZE * GRID_SIZE).fill(0);
                    const thickness = Math.random() > 0.5 ? 1 : 2;
                    for (let row = 0; row < GRID_SIZE; row++) {
                        for (let col = 0; col < GRID_SIZE; col++) {
                            const onEdge = row < thickness || row >= GRID_SIZE - thickness ||
                                          col < thickness || col >= GRID_SIZE - thickness;
                            if (onEdge) {
                                if (Math.random() > 0.1)
                                    pattern[row * GRID_SIZE + col] = 1;
                            } else {
                                if (Math.random() > 0.92)
                                    pattern[row * GRID_SIZE + col] = 1;
                            }
                        }
                    }
                    trainingData.push({ input: pattern, label: 5 });
                }
            }

            function initPatternNetwork() {
                const inputSize = GRID_SIZE * GRID_SIZE;
                const outputSize = NUM_CLASSES;

                // He initialization for ReLU: std = sqrt(2 / fan_in)
                const std_W1 = Math.sqrt(2 / inputSize);
                const std_W2 = Math.sqrt(2 / hiddenUnits);

                W1 = [];
                for (let i = 0; i < hiddenUnits; i++) {
                    W1[i] = [];
                    for (let j = 0; j < inputSize; j++) {
                        // Box-Muller transform for Gaussian sampling
                        const u1 = Math.random();
                        const u2 = Math.random();
                        const z =
                            Math.sqrt(-2 * Math.log(u1)) *
                            Math.cos(2 * Math.PI * u2);
                        W1[i][j] = z * std_W1;
                    }
                }

                b1 = new Array(hiddenUnits).fill(0);

                W2 = [];
                for (let i = 0; i < outputSize; i++) {
                    W2[i] = [];
                    for (let j = 0; j < hiddenUnits; j++) {
                        const u1 = Math.random();
                        const u2 = Math.random();
                        const z =
                            Math.sqrt(-2 * Math.log(u1)) *
                            Math.cos(2 * Math.PI * u2);
                        W2[i][j] = z * std_W2;
                    }
                }

                b2 = new Array(NUM_CLASSES).fill(0);

                patternIteration = 0;
                trajectoryPoints = []; // Reset trajectory
                currentGradientsW1 = []; // Reset gradients
                currentGradientsW2 = [];
                maxGradientNormW1 = 0; // Reset max gradient
                maxGradientNormW2 = 0;

                // Initialize with random batch for visualization
                currentBatchIndices = [];
                while (currentBatchIndices.length < 4) {
                    const idx = Math.floor(Math.random() * trainingData.length);
                    if (!currentBatchIndices.includes(idx)) {
                        currentBatchIndices.push(idx);
                    }
                }
            }

            // Track 2D projection of weights for visualization
            function getWeightProjection() {
                // Use first two weights from W1 as our 2D projection
                return [W1[0][0], W1[0][1]];
            }

            function forwardPass(input) {
                // Hidden layer
                const hidden = new Array(hiddenUnits);
                const hiddenRaw = new Array(hiddenUnits);
                for (let i = 0; i < hiddenUnits; i++) {
                    let sum = b1[i];
                    for (let j = 0; j < input.length; j++) {
                        sum += W1[i][j] * input[j];
                    }
                    hiddenRaw[i] = sum;
                    hidden[i] = relu(sum);
                }

                // Output layer
                const output = new Array(NUM_CLASSES);
                const outputRaw = new Array(NUM_CLASSES);
                for (let i = 0; i < NUM_CLASSES; i++) {
                    let sum = b2[i];
                    for (let j = 0; j < hiddenUnits; j++) {
                        sum += W2[i][j] * hidden[j];
                    }
                    outputRaw[i] = sum;
                }

                // Softmax
                const maxVal = Math.max(...outputRaw);
                const expVals = outputRaw.map((x) => Math.exp(x - maxVal));
                const sumExp = expVals.reduce((a, b) => a + b, 0);
                for (let i = 0; i < NUM_CLASSES; i++) {
                    output[i] = expVals[i] / sumExp;
                }

                return { hidden, hiddenRaw, output, outputRaw };
            }

            function patternSGDStep() {
                // Sample random batch
                const batchIndices = [];
                const batch = [];
                const usedIndices = new Set();

                // Sample 4 random examples for the batch
                while (batch.length < 4) {
                    const idx = Math.floor(Math.random() * trainingData.length);
                    if (!usedIndices.has(idx)) {
                        usedIndices.add(idx);
                        batchIndices.push(idx);
                        batch.push(trainingData[idx]);
                    }
                }

                // Store for visualization
                currentBatchIndices = batchIndices;

                // Process each sample in batch
                const allGradients = { W1: [], b1: [], W2: [], b2: [] };

                for (const sample of batch) {
                    const input = sample.input;
                    const label = sample.label;

                    // Forward pass
                    const { hidden, hiddenRaw, output, outputRaw } =
                        forwardPass(input);

                    // Compute output gradient (cross-entropy + softmax)
                    const outputGrad = [...output];
                    outputGrad[label] -= 1;

                    // Backprop to hidden layer
                    const hiddenGrad = new Array(hiddenUnits).fill(0);
                    for (let i = 0; i < hiddenUnits; i++) {
                        for (let j = 0; j < NUM_CLASSES; j++) {
                            hiddenGrad[i] += outputGrad[j] * W2[j][i];
                        }
                        hiddenGrad[i] *= reluDerivative(hiddenRaw[i]);
                    }

                    // Accumulate gradients
                    if (!allGradients.W1.length) {
                        allGradients.W1 = W1.map((row) => row.map(() => 0));
                        allGradients.b1 = new Array(hiddenUnits).fill(0);
                        allGradients.W2 = W2.map((row) => row.map(() => 0));
                        allGradients.b2 = new Array(NUM_CLASSES).fill(0);
                    }

                    for (let i = 0; i < NUM_CLASSES; i++) {
                        for (let j = 0; j < hiddenUnits; j++) {
                            allGradients.W2[i][j] += outputGrad[i] * hidden[j];
                        }
                        allGradients.b2[i] += outputGrad[i];
                    }

                    for (let i = 0; i < hiddenUnits; i++) {
                        for (let j = 0; j < input.length; j++) {
                            allGradients.W1[i][j] += hiddenGrad[i] * input[j];
                        }
                        allGradients.b1[i] += hiddenGrad[i];
                    }
                }

                // Average gradients and store for visualization
                const batchSize = batch.length;

                // Store W1 gradients
                currentGradientsW1 = [];
                let stepMaxGradW1 = 0;
                for (let i = 0; i < hiddenUnits; i++) {
                    currentGradientsW1[i] = [];
                    for (let j = 0; j < GRID_SIZE * GRID_SIZE; j++) {
                        const grad = Math.abs(
                            allGradients.W1[i][j] / batchSize,
                        );
                        currentGradientsW1[i][j] = grad;
                        stepMaxGradW1 = Math.max(stepMaxGradW1, grad);
                    }
                }

                // Store W2 gradients
                currentGradientsW2 = [];
                let stepMaxGradW2 = 0;
                for (let i = 0; i < NUM_CLASSES; i++) {
                    currentGradientsW2[i] = [];
                    for (let j = 0; j < hiddenUnits; j++) {
                        const grad = Math.abs(
                            allGradients.W2[i][j] / batchSize,
                        );
                        currentGradientsW2[i][j] = grad;
                        stepMaxGradW2 = Math.max(stepMaxGradW2, grad);
                    }
                }

                // Track maximum gradient during calibration period
                if (patternIteration < CALIBRATION_STEPS) {
                    maxGradientNormW1 = Math.max(maxGradientNormW1, stepMaxGradW1);
                    maxGradientNormW2 = Math.max(maxGradientNormW2, stepMaxGradW2);
                }

                // Apply gradients
                for (let i = 0; i < NUM_CLASSES; i++) {
                    for (let j = 0; j < hiddenUnits; j++) {
                        W2[i][j] -=
                            (patternLearningRate * allGradients.W2[i][j]) /
                            batchSize;
                    }
                    b2[i] -=
                        (patternLearningRate * allGradients.b2[i]) / batchSize;
                }

                for (let i = 0; i < hiddenUnits; i++) {
                    for (let j = 0; j < GRID_SIZE * GRID_SIZE; j++) {
                        W1[i][j] -=
                            (patternLearningRate * allGradients.W1[i][j]) /
                            batchSize;
                    }
                    b1[i] -=
                        (patternLearningRate * allGradients.b1[i]) / batchSize;
                }

                patternIteration++;

                // Track trajectory for loss landscape (every 5 iterations)
                if (patternIteration % 5 === 0) {
                    const [w1, w2] = getWeightProjection();
                    const loss = computePatternStats().loss;
                    trajectoryPoints.push({ w1, w2, loss });
                    if (trajectoryPoints.length > MAX_TRAJECTORY) {
                        trajectoryPoints.shift();
                    }
                }
            }

            function computePatternStats() {
                let totalLoss = 0;
                let correct = 0;

                for (const sample of trainingData) {
                    const { output } = forwardPass(sample.input);
                    const predicted = output.indexOf(Math.max(...output));
                    if (predicted === sample.label) correct++;

                    totalLoss += -Math.log(output[sample.label] + 1e-10);
                }

                return {
                    loss: totalLoss / trainingData.length,
                    accuracy: (correct / trainingData.length) * 100,
                };
            }

            function drawPattern() {
                const rect = patternCanvas.getBoundingClientRect();
                const width = rect.width;
                const height = rect.height;

                patternCtx.fillStyle = "#1c1c1c";
                patternCtx.fillRect(0, 0, width, height);

                const classNames = [
                    "H-Stripe",
                    "V-Stripe",
                    "Diagonal",
                    "Checker",
                    "X-Cross",
                    "Frame",
                ];

                // Draw legend at top
                patternCtx.font = "11px 'Berkeley Mono', monospace";
                patternCtx.fillStyle = "#d9d4cc";
                patternCtx.fillText("■ CORRECT", 10, 15);
                patternCtx.fillStyle = "#ff6b35";
                patternCtx.fillText("■ WRONG", 90, 15);

                // Draw batch indicator - dark square with border
                patternCtx.fillStyle = "#3a3836";
                patternCtx.fillRect(170, 6, 10, 10);
                patternCtx.strokeStyle = "#d9d4cc";
                patternCtx.lineWidth = 1;
                patternCtx.strokeRect(170, 6, 10, 10);

                patternCtx.fillStyle = "#d9d4cc";
                patternCtx.font = "11px 'Berkeley Mono', monospace";
                patternCtx.fillText("BATCH", 185, 15);

                const topPadding = 30;
                const cols = 25;
                const rows = Math.ceil(trainingData.length / cols);
                const cellSize = width / cols;
                const pixelSize = cellSize / GRID_SIZE;

                for (let i = 0; i < trainingData.length; i++) {
                    const sample = trainingData[i];
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    const x = col * cellSize + 2;
                    const y = row * cellSize + topPadding + 2;

                    const isInBatch = currentBatchIndices.includes(i);

                    // Predict and check correctness
                    const { output } = forwardPass(sample.input);
                    const predicted = output.indexOf(Math.max(...output));
                    const isCorrect = predicted === sample.label;

                    // Draw pattern (very small)
                    for (let py = 0; py < GRID_SIZE; py++) {
                        for (let px = 0; px < GRID_SIZE; px++) {
                            const idx = py * GRID_SIZE + px;
                            if (sample.input[idx] === 1) {
                                // Color based on correctness and batch membership
                                if (isInBatch) {
                                    patternCtx.fillStyle = "#d9d4cc";
                                } else {
                                    patternCtx.fillStyle = isCorrect
                                        ? "#d9d4cc"
                                        : "#ff6b35";
                                }
                                patternCtx.fillRect(
                                    x + px * pixelSize,
                                    y + py * pixelSize,
                                    pixelSize - 0.3,
                                    pixelSize - 0.3,
                                );
                            }
                        }
                    }

                    // Draw border based on correctness
                    if (isInBatch) {
                        patternCtx.strokeStyle = "#d9d4cc";
                        patternCtx.lineWidth = 2;
                    } else {
                        patternCtx.strokeStyle = isCorrect
                            ? "#d9d4cc33"
                            : "#ff6b3533";
                        patternCtx.lineWidth = 1;
                    }
                    patternCtx.strokeRect(
                        x - 0.5,
                        y - 0.5,
                        cellSize - 3,
                        cellSize - 3,
                    );
                }
            }

            function resizeWeightsCanvas() {
                const rect = weightsCanvas.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                weightsCanvas.width = rect.width * dpr;
                weightsCanvas.height = rect.height * dpr;
                weightsCtx.scale(dpr, dpr);
            }

            function resizeNetworkCanvas() {
                const rect = networkCanvas.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                networkCanvas.width = rect.width * dpr;
                networkCanvas.height = rect.height * dpr;
                networkCtx.scale(dpr, dpr);
            }

            // Get activation color gradient (dark to bright orange/yellow)
            function getActivationColor(value, maxValue) {
                const normalized = maxValue > 0 ? Math.min(1, Math.max(0, value / maxValue)) : 0;
                // Dark gray to bright orange
                const r = Math.floor(40 + normalized * 215); // 40 -> 255
                const g = Math.floor(40 + normalized * 67);  // 40 -> 107
                const b = Math.floor(40 + normalized * 15);  // 40 -> 55
                return `rgb(${r}, ${g}, ${b})`;
            }

            // Get connection color based on weight magnitude
            function getConnectionColor(weight, maxWeight) {
                const normalized = maxWeight > 0 ? Math.abs(weight) / maxWeight : 0;
                const alpha = 0.05 + normalized * 0.4;
                // Positive weights: orange, Negative weights: blue
                if (weight >= 0) {
                    return `rgba(255, 107, 53, ${alpha})`;
                } else {
                    return `rgba(90, 125, 154, ${alpha})`;
                }
            }

            function drawLiveNetwork(inputPattern, hiddenActs, outputActs) {
                const rect = networkCanvas.getBoundingClientRect();
                const width = rect.width;
                const height = rect.height;
                const padding = 20;

                // Clear canvas
                networkCtx.fillStyle = '#1a1a1a';
                networkCtx.fillRect(0, 0, width, height);

                // Use stored activations or provided ones
                const input = inputPattern || currentInputActivations;
                const hidden = hiddenActs || currentHiddenActivations;
                const output = outputActs || currentOutputActivations;

                // Calculate layer positions
                const layerX = [
                    padding + 30,           // Input layer
                    width / 2,              // Hidden layer
                    width - padding - 30    // Output layer
                ];

                // Calculate max values for normalization
                const maxInput = Math.max(...input.map(Math.abs), 0.001);
                const maxHidden = hidden.length > 0 ? Math.max(...hidden.map(Math.abs), 0.001) : 1;
                const maxOutput = output.length > 0 ? Math.max(...output.map(Math.abs), 0.001) : 1;

                // Node sizes
                const inputNodeSize = 4;
                const hiddenNodeSize = Math.max(6, Math.min(12, 80 / hiddenUnits));
                const outputNodeSize = 10;

                // Calculate node positions
                // Input layer: 8x8 grid
                const inputSpacing = (height - padding * 2) / 8;
                const inputPositions = [];
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        const x = layerX[0] + (col - 3.5) * inputNodeSize * 1.5;
                        const y = padding + row * inputSpacing + inputSpacing / 2;
                        inputPositions.push({ x, y });
                    }
                }

                // Hidden layer: vertical column
                const hiddenSpacing = Math.min(20, (height - padding * 2) / (hiddenUnits + 1));
                const hiddenStartY = padding + (height - padding * 2 - hiddenSpacing * (hiddenUnits - 1)) / 2;
                const hiddenPositions = [];
                for (let i = 0; i < hiddenUnits; i++) {
                    hiddenPositions.push({
                        x: layerX[1],
                        y: hiddenStartY + i * hiddenSpacing
                    });
                }

                // Output layer: vertical column
                const outputSpacing = (height - padding * 2) / (NUM_CLASSES + 1);
                const outputPositions = [];
                for (let i = 0; i < NUM_CLASSES; i++) {
                    outputPositions.push({
                        x: layerX[2],
                        y: padding + (i + 1) * outputSpacing
                    });
                }

                // Find max weight for normalization
                let maxW1 = 0.001, maxW2 = 0.001;
                if (W1.length > 0) {
                    for (let h = 0; h < hiddenUnits; h++) {
                        if (W1[h]) {
                            for (let i = 0; i < 64; i++) {
                                maxW1 = Math.max(maxW1, Math.abs(W1[h][i] || 0));
                            }
                        }
                    }
                }
                if (W2.length > 0) {
                    for (let o = 0; o < NUM_CLASSES; o++) {
                        if (W2[o]) {
                            for (let h = 0; h < hiddenUnits; h++) {
                                maxW2 = Math.max(maxW2, Math.abs(W2[o][h] || 0));
                            }
                        }
                    }
                }

                // Draw connections (only subset for performance)
                networkCtx.lineWidth = 0.5;

                // Input to hidden connections (sample every 4th input for visibility)
                if (W1.length > 0) {
                    for (let h = 0; h < hiddenUnits; h++) {
                        if (!W1[h]) continue;
                        for (let i = 0; i < 64; i += 4) {
                            const weight = W1[h][i] || 0;
                            networkCtx.strokeStyle = getConnectionColor(weight, maxW1);
                            networkCtx.beginPath();
                            networkCtx.moveTo(inputPositions[i].x, inputPositions[i].y);
                            networkCtx.lineTo(hiddenPositions[h].x, hiddenPositions[h].y);
                            networkCtx.stroke();
                        }
                    }
                }

                // Hidden to output connections
                if (W2.length > 0) {
                    for (let o = 0; o < NUM_CLASSES; o++) {
                        if (!W2[o]) continue;
                        for (let h = 0; h < hiddenUnits; h++) {
                            const weight = W2[o][h] || 0;
                            networkCtx.strokeStyle = getConnectionColor(weight, maxW2);
                            networkCtx.beginPath();
                            networkCtx.moveTo(hiddenPositions[h].x, hiddenPositions[h].y);
                            networkCtx.lineTo(outputPositions[o].x, outputPositions[o].y);
                            networkCtx.stroke();
                        }
                    }
                }

                // Draw input nodes
                for (let i = 0; i < 64; i++) {
                    const pos = inputPositions[i];
                    const activation = input[i] || 0;
                    networkCtx.fillStyle = getActivationColor(activation, maxInput);
                    networkCtx.fillRect(
                        pos.x - inputNodeSize / 2,
                        pos.y - inputNodeSize / 2,
                        inputNodeSize,
                        inputNodeSize
                    );
                }

                // Draw hidden nodes
                for (let i = 0; i < hiddenUnits; i++) {
                    const pos = hiddenPositions[i];
                    const activation = hidden[i] || 0;
                    networkCtx.fillStyle = getActivationColor(activation, maxHidden);
                    networkCtx.beginPath();
                    networkCtx.arc(pos.x, pos.y, hiddenNodeSize / 2, 0, Math.PI * 2);
                    networkCtx.fill();
                    // Border
                    networkCtx.strokeStyle = '#ff6b35';
                    networkCtx.lineWidth = 1;
                    networkCtx.stroke();
                }

                // Draw output nodes
                const classNames = ['H', 'V', 'D', 'C', 'X', 'F'];
                for (let i = 0; i < NUM_CLASSES; i++) {
                    const pos = outputPositions[i];
                    const activation = output[i] || 0;
                    networkCtx.fillStyle = getActivationColor(activation, maxOutput);
                    networkCtx.beginPath();
                    networkCtx.arc(pos.x, pos.y, outputNodeSize / 2, 0, Math.PI * 2);
                    networkCtx.fill();
                    // Border
                    networkCtx.strokeStyle = '#5a7d9a';
                    networkCtx.lineWidth = 1.5;
                    networkCtx.stroke();
                    // Label
                    networkCtx.fillStyle = '#d9d4cc';
                    networkCtx.font = '9px monospace';
                    networkCtx.textAlign = 'center';
                    networkCtx.fillText(classNames[i], pos.x + outputNodeSize + 8, pos.y + 3);
                }

                // Draw layer labels
                networkCtx.fillStyle = '#666';
                networkCtx.font = '10px monospace';
                networkCtx.textAlign = 'center';
                networkCtx.fillText('INPUT', layerX[0], height - 5);
                networkCtx.fillText('HIDDEN', layerX[1], height - 5);
                networkCtx.fillText('OUTPUT', layerX[2], height - 5);
            }

            function visualizeWeights() {
                const rect = weightsCanvas.getBoundingClientRect();
                const width = rect.width;
                const height = rect.height;
                const padding = 8;

                weightsCtx.fillStyle = "#1c1c1c";
                weightsCtx.fillRect(0, 0, width, height);

                // Collect all weights for global normalization
                const allWeights = [];
                for (let h = 0; h < hiddenUnits; h++) {
                    allWeights.push(...W1[h]);
                }
                for (let i = 0; i < NUM_CLASSES; i++) {
                    allWeights.push(...W2[i]);
                }
                const min = Math.min(...allWeights);
                const max = Math.max(...allWeights);
                const range = max - min;

                // Total weights: W1 (64 * hiddenUnits) + W2 (NUM_CLASSES * hiddenUnits)
                const totalW1 = 64 * hiddenUnits;
                const totalW2 = NUM_CLASSES * hiddenUnits;
                const totalWeights = totalW1 + totalW2;

                // Layout as a grid with padding
                const availableWidth = width - (padding * 2);
                const availableHeight = height - (padding * 2);
                const cols = Math.ceil(Math.sqrt(totalWeights * (availableWidth / availableHeight)));
                const rows = Math.ceil(totalWeights / cols);
                const cellWidth = availableWidth / cols;
                const cellHeight = availableHeight / rows;

                let weightIdx = 0;

                // Draw W1 weights
                for (let h = 0; h < hiddenUnits; h++) {
                    for (let i = 0; i < 64; i++) {
                        const weight = W1[h][i];
                        const normalized = range > 0 ? (weight - min) / range : 0.5;
                        const intensity = Math.floor(normalized * 255);

                        let r = intensity, g = intensity, b = intensity;

                        // Gradient overlay
                        if (currentGradientsW1[h] && maxGradientNormW1 > 0) {
                            const gradMag = currentGradientsW1[h][i];
                            const normGrad = Math.min(1, gradMag / maxGradientNormW1);
                            r = Math.floor(intensity + (255 - intensity) * normGrad * 0.7);
                            g = Math.floor(intensity + (165 - intensity) * normGrad * 0.7);
                            b = Math.floor(intensity + (0 - intensity) * normGrad * 0.7);
                        }

                        const col = weightIdx % cols;
                        const row = Math.floor(weightIdx / cols);
                        weightsCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                        weightsCtx.fillRect(padding + col * cellWidth, padding + row * cellHeight, cellWidth, cellHeight);

                        weightIdx++;
                    }
                }

                // Draw W2 weights
                for (let outClass = 0; outClass < NUM_CLASSES; outClass++) {
                    for (let h = 0; h < hiddenUnits; h++) {
                        const weight = W2[outClass][h];
                        const normalized = range > 0 ? (weight - min) / range : 0.5;
                        const intensity = Math.floor(normalized * 255);

                        let r = intensity, g = intensity, b = intensity;

                        // Gradient overlay
                        if (currentGradientsW2[outClass] && maxGradientNormW2 > 0) {
                            const gradMag = currentGradientsW2[outClass][h];
                            const normGrad = Math.min(1, gradMag / maxGradientNormW2);
                            r = Math.floor(intensity + (255 - intensity) * normGrad * 0.7);
                            g = Math.floor(intensity + (165 - intensity) * normGrad * 0.7);
                            b = Math.floor(intensity + (0 - intensity) * normGrad * 0.7);
                        }

                        const col = weightIdx % cols;
                        const row = Math.floor(weightIdx / cols);
                        weightsCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                        weightsCtx.fillRect(padding + col * cellWidth, padding + row * cellHeight, cellWidth, cellHeight);

                        weightIdx++;
                    }
                }

                // Draw weight count in bottom right
                weightsCtx.font = "11px 'Berkeley Mono', monospace";
                weightsCtx.fillStyle = "#000";
                weightsCtx.textAlign = "right";
                weightsCtx.textBaseline = "bottom";
                weightsCtx.fillText(`${totalWeights} weights`, width - padding, height - padding);
            }

            // ============================================
            // LOSS LANDSCAPE VISUALIZATION
            // ============================================
            const lossCanvas = document.getElementById("lossLandscape");
            const lossCtx = lossCanvas.getContext("2d");

            function resizeLossCanvas() {
                const dpr = window.devicePixelRatio || 1;
                lossCanvas.width = 150 * dpr;
                lossCanvas.height = 120 * dpr;
                lossCtx.scale(dpr, dpr);
            }
            resizeLossCanvas();

            function drawLossLandscape() {
                const width = 150;
                const height = 120;

                lossCtx.fillStyle = "#1c1c1c";
                lossCtx.fillRect(0, 0, width, height);

                if (trajectoryPoints.length < 2) return;

                // Find bounds for trajectory
                const w1Values = trajectoryPoints.map((p) => p.w1);
                const w2Values = trajectoryPoints.map((p) => p.w2);
                const lossValues = trajectoryPoints.map((p) => p.loss);

                const minW1 = Math.min(...w1Values);
                const maxW1 = Math.max(...w1Values);
                const minW2 = Math.min(...w2Values);
                const maxW2 = Math.max(...w2Values);
                const minLoss = Math.min(...lossValues);
                const maxLoss = Math.max(...lossValues);

                const rangeW1 = maxW1 - minW1 || 1;
                const rangeW2 = maxW2 - minW2 || 1;
                const rangeLoss = maxLoss - minLoss || 1;

                // 3D projection parameters
                const centerX = width / 2;
                const centerY = height * 0.7;
                const scaleXY = Math.min(width, height) * 0.3;
                const scaleZ = -height * 0.4; // Negative to invert Y-axis

                // Project 3D point to 2D (isometric-ish projection)
                function project3D(w1, w2, loss) {
                    const nx = (w1 - minW1) / rangeW1 - 0.5; // -0.5 to 0.5
                    const ny = (w2 - minW2) / rangeW2 - 0.5;
                    const nz = (loss - minLoss) / rangeLoss;

                    // Isometric projection
                    const x = centerX + (nx - ny) * scaleXY;
                    const y = centerY + (nx + ny) * scaleXY * 0.5 + nz * scaleZ;

                    return { x, y };
                }

                // Draw grid for the base plane
                lossCtx.strokeStyle = "#3a3836";
                lossCtx.lineWidth = 1;

                for (let i = 0; i <= 10; i++) {
                    const t = i / 10;
                    const w1 = minW1 + rangeW1 * t;
                    const w2_start = minW2;
                    const w2_end = minW2 + rangeW2;

                    const p1 = project3D(w1, w2_start, minLoss);
                    const p2 = project3D(w1, w2_end, minLoss);

                    lossCtx.beginPath();
                    lossCtx.moveTo(p1.x, p1.y);
                    lossCtx.lineTo(p2.x, p2.y);
                    lossCtx.stroke();
                }

                for (let i = 0; i <= 10; i++) {
                    const t = i / 10;
                    const w2 = minW2 + rangeW2 * t;
                    const w1_start = minW1;
                    const w1_end = minW1 + rangeW1;

                    const p1 = project3D(w1_start, w2, minLoss);
                    const p2 = project3D(w1_end, w2, minLoss);

                    lossCtx.beginPath();
                    lossCtx.moveTo(p1.x, p1.y);
                    lossCtx.lineTo(p2.x, p2.y);
                    lossCtx.stroke();
                }

                // Draw trajectory path
                lossCtx.strokeStyle = "#ff6b35";
                lossCtx.lineWidth = 2;
                lossCtx.beginPath();

                for (let i = 0; i < trajectoryPoints.length; i++) {
                    const point = trajectoryPoints[i];
                    const { x, y } = project3D(point.w1, point.w2, point.loss);

                    if (i === 0) {
                        lossCtx.moveTo(x, y);
                    } else {
                        lossCtx.lineTo(x, y);
                    }
                }

                lossCtx.stroke();

                // Draw points along trajectory (with fade)
                for (let i = 0; i < trajectoryPoints.length; i++) {
                    const point = trajectoryPoints[i];
                    const { x, y } = project3D(point.w1, point.w2, point.loss);

                    const alpha = (i / trajectoryPoints.length) * 0.6 + 0.4;
                    lossCtx.fillStyle = `rgba(255, 107, 53, ${alpha})`;
                    lossCtx.beginPath();
                    lossCtx.arc(x, y, 2, 0, Math.PI * 2);
                    lossCtx.fill();
                }

                // Draw current position (larger)
                if (trajectoryPoints.length > 0) {
                    const current =
                        trajectoryPoints[trajectoryPoints.length - 1];
                    const { x, y } = project3D(
                        current.w1,
                        current.w2,
                        current.loss,
                    );

                    lossCtx.fillStyle = "#ff6b35";
                    lossCtx.beginPath();
                    lossCtx.arc(x, y, 4, 0, Math.PI * 2);
                    lossCtx.fill();

                    lossCtx.strokeStyle = "#d9d4cc";
                    lossCtx.lineWidth = 2;
                    lossCtx.stroke();
                }

                // No labels needed for compact view
            }

            function updatePatternStats() {
                const stats = computePatternStats();
                document.getElementById("patternIteration").textContent =
                    patternIteration;
                document.getElementById("patternLoss").textContent =
                    stats.loss.toFixed(3);
                document.getElementById("patternAccuracy").textContent =
                    Math.round(stats.accuracy) + "%";

                // Check for stopping conditions
                const hitMaxIterations = maxIterations > 0 && patternIteration >= maxIterations;

                if (hitMaxIterations && patternRunning) {
                    patternRunning = false;
                    document.getElementById("patternStartBtn").textContent =
                        "START LEARNING";
                    document.getElementById("patternStatus").textContent =
                        "MAX ITERATIONS";
                    document.getElementById("patternStatus").style.color =
                        "#ff6b35";
                    document.getElementById("patternStatus").style.fontWeight =
                        "bold";
                } else {
                    document.getElementById("patternStatus").textContent =
                        patternRunning ? "ACTIVE" : "PAUSED";
                    document.getElementById("patternStatus").style.color =
                        "";
                    document.getElementById("patternStatus").style.fontWeight =
                        "normal";
                }
            }

            function animatePattern(timestamp) {
                if (!patternRunning) return;

                // Initialize lastFrameTime on first frame
                if (lastFrameTime === 0) {
                    lastFrameTime = timestamp;
                    requestAnimationFrame(animatePattern);
                    return;
                }

                // Calculate elapsed time in seconds
                const deltaTime = (timestamp - lastFrameTime) / 1000;
                lastFrameTime = timestamp;

                // Calculate steps to run based on time elapsed
                // Base speed: 100 steps/sec, scaled by trainingSpeed (0 to 1)
                const stepsPerSecond = trainingSpeed * 100;
                stepAccumulator += stepsPerSecond * deltaTime;

                // Execute accumulated steps
                const stepsToRun = Math.floor(stepAccumulator);
                stepAccumulator -= stepsToRun;

                for (let i = 0; i < stepsToRun; i++) {
                    patternSGDStep();
                }

                // Update visualization every frame
                updatePatternStats();
                drawPattern();
                visualizeWeights();
                drawLossLandscape();

                // Update live network with current batch sample activations
                if (currentBatchIndices.length > 0 && trainingData.length > 0) {
                    const sampleIdx = currentBatchIndices[0];
                    const sample = trainingData[sampleIdx];
                    if (sample) {
                        const { hidden, output } = forwardPass(sample.input);
                        currentInputActivations = sample.input;
                        currentHiddenActivations = hidden;
                        currentOutputActivations = output;
                        drawLiveNetwork();
                    }
                }

                requestAnimationFrame(animatePattern);
            }

            document
                .getElementById("patternStartBtn")
                .addEventListener("click", () => {
                    patternRunning = !patternRunning;
                    const btn = document.getElementById("patternStartBtn");
                    if (patternRunning) {
                        btn.textContent = "PAUSE";
                        lastFrameTime = 0; // Reset timing
                        stepAccumulator = 0;
                        requestAnimationFrame(animatePattern);
                    } else {
                        btn.textContent = "START LEARNING";
                    }
                });

            document
                .getElementById("patternResetBtn")
                .addEventListener("click", () => {
                    patternRunning = false;
                    document.getElementById("patternStartBtn").textContent =
                        "START LEARNING";
                    lastFrameTime = 0;
                    stepAccumulator = 0;
                    initPatternNetwork();
                    updatePatternStats();
                    drawPattern();
                    visualizeWeights();
                    drawLossLandscape();
                    // Reset network visualization with first sample
                    if (trainingData.length > 0) {
                        const sample = trainingData[0];
                        const { hidden, output } = forwardPass(sample.input);
                        currentInputActivations = sample.input;
                        currentHiddenActivations = hidden;
                        currentOutputActivations = output;
                        drawLiveNetwork();
                    }
                });

            document
                .getElementById("patternLearningRate")
                .addEventListener("input", (e) => {
                    patternLearningRate = parseFloat(e.target.value);
                    document.getElementById(
                        "patternLearningRateValue",
                    ).textContent = patternLearningRate.toFixed(3);
                });

            document
                .getElementById("trainingSpeed")
                .addEventListener("input", (e) => {
                    trainingSpeed = parseFloat(e.target.value);
                    // Show up to 3 decimal places, removing trailing zeros
                    const formatted = parseFloat(
                        trainingSpeed.toFixed(3),
                    ).toString();
                    document.getElementById("trainingSpeedValue").textContent =
                        formatted;
                });

            document
                .getElementById("hiddenUnits")
                .addEventListener("input", (e) => {
                    const newHiddenUnits = parseInt(e.target.value);
                    if (newHiddenUnits !== hiddenUnits) {
                        hiddenUnits = newHiddenUnits;
                        document.getElementById(
                            "hiddenUnitsValue",
                        ).textContent = hiddenUnits;
                        patternRunning = false;
                        document.getElementById("patternStartBtn").textContent =
                            "START LEARNING";
                        lastFrameTime = 0;
                        stepAccumulator = 0;
                        initPatternNetwork();
                        updatePatternStats();
                        drawPattern();
                        visualizeWeights();
                        updateNetworkDiagram();
                        drawLossLandscape();
                        // Update network visualization with new hidden layer size
                        if (trainingData.length > 0) {
                            const sample = trainingData[0];
                            const { hidden, output } = forwardPass(sample.input);
                            currentInputActivations = sample.input;
                            currentHiddenActivations = hidden;
                            currentOutputActivations = output;
                            drawLiveNetwork();
                        }
                    }
                });

            document
                .getElementById("maxIterations")
                .addEventListener("input", (e) => {
                    maxIterations = parseInt(e.target.value) || 0;
                });

            // ============================================
            // DRAWING INTERFACE
            // ============================================
            const drawCanvasContainer = document.getElementById("drawCanvas");
            let drawState = new Array(GRID_SIZE * GRID_SIZE).fill(0);
            let isDrawing = false;
            let drawMode = 1; // 1 = drawing, 0 = erasing

            // Initialize drawing canvas
            function initDrawCanvas() {
                drawCanvasContainer.innerHTML = "";
                for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
                    const pixel = document.createElement("div");
                    pixel.className = "draw-pixel";
                    pixel.dataset.index = i;
                    drawCanvasContainer.appendChild(pixel);
                }
            }

            function updateDrawCanvas() {
                const pixels =
                    drawCanvasContainer.querySelectorAll(".draw-pixel");
                pixels.forEach((pixel, i) => {
                    if (drawState[i] === 1) {
                        pixel.classList.add("active");
                    } else {
                        pixel.classList.remove("active");
                    }
                });
            }

            function classifyDrawing() {
                const classNames = [
                    "H-Stripe",
                    "V-Stripe",
                    "Diagonal",
                    "Checker",
                    "X-Cross",
                    "Frame",
                ];

                // Check if anything is drawn
                if (drawState.every((v) => v === 0)) {
                    document.getElementById("drawPrediction").textContent = "—";
                    document.getElementById("drawConfidence").textContent = "—";
                    document.getElementById("activationsViz").innerHTML = "";
                    document.getElementById("outputActivationsViz").innerHTML = "";
                    return;
                }

                // Classify
                const { output, hidden } = forwardPass(drawState);
                const predicted = output.indexOf(Math.max(...output));
                const confidence = (output[predicted] * 100).toFixed(1);

                document.getElementById("drawPrediction").textContent =
                    classNames[predicted];
                document.getElementById("drawConfidence").textContent =
                    `${confidence}%`;

                // Visualize hidden layer activations
                const activationsContainer = document.getElementById("activationsViz");
                activationsContainer.innerHTML = "";

                const maxActivation = Math.max(...hidden);

                for (let i = 0; i < hidden.length; i++) {
                    const activation = hidden[i];
                    const normalized = maxActivation > 0 ? activation / maxActivation : 0;
                    const intensity = Math.floor(normalized * 255);

                    const cell = document.createElement("div");
                    cell.style.width = "35px";
                    cell.style.height = "35px";
                    cell.style.background = `rgb(${intensity}, ${intensity}, ${intensity})`;
                    cell.style.border = "1px solid #3a3836";
                    cell.style.display = "flex";
                    cell.style.alignItems = "center";
                    cell.style.justifyContent = "center";
                    cell.style.fontSize = "10px";
                    cell.style.fontWeight = "bold";
                    cell.style.color = normalized > 0.5 ? "#141414" : "#d9d4cc";
                    cell.textContent = activation.toFixed(1);

                    activationsContainer.appendChild(cell);
                }

                // Visualize output layer activations
                const outputContainer = document.getElementById("outputActivationsViz");
                outputContainer.innerHTML = "";

                const maxOutput = Math.max(...output);

                for (let i = 0; i < output.length; i++) {
                    const activation = output[i];
                    const normalized = maxOutput > 0 ? activation / maxOutput : 0;
                    const intensity = Math.floor(normalized * 255);

                    const cell = document.createElement("div");
                    cell.style.width = "60px";
                    cell.style.height = "35px";
                    cell.style.background = `rgb(${intensity}, ${intensity}, ${intensity})`;
                    cell.style.border = i === predicted ? "2px solid #ff6b35" : "1px solid #3a3836";
                    cell.style.display = "flex";
                    cell.style.alignItems = "center";
                    cell.style.justifyContent = "center";
                    cell.style.fontSize = "9px";
                    cell.style.fontWeight = "bold";
                    cell.style.color = normalized > 0.5 ? "#141414" : "#d9d4cc";
                    cell.style.flexDirection = "column";
                    cell.style.gap = "2px";

                    const label = document.createElement("div");
                    label.style.fontSize = "8px";
                    label.textContent = classNames[i].toUpperCase();

                    const value = document.createElement("div");
                    value.textContent = (activation * 100).toFixed(0) + "%";

                    cell.appendChild(label);
                    cell.appendChild(value);

                    outputContainer.appendChild(cell);
                }

                // Update live network visualization with user's drawing
                currentInputActivations = drawState;
                currentHiddenActivations = hidden;
                currentOutputActivations = output;
                drawLiveNetwork();
            }

            function togglePixel(index) {
                drawState[index] = drawState[index] === 1 ? 0 : 1;
                updateDrawCanvas();
                classifyDrawing();
            }

            // Mouse events
            drawCanvasContainer.addEventListener("mousedown", (e) => {
                if (e.target.classList.contains("draw-pixel")) {
                    const index = parseInt(e.target.dataset.index);
                    isDrawing = true;
                    // Set draw mode based on current pixel state (toggle)
                    drawMode = drawState[index] === 1 ? 0 : 1;
                    drawState[index] = drawMode;
                    updateDrawCanvas();
                    classifyDrawing();
                }
            });

            drawCanvasContainer.addEventListener("mouseover", (e) => {
                if (isDrawing && e.target.classList.contains("draw-pixel")) {
                    const index = parseInt(e.target.dataset.index);
                    if (drawState[index] !== drawMode) {
                        drawState[index] = drawMode;
                        updateDrawCanvas();
                        classifyDrawing();
                    }
                }
            });

            document.addEventListener("mouseup", () => {
                isDrawing = false;
            });

            // Touch events for mobile
            drawCanvasContainer.addEventListener("touchstart", (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const element = document.elementFromPoint(
                    touch.clientX,
                    touch.clientY,
                );
                if (element && element.classList.contains("draw-pixel")) {
                    const index = parseInt(element.dataset.index);
                    isDrawing = true;
                    // Set draw mode based on current pixel state (toggle)
                    drawMode = drawState[index] === 1 ? 0 : 1;
                    drawState[index] = drawMode;
                    updateDrawCanvas();
                    classifyDrawing();
                }
            });

            drawCanvasContainer.addEventListener("touchmove", (e) => {
                e.preventDefault();
                if (isDrawing) {
                    const touch = e.touches[0];
                    const element = document.elementFromPoint(
                        touch.clientX,
                        touch.clientY,
                    );
                    if (element && element.classList.contains("draw-pixel")) {
                        const index = parseInt(element.dataset.index);
                        if (drawState[index] !== drawMode) {
                            drawState[index] = drawMode;
                            updateDrawCanvas();
                            classifyDrawing();
                        }
                    }
                }
            });

            document.addEventListener("touchend", () => {
                isDrawing = false;
            });

            document
                .getElementById("clearDrawing")
                .addEventListener("click", () => {
                    drawState = new Array(GRID_SIZE * GRID_SIZE).fill(0);
                    updateDrawCanvas();
                    classifyDrawing();
                });

            // Initialize everything
            generatePatterns();
            initPatternNetwork();
            resizePatternCanvas(); // Resize now that we have data
            updatePatternStats();
            drawPattern();
            visualizeWeights();
            updateNetworkDiagram();
            drawLossLandscape();
            initDrawCanvas();

            // Initialize network visualization with first sample
            if (trainingData.length > 0) {
                const sample = trainingData[0];
                const { hidden, output } = forwardPass(sample.input);
                currentInputActivations = sample.input;
                currentHiddenActivations = hidden;
                currentOutputActivations = output;
                drawLiveNetwork();
            }

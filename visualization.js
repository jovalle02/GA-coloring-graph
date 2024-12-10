// Import required modules for genetic algorithm and generation playback
import { geneticAlgorithm } from './geneticAlgo.js';
import { GenerationPlayer } from './player.js';

// Initialize the generation player for animation control
const player = new GenerationPlayer();

// Get the main container and initialize SVG canvas
const container = document.querySelector('.graph-container');
const svg = d3.select("#graph");
let width, height;

// Setup fitness chart dimensions and margins
const fitnessChartSvg = d3.select("#fitness-chart");
const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const fitnessWidth = document.getElementById('fitness-chart').clientWidth - margin.left - margin.right;
const fitnessHeight = 200 - margin.top - margin.bottom;

// Create the main fitness chart group with proper margins
const fitnessChart = fitnessChartSvg
    .attr("width", fitnessWidth + margin.left + margin.right)
    .attr("height", fitnessHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Setup scales for the fitness chart
const xScale = d3.scaleLinear().range([0, fitnessWidth]);
const yScale = d3.scaleLinear().range([fitnessHeight, 0]);

// Add axes to the fitness chart
fitnessChart.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${fitnessHeight})`);

fitnessChart.append("g")
    .attr("class", "y-axis");

// Add axis labels
fitnessChart.append("text")
    .attr("transform", `translate(${fitnessWidth/2},${fitnessHeight + 25})`)
    .style("text-anchor", "middle")
    .text("Generation");

fitnessChart.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left)
    .attr("x", -fitnessHeight/2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Fitness");

/**
 * Updates the fitness chart with new data
 * @param {number[]} bestFitnessData - Array of best fitness values per generation
 * @param {number[]} avgFitnessData - Array of average fitness values per generation
 */
function updateFitnessChart(bestFitnessData, avgFitnessData) {
    // Update scale domains based on new data
    xScale.domain([0, bestFitnessData.length - 1]);
    yScale.domain([
        Math.min(d3.min(bestFitnessData), d3.min(avgFitnessData)), 
        Math.max(d3.max(bestFitnessData), d3.max(avgFitnessData))
    ]);

    // Update axes
    fitnessChart.select(".x-axis")
        .call(d3.axisBottom(xScale).ticks(5));
    fitnessChart.select(".y-axis")
        .call(d3.axisLeft(yScale).ticks(5));

    // Create line generator for the fitness curves
    const line = d3.line()
        .x((d, i) => xScale(i))
        .y(d => yScale(d));

    // Remove existing lines
    fitnessChart.selectAll(".fitness-line").remove();

    // Add new lines for best and average fitness
    fitnessChart.append("path")
        .datum(bestFitnessData)
        .attr("class", "fitness-line best-fitness")
        .style("stroke", "#2196F3")
        .attr("d", line);

    fitnessChart.append("path")
        .datum(avgFitnessData)
        .attr("class", "fitness-line avg-fitness")
        .style("stroke", "#4CAF50")
        .style("opacity", 0.7)
        .attr("d", line);
}

/**
 * Updates SVG dimensions based on container size
 */
function updateDimensions() {
    width = container.clientWidth;
    height = container.clientHeight;
    svg
        .attr("width", width)
        .attr("height", height);
}

// Initial dimension setup and resize handler
updateDimensions();
window.addEventListener('resize', () => {
    updateDimensions();
    if (nodes.length > 0) {
        centerGraph();
    }
});

// Setup color scale for node coloring
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Create groups for graph elements
const linksGroup = svg.append("g").attr("class", "links-group");
const nodesGroup = svg.append("g").attr("class", "nodes-group");

// Initialize graph state
let nodes = [];
let links = [];
let graph = {};
let nextNodeId = 0;
let numColors = 3; 

// Constants
const EDGE_LENGTH = 150;

// Edge creation state
let selectedNode = null;
let isCreatingEdge = false;

// Create temporary line for edge creation visualization
const dragLine = svg.append("line")
    .attr("class", "drag-line")
    .style("stroke", "#999")
    .style("stroke-width", 2)
    .style("stroke-dasharray", "5,5")
    .style("visibility", "hidden");

// Handle mouse movement during edge creation
svg.on("mousemove", function(event) {
    if (isCreatingEdge && selectedNode) {
        const [x, y] = d3.pointer(event);
        dragLine
            .attr("x1", selectedNode.x)
            .attr("y1", selectedNode.y)
            .attr("x2", x)
            .attr("y2", y);
    }
});

/**
 * Initiates edge creation from a node
 * @param {Object} node - The source node for the new edge
 */
function startEdgeCreation(node) {
    selectedNode = node;
    isCreatingEdge = true;
    dragLine
        .style("visibility", "visible")
        .attr("x1", node.x)
        .attr("y1", node.y)
        .attr("x2", node.x)
        .attr("y2", node.y);
}

/**
 * Handles node clicks for edge creation
 * @param {Event} event - The click event
 * @param {Object} node - The clicked node
 */
function handleNodeClick(event, node) {
    if (!isCreatingEdge) {
        startEdgeCreation(node);
    } else if (selectedNode) {
        if (node !== selectedNode) {
            addEdge(selectedNode.id, node.id);
        }
        isCreatingEdge = false;
        selectedNode = null;
        dragLine.style("visibility", "hidden");
    }
    event.stopPropagation();
}

// Setup node dragging behavior
const nodeDrag = d3.drag()
    .on("drag", (event, d) => {
        if (!isCreatingEdge) {
            d.x = event.x;
            d.y = event.y;
            updatePositions();
        }
    });

/**
 * Gets genetic algorithm parameters from UI inputs
 * @returns {Object|null} Parameters object or null if validation fails
 */
function getGAParameters() {
    const populationSize = parseInt(document.getElementById('populationSize').value);
    const generations = parseInt(document.getElementById('generations').value);
    const mutationRate = parseFloat(document.getElementById('mutationRate').value);

    // Validate parameters
    if (populationSize < 10 || populationSize > 1000) {
        alert('Population size must be between 10 and 1000');
        return null;
    }
    if (generations < 10 || generations > 1000) {
        alert('Number of generations must be between 10 and 1000');
        return null;
    }
    if (mutationRate < 0 || mutationRate > 1) {
        alert('Mutation rate must be between 0 and 1');
        return null;
    }

    return {
        populationSize,
        generations,
        mutationRate
    };
}

/**
 * Updates positions of all nodes and edges in the graph
 */
function updatePositions() {
    linksGroup.selectAll(".link")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    nodesGroup.selectAll(".node")
        .attr("transform", d => `translate(${d.x},${d.y})`);
}

/**
 * Centers the graph in the viewport
 */
function centerGraph() {
    if (nodes.length === 0) return;

    // Calculate graph bounds
    const bounds = {
        minX: d3.min(nodes, d => d.x),
        maxX: d3.max(nodes, d => d.x),
        minY: d3.min(nodes, d => d.y),
        maxY: d3.max(nodes, d => d.y)
    };

    // Calculate current and desired centers
    const currentCenter = {
        x: (bounds.minX + bounds.maxX) / 2,
        y: (bounds.minY + bounds.maxY) / 2
    };

    const desiredCenter = {
        x: width / 2,
        y: height / 2
    };

    // Calculate and apply offset
    const offset = {
        x: desiredCenter.x - currentCenter.x,
        y: desiredCenter.y - currentCenter.y
    };

    nodes.forEach(node => {
        node.x += offset.x;
        node.y += offset.y;
    });

    updatePositions();
}

/**
 * Updates the graph visualization
 */
function update() {
    // Update links
    const link = linksGroup.selectAll(".link")
        .data(links);

    link.exit().remove();

    link.enter()
        .append("line")
        .attr("class", "link")
        .style("stroke", "#999")
        .style("stroke-width", 2);

    // Update nodes
    const node = nodesGroup.selectAll(".node")
        .data(nodes);

    node.exit().remove();

    const nodeEnter = node.enter()
        .append("g")
        .attr("class", "node")
        .call(nodeDrag)
        .on("click", handleNodeClick);

    // Add circle and text to new nodes
    nodeEnter.append("circle")
        .attr("r", 20)
        .style("stroke", "#333")
        .style("stroke-width", 2);

    nodeEnter.append("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .text(d => d.id);

    updatePositions();
}

// Handle clicks on the SVG canvas
svg.on("click", function(event) {
    if (event.target.tagName === "svg") {
        if (isCreatingEdge) {
            isCreatingEdge = false;
            selectedNode = null;
            dragLine.style("visibility", "hidden");
        } else {
            // Add new node at click position
            const point = d3.pointer(event);
            const node = {
                id: nextNodeId++,
                x: point[0],
                y: point[1]
            };
            nodes.push(node);
            graph[node.id] = [];
            update();
            recalculateColoring();
        }
    }
});

/**
 * Adds an edge between two nodes
 * @param {number} sourceId - Source node ID
 * @param {number} targetId - Target node ID
 */
function addEdge(sourceId, targetId) {
    if (!graph[sourceId].includes(targetId)) {
        // Update adjacency list
        graph[sourceId].push(targetId);
        graph[targetId].push(sourceId);
        
        // Add visual link
        links.push({ 
            source: nodes.find(n => n.id === sourceId), 
            target: nodes.find(n => n.id === targetId) 
        });
        
        update();
        recalculateColoring();
    }
}

/**
 * Recalculates graph coloring using genetic algorithm
 */
function recalculateColoring() {
    if (nodes.length === 0) return;

    const params = getGAParameters();
    if (!params) return;

    // Run genetic algorithm
    const result = geneticAlgorithm(
        graph, 
        numColors, 
        params.populationSize,
        params.generations,
        params.mutationRate
    );
    
    // Update generation player with new results
    player.setData(result.populationHistory, result.fitnessHistory);
    
    // Set callback for coloring nodes
    player.setOnGenerationChange((generationColors) => {
        nodesGroup.selectAll(".node circle")
            .style("fill", (d) => colorScale(generationColors[d.id]));
    });

    // Update fitness chart
    if (result.fitnessHistory && result.avgFitnessHistory) {
        updateFitnessChart(result.fitnessHistory, result.avgFitnessHistory);
    }

    // Update best fitness display
    const bestFitnessElement = document.getElementById('bestFitness');
    if (bestFitnessElement) {
        bestFitnessElement.textContent = result.fitness;
        bestFitnessElement.className = result.fitness === 0 ? 'badge bg-success fs-6' : 'badge bg-warning fs-6';
    }
}

/**
 * Resets the graph to initial triangle configuration
 */
function resetGraph() {
    const spacing = EDGE_LENGTH;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create triangle configuration
    nodes = [
        { id: 0, x: centerX - spacing/2, y: centerY },
        { id: 1, x: centerX + spacing/2, y: centerY },
        { id: 2, x: centerX, y: centerY - spacing * Math.sin(Math.PI/3) }
    ];
    links = [
        { source: nodes[0], target: nodes[1] },
        { source: nodes[1], target: nodes[2] },
        { source: nodes[2], target: nodes[0] }
    ];
    graph = {
        0: [1, 2],
        1: [0, 2],
        2: [0, 1]
    };
    nextNodeId = 3;
    
    // Reset state
    isCreatingEdge = false;
    selectedNode = null;
    dragLine.style("visibility", "hidden");
    
    update();
    recalculateColoring();
    player.reset();
}

/**
 * Clears the entire graph
 */

function clearGraph() {
    nodes = [];
    links = [];
    graph = {};
    nextNodeId = 0;
    isCreatingEdge = false;
    selectedNode = null;
    dragLine.style("visibility", "hidden");
    update();
    player.reset();
    
    updateFitnessChart([], []);
}

/**
 Generates the new graph soulution using k-colors
 */

document.getElementById('updateColors').addEventListener('click', () => {
    const colorCount = parseInt(document.getElementById('colorCount').value);
    if (colorCount >= 2 && colorCount <= 10) {
        numColors = colorCount;
        recalculateColoring();
    } else {
        alert('Please enter a number between 2 and 10');
    }
});

/**
 * Event listeners for all functionalities such as clear, reset and recalculate.
 */

document.getElementById('calculate').addEventListener('click', recalculateColoring);
document.getElementById('reset').addEventListener('click', resetGraph);
document.getElementById('clearGraph').addEventListener('click', clearGraph);

resetGraph();
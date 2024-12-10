import { geneticAlgorithm } from './geneticAlgo.js';
import { GenerationPlayer } from './player.js';

const player = new GenerationPlayer();

const container = document.querySelector('.graph-container');
const svg = d3.select("#graph");
let width, height;

const fitnessChartSvg = d3.select("#fitness-chart");
const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const fitnessWidth = document.getElementById('fitness-chart').clientWidth - margin.left - margin.right;
const fitnessHeight = 200 - margin.top - margin.bottom;

const fitnessChart = fitnessChartSvg
    .attr("width", fitnessWidth + margin.left + margin.right)
    .attr("height", fitnessHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const xScale = d3.scaleLinear().range([0, fitnessWidth]);
const yScale = d3.scaleLinear().range([fitnessHeight, 0]);

fitnessChart.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${fitnessHeight})`);

fitnessChart.append("g")
    .attr("class", "y-axis");

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

function updateFitnessChart(bestFitnessData, avgFitnessData) {
    xScale.domain([0, bestFitnessData.length - 1]);
    yScale.domain([
        Math.min(d3.min(bestFitnessData), d3.min(avgFitnessData)), 
        Math.max(d3.max(bestFitnessData), d3.max(avgFitnessData))
    ]);

    fitnessChart.select(".x-axis")
        .call(d3.axisBottom(xScale).ticks(5));
    fitnessChart.select(".y-axis")
        .call(d3.axisLeft(yScale).ticks(5));

    const line = d3.line()
        .x((d, i) => xScale(i))
        .y(d => yScale(d));

    fitnessChart.selectAll(".fitness-line").remove();

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

function updateDimensions() {
    width = container.clientWidth;
    height = container.clientHeight;
    svg
        .attr("width", width)
        .attr("height", height);
}

updateDimensions();
window.addEventListener('resize', () => {
    updateDimensions();
    if (nodes.length > 0) {
        centerGraph();
    }
});

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const linksGroup = svg.append("g").attr("class", "links-group");
const nodesGroup = svg.append("g").attr("class", "nodes-group");

let nodes = [];
let links = [];
let graph = {};
let nextNodeId = 0;
let numColors = 3; 

const EDGE_LENGTH = 150;

let selectedNode = null;
let isCreatingEdge = false;

const dragLine = svg.append("line")
    .attr("class", "drag-line")
    .style("stroke", "#999")
    .style("stroke-width", 2)
    .style("stroke-dasharray", "5,5")
    .style("visibility", "hidden");

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

const nodeDrag = d3.drag()
    .on("drag", (event, d) => {
        if (!isCreatingEdge) {
            d.x = event.x;
            d.y = event.y;
            updatePositions();
        }
    });

    function getGAParameters() {
        const populationSize = parseInt(document.getElementById('populationSize').value);
        const generations = parseInt(document.getElementById('generations').value);
        const mutationRate = parseFloat(document.getElementById('mutationRate').value);
    
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

function updatePositions() {
    linksGroup.selectAll(".link")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    nodesGroup.selectAll(".node")
        .attr("transform", d => `translate(${d.x},${d.y})`);
}

function centerGraph() {
    if (nodes.length === 0) return;

    const bounds = {
        minX: d3.min(nodes, d => d.x),
        maxX: d3.max(nodes, d => d.x),
        minY: d3.min(nodes, d => d.y),
        maxY: d3.max(nodes, d => d.y)
    };

    const currentCenter = {
        x: (bounds.minX + bounds.maxX) / 2,
        y: (bounds.minY + bounds.maxY) / 2
    };

    const desiredCenter = {
        x: width / 2,
        y: height / 2
    };

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

function update() {
    const link = linksGroup.selectAll(".link")
        .data(links);

    link.exit().remove();

    link.enter()
        .append("line")
        .attr("class", "link")
        .style("stroke", "#999")
        .style("stroke-width", 2);

    const node = nodesGroup.selectAll(".node")
        .data(nodes);

    node.exit().remove();

    const nodeEnter = node.enter()
        .append("g")
        .attr("class", "node")
        .call(nodeDrag)
        .on("click", handleNodeClick);

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

svg.on("click", function(event) {
    if (event.target.tagName === "svg") {
        if (isCreatingEdge) {
            isCreatingEdge = false;
            selectedNode = null;
            dragLine.style("visibility", "hidden");
        } else {
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

function addEdge(sourceId, targetId) {
    if (!graph[sourceId].includes(targetId)) {
        graph[sourceId].push(targetId);
        graph[targetId].push(sourceId);
        links.push({ 
            source: nodes.find(n => n.id === sourceId), 
            target: nodes.find(n => n.id === targetId) 
        });
        update();
        recalculateColoring();
    }
}

function recalculateColoring() {
    if (nodes.length === 0) return;

    const params = getGAParameters();
    if (!params) return;

    const result = geneticAlgorithm(
        graph, 
        numColors, 
        params.populationSize,
        params.generations,
        params.mutationRate
    );
    
    player.setData(result.populationHistory, result.fitnessHistory);
    
    player.setOnGenerationChange((generationColors) => {
        nodesGroup.selectAll(".node circle")
            .style("fill", (d) => colorScale(generationColors[d.id]));
    });

    if (result.fitnessHistory && result.avgFitnessHistory) {
        updateFitnessChart(result.fitnessHistory, result.avgFitnessHistory);
    }

    const bestFitnessElement = document.getElementById('bestFitness');
    if (bestFitnessElement) {
        bestFitnessElement.textContent = result.fitness;
        bestFitnessElement.className = result.fitness === 0 ? 'badge bg-success fs-6' : 'badge bg-warning fs-6';
    }
}

function resetGraph() {
    const spacing = EDGE_LENGTH;
    const centerX = width / 2;
    const centerY = height / 2;
    
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
    isCreatingEdge = false;
    selectedNode = null;
    dragLine.style("visibility", "hidden");
    update();
    recalculateColoring();
    player.reset();
}

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

document.getElementById('updateColors').addEventListener('click', () => {
    const colorCount = parseInt(document.getElementById('colorCount').value);
    if (colorCount >= 2 && colorCount <= 10) {
        numColors = colorCount;
        recalculateColoring();
    } else {
        alert('Please enter a number between 2 and 10');
    }
});

document.getElementById('calculate').addEventListener('click', recalculateColoring);
document.getElementById('reset').addEventListener('click', resetGraph);
document.getElementById('clearGraph').addEventListener('click', clearGraph);

resetGraph();
# Graph Coloring with Genetic Algorithms - Interactive Visualization

This project provides an interactive visualization of graph coloring using genetic algorithms. Users can create custom graphs, adjust algorithm parameters, and watch the evolution of solutions in real-time.

## The Graph Coloring Problem
Graph coloring is a fundamental problem in computer science and mathematics where the goal is to assign colors to vertices (nodes) of a graph such that no adjacent vertices share the same color. The minimum number of colors needed to achieve this is called the chromatic number of the graph (https://en.wikipedia.org/wiki/Graph_coloring).

## Features

- **Interactive Graph Creation**
  - Click to add nodes
  - Click and drag between nodes to create edges
  - Drag nodes to reposition them
  - Clear or reset the graph at any time

- **Genetic Algorithm Implementation**
  - Population-based evolutionary approach
  - Configurable parameters (population size, generations, mutation rate)
  - Elitism to preserve best solutions
  - Fitness tracking and visualization

- **Real-time Visualization**
  - Color-coded node visualization
  - Generation playback controls
  - Adjustable playback speed
  - Fitness evolution chart
  - Best fitness tracking

## How It Works

### Genetic Algorithm Components

The genetic algorithm implementation (`geneticAlgo.js`) includes:

- **Population Initialization**: Random assignment of colors to nodes
- **Fitness Calculation**: Based on the number of conflicts (adjacent nodes with same color)
- **Parent Selection**: Probability-based selection weighted by fitness
- **Crossover**: Single-point crossover combining parent solutions
- **Mutation**: Random color changes with configurable probability
- **Elitism**: Preserving best solutions across generations

### Visualization Components

The visualization (`visualization.js`) provides:

- D3.js-based graph rendering
- Interactive graph manipulation
- Real-time solution visualization
- Generation playback system
- Fitness tracking chart

## Usage

1. **Graph Creation**
   - Click on empty space to add nodes
   - Click one node then another to create an edge
   - Drag nodes to arrange the graph

2. **Algorithm Configuration**
   - Set the number of colors (2-10)
   - Adjust population size (10-1000)
   - Set number of generations (10-1000)
   - Configure mutation rate (0-1)

3. **Running the Algorithm**
   - Click "Recalculate Coloring" to run the genetic algorithm
   - Use playback controls to watch the evolution
   - Monitor fitness improvements in the chart

## Setup

1. Clone the repository
2. Serve the files using a local web server (e.g., `python -m http.server`)
3. Open in a web browser

## Dependencies

- D3.js (v7) for visualization
- Bootstrap 5.3.0 for UI components
- Bootstrap Icons 1.11.1 for icons

## File Structure

- `index.html`: Main application interface
- `geneticAlgo.js`: Genetic algorithm implementation
- `visualization.js`: D3.js visualization and UI logic
- `player.js`: Generation playback controller

## Features in Detail

### Generation Player

The generation player (`player.js`) provides:

- Play/pause functionality
- Step-by-step navigation
- Generation slider
- Speed control
- Real-time fitness display

### Fitness Visualization

The fitness chart shows:

- Best fitness per generation
- Average fitness per generation
- Generation-by-generation evolution

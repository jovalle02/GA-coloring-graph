/**
 * Creates an initial population of random solutions for the graph coloring problem
 * @param {Object} graph - Adjacency list representation of the graph
 * @param {number} numColors - Number of colors available for coloring
 * @param {number} populationSize - Size of the population to generate
 * @returns {Array} Array of random solutions (individuals)
 */
function generateInitialPopulation(graph, numColors, populationSize) {
    const population = [];
    const numNodes = Object.keys(graph).length;

    // Generate random color assignments for each individual
    for (let i = 0; i < populationSize; i++) {
        const individual = Array.from({ length: numNodes }, () => Math.floor(Math.random() * numColors));
        population.push(individual);
    }

    return population;
}

/**
 * Calculates the fitness of an individual solution
 * Fitness is negative number of conflicts (adjacent nodes with same color)
 * Higher fitness (closer to 0) means better solution
 * @param {Array} individual - Array of color assignments
 * @param {Object} graph - Adjacency list representation of the graph
 * @returns {number} Fitness value (negative number of conflicts)
 */
function calculateFitness(individual, graph) {
    let conflicts = 0;

    // Check each node's neighbors for color conflicts
    for (const node in graph) {
        const nodeId = parseInt(node);
        const neighbors = graph[node];
        neighbors.forEach(neighbor => {
            // Only count each conflict once (when nodeId < neighbor)
            if (nodeId < neighbor && individual[nodeId] === individual[neighbor]) {
                conflicts++;
            }
        });
    }

    return -conflicts; // Negative because lower number of conflicts is better
}

/**
 * Selects a parent for reproduction using fitness proportionate selection
 * Better fitness increases chance of selection
 * @param {Array} population - Array of individuals
 * @param {Array} fitnesses - Array of fitness values corresponding to population
 * @returns {Array} Selected parent individual
 */
function selectParents(population, fitnesses) {
    // Shift fitness values to ensure all are positive
    const minFitness = Math.min(...fitnesses);
    const shiftedFitnesses = fitnesses.map(f => f - minFitness + 1);
    
    // Calculate total fitness for normalization
    const totalFitness = shiftedFitnesses.reduce((sum, fitness) => sum + fitness, 0);
    
    // Calculate cumulative probabilities for selection
    const cumulativeProbabilities = [];
    let cumSum = 0;
    for (let i = 0; i < shiftedFitnesses.length; i++) {
        cumSum += shiftedFitnesses[i] / totalFitness;
        cumulativeProbabilities[i] = cumSum;
    }
    
    // Select parent using roulette wheel selection
    const randomValue = Math.random();
    for (let i = 0; i < cumulativeProbabilities.length; i++) {
        if (randomValue <= cumulativeProbabilities[i]) {
            return population[i];
        }
    }
    
    // Fallback to last individual (should rarely happen)
    return population[population.length - 1];
}

/**
 * Performs single-point crossover between two parents
 * Takes first half of parent1 and second half of parent2
 * @param {Array} parent1 - First parent individual
 * @param {Array} parent2 - Second parent individual
 * @returns {Array} Child individual
 */
function crossover(parent1, parent2) {
    const cutoff = Math.floor(parent1.length / 2);
    const child = parent1.slice(0, cutoff).concat(parent2.slice(cutoff));
    return child;
}

/**
 * Applies random mutations to an individual
 * Each color assignment has a chance to be randomly changed
 * @param {Array} individual - Individual to mutate
 * @param {number} numColors - Number of available colors
 * @param {number} mutationRate - Probability of mutation for each position
 * @returns {Array} Mutated individual
 */
function mutate(individual, numColors, mutationRate) {
    const mutated = [...individual];

    for (let i = 0; i < mutated.length; i++) {
        if (Math.random() < mutationRate) {
            mutated[i] = Math.floor(Math.random() * numColors);
        }
    }

    return mutated;
}

/**
 * Main genetic algorithm implementation for graph coloring
 * Uses elitism to preserve best solutions and maintains history for visualization
 * @param {Object} graph - Adjacency list representation of the graph
 * @param {number} numColors - Number of colors available
 * @param {number} populationSize - Size of population in each generation
 * @param {number} generations - Number of generations to run
 * @param {number} mutationRate - Probability of mutation
 * @returns {Object} Results including best solution and history
 */
function geneticAlgorithm(graph, numColors, populationSize, generations, mutationRate) {
    // Initialize population and tracking variables
    let population = generateInitialPopulation(graph, numColors, populationSize);
    let fitnessHistory = [];          // Track average fitness per generation
    let bestFitnessHistory = [];      // Track best fitness found so far
    let populationHistory = [];       // Track population for visualization
    let bestIndividual = null;        // Best solution found
    let bestFitness = -Infinity;      // Best fitness found

    // Elitism parameters (preserve top 10% of solutions)
    const elitismRate = 0.1;
    const numElites = Math.max(1, Math.floor(populationSize * elitismRate));

    // Main evolution loop
    for (let generation = 0; generation < generations; generation++) {
        // Save current population for visualization
        populationHistory.push([...population[0]]);
        
        // Calculate fitness for all individuals
        const fitnesses = population.map(individual => calculateFitness(individual, graph));
        
        // Track average fitness
        const avgFitness = fitnesses.reduce((sum, fitness) => sum + fitness, 0) / populationSize;
        fitnessHistory.push(avgFitness);

        // Update best solution if improved
        const generationBestFitness = Math.max(...fitnesses);
        const generationBestIndex = fitnesses.indexOf(generationBestFitness);
        
        if (generationBestFitness > bestFitness) {
            bestFitness = generationBestFitness;
            bestIndividual = [...population[generationBestIndex]];
        }
        bestFitnessHistory.push(bestFitness);

        // Sort population by fitness for elitism
        const sortedIndices = fitnesses
            .map((f, i) => ({ fitness: f, index: i }))
            .sort((a, b) => b.fitness - a.fitness)
            .map(item => item.index);

        // Create new population starting with elite individuals
        const newPopulation = [];
        
        for (let i = 0; i < numElites; i++) {
            newPopulation.push([...population[sortedIndices[i]]]);
        }
        
        // Fill rest of population with offspring
        while (newPopulation.length < populationSize) {
            const parent1 = selectParents(population, fitnesses);
            const parent2 = selectParents(population, fitnesses);
            let child = crossover(parent1, parent2);
            child = mutate(child, numColors, mutationRate);
            newPopulation.push(child);
        }

        population = newPopulation;
    }

    // Save final population
    populationHistory.push([...population[0]]);

    return {
        bestIndividual,           // Best solution found
        fitness: bestFitness,     // Fitness of best solution
        fitnessHistory: bestFitnessHistory,      // History of best fitness
        avgFitnessHistory: fitnessHistory,       // History of average fitness
        populationHistory: populationHistory     // History for visualization
    };
}

export {
    geneticAlgorithm,
    generateInitialPopulation,
    calculateFitness,
    selectParents,
    crossover,
    mutate
};
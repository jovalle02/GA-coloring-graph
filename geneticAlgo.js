function generateInitialPopulation(graph, numColors, populationSize) {
    const population = [];
    const numNodes = Object.keys(graph).length;

    for (let i = 0; i < populationSize; i++) {
        const individual = Array.from({ length: numNodes }, () => Math.floor(Math.random() * numColors));
        population.push(individual);
    }

    return population;
}

function calculateFitness(individual, graph) {
    let conflicts = 0;

    for (const node in graph) {
        const nodeId = parseInt(node);
        const neighbors = graph[node];
        neighbors.forEach(neighbor => {
            if (nodeId < neighbor && individual[nodeId] === individual[neighbor]) {
                conflicts++;
            }
        });
    }

    return -conflicts; 
}

function selectParents(population, fitnesses) {
    const minFitness = Math.min(...fitnesses);
    const shiftedFitnesses = fitnesses.map(f => f - minFitness + 1);
    
    const totalFitness = shiftedFitnesses.reduce((sum, fitness) => sum + fitness, 0);
    
    const cumulativeProbabilities = [];
    let cumSum = 0;
    for (let i = 0; i < shiftedFitnesses.length; i++) {
        cumSum += shiftedFitnesses[i] / totalFitness;
        cumulativeProbabilities[i] = cumSum;
    }
    
    const randomValue = Math.random();
    for (let i = 0; i < cumulativeProbabilities.length; i++) {
        if (randomValue <= cumulativeProbabilities[i]) {
            return population[i];
        }
    }
    
    return population[population.length - 1];
}

function crossover(parent1, parent2) {
    const cutoff = Math.floor(parent1.length / 2);
    const child = parent1.slice(0, cutoff).concat(parent2.slice(cutoff));
    return child;
}

function mutate(individual, numColors, mutationRate) {
    const mutated = [...individual];

    for (let i = 0; i < mutated.length; i++) {
        if (Math.random() < mutationRate) {
            mutated[i] = Math.floor(Math.random() * numColors);
        }
    }

    return mutated;
}

function geneticAlgorithm(graph, numColors, populationSize, generations, mutationRate) {
    let population = generateInitialPopulation(graph, numColors, populationSize);
    let fitnessHistory = [];
    let bestFitnessHistory = [];
    let populationHistory = [];
    let bestIndividual = null;
    let bestFitness = -Infinity;

    const elitismRate = 0.1;
    const numElites = Math.max(1, Math.floor(populationSize * elitismRate));

    for (let generation = 0; generation < generations; generation++) {
        populationHistory.push([...population[0]]);
        const fitnesses = population.map(individual => calculateFitness(individual, graph));
        
        const avgFitness = fitnesses.reduce((sum, fitness) => sum + fitness, 0) / populationSize;
        fitnessHistory.push(avgFitness);

        const generationBestFitness = Math.max(...fitnesses);
        const generationBestIndex = fitnesses.indexOf(generationBestFitness);
        
        if (generationBestFitness > bestFitness) {
            bestFitness = generationBestFitness;
            bestIndividual = [...population[generationBestIndex]];
        }
        bestFitnessHistory.push(bestFitness);

        const sortedIndices = fitnesses
            .map((f, i) => ({ fitness: f, index: i }))
            .sort((a, b) => b.fitness - a.fitness)
            .map(item => item.index);

        const newPopulation = [];
        
        for (let i = 0; i < numElites; i++) {
            newPopulation.push([...population[sortedIndices[i]]]);
        }
        
        while (newPopulation.length < populationSize) {
            const parent1 = selectParents(population, fitnesses);
            const parent2 = selectParents(population, fitnesses);
            let child = crossover(parent1, parent2);
            child = mutate(child, numColors, mutationRate);
            newPopulation.push(child);
        }

        population = newPopulation;
    }

    populationHistory.push([...population[0]]);

    return {
        bestIndividual,
        fitness: bestFitness,
        fitnessHistory: bestFitnessHistory,
        avgFitnessHistory: fitnessHistory,
        populationHistory: populationHistory
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
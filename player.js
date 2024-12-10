/**
 * GenerationPlayer class manages the playback and visualization of genetic algorithm generations
 * Controls include play/pause, step forward/backward, speed adjustment, and generation selection
 */
class GenerationPlayer {
    /**
     * Initialize the generation player and set up UI controls
     */
    constructor() {
        // Internal state
        this.generations = [];          // Array of generation data
        this.fitnessHistory = [];       // Array of fitness values
        this.currentGeneration = 0;     // Current generation index
        this.isPlaying = false;         // Playback state
        this.playInterval = null;       // Interval for automatic playback
        this.speed = 500;              // Playback speed in milliseconds

        // Get UI element references
        this.playBtn = document.getElementById('play-btn');
        this.playIcon = document.getElementById('play-icon');
        this.resetBtn = document.getElementById('reset-btn');
        this.backBtn = document.getElementById('back-btn');
        this.forwardBtn = document.getElementById('forward-btn');
        this.generationSlider = document.getElementById('generation-slider');
        this.speedSlider = document.getElementById('speed-slider');
        this.generationCounter = document.getElementById('generation-counter');
        this.fitnessValue = document.getElementById('fitness-value');
        this.speedValue = document.getElementById('speed-value');

        // Set up event handlers
        this.bindEvents();
    }

    /**
     * Bind event listeners to UI controls
     */
    bindEvents() {
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.backBtn.addEventListener('click', () => this.stepBackward());
        this.forwardBtn.addEventListener('click', () => this.stepForward());
        this.generationSlider.addEventListener('input', (e) => this.setGeneration(parseInt(e.target.value)));
        this.speedSlider.addEventListener('input', (e) => this.setSpeed(parseInt(e.target.value)));
    }

    /**
     * Set new generation data and fitness history
     * @param {Array} generations - Array of generation data
     * @param {Array} fitnessHistory - Array of fitness values
     */
    setData(generations, fitnessHistory) {
        this.generations = generations;
        this.fitnessHistory = fitnessHistory;
        this.currentGeneration = 0;
        this.generationSlider.max = this.generations.length - 1;
        
        this.updateDisplay();
    }

    /**
     * Toggle between play and pause states
     */
    togglePlay() {
        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            // Update UI to show pause icon and start playback
            this.playIcon.classList.remove('bi-play-fill');
            this.playIcon.classList.add('bi-pause-fill');
            this.play();
        } else {
            // Update UI to show play icon and pause playback
            this.playIcon.classList.remove('bi-pause-fill');
            this.playIcon.classList.add('bi-play-fill');
            this.pause();
        }
    }

    /**
     * Start automatic playback of generations
     */
    play() {
        // Clear any existing interval
        if (this.playInterval) clearInterval(this.playInterval);
        
        // Set up new interval for automatic advancement
        this.playInterval = setInterval(() => {
            if (this.currentGeneration >= this.generations.length - 1) {
                this.pause();
                return;
            }
            this.stepForward();
        }, this.speed);
    }

    /**
     * Pause the automatic playback
     */
    pause() {
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
        this.isPlaying = false;
        this.playIcon.classList.remove('bi-pause-fill');
        this.playIcon.classList.add('bi-play-fill');
    }

    /**
     * Reset to the first generation
     */
    reset() {
        this.pause();
        this.setGeneration(0);
    }

    /**
     * Advance to the next generation if not at the end
     */
    stepForward() {
        if (this.currentGeneration < this.generations.length - 1) {
            this.setGeneration(this.currentGeneration + 1);
        }
    }

    /**
     * Go back to the previous generation if not at the start
     */
    stepBackward() {
        if (this.currentGeneration > 0) {
            this.setGeneration(this.currentGeneration - 1);
        }
    }

    /**
     * Set the current generation and update display
     * @param {number} generation - Generation index to display
     */
    setGeneration(generation) {
        this.currentGeneration = generation;
        this.generationSlider.value = generation;
        this.updateDisplay();
        
        // Call the generation change callback if set
        if (this.onGenerationChange) {
            this.onGenerationChange(this.generations[generation]);
        }
    }

    /**
     * Set the playback speed and update display
     * @param {number} speed - Speed in milliseconds between generations
     */
    setSpeed(speed) {
        this.speed = speed;
        this.speedValue.textContent = `${speed}ms`;
        
        // Restart playback if currently playing
        if (this.isPlaying) {
            this.play();
        }
    }

    /**
     * Update the generation counter and fitness display
     */
    updateDisplay() {
        this.generationCounter.textContent = `Generation ${this.currentGeneration} / ${this.generations.length - 1}`;
        this.fitnessValue.textContent = `Fitness: ${this.fitnessHistory[this.currentGeneration] || 0}`;
    }

    /**
     * Set callback function to be called when generation changes
     * @param {Function} callback - Function to call with new generation data
     */
    setOnGenerationChange(callback) {
        this.onGenerationChange = callback;
    }
}

export { GenerationPlayer };
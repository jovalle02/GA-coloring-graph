class GenerationPlayer {
    constructor() {
        this.generations = [];
        this.fitnessHistory = [];
        this.currentGeneration = 0;
        this.isPlaying = false;
        this.playInterval = null;
        this.speed = 500;

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

        this.bindEvents();
    }

    bindEvents() {
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.backBtn.addEventListener('click', () => this.stepBackward());
        this.forwardBtn.addEventListener('click', () => this.stepForward());
        this.generationSlider.addEventListener('input', (e) => this.setGeneration(parseInt(e.target.value)));
        this.speedSlider.addEventListener('input', (e) => this.setSpeed(parseInt(e.target.value)));
    }

    setData(generations, fitnessHistory) {
        this.generations = generations;
        this.fitnessHistory = fitnessHistory;
        this.currentGeneration = 0;
        this.generationSlider.max = this.generations.length - 1;
        
        this.updateDisplay();
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            this.playIcon.classList.remove('bi-play-fill');
            this.playIcon.classList.add('bi-pause-fill');
            this.play();
        } else {
            this.playIcon.classList.remove('bi-pause-fill');
            this.playIcon.classList.add('bi-play-fill');
            this.pause();
        }
    }

    play() {
        if (this.playInterval) clearInterval(this.playInterval);
        
        this.playInterval = setInterval(() => {
            if (this.currentGeneration >= this.generations.length - 1) {
                this.pause();
                return;
            }
            this.stepForward();
        }, this.speed);
    }

    pause() {
        if (this.playInterval) {
            clearInterval(this.playInterval);
            this.playInterval = null;
        }
        this.isPlaying = false;
        this.playIcon.classList.remove('bi-pause-fill');
        this.playIcon.classList.add('bi-play-fill');
    }

    reset() {
        this.pause();
        this.setGeneration(0);
    }

    stepForward() {
        if (this.currentGeneration < this.generations.length - 1) {
            this.setGeneration(this.currentGeneration + 1);
        }
    }

    stepBackward() {
        if (this.currentGeneration > 0) {
            this.setGeneration(this.currentGeneration - 1);
        }
    }

    setGeneration(generation) {
        this.currentGeneration = generation;
        this.generationSlider.value = generation;
        this.updateDisplay();
        
        if (this.onGenerationChange) {
            this.onGenerationChange(this.generations[generation]);
        }
    }

    setSpeed(speed) {
        this.speed = speed;
        this.speedValue.textContent = `${speed}ms`;
        
        if (this.isPlaying) {
            this.play();
        }
    }

    updateDisplay() {
        this.generationCounter.textContent = `Generation ${this.currentGeneration} / ${this.generations.length - 1}`;
        this.fitnessValue.textContent = `Fitness: ${this.fitnessHistory[this.currentGeneration] || 0}`;
    }

    setOnGenerationChange(callback) {
        this.onGenerationChange = callback;
    }
}

export { GenerationPlayer };
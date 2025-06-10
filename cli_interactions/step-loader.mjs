// cli_interactions/step-loader.mjs
export class StepLoader {
    constructor() {
      this.bounceFrames = ['●    ', ' ●   ', '  ●  ', '   ● ', '    ●', '   ● ', '  ●  ', ' ●   '];
      this.currentFrame = 0;
      this.interval = null;
      this.isActive = false;
      this.currentStep = '';
      this.completedSteps = [];
    }
  
    start(stepMessage) {
      this.currentStep = stepMessage;
      
      if (!this.isActive) {
        this.isActive = true;
        process.stdout.write('\x1B[?25l'); // Hide cursor
        
        this.interval = setInterval(() => {
          const frame = this.bounceFrames[this.currentFrame];
          process.stdout.write(`\r${frame} ${this.currentStep}`);
          this.currentFrame = (this.currentFrame + 1) % this.bounceFrames.length;
        }, 120);
      }
    }
  
    nextStep(stepMessage) {
      if (this.currentStep) {
        this.completeCurrentStep();
      }
      this.start(stepMessage);
    }
  
    completeCurrentStep() {
      if (this.isActive && this.currentStep) {
        this.stop();
        console.log(`✅ ${this.currentStep}`);
        this.completedSteps.push(this.currentStep);
      }
    }
  
    stop() {
      if (this.isActive) {
        this.isActive = false;
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }
        process.stdout.write('\r\x1B[K'); // Clear line
        process.stdout.write('\x1B[?25h'); // Show cursor
      }
    }
  
    complete() {
      this.completeCurrentStep();
    }
  
    fail(errorMessage) {
      if (this.isActive) {
        this.stop();
        console.log(`❌ ${this.currentStep} - ${errorMessage}`);
      }
    }
  }
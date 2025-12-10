/**
 * ============================================
 * BIRTHDAY CELEBRATION WEBSITE - MAIN SCRIPT
 * ============================================
 * Modern, modular JavaScript implementation
 * Maintains all original functionality with improved structure
 */

'use strict';

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Request animation frame polyfill for cross-browser compatibility
 */
const requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

/**
 * Generate random number within a range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
function random(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Calculate distance between two points
 * @param {number} p1x - Point 1 X coordinate
 * @param {number} p1y - Point 1 Y coordinate
 * @param {number} p2x - Point 2 X coordinate
 * @param {number} p2y - Point 2 Y coordinate
 * @returns {number} Distance
 */
function calculateDistance(p1x, p1y, p2x, p2y) {
  const xDistance = p1x - p2x;
  const yDistance = p1y - p2y;
  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

// ============================================
// FIREWORK SYSTEM
// ============================================

/**
 * Firework class - represents a single firework
 */
class Firework {
  constructor(sx, sy, tx, ty) {
    // Current position
    this.x = sx;
    this.y = sy;
    
    // Starting position
    this.sx = sx;
    this.sy = sy;
    
    // Target position
    this.tx = tx;
    this.ty = ty;
    
    // Distance calculations
    this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
    this.distanceTraveled = 0;
    
    // Trail coordinates for visual effect
    this.coordinates = [];
    this.coordinateCount = 3;
    while (this.coordinateCount--) {
      this.coordinates.push([this.x, this.y]);
    }
    
    // Physics properties
    this.angle = Math.atan2(ty - sy, tx - sx);
    this.speed = 2;
    this.acceleration = 1.05;
    this.brightness = random(50, 70);
    this.targetRadius = 1;
  }

  /**
   * Update firework position and state
   * @param {number} index - Index in fireworks array
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} hue - Current hue value
   */
  update(index, ctx, hue) {
    // Update trail
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);

    // Pulse target indicator
    if (this.targetRadius < 8) {
      this.targetRadius += 0.3;
    } else {
      this.targetRadius = 1;
    }

    // Accelerate
    this.speed *= this.acceleration;

    // Calculate velocity
    const vx = Math.cos(this.angle) * this.speed;
    const vy = Math.sin(this.angle) * this.speed;
    
    // Update distance traveled
    this.distanceTraveled = calculateDistance(
      this.sx,
      this.sy,
      this.x + vx,
      this.y + vy
    );

    // Check if target reached
    if (this.distanceTraveled >= this.distanceToTarget) {
      createParticles(this.tx, this.ty, hue);
      fireworks.splice(index, 1);
    } else {
      this.x += vx;
      this.y += vy;
    }
  }

  /**
   * Draw firework on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} hue - Current hue value
   */
  draw(ctx, hue) {
    // Draw trail
    ctx.beginPath();
    ctx.moveTo(
      this.coordinates[this.coordinates.length - 1][0],
      this.coordinates[this.coordinates.length - 1][1]
    );
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = `hsl(${hue}, 100%, ${this.brightness}%)`;
    ctx.stroke();

    // Draw target indicator
    ctx.beginPath();
    ctx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/**
 * Particle class - represents explosion particles
 */
class Particle {
  constructor(x, y, hue) {
    this.x = x;
    this.y = y;
    
    // Trail coordinates
    this.coordinates = [];
    this.coordinateCount = 5;
    while (this.coordinateCount--) {
      this.coordinates.push([this.x, this.y]);
    }
    
    // Physics properties
    this.angle = random(0, Math.PI * 2);
    this.speed = random(1, 10);
    this.friction = 0.95;
    this.gravity = 1;
    this.hue = random(hue - 20, hue + 20);
    this.brightness = random(50, 80);
    this.alpha = 1;
    this.decay = random(0.015, 0.03);
  }

  /**
   * Update particle position and state
   * @param {number} index - Index in particles array
   */
  update(index) {
    // Update trail
    this.coordinates.pop();
    this.coordinates.unshift([this.x, this.y]);

    // Apply physics
    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    this.alpha -= this.decay;

    // Remove if faded out
    if (this.alpha <= this.decay) {
      particles.splice(index, 1);
    }
  }

  /**
   * Draw particle on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(
      this.coordinates[this.coordinates.length - 1][0],
      this.coordinates[this.coordinates.length - 1][1]
    );
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
    ctx.stroke();
  }
}

/**
 * Create particle explosion at coordinates
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} hue - Current hue value
 */
function createParticles(x, y, hue) {
  const particleCount = 30;
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(x, y, hue));
  }
}

// ============================================
// CANVAS INITIALIZATION
// ============================================

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let cw = window.innerWidth;
let ch = window.innerHeight;

// Set canvas dimensions
canvas.width = cw;
canvas.height = ch;

// Resize handler
function handleResize() {
  cw = window.innerWidth;
  ch = window.innerHeight;
  canvas.width = cw;
  canvas.height = ch;
}

window.addEventListener('resize', handleResize);

// ============================================
// FIREWORKS STATE MANAGEMENT
// ============================================

const fireworks = [];
const particles = [];
let hue = 120;
let limiterTotal = 5;
let limiterTick = 0;
let timerTotal = 80;
let timerTick = 0;
let mousedown = false;
let mx = 0;
let my = 0;

// ============================================
// ANIMATION LOOP
// ============================================

/**
 * Main animation loop
 */
function loop() {
  requestAnimFrame(loop);

  // Cycle hue for color variety
  hue += 0.5;

  // Clear canvas with trailing effect
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, cw, ch);
  ctx.globalCompositeOperation = 'lighter';

  // Update and draw fireworks
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].draw(ctx, hue);
    fireworks[i].update(i, ctx, hue);
  }

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].draw(ctx);
    particles[i].update(i);
  }

  // Auto-launch fireworks
  if (timerTick >= timerTotal) {
    if (!mousedown) {
      fireworks.push(new Firework(
        cw / 2,
        ch,
        random(0, cw),
        random(0, ch / 2)
      ));
      timerTick = 0;
    }
  } else {
    timerTick++;
  }

  // Mouse-controlled fireworks
  if (limiterTick >= limiterTotal) {
    if (mousedown) {
      fireworks.push(new Firework(cw / 2, ch, mx, my));
      limiterTick = 0;
    }
  } else {
    limiterTick++;
  }
}

// ============================================
// GIFT BOX INTERACTION
// ============================================

/**
 * GiftBoxController - Manages gift box opening sequence
 */
class GiftBoxController {
  constructor() {
    this.merrywrap = document.getElementById('merrywrap');
    this.box = this.merrywrap.querySelector('.giftbox');
    this.step = 1;
    this.stepDurations = [2000, 2000, 1000, 1000];
    this.isInitialized = false;
  }

  /**
   * Initialize gift box event listeners
   */
  init() {
    if (this.isInitialized) return;
    
    this.box.addEventListener('click', () => this.openBox());
    this.box.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.openBox();
      }
    });
    
    this.isInitialized = true;
  }

  /**
   * Apply step class to container
   * @param {number} step - Current step number
   */
  setStepClass(step) {
    this.merrywrap.className = 'merrywrap';
    this.merrywrap.classList.add(`step-${step}`);
  }

  /**
   * Handle gift box opening sequence
   */
  openBox() {
    if (this.step === 1) {
      this.box.removeEventListener('click', this.openBox);
    }

    this.setStepClass(this.step);

    if (this.step === 4) {
      this.reveal();
      return;
    }

    setTimeout(() => {
      this.step++;
      this.openBox();
    }, this.stepDurations[this.step - 1]);
  }

  /**
   * Reveal final content (fireworks and video)
   */
  reveal() {
    // Make background transparent
    this.merrywrap.style.backgroundColor = 'transparent';

    // Start fireworks animation
    loop();

    // Create and insert video
    this.createVideo();
  }

  /**
   * Create and insert video iframe
   */
  createVideo() {
    const videoContainer = document.getElementById('video');
    const isDesktop = window.innerWidth >= 1000;
    
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', 'https://www.youtube.com/embed/Q4s2AsXCRmY?si=zgonKazFfHrHI19V');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('title', 'Birthday Celebration Video');
    iframe.style.border = 'none';
    iframe.style.width = isDesktop ? '295px' : '255px';
    iframe.style.height = isDesktop ? '185px' : '155px';
    
    videoContainer.appendChild(iframe);
    
    // Animate video appearance
    setTimeout(() => {
      videoContainer.classList.add('visible');
    }, 300);
  }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize application when DOM is ready
 */
function init() {
  const giftController = new GiftBoxController();
  giftController.init();
}

// Start when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Firework,
    Particle,
    GiftBoxController,
    random,
    calculateDistance
  };
}

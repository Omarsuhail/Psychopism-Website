import { TextUtils, ColorUtils } from '../utils/index.js';

interface Node {
  x: number;
  y: number;
  vx: number; // velocity X
  vy: number; // velocity Y
  char: string;
  color: string;
  lastCharUpdate: number;
}

interface Connection {
  nodeA: Node;
  nodeB: Node;
  strength: number; // 0-1 based on distance
}

class NodeNetworkAnimation {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private nodes: Node[] = [];
  private connections: Connection[] = [];
  private nodeCount: number;
  private maxConnectionDistance: number = 150;
  private animationId: number | null = null;
  private isVisible: boolean = true;
  private lastScrollY: number = 0;
  private scrollVelocity: number = 0;
  private lastTime: number = 0;
  
  // Performance optimization
  private frameSkip: number = 0;
  private frameSkipMax: number = 2; // Skip frames when scrolling

  constructor(canvas: HTMLCanvasElement, nodeCount = 80) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d')!;
    this.nodeCount = nodeCount;
    
    this.setupCanvas();
    this.initNodes();
    this.setupScrollOptimization();
    this.animate(0);
  }

  /**
   * Get current font size and family from CSS variables
   */
  private getFontSize(): string {
    const computedStyle = getComputedStyle(document.documentElement);
    const baseFontSize = computedStyle.getPropertyValue('--font-size-base') || '0.9rem';
    const fontFamily = computedStyle.getPropertyValue('--font-family-primary') || "'Press Start 2P', cursive";
    // Convert rem to pixels (assuming 16px base)
    const fontSize = parseFloat(baseFontSize) * 16;
    return `${Math.round(fontSize)}px ${fontFamily}`;
  }

  /**
   * Get slightly smaller font size for connections
   */
  private getConnectionFontSize(): string {
    const computedStyle = getComputedStyle(document.documentElement);
    const baseFontSize = computedStyle.getPropertyValue('--font-size-sm') || '0.8rem';
    const fontFamily = computedStyle.getPropertyValue('--font-family-primary') || "'Press Start 2P', cursive";
    // Convert rem to pixels (assuming 16px base)
    const fontSize = parseFloat(baseFontSize) * 16;
    return `${Math.round(fontSize)}px ${fontFamily}`;
  }

  private setupCanvas(): void {
    // Make canvas fullscreen and fixed
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.zIndex = '-1';
    this.canvas.style.pointerEvents = 'none';
    
    this.updateCanvasSize();
    window.addEventListener('resize', () => this.updateCanvasSize());
  }

  private updateCanvasSize(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    this.context.scale(dpr, dpr);
    
    // Re-position nodes if canvas size changed significantly
    this.repositionNodes();
  }

  private repositionNodes(): void {
    const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
    
    this.nodes.forEach(node => {
      if (node.x > canvasWidth) node.x = canvasWidth - 50;
      if (node.y > canvasHeight) node.y = canvasHeight - 50;
    });
  }

  private setupScrollOptimization(): void {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          this.scrollVelocity = Math.abs(currentScrollY - this.lastScrollY);
          this.lastScrollY = currentScrollY;
          
          // Adjust frame skip based on scroll velocity
          this.frameSkipMax = this.scrollVelocity > 20 ? 4 : this.scrollVelocity > 5 ? 2 : 1;
          
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Pause animation when tab is not visible
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      if (this.isVisible && !this.animationId) {
        this.animate(performance.now());
      }
    });
  }

  private initNodes(): void {
    const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
    
    for (let i = 0; i < this.nodeCount; i++) {
      this.nodes.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        vx: (Math.random() - 0.5) * 0.5, // Slow movement
        vy: (Math.random() - 0.5) * 0.5,
        char: TextUtils.randomNoiseChar(),
        color: ColorUtils.rgbToString(ColorUtils.randomRGB()),
        lastCharUpdate: 0
      });
    }
  }

  private animate(currentTime: number): void {
    if (!this.isVisible) {
      this.animationId = null;
      return;
    }
    
    // Frame skipping for performance during scroll
    this.frameSkip++;
    if (this.frameSkip < this.frameSkipMax) {
      this.animationId = requestAnimationFrame((time) => this.animate(time));
      return;
    }
    this.frameSkip = 0;
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.updateNodes(deltaTime);
    this.updateConnections();
    this.render();
    
    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }

  private updateNodes(deltaTime: number): void {
    const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
    const now = performance.now();
    
    this.nodes.forEach(node => {
      // Update position
      node.x += node.vx * deltaTime * 0.02;
      node.y += node.vy * deltaTime * 0.02;
      
      // Bounce off edges
      if (node.x <= 0 || node.x >= canvasWidth) {
        node.vx *= -1;
        node.x = Math.max(0, Math.min(canvasWidth, node.x));
      }
      if (node.y <= 0 || node.y >= canvasHeight) {
        node.vy *= -1;
        node.y = Math.max(0, Math.min(canvasHeight, node.y));
      }
      
      // Randomly change direction occasionally
      if (Math.random() < 0.002) {
        node.vx += (Math.random() - 0.5) * 0.1;
        node.vy += (Math.random() - 0.5) * 0.1;
        
        // Limit velocity
        const maxVel = 0.8;
        node.vx = Math.max(-maxVel, Math.min(maxVel, node.vx));
        node.vy = Math.max(-maxVel, Math.min(maxVel, node.vy));
      }
      
      // Update character periodically
      if (now - node.lastCharUpdate > 2000 + Math.random() * 3000) {
        node.char = TextUtils.randomNoiseChar();
        node.color = ColorUtils.rgbToString(ColorUtils.randomRGB());
        node.lastCharUpdate = now;
      }
    });
  }

  private updateConnections(): void {
    this.connections = [];
    
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const nodeA = this.nodes[i];
        const nodeB = this.nodes[j];
        
        if (nodeA && nodeB) {
          const distance = this.getDistance(nodeA, nodeB);
          
          if (distance < this.maxConnectionDistance) {
            this.connections.push({
              nodeA,
              nodeB,
              strength: 1 - (distance / this.maxConnectionDistance)
            });
          }
        }
      }
    }
  }

  private render(): void {
    // Clear canvas completely to avoid trails
    const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
    this.context.clearRect(0, 0, canvasWidth, canvasHeight);
    
    this.drawConnections();
    this.drawNodes();
  }

  private drawConnections(): void {
    this.connections.forEach(connection => {
      this.drawGradientConnection(connection);
    });
  }

  private drawGradientConnection(connection: Connection): void {
    const { nodeA, nodeB, strength } = connection;
    const distance = this.getDistance(nodeA, nodeB);
    const steps = Math.floor(distance / 8); // Character every 8 pixels
    
    if (steps < 2) return;
    
    const dx = (nodeB.x - nodeA.x) / steps;
    const dy = (nodeB.y - nodeA.y) / steps;
    
    // Generate gray noise characters for connection
    for (let i = 1; i < steps; i++) {
      const progress = i / steps;
      const x = nodeA.x + dx * i;
      const y = nodeA.y + dy * i;
      
      // Gray gradient based on position and strength
      const grayValue = Math.floor(80 + (strength * progress * (1 - progress) * 4) * 100);
      const alpha = strength * 0.4;
      
      this.context.fillStyle = `rgba(${grayValue}, ${grayValue}, ${grayValue}, ${alpha})`;
      this.context.font = this.getConnectionFontSize();
      this.context.fillText(TextUtils.randomNoiseChar(), x, y);
    }
  }

  private drawNodes(): void {
    this.nodes.forEach(node => {
      // Set font to match main text size
      this.context.font = `bold ${this.getFontSize()}`;
      this.context.fillStyle = node.color;
      
      // Add subtle glow effect
      this.context.shadowColor = node.color;
      this.context.shadowBlur = 3;
      this.context.fillText(node.char, node.x, node.y);
      
      // Reset shadow for clean rendering
      this.context.shadowBlur = 0;
    });
  }

  private getDistance(nodeA: Node, nodeB: Node): number {
    return Math.sqrt((nodeA.x - nodeB.x) ** 2 + (nodeA.y - nodeB.y) ** 2);
  }

  // Public methods for external control
  public pause(): void {
    this.isVisible = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public resume(): void {
    if (!this.isVisible) {
      this.isVisible = true;
      this.animate(performance.now());
    }
  }

  public destroy(): void {
    this.pause();
    window.removeEventListener('resize', () => this.updateCanvasSize());
  }
}

export default NodeNetworkAnimation;


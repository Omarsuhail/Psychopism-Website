/**
 * Refactored Node Network Animation with improved architecture
 */

import { Component, ComponentConfig } from '../../core/lifecycle/Component.js';
import { AnimationFrameManager, randomNoiseChar, randomRGB, rgbToString, distance, randomPosition, randomVelocity, clamp } from '../../shared/utils/animation.js';
import { getCSSCustomProperty } from '../../shared/utils/dom.js';
import { APP_CONFIG } from '../../shared/constants/app.js';
import { CanvasError } from '../../shared/errors/AppError.js';
import { eventBus } from '../../core/events/EventBus.js';
import { throttle } from '../../shared/utils/dom.js';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  color: string;
  lastCharUpdate: number;
  isDragging?: boolean;
  originalVx?: number;
  originalVy?: number;
}

interface Connection {
  nodeA: Node;
  nodeB: Node;
  strength: number;
}

interface NodeNetworkConfig extends ComponentConfig {
  nodeCount?: number;
  maxConnectionDistance?: number;
  canvasSelector?: string;
}

export class NodeNetworkAnimation extends Component {
  private canvas!: HTMLCanvasElement;
  private context!: CanvasRenderingContext2D;
  private nodes: Node[] = [];
  private connections: Connection[] = [];
  private animationManager = new AnimationFrameManager();
  private resizeObserver?: ResizeObserver;
  private lastUpdateTime = 0;
  private isVisible = true;
  
  private readonly nodeCount: number;
  private readonly maxConnectionDistance: number;
  private readonly canvasSelector: string;
  
  // Performance optimization
  private frameSkip = 0;
  private frameSkipMax = 1;
  private lastScrollY = 0;
  private scrollVelocity = 0;
  
  // Mouse interaction
  private isDragging = false;
  private draggedNode: Node | null = null;
  private mousePosition = { x: 0, y: 0 };
  private mouseOffset = { x: 0, y: 0 };

  constructor(config: NodeNetworkConfig) {
    super({
      name: 'NodeNetworkAnimation',
      debug: config.debug ?? false,
      autoInit: config.autoInit ?? true,
    });
    
    this.nodeCount = config.nodeCount ?? APP_CONFIG.NODE_NETWORK.DEFAULT_NODE_COUNT;
    this.maxConnectionDistance = config.maxConnectionDistance ?? APP_CONFIG.NODE_NETWORK.MAX_CONNECTION_DISTANCE;
    this.canvasSelector = config.canvasSelector ?? APP_CONFIG.SELECTORS.NODE_CANVAS;
  }

  protected async onInit(): Promise<void> {
    this.setupCanvas();
    this.setupEventListeners();
    this.initializeNodes();
  }

  protected async onMount(): Promise<void> {
    // Canvas is already set up, nothing additional needed
  }

  protected onActivate(): void {
    this.isVisible = true;
    this.startAnimation();
  }

  protected onPause(): void {
    this.isVisible = false;
    this.animationManager.cancelAllFrames();
  }

  protected onDestroy(): void {
    this.animationManager.destroy();
    this.resizeObserver?.disconnect();
    this.canvas?.remove();
  }

  /**
   * Setup canvas element and context
   */
  private setupCanvas(): void {
    // Try to find existing canvas or create new one
    let canvas = document.querySelector<HTMLCanvasElement>(this.canvasSelector);
    
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'node-network-canvas';
      canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: -1;
        pointer-events: auto;
        background: transparent;
        opacity: 0.8;
      `;
      document.body.appendChild(canvas);
    }
    
    this.canvas = canvas;
    
    const context = canvas.getContext('2d');
    if (!context) {
      throw new CanvasError('Failed to get 2D rendering context', this.config.name);
    }
    
    this.context = context;
    this.updateCanvasSize();
    
    eventBus.emit('canvas:created', { canvas: this.canvas });
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Throttled resize handler
    const handleResize = throttle(() => {
      this.updateCanvasSize();
      this.repositionNodes();
    }, 100);
    
    window.addEventListener('resize', handleResize);
    this.addCleanup(() => window.removeEventListener('resize', handleResize));
    
    // Scroll optimization
    const handleScroll = throttle(() => {
      const currentScrollY = window.scrollY;
      this.scrollVelocity = Math.abs(currentScrollY - this.lastScrollY);
      this.lastScrollY = currentScrollY;
      
      // Adjust frame skip based on scroll velocity
      this.frameSkipMax = this.scrollVelocity > APP_CONFIG.PERFORMANCE.FRAME_SKIP_THRESHOLD ? 4 
        : this.scrollVelocity > 5 ? 2 : 1;
    }, 50);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    this.addCleanup(() => window.removeEventListener('scroll', handleScroll));
    
    // Visibility change handling
    const handleVisibilityChange = () => {
      this.isVisible = !document.hidden;
      if (this.isVisible && this.isActive()) {
        this.startAnimation();
      } else {
        this.animationManager.cancelAllFrames();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    this.addCleanup(() => document.removeEventListener('visibilitychange', handleVisibilityChange));
    
    // Setup ResizeObserver for better performance
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateCanvasSize();
      });
      this.resizeObserver.observe(this.canvas);
    }
    
    // Setup mouse event listeners for drag functionality
    this.setupMouseEventListeners();
  }

  /**
   * Update canvas size with device pixel ratio support
   */
  private updateCanvasSize(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    this.context.scale(dpr, dpr);
    
    eventBus.emit('canvas:resize', {
      width: rect.width,
      height: rect.height,
    });
  }

  /**
   * Initialize nodes with random positions and properties
   */
  private initializeNodes(): void {
    const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
    
    this.nodes = [];
    
    for (let i = 0; i < this.nodeCount; i++) {
      const position = randomPosition(canvasWidth, canvasHeight);
      const velocity = randomVelocity(0.5);
      
      this.nodes.push({
        x: position.x,
        y: position.y,
        vx: velocity.vx,
        vy: velocity.vy,
        char: randomNoiseChar(),
        color: rgbToString(randomRGB()),
        lastCharUpdate: 0,
      });
    }
  }

  /**
   * Reposition nodes when canvas size changes
   */
  private repositionNodes(): void {
    const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
    
    this.nodes.forEach(node => {
      node.x = clamp(node.x, 0, canvasWidth - 50);
      node.y = clamp(node.y, 0, canvasHeight - 50);
    });
  }

  /**
   * Start animation loop
   */
  private startAnimation(): void {
    if (!this.isVisible || !this.isActive()) {
      return;
    }
    
    this.animationManager.requestFrame((timestamp) => {
      this.animate(timestamp);
    });
  }

  /**
   * Main animation loop
   */
  private animate(currentTime: number): void {
    if (!this.isVisible || !this.isActive()) {
      return;
    }
    
    // Frame skipping for performance during scroll
    this.frameSkip++;
    if (this.frameSkip < this.frameSkipMax) {
      this.startAnimation();
      return;
    }
    this.frameSkip = 0;
    
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;
    
    this.updateNodes(deltaTime);
    this.updateConnections();
    this.render();
    
    this.startAnimation();
  }

  /**
   * Update node positions and properties
   */
  private updateNodes(deltaTime: number): void {
    const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
    const now = performance.now();
    
    this.nodes.forEach(node => {
      // Skip movement updates for dragged nodes
      if (!node.isDragging) {
        // Update position
        node.x += node.vx * deltaTime * APP_CONFIG.NODE_NETWORK.MOVEMENT_SPEED;
        node.y += node.vy * deltaTime * APP_CONFIG.NODE_NETWORK.MOVEMENT_SPEED;
        
        // Bounce off edges
        if (node.x <= 0 || node.x >= canvasWidth) {
          node.vx *= -1;
          node.x = clamp(node.x, 0, canvasWidth);
        }
        if (node.y <= 0 || node.y >= canvasHeight) {
          node.vy *= -1;
          node.y = clamp(node.y, 0, canvasHeight);
        }
        
        // Randomly change direction
        if (Math.random() < APP_CONFIG.NODE_NETWORK.DIRECTION_CHANGE_PROBABILITY) {
          node.vx += (Math.random() - 0.5) * 0.1;
          node.vy += (Math.random() - 0.5) * 0.1;
          
          // Limit velocity
          const maxVel = APP_CONFIG.NODE_NETWORK.MAX_VELOCITY;
          node.vx = clamp(node.vx, -maxVel, maxVel);
          node.vy = clamp(node.vy, -maxVel, maxVel);
        }
      }
      
      // Update character periodically (regardless of dragging state)
      const { MIN, MAX } = APP_CONFIG.NODE_NETWORK.CHARACTER_UPDATE_INTERVAL;
      if (now - node.lastCharUpdate > MIN + Math.random() * (MAX - MIN)) {
        node.char = randomNoiseChar();
        node.color = rgbToString(randomRGB());
        node.lastCharUpdate = now;
      }
    });
  }

  /**
   * Update connections between nodes
   */
  private updateConnections(): void {
    this.connections = [];
    
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const nodeA = this.nodes[i];
        const nodeB = this.nodes[j];
        
        if (!nodeA || !nodeB) continue;
        
        const dist = distance(nodeA, nodeB);
        
        if (dist < this.maxConnectionDistance) {
          this.connections.push({
            nodeA,
            nodeB,
            strength: 1 - (dist / this.maxConnectionDistance),
          });
        }
      }
    }
  }

  /**
   * Render the animation frame
   */
  private render(): void {
    // Clear canvas
    const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
    const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
    this.context.clearRect(0, 0, canvasWidth, canvasHeight);
    
    this.renderConnections();
    this.renderNodes();
  }

  /**
   * Render connections between nodes
   */
  private renderConnections(): void {
    this.connections.forEach(connection => {
      this.renderConnection(connection);
    });
  }

  /**
   * Render individual connection
   */
  private renderConnection(connection: Connection): void {
    const { nodeA, nodeB, strength } = connection;
    const dist = distance(nodeA, nodeB);
    const steps = Math.floor(dist / APP_CONFIG.NODE_NETWORK.CHARACTER_SPACING);
    
    if (steps < 2) return;
    
    const dx = (nodeB.x - nodeA.x) / steps;
    const dy = (nodeB.y - nodeA.y) / steps;
    
    this.context.font = this.getConnectionFontSize();
    
    for (let i = 1; i < steps; i++) {
      const progress = i / steps;
      const x = nodeA.x + dx * i;
      const y = nodeA.y + dy * i;
      
      // Gray gradient based on position and strength
      const grayValue = Math.floor(80 + (strength * progress * (1 - progress) * 4) * 100);
      const alpha = strength * 0.4;
      
      this.context.fillStyle = `rgba(${grayValue}, ${grayValue}, ${grayValue}, ${alpha})`;
      this.context.fillText(randomNoiseChar(), x, y);
    }
  }

  /**
   * Render nodes
   */
  private renderNodes(): void {
    this.context.font = `bold ${this.getNodeFontSize()}`;
    
    this.nodes.forEach(node => {
      this.context.fillStyle = node.color;
      
      // Add subtle glow effect
      this.context.shadowColor = node.color;
      this.context.shadowBlur = 3;
      this.context.fillText(node.char, node.x, node.y);
      
      // Reset shadow
      this.context.shadowBlur = 0;
    });
  }

  /**
   * Get font size for nodes
   */
  private getNodeFontSize(): string {
    const baseFontSize = getCSSCustomProperty(APP_CONFIG.CSS_VARS.FONT_SIZE_BASE) || '0.9rem';
    const fontFamily = getCSSCustomProperty(APP_CONFIG.CSS_VARS.FONT_FAMILY) || "'Press Start 2P', cursive";
    const fontSize = parseFloat(baseFontSize) * 16;
    return `${Math.round(fontSize)}px ${fontFamily}`;
  }

  /**
   * Get font size for connections
   */
  private getConnectionFontSize(): string {
    const baseFontSize = getCSSCustomProperty(APP_CONFIG.CSS_VARS.FONT_SIZE_SM) || '0.8rem';
    const fontFamily = getCSSCustomProperty(APP_CONFIG.CSS_VARS.FONT_FAMILY) || "'Press Start 2P', cursive";
    const fontSize = parseFloat(baseFontSize) * 16;
    return `${Math.round(fontSize)}px ${fontFamily}`;
  }

  /**
   * Setup mouse event listeners for drag functionality
   */
  private setupMouseEventListeners(): void {
    const handleMouseDown = (event: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Find the closest node to the mouse position
      const clickedNode = this.findNodeAtPosition(x, y);
      
      if (clickedNode) {
        this.isDragging = true;
        this.draggedNode = clickedNode;
        this.mouseOffset.x = x - clickedNode.x;
        this.mouseOffset.y = y - clickedNode.y;
        
        // Store original velocity to restore later
        clickedNode.originalVx = clickedNode.vx;
        clickedNode.originalVy = clickedNode.vy;
        clickedNode.isDragging = true;
        
        // Stop the node's movement while dragging
        clickedNode.vx = 0;
        clickedNode.vy = 0;
        
        this.canvas.style.cursor = 'grabbing';
        event.preventDefault();
      }
    };
    
    const handleMouseMove = (event: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      this.mousePosition.x = x;
      this.mousePosition.y = y;
      
      if (this.isDragging && this.draggedNode) {
        // Update dragged node position
        this.draggedNode.x = x - this.mouseOffset.x;
        this.draggedNode.y = y - this.mouseOffset.y;
        
        // Keep node within canvas bounds
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        
        this.draggedNode.x = clamp(this.draggedNode.x, 0, canvasWidth);
        this.draggedNode.y = clamp(this.draggedNode.y, 0, canvasHeight);
        
        event.preventDefault();
      } else {
        // Check if mouse is over a node for cursor feedback
        const hoveredNode = this.findNodeAtPosition(x, y);
        this.canvas.style.cursor = hoveredNode ? 'grab' : 'default';
      }
    };
    
    const handleMouseUp = () => {
      if (this.isDragging && this.draggedNode) {
        // Restore original velocity or give a small random velocity
        this.draggedNode.vx = this.draggedNode.originalVx || (Math.random() - 0.5) * 0.5;
        this.draggedNode.vy = this.draggedNode.originalVy || (Math.random() - 0.5) * 0.5;
        
        // Clean up drag state
        this.draggedNode.isDragging = false;
        delete this.draggedNode.originalVx;
        delete this.draggedNode.originalVy;
      }
      
      this.isDragging = false;
      this.draggedNode = null;
      this.canvas.style.cursor = 'default';
    };
    
    // Touch events for mobile support
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        if (!touch) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        const clickedNode = this.findNodeAtPosition(x, y);
        
        if (clickedNode) {
          this.isDragging = true;
          this.draggedNode = clickedNode;
          this.mouseOffset.x = x - clickedNode.x;
          this.mouseOffset.y = y - clickedNode.y;
          
          clickedNode.originalVx = clickedNode.vx;
          clickedNode.originalVy = clickedNode.vy;
          clickedNode.isDragging = true;
          clickedNode.vx = 0;
          clickedNode.vy = 0;
          
          event.preventDefault();
        }
      }
    };
    
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 1 && this.isDragging && this.draggedNode) {
        const touch = event.touches[0];
        if (!touch) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.draggedNode.x = x - this.mouseOffset.x;
        this.draggedNode.y = y - this.mouseOffset.y;
        
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        
        this.draggedNode.x = clamp(this.draggedNode.x, 0, canvasWidth);
        this.draggedNode.y = clamp(this.draggedNode.y, 0, canvasHeight);
        
        event.preventDefault();
      }
    };
    
    const handleTouchEnd = () => {
      if (this.isDragging && this.draggedNode) {
        this.draggedNode.vx = this.draggedNode.originalVx || (Math.random() - 0.5) * 0.5;
        this.draggedNode.vy = this.draggedNode.originalVy || (Math.random() - 0.5) * 0.5;
        
        this.draggedNode.isDragging = false;
        delete this.draggedNode.originalVx;
        delete this.draggedNode.originalVy;
      }
      
      this.isDragging = false;
      this.draggedNode = null;
    };
    
    // Add event listeners
    this.canvas.addEventListener('mousedown', handleMouseDown);
    this.canvas.addEventListener('mousemove', handleMouseMove);
    this.canvas.addEventListener('mouseup', handleMouseUp);
    this.canvas.addEventListener('mouseleave', handleMouseUp); // Handle mouse leaving canvas
    
    // Touch events
    this.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', handleTouchEnd);
    
    // Add cleanup
    this.addCleanup(() => {
      this.canvas.removeEventListener('mousedown', handleMouseDown);
      this.canvas.removeEventListener('mousemove', handleMouseMove);
      this.canvas.removeEventListener('mouseup', handleMouseUp);
      this.canvas.removeEventListener('mouseleave', handleMouseUp);
      this.canvas.removeEventListener('touchstart', handleTouchStart);
      this.canvas.removeEventListener('touchmove', handleTouchMove);
      this.canvas.removeEventListener('touchend', handleTouchEnd);
    });
  }
  
  /**
   * Find a node at the given position with some tolerance
   */
  private findNodeAtPosition(x: number, y: number): Node | null {
    const tolerance = 25; // pixels
    
    for (const node of this.nodes) {
      const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      if (dist <= tolerance) {
        return node;
      }
    }
    
    return null;
  }
  
  /**
   * Get animation metrics for debugging
   */
  public getMetrics() {
    return {
      nodeCount: this.nodes.length,
      connectionCount: this.connections.length,
      activeAnimations: this.animationManager.getActiveCount(),
      isVisible: this.isVisible,
      frameSkipMax: this.frameSkipMax,
      isDragging: this.isDragging,
      draggedNodeCount: this.nodes.filter(n => n.isDragging).length,
    };
  }
}


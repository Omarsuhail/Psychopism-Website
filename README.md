# 🎮 Psychopism Website

<div align="center">

![Psychopism Logo](favicon.ico)

**Official website for Psychopism - An open-source psychedelic video game where reality distorts and logic is just an illusion.**

[![Build and Deploy](https://github.com/VoidVortex-Games/Psychopism-Website/workflows/🚀%20Build%20and%20Deploy%20Psychopism%20Website/badge.svg)](https://github.com/VoidVortex-Games/Psychopism-Website/actions)
[![Code Quality](https://github.com/VoidVortex-Games/Psychopism-Website/workflows/🔍%20Code%20Quality%20Check/badge.svg)](https://github.com/VoidVortex-Games/Psychopism-Website/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://html.spec.whatwg.org/)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![Canvas API](https://img.shields.io/badge/Canvas-FF6B6B?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

[🎮 Live Demo](https://psychopism.game) • [📖 Documentation](#documentation) • [🚀 Getting Started](#getting-started) • [🤝 Contributing](#contributing)

</div>

---

## ✨ Features

### 🎨 **Interactive Visual Effects**
- **Psychedelic Text Animations**: Characters transform into colorful noise on hover
- **Noise Reveal Animations**: Text gradually emerges from scrambled characters
- **Interactive Node Network**: Drag and drop animated nodes in the background
- **Responsive Canvas Rendering**: Optimized for all screen sizes and device pixel ratios

### 📱 **Cross-Platform Support**
- **Desktop**: Full mouse interaction with hover effects and dragging
- **Mobile**: Touch-friendly interface with gesture support
- **Tablets**: Optimized for touch screens and various orientations
- **Accessibility**: Screen reader support, high contrast mode, keyboard navigation

### ⚡ **Performance Optimized**
- **Frame Skipping**: Automatic performance adjustment during scroll
- **Lazy Loading**: Scroll-triggered animations for better performance
- **Memory Management**: Proper cleanup of event listeners and animations
- **Browser Compatibility**: Graceful degradation for older browsers

### 🛠️ **Advanced Settings**
- **Visual Controls**: Toggle animations, adjust speed, enable/disable effects
- **Audio Settings**: Volume control, ambient sounds, dynamic soundtrack
- **Performance Tuning**: Graphics quality, frame rate limiting, motion reduction
- **Accessibility Options**: High contrast, large text, screen reader mode

---

## 🚀 Getting Started

### 📋 Prerequisites

- **Node.js** v16+ (for development)
- **Modern web browser** with ES2020+ support
- **Git** for version control

### 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/psychopism/psychopism-website.git
   cd psychopism-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Start development server**
   ```bash
   npm run serve
   ```

5. **Open in browser**
   ```
   http://localhost:8000
   ```

### 🏗️ Development Commands

```bash
# Build for production
npm run build

# Start development server
npm run serve

# Watch mode (auto-rebuild on changes)
npm run watch

# Clean build directory
npm run clean
```

---

## 🎯 Interactive Features

### 🖱️ **Node Dragging**

**Experience the interactive background animation:**

1. **Hover** over any floating symbol in the background
2. **Cursor changes** to a grab hand when over a draggable node
3. **Click and drag** to move nodes around the screen
4. **Release** to let the node continue its natural movement
5. **Touch support** for mobile devices

**Technical Details:**
- 25px detection radius around each node
- Smooth dragging with momentum preservation
- Boundary constraints within canvas area
- Performance optimized for 60fps

### ✨ **Text Noise Effects**

**Psychedelic text transformations:**

1. **Page Load**: Title text emerges from colorful character noise
2. **Hover Effects**: Individual characters transform into random symbols with vibrant colors
3. **Scroll Animations**: Content reveals progressively as you scroll
4. **Customizable**: Adjust animation speed and intensity in settings

---

## 🏗️ Project Structure

```
psychopism-website/
├── 📁 src/
│   ├── 📁 animations/          # Animation components
│   │   ├── TextAnimation.ts     # Text noise effects
│   │   ├── ElementAnimation.ts  # Element reveal animations
│   │   └── NodeNetworkAnimation.ts # Background network
│   ├── 📁 components/          # UI components
│   │   ├── App.ts              # Main application
│   │   └── Navigation.ts       # Navigation component
│   ├── 📁 core/                # Core systems
│   │   ├── events/             # Event bus system
│   │   ├── lifecycle/          # Component lifecycle
│   │   └── performance/        # Performance monitoring
│   ├── 📁 features/            # Feature modules
│   │   └── animations/         # Advanced animations
│   ├── 📁 shared/              # Shared utilities
│   │   ├── constants/          # Configuration constants
│   │   ├── errors/             # Error handling
│   │   └── utils/              # Utility functions
│   ├── 📁 settings/            # Settings management
│   ├── 📁 styles/              # CSS stylesheets
│   ├── 📁 types/               # TypeScript definitions
│   └── main.ts                 # Application entry point
├── 📄 index.html               # Main HTML file
├── 📄 package.json             # Dependencies and scripts
├── 📄 tsconfig.json            # TypeScript configuration
├── 📄 build.sh                 # Build script
└── 📁 dist/                    # Compiled output (generated)
```

---

## 🛠️ Technical Architecture

### 🔧 **Core Technologies**

- **TypeScript**: Type-safe development with modern ES features
- **Canvas API**: Hardware-accelerated graphics rendering
- **Web APIs**: Intersection Observer, ResizeObserver, RequestAnimationFrame
- **CSS3**: Modern styling with custom properties and animations
- **ES Modules**: Native module system for optimal loading

### 📐 **Architecture Patterns**

- **Component-Based**: Modular, reusable components with lifecycle management
- **Event-Driven**: Decoupled communication via custom event bus
- **Performance-First**: Optimized rendering with frame skipping and cleanup
- **Responsive Design**: Mobile-first approach with breakpoint optimization

### 🎨 **Animation System**

```typescript
// Example: Text noise animation
const textAnimation = new TextAnimation({
  duration: 1500,
  finalColor: '#fff',
  noiseChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
});

// Setup hover effects
textAnimation.setupTitleHoverEffects(element);

// Animate text reveal
textAnimation.animateNoiseReveal(element, originalText, duration);
```

### 🎯 **Performance Features**

- **Frame Rate Monitoring**: Automatic quality adjustment based on FPS
- **Intersection Observer**: Efficient scroll-triggered animations
- **Memory Management**: Automatic cleanup of resources and event listeners
- **Canvas Optimization**: Device pixel ratio support and efficient rendering

---

## ⚙️ Configuration

### 🎛️ **Animation Settings**

```typescript
// Text Animation Configuration
export const textAnimationConfig = {
  duration: 1500,              // Animation duration in ms
  finalColor: '#fff',          // Final text color
  noiseChars: '...',          // Characters for noise effect
};

// Node Network Configuration
export const nodeNetworkConfig = {
  nodeCount: 80,              // Number of background nodes
  maxConnectionDistance: 150, // Connection threshold
  movementSpeed: 0.01,       // Node movement speed
};
```

### 🎨 **Styling Customization**

```css
:root {
  --primary-color: #fff;
  --background-color: #1a1a1a;
  --accent-color: #00ff88;
  --font-family: 'Press Start 2P', cursive;
  --animation-duration: 1.5s;
}
```

---

## 🧪 Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------| ---- |
| Canvas API | ✅ 4+ | ✅ 2+ | ✅ 3.1+ | ✅ 9+ |
| ES Modules | ✅ 61+ | ✅ 60+ | ✅ 10.1+ | ✅ 16+ |
| Intersection Observer | ✅ 51+ | ✅ 55+ | ✅ 12.1+ | ✅ 15+ |
| Touch Events | ✅ 22+ | ✅ 52+ | ✅ 9+ | ✅ 12+ |
| Custom Properties | ✅ 49+ | ✅ 31+ | ✅ 9.1+ | ✅ 16+ |

**Minimum Requirements:**
- Chrome 61+, Firefox 60+, Safari 12.1+, Edge 16+
- JavaScript enabled
- Canvas 2D support
- 1MB available memory

---

## 🤝 Contributing

### 🎯 **Ways to Contribute**

- 🐛 **Bug Reports**: Found an issue? [Open an issue](https://github.com/psychopism/psychopism-website/issues)
- ✨ **Feature Requests**: Have an idea? [Suggest a feature](https://github.com/psychopism/psychopism-website/issues)
- 🔧 **Code Contributions**: [Submit a pull request](https://github.com/psychopism/psychopism-website/pulls)
- 📚 **Documentation**: Help improve our docs
- 🎨 **Design**: Contribute visual assets or UI improvements

### 🛠️ **Development Workflow**

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### 📝 **Commit Convention**

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new animation system
fix: resolve mobile touch issues
docs: update README with examples
style: improve CSS organization
refactor: optimize performance
test: add animation tests
```

---

## 📈 Performance Metrics

### ⚡ **Benchmarks**

- **Initial Load**: < 2 seconds on 3G
- **Animation FPS**: 60fps on modern devices, 30fps minimum
- **Memory Usage**: < 50MB peak during animations
- **Bundle Size**: < 500KB total (compressed)

### 📊 **Lighthouse Score**

- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 95+
- **SEO**: 100

---

## 📚 Documentation

### 🔗 **API Reference**

- [Animation Components](src/animations/README.md)
- [Core Systems](src/core/README.md)
- [Utility Functions](src/shared/utils/README.md)
- [Type Definitions](src/types/README.md)

### 🎓 **Guides**

- [Creating Custom Animations](docs/custom-animations.md)
- [Performance Optimization](docs/performance.md)
- [Mobile Development](docs/mobile.md)
- [Accessibility Guidelines](docs/accessibility.md)

---

## 🌟 Showcase

### 🎮 **About Psychopism Game**

Psychopism is an open-source psychedelic video game that challenges perception and reality. The game features:

- **Procedural Generation**: Infinite, ever-changing worlds
- **Distortion Effects**: Reality-bending visual and audio effects
- **Community-Driven**: Open development with community contributions
- **Cross-Platform**: Available on Windows, Linux, and macOS

### 🔗 **Related Projects**

- [Psychopism Game](https://github.com/psychopism/psychopism) - Main game repository
- [Psychopism Engine](https://github.com/psychopism/engine) - Custom game engine
- [Psychopism Assets](https://github.com/psychopism/assets) - Game assets and resources

---

## 📄 License

**MIT License** - see [LICENSE](LICENSE) file for details.

```
Copyright (c) 2025 Psychopism Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 🙏 Acknowledgments

- **Typography**: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) font family
- **Inspiration**: Psychedelic art movement and glitch aesthetics
- **Community**: All contributors and beta testers
- **Tools**: TypeScript, Canvas API, modern web standards

---

## 📞 Contact

<div align="center">

**Psychopism Team**

📧 [contact@psychopism.game](mailto:contact@psychopism.game)  
🌐 [psychopism.game](https://psychopism.game)  
🐦 [@PsychopismGame](https://twitter.com/PsychopismGame)  
💬 [Discord Community](https://discord.gg/psychopism)  
📱 [GitHub](https://github.com/psychopism)  

---

**Made with 🎮 and ✨ by the Psychopism community**

*"Where reality distorts and logic is just an illusion"*

</div>


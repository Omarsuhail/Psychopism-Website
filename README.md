# Psychopism Website

> Official website for Psychopism - an open-source psychedelic video game where reality distorts and logic is just an illusion.

![Version](https://img.shields.io/badge/version-0.3.0--dev-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎮 Overview

This is the official website for **Psychopism**, built with a modern, modular TypeScript architecture. The website features:

- **Interactive animation background** that responds to mouse movement
- **Noise text effects** with scrambled text that reveals on scroll
- **Floating noise clouds** that appear and disappear
- **Fully responsive design** with mobile-first approach
- **Type-safe codebase** with comprehensive TypeScript typing
- **Modular architecture** following best practices
- **Performance optimized** with proper cleanup and memory management

## 🏗️ Architecture

### Project Structure

```
psychopism-website/
├── src/
│   ├── animations/           # Animation components
│   │   ├── BackgroundAnimation.ts  # Interactive background
│   │   ├── TextAnimation.ts   # Text noise effects
│   │   ├── NoiseCloud.ts      # Floating noise clouds
│   │   └── index.ts           # Animation exports
│   ├── components/           # UI components
│   │   ├── App.ts            # Main application class
│   │   ├── Navigation.ts     # Navigation component
│   │   └── index.ts          # Component exports
│   ├── data/                 # Data and content
│   │   └── index.ts          # Structured website data
│   ├── styles/               # Modular CSS
│   │   ├── base.css          # Base styles and reset
│   │   ├── components.css    # Component styles
│   │   ├── responsive.css    # Responsive design
│   │   └── main.css          # Main stylesheet
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts          # All type definitions
│   ├── utils/                # Utility functions
│   │   └── index.ts          # Helper utilities
│   └── main.ts               # Application entry point
├── dist/                     # Compiled output (generated)
├── index.html                # Main HTML file
├── tsconfig.json            # TypeScript configuration
├── package.json             # Node.js dependencies
├── build.sh                 # Build script
└── README.md                # This file
```

### Key Design Principles

1. **Modular Architecture**: Each component is self-contained with clear responsibilities
2. **Type Safety**: Comprehensive TypeScript typing for all components and data
3. **Performance**: Optimized animations with proper cleanup and memory management
4. **Accessibility**: ARIA labels, semantic HTML, and keyboard navigation support
5. **Responsive Design**: Mobile-first approach with progressive enhancement
6. **Clean Code**: Well-documented, maintainable code following best practices

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16.0.0 or higher
- **TypeScript** 5.0 or higher
- **Modern web browser** with ES2020 support

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/psychopism/website.git
   cd psychopism-website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Build the project**:
   ```bash
   npm run build
   # or
   ./build.sh
   ```

4. **Serve locally**:
   ```bash
   npm run serve
   # or
   python3 -m http.server 8000
   ```

5. **Open in browser**:
   ```
   http://localhost:8000
   ```

### Development Mode

For development with auto-compilation:

```bash
# Terminal 1: Watch TypeScript files
npm run dev

# Terminal 2: Serve the website
npm run serve
```

## 🎨 Features

### 1. Interactive Animation Background

- **Dynamic visual grid** that renders colorful, ever-changing background
- **Mouse interaction** that responds to cursor position
- **Performance optimized** with efficient rendering and memory management
- **Responsive** canvas that adapts to window size and device resolution

### 2. Text Animation Effects

- **Noise reveal animation**: Text starts as scrambled noise and reveals gradually
- **Character hover effects**: Individual characters scramble on mouse hover
- **Scroll-triggered animations**: Text reveals as sections come into view
- **Intersection Observer**: Efficient scroll-based animations

### 3. Floating Noise Clouds

- **Procedural generation** of noise clouds at random positions
- **Interactive evaporation** on mouse hover
- **Automatic lifecycle management** with configurable lifetimes
- **Performance controlled** with maximum cloud limits

### 4. Navigation System

- **Smooth scrolling** to sections with proper focus management
- **Infinite scroll animation** for visual appeal
- **Responsive behavior** that adapts to different screen sizes
- **Accessibility support** with proper ARIA labels

## 🛠️ Configuration

### Animation Configs

All animations are configurable through the data layer:

```typescript
// Background animation configuration
export const backgroundAnimationConfig: BackgroundAnimationConfig = {
  elementSize: 8,
  maxRise: 20,
  riseSpeed: 0.05,
  decaySpeed: 0.5,
  mouseRadius: 100,
  backgroundColorChangeSpeed: 0.0001
};

// Text animation configuration
export const textAnimationConfig: TextAnimationConfig = {
  duration: 1500,
  finalColor: '#fff',
  noiseChars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789..."
};

// Noise cloud configuration
export const noiseCloudConfig: NoiseCloudConfig = {
  maxClouds: 5,
  creationInterval: 5000,
  cloudLifetime: 10000,
  minLength: 30,
  maxLength: 100
};
```

### CSS Custom Properties

The design system uses CSS custom properties for consistent theming:

```css
:root {
  /* Colors */
  --color-primary: #000;
  --color-secondary: #fff;
  --color-accent: #ccc;
  
  /* Typography */
  --font-family-primary: 'Press Start 2P', cursive;
  --font-size-base: 0.9rem;
  
  /* Spacing */
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  
  /* Animations */
  --transition-fast: 0.1s ease-in-out;
  --transition-medium: 0.3s ease-in-out;
}
```

## 🔧 Development

### Available Scripts

- `npm run build` - Build the project for production
- `npm run dev` - Watch TypeScript files for changes
- `npm run serve` - Serve the website locally
- `npm run clean` - Clean build artifacts
- `npm run typecheck` - Check TypeScript types without compilation
- `npm start` - Build and serve (one command)

### Code Style

The project follows these conventions:

- **TypeScript**: Strict mode with comprehensive typing
- **CSS**: BEM methodology for class naming
- **JavaScript**: ES2020 modules with proper imports/exports
- **Documentation**: JSDoc comments for all public APIs
- **Error Handling**: Comprehensive error boundaries and safe execution

### Performance Considerations

- **Animation Frame Management**: Proper cleanup of requestAnimationFrame
- **Memory Management**: Cleanup of event listeners and object references
- **Lazy Loading**: Intersection Observer for scroll-triggered animations
- **Responsive Images**: Placeholder images with proper sizing
- **CSS Optimization**: Efficient selectors and minimal reflows

## 📱 Browser Support

- **Chrome** 80+
- **Firefox** 75+
- **Safari** 13+
- **Edge** 80+

Features used:
- ES2020 modules
- Canvas 2D API
- Intersection Observer
- Custom CSS Properties
- requestAnimationFrame

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper TypeScript typing
4. **Add tests** if applicable
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing code style and conventions
- Add JSDoc comments for public APIs
- Ensure proper error handling
- Test on multiple browsers and devices
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎮 About Psychopism

Psychopism is an open-source psychedelic video game where reality distorts and logic is just an illusion. Built with Rust, it features:

- **Procedural generation** of distorted worlds
- **Dynamic reality distortion** algorithms
- **Community-driven development**
- **Cooperative multiplayer** gameplay
- **Customizable distortion parameters**

Learn more at [psychopism.game](https://psychopism.game)

## 📞 Contact

- **Email**: contact@psychopism.game
- **Discord**: [Coming Soon]
- **GitHub**: [psychopism](https://github.com/psychopism)
- **Website**: [psychopism.game](https://psychopism.game)

---

<div align="center">
  <strong>Made with ❤️ by the Psychopism Team</strong>
  <br>
  <em>Dive into the depths of the mind in a world that changes with you.</em>
</div>


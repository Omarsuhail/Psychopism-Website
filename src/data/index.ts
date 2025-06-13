/**
 * Structured data for the Psychopism website
 * Contains all content in a type-safe, maintainable format
 */

import type {
  NavigationItem,
  BlogPost,
  Feature,
  SystemRequirement,
  FAQItem,
  ContactInfo,
  TextAnimationConfig
} from '../types/index.js';
import type { ElementAnimationConfig } from '../animations/ElementAnimation.js';

/**
 * Navigation menu items
 */
export const navigationItems: readonly NavigationItem[] = [
  { href: '#hero-header-section', label: 'Home' },
  { href: '#how-it-works-section', label: 'How It Works' },
  { href: '#features-list-section', label: 'Features' },
  { href: '#system-requirements-section', label: 'System Requirements' },
  { href: '#faq-section', label: 'FAQ' },
  { href: '#cta-section', label: 'Join' },
  { href: '#blog-list-section', label: 'Blog' },
  { href: '#contact-section', label: 'Contact' }
] as const;

/**
 * Main hero section content
 */
export const heroContent = {
  title: 'PSYCHOPISM',
  subtitle: 'Rust Edition. Version: 0.3.0-dev',
  description: 'An open-source psychedelic video game where reality distorts and logic is just an illusion. Dive into the depths of the mind in a world that changes with you.',
  buttons: [
    { text: 'Download Game', action: 'download' },
    { text: 'Contribute', action: 'contribute' }
  ]
} as const;

/**
 * How It Works section content
 */
export const howItWorksContent = {
  title: 'How It Works',
  paragraphs: [
    'Psychopism is not just a game, it\'s a **living experiment in interactive art**, constantly evolving thanks to the efforts of a passionate community. The core principle of the game is **procedural generation of distorted worlds**, where every element, from textures to sounds, is created on the fly, reacting to your actions and perception. This means that each playthrough will be unique, and the game\'s reality will change with you.',
    'We use innovative **distortion algorithms** that dynamically transform visual and audio data, creating the effect of "glitches" and psychedelic experiences. The deeper you immerse yourself in the world of Psychopism, the stronger the distortions, requiring you to adapt and think outside the box.',
    '**Community is the heart of Psychopism**. We believe in the power of collective creativity. Players can not only enjoy the game but also actively participate in its development: suggest new mechanics, create art, write storylines, and, of course, contribute to the code. Our **open-source code** invites everyone to join this surreal adventure.'
  ]
} as const;

/**
 * Main feature content
 */
export const mainFeatureContent = {
  title: 'Main Feature: Distorting Reality',
  paragraphs: [
    'The foundation of Psychopism is a **dynamic world** that constantly changes and adapts to the player\'s actions and perception. Visual elements don\'t just form static scenes; they distort, rearrange, and morph in response to your progress. This creates a unique and unpredictable experience where you never know what to expect around the next corner. Your mind is your compass in this ever-changing landscape.',
    '**Example of distortions:** At one moment, the landscape might be stable, and the next, visuals begin to "bleed," colors invert, and sounds distort. These effects are not random; they are often tied to your in-game state or key plot points, creating a deep connection between the player and the world.'
  ]
} as const;

/**
 * Additional features list
 */
export const additionalFeatures: readonly Feature[] = [
  {
    id: 'multiplayer',
    title: 'Cooperative Play (Multiplayer)',
    description: 'Explore distorted worlds together with friends. Psychopism supports **cooperative play**, allowing you to share the psychedelic experience and jointly solve puzzles that require multiple perspectives. The cooperative mode offers unique challenges where coordination and interaction become key to survival in an ever-changing reality.'
  },
  {
    id: 'customization',
    title: 'Customizable Distortion Parameters',
    description: 'Influence the level of psychedelic effect and world distortion parameters. The game provides a wide range of **settings**, allowing you to customize the visual and audio experience to your preferences. From subtle distortions to full immersion in chaos — you choose the intensity of your journey.'
  },
  {
    id: 'soundtrack',
    title: 'Dynamic Adaptive Soundtrack',
    description: 'Immerse yourself in the atmosphere of Psychopism with our **dynamic soundtrack** that adapts to your actions and game state. The music distorts and changes in real-time, reflecting the level of madness and unpredictability of the world, creating a truly immersive audio-visual journey.'
  },
  {
    id: 'community',
    title: 'Community-Driven Updates',
    description: 'The future of Psychopism is shaped by our community. New levels, mechanics, and visual effects can be proposed and implemented by **active project participants**, making the game truly alive and evolving. Join us to contribute to the evolution of the psychedelic experience!'
  }
] as const;

/**
 * System requirements
 */
export const systemRequirements: readonly SystemRequirement[] = [
  {
    category: 'minimum',
    requirements: {
      processor: 'Intel Core 2 Duo or equivalent.',
      ram: '64 MB.',
      videoCard: 'DirectX 9.0c compatible.',
      diskSpace: '200 MB.',
      operatingSystem: 'Windows XP/Vista/7/8/10, Linux, macOS.'
    }
  },
  {
    category: 'recommended',
    requirements: {
      processor: 'Intel Core i5 / AMD Ryzen 5 or newer.',
      ram: '4 GB.',
      videoCard: 'DirectX 11 compatible with 1 GB VRAM.',
      diskSpace: '500 MB.',
      operatingSystem: 'Windows 10, Linux (modern distribution), macOS (latest versions).'
    }
  }
] as const;

/**
 * FAQ items
 */
export const faqItems: readonly FAQItem[] = [
  {
    id: 'what-is-psychopism',
    question: 'What is Psychopism?',
    answer: 'Psychopism is an open-source psychedelic video game created by the community, where reality distorts and logic is just an illusion. Gameplay is built on exploring procedurally generated distorted worlds.'
  },
  {
    id: 'how-to-contribute',
    question: 'How can I contribute?',
    answer: 'You can contribute to code development, art creation, storyline writing, or testing new mechanics. Our source code is open, and we invite everyone to join us. Details can be found in the "Contribute" section.'
  },
  {
    id: 'platform-availability',
    question: 'Will the game be available on other platforms?',
    answer: 'The game is currently being developed for Windows, Linux, and macOS. In the future, we will consider porting to other platforms depending on community interest and available resources.'
  },
  {
    id: 'download-location',
    question: 'Where can I download the game?',
    answer: 'Download links will be available in the "Download Game" section and on our releases page as stable versions are released.'
  }
] as const;

/**
 * Blog posts
 */
export const blogPosts: readonly BlogPost[] = [
  {
    id: 'first-look',
    title: 'Introducing: A First Look at the World of Psychopism!',
    date: 'May 15, 2025',
    content: 'We are excited to present our new project - Psychopism! This game is a deep dive into a visual adventure with a unique psychedelic atmosphere. In this first blog post, we share our vision for the project, the first concepts of the game world, and talk about what inspired us to create this unique game. Get ready for reality to distort!',
    excerpt: 'We are excited to present our new project - Psychopism!'
  },
  {
    id: 'art-development',
    title: 'Art Development: Behind the Scenes of Visual Psychedelia',
    date: 'April 10, 2025',
    content: 'See how we create unique visual effects and digital art that bring the world of Psychopism to life. From initial sketches and distortion prototypes to finished animations, every visual element is imbued with meaning and designed to immerse you in an ever-changing visual symphony. We use advanced digital art techniques to achieve a truly surreal effect.',
    excerpt: 'See how we create unique visual effects and digital art'
  },
  {
    id: 'soundtrack',
    title: 'Psychopism Soundtrack: Sounds of Consciousness',
    date: 'March 01, 2025',
    content: 'Music plays a key role in creating the atmosphere of Psychopism. In this post, we share details about the soundtrack that will distort your perception and immerse you deeper into the game. We discuss the concept of dynamic audio, where sounds adapt to your actions and the level of reality distortion, creating a truly unique and unforgettable audio experience.',
    excerpt: 'Music plays a key role in creating the atmosphere'
  },
  {
    id: 'why-rust',
    title: 'Technical Aspects: Why Rust?',
    date: 'February 20, 2025',
    content: 'In this deep dive, we explain why we chose Rust for Psychopism development. We will explore the benefits of performance, memory safety, and parallel programming capabilities that Rust provides for creating a complex and dynamic game environment. Learn how this choice helps us build a reliable and efficient game.',
    excerpt: 'We explain why we chose Rust for Psychopism development'
  }
] as const;

/**
 * Call-to-action section
 */
export const ctaContent = {
  title: 'Join the psychedelic adventure!',
  description: 'Ready to dive into a world where the rules of reality are absent? Download the game or contribute to its development. We are always happy to welcome new members to our community.',
  contributionInfo: {
    title: 'How to contribute:',
    items: [
      {
        category: 'Code',
        description: 'If you are proficient in Rust and want to contribute to game logic or rendering, our GitHub repository is always open for pull requests.'
      },
      {
        category: 'Art',
        description: 'Talented artists can help with creating digital art, animations, and textures that define the game\'s visual style.'
      },
      {
        category: 'Story/Lore',
        description: 'Help us build a rich and intricate Psychopism universe by creating new storylines, characters, and lore elements.'
      },
      {
        category: 'Testing',
        description: 'Find bugs, suggest gameplay improvements, and help us make the game more stable and engaging.'
      }
    ],
    contact: 'Contact us via Discord or GitHub to learn more about how to get started.'
  },
  buttons: [
    { text: 'Download Now', action: 'download' },
    { text: 'Learn More About Contributing', action: 'contribute' },
    { text: 'Join the Community', action: 'community' }
  ]
} as const;

/**
 * Contact information
 */
export const contactInfo: ContactInfo = {
  email: 'contact@psychopism.game',
  socialMedia: {
    discord: '#',
    github: '#',
    twitter: '#'
  }
} as const;

/**
 * Animation configurations
 */

export const textAnimationConfig: TextAnimationConfig = {
  duration: 1500,
  finalColor: '#fff',
  noiseChars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':,./><? АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя"
} as const;


export const elementAnimationConfig: ElementAnimationConfig = {
  duration: 2000,
  noiseChars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;':,./><? АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя",
  minNoiseChars: 1000,
  maxNoiseChars: 2000,
  revealSpeed: 0.8,
  noiseUpdateInterval: 50
} as const;

/**
 * Footer content
 */
export const footerContent = {
  copyright: '© 2025 Psychopism. All rights reserved.',
  contact: 'Contact: contact@psychopism.game'
} as const;


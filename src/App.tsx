/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Build: 2026-03-28-v2
 */

import React, { useState, useRef, useEffect, useCallback, ChangeEvent, useMemo, MutableRefObject, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ScanningVisuals from './components/ScanningVisuals';
import { 
  Upload, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Settings2, 
  Waves, 
  Image as ImageIcon,
  Activity,
  Info,
  Sparkles,
  Music,
  Video,
  Camera,
  Zap,
  Wind,
  Cloud,
  Layers,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Cpu,
  Circle,
  Sliders,
  Square,
  X,
  XCircle,
  Eye,
  Palette,
  Link2,
  Target,
  Clock,
  RefreshCw
} from 'lucide-react';
// --- Constants & Types ---

const SCAN_SPEED = 0.02; // Time increment per frame
const SAMPLE_POINTS = 16;
const BASE_FREQ = 110;

const CHARACTER_EFFECTS = [
  { id: 'none', name: 'None', desc: 'Bypass' },
  { id: 'drive', name: 'Drive', desc: 'Tube-like drive' },
  { id: 'sweeten', name: 'Sweeten', desc: 'EQ, compression, saturation' },
  { id: 'fuzz', name: 'Fuzz', desc: 'Vintage fuzz' },
  { id: 'howl', name: 'Howl', desc: 'Resonant filter fuzz' },
  { id: 'swell', name: 'Swell', desc: 'Volume swells' },
  { id: 'crush', name: 'Crush', desc: 'Aggressive bitcrusher' },
] as const;

const MOVEMENT_EFFECTS = [
  { id: 'none', name: 'None', desc: 'Bypass' },
  { id: 'doubler', name: 'Doubler', desc: 'Double tracking' },
  { id: 'vibrato', name: 'Vibrato', desc: 'Pitch modulation' },
  { id: 'phaser', name: 'Phaser', desc: 'Hypnotic sweeps' },
  { id: 'tremolo', name: 'Tremolo', desc: 'Amplitude modulation' },
  { id: 'pitch', name: 'Pitch', desc: 'Pitch shifting' },
  { id: 'vortex', name: 'Vortex', desc: 'Flanger/Swirl' },
] as const;

const DIFFUSION_EFFECTS = [
  { id: 'none', name: 'None', desc: 'Bypass' },
  { id: 'cascade', name: 'Cascade', desc: 'Delay with feedback' },
  { id: 'reels', name: 'Reels', desc: 'Tape-like delay' },
  { id: 'space', name: 'Space', desc: 'Reverb' },
  { id: 'collage', name: 'Collage', desc: 'Granular delay' },
  { id: 'reverse', name: 'Reverse', desc: 'Reverse delay' },
  { id: 'echo', name: 'Echo', desc: 'Classic tape echo' },
] as const;

const TEXTURE_EFFECTS = [
  { id: 'none', name: 'None', desc: 'Bypass' },
  { id: 'filter', name: 'Filter', desc: 'Multi-mode filter' },
  { id: 'squash', name: 'Squash', desc: 'Heavy compression' },
  { id: 'cassette', name: 'Cassette', desc: 'Tape texture' },
  { id: 'broken', name: 'Broken', desc: 'Bitcrusher/Glitch' },
  { id: 'interference', name: 'Interference', desc: 'Noise/Static' },
  { id: 'radio', name: 'Radio', desc: 'Lo-fi AM radio' },
] as const;

const WAVE_TABLES = {
  'Organ': {
    real: [0, 1, 0.5, 0.33, 0.25, 0.2, 0.16, 0.14, 0.12],
    imag: [0, 0, 0, 0, 0, 0, 0, 0, 0]
  },
  'Brass': {
    real: [0, 1, 0.4, 0.1, 0.05, 0.02, 0.01],
    imag: [0, 0, 0, 0, 0, 0, 0]
  },
  'Strings': {
    real: [0, 1, 0.8, 0.6, 0.4, 0.2, 0.1],
    imag: [0, 0, 0, 0, 0, 0, 0]
  },
  'Electric Piano': {
    real: [0, 1, 0.2, 0.05, 0.01],
    imag: [0, 0, 0, 0, 0]
  }
};

const SCALES = {
  'Chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  'Major': [0, 2, 4, 5, 7, 9, 11],
  'Minor': [0, 2, 3, 5, 7, 8, 10],
  'Pentatonic Major': [0, 2, 4, 7, 9],
  'Pentatonic Minor': [0, 3, 5, 7, 10],
  'Blues': [0, 3, 5, 6, 7, 10],
  'Dorian': [0, 2, 3, 5, 7, 9, 10],
  'Phrygian': [0, 1, 3, 5, 7, 8, 10],
  'Lydian': [0, 2, 4, 6, 7, 9, 11],
  'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
  'Aeolian': [0, 2, 3, 5, 7, 8, 10],
  'Locrian': [0, 1, 3, 5, 6, 8, 10]
};

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const VISUAL_PALETTES = [
  { name: 'Cyberpunk', colors: ['#ff00ff', '#00ffff', '#ffff00'] },
  { name: 'Matrix', colors: ['#00ff00', '#003300', '#008800'] },
  { name: 'Sunset', colors: ['#ff5e62', '#ff9966', '#ffcc33'] },
  { name: 'Ocean', colors: ['#00c6ff', '#0072ff', '#00d2ff'] },
  { name: 'Vaporwave', colors: ['#ff71ce', '#01cdfe', '#05ffa1'] },
  { name: 'Monochrome', colors: ['#ffffff', '#888888', '#333333'] },
];

type WaveOption = OscillatorType | keyof typeof WAVE_TABLES | 'auto';
type VoiceType = 'melody' | 'kick' | 'snare' | 'hihat';

type ImageTrait = 'brightness' | 'hue' | 'saturation' | 'lightness' | 'x' | 'y';
type SoundParam = 'frequency' | 'amplitude' | 'cutoff' | 'q' | 'pan' | 'attack' | 'decay' | 'sustain' | 'release';

type CharacterEffect = typeof CHARACTER_EFFECTS[number]['id'];
type MovementEffect = typeof MOVEMENT_EFFECTS[number]['id'];
type DiffusionEffect = typeof DIFFUSION_EFFECTS[number]['id'];
type TextureEffect = typeof TEXTURE_EFFECTS[number]['id'];

interface ScanPreset {
  name: string;
  formulaX: string;
  formulaY: string;
  description: string;
}

const SCAN_PRESETS: ScanPreset[] = [
  {
    name: "Horizontal Scan",
    formulaX: "(t * 500) % w",
    formulaY: "(i / n) * h",
    description: "Classic left-to-right linear scan."
  },
  {
    name: "Vertical Scan",
    formulaX: "(i / n) * w",
    formulaY: "(t * 500) % h",
    description: "Classic top-to-bottom linear scan."
  },
  {
    name: "Circular Orbit",
    formulaX: "w/2 + Math.cos(t + i*0.2) * (h/3)",
    formulaY: "h/2 + Math.sin(t + i*0.2) * (h/3)",
    description: "Oscillators orbit the center in a circular path."
  },
  {
    name: "Lissajous Curve",
    formulaX: "w/2 + Math.sin(t * 2 + i*0.1) * (w/2.5)",
    formulaY: "h/2 + Math.cos(t * 3 + i*0.1) * (h/2.5)",
    description: "Complex harmonic motion creating intricate patterns."
  },
  {
    name: "Expanding Spiral",
    formulaX: "w/2 + Math.cos(t * 5 + i*0.1) * ((t * 50) % (h/2))",
    formulaY: "h/2 + Math.sin(t * 5 + i*0.1) * ((t * 50) % (h/2))",
    description: "A spiral that resets as it reaches the edges."
  },
  {
    name: "Wave Interference",
    formulaX: "(i/n) * w",
    formulaY: "h/2 + Math.sin(t * 2 + i) * (h/4) + Math.cos(t * 3) * (h/8)",
    description: "Oscillators follow a complex wave interference pattern."
  },
  {
    name: "DNA Helix",
    formulaX: "w/2 + Math.sin(t * 4 + (i%2)*Math.PI + i*0.2) * (w/4)",
    formulaY: "(t * 200 + i*20) % h",
    description: "A double helix structure scanning vertically."
  },
  {
    name: "Diamond Grid",
    formulaX: "w/2 + ((i % 4) - 1.5) * (w/5) + Math.sin(t + i) * 10",
    formulaY: "h/2 + (Math.floor(i / 4) - 1.5) * (h/5) + Math.cos(t + i) * 10",
    description: "Oscillators arranged in a vibrating diamond grid."
  },
  {
    name: "Chaotic Pendulum",
    formulaX: "w/2 + Math.sin(t * 1.5 + i) * (w/3) * Math.cos(t * 0.5)",
    formulaY: "h/2 + Math.cos(t * 1.2 + i) * (h/3) * Math.sin(t * 0.7)",
    description: "Complex non-linear motion mimicking a chaotic pendulum."
  },
  {
    name: "Zig-Zag Pulse",
    formulaX: "(t * 400 + i * 20) % w",
    formulaY: "h/2 + Math.abs(((t * 600 + i * 40) % (h * 2)) - h) - h/2",
    description: "Sharp geometric zig-zag patterns across the matrix."
  },
  {
    name: "Star Constellation",
    formulaX: "w/2 + Math.cos(t + (i % 5) * (Math.PI * 2 / 5)) * (h/3) * (0.5 + 0.5 * Math.sin(t * 3))",
    formulaY: "h/2 + Math.sin(t + (i % 5) * (Math.PI * 2 / 5)) * (h/3) * (0.5 + 0.5 * Math.sin(t * 3))",
    description: "Pulsing star-shaped paths with harmonic expansion."
  },
  {
    name: "Quantum Swarm",
    formulaX: "w/2 + Math.sin(t + i) * (w/4) + Math.sin(t * 2.3 + i * 2) * (w/8)",
    formulaY: "h/2 + Math.cos(t * 0.7 + i) * (h/4) + Math.cos(t * 3.1 + i * 1.5) * (h/8)",
    description: "Fluid, organic swarming motion with quantum-like jitter."
  },
  {
    name: "Infinity Loop",
    formulaX: "w/2 + Math.sin(t * 2 + i * 0.1) * (w/3)",
    formulaY: "h/2 + Math.sin(t * 4 + i * 0.1) * (h/6)",
    description: "Classic figure-eight infinity path."
  },
  {
    name: "Vortex Ripple",
    formulaX: "w/2 + Math.cos(t * 3 + i) * (w/4) * Math.sin(t * 0.5)",
    formulaY: "h/2 + Math.sin(t * 3 + i) * (h/4) * Math.cos(t * 0.5)",
    description: "A swirling vortex that ripples through the matrix."
  },
  {
    name: "Fractal Pulse",
    formulaX: "w/2 + Math.sin(t * 10 + i) * (w/8) + Math.cos(t * 2) * (w/4)",
    formulaY: "h/2 + Math.cos(t * 10 + i) * (h/8) + Math.sin(t * 2) * (h/4)",
    description: "High-frequency fractal-like vibrations."
  },
  {
    name: "Neon Rain",
    formulaX: "(i * (w/n) + Math.sin(t) * 20) % w",
    formulaY: "(t * 800 + i * 50) % h",
    description: "Vertical streaks mimicking falling digital rain."
  },
  {
    name: "Geometric Web",
    formulaX: "w/2 + Math.cos(t + i * Math.PI/4) * (w/3)",
    formulaY: "h/2 + Math.sin(t * 1.5 + i * Math.PI/2) * (h/3)",
    description: "Angular, geometric paths forming a shifting web."
  },
  {
    name: "Solar Flare",
    description: "Explosive radial patterns with high energy.",
    formulaX: "w/2 + Math.cos(t*5 + i/16 * Math.PI * 2) * (w/4 + Math.sin(t*10) * w/10)",
    formulaY: "h/2 + Math.sin(t*5 + i/16 * Math.PI * 2) * (h/4 + Math.cos(t*10) * h/10)"
  },
  {
    name: "Tidal Wave",
    description: "Fluid, rolling wave patterns.",
    formulaX: "i/16 * w",
    formulaY: "h/2 + Math.sin(t + i/16 * Math.PI * 2) * h/4 + Math.sin(t*2 + i/16 * Math.PI * 4) * h/8"
  },
  {
    name: "Digital Rain",
    description: "Cascading vertical patterns.",
    formulaX: "(i % 10) / 10 * w",
    formulaY: "((t * 2 + i/16) % 1) * h"
  },
  {
    name: "Radial Burst",
    formulaX: "w/2 + Math.cos(i * (Math.PI * 2 / n)) * ((t * 200) % (w/2))",
    formulaY: "h/2 + Math.sin(i * (Math.PI * 2 / n)) * ((t * 200) % (h/2))",
    description: "Oscillators burst from the center in a radial pattern."
  },
  {
    name: "Double Lissajous",
    formulaX: "w/2 + Math.sin(t * 1.5 + i*0.1) * (w/4) + Math.sin(t * 3.5) * (w/8)",
    formulaY: "h/2 + Math.cos(t * 2.5 + i*0.1) * (h/4) + Math.cos(t * 4.5) * (h/8)",
    description: "Two overlapping Lissajous curves for complex motion."
  },
  {
    name: "Sine Wave Cascade",
    formulaX: "(i/n) * w",
    formulaY: "h/2 + Math.sin(t * 3 + i * 0.5) * (h/3)",
    description: "A cascading sine wave moving through the oscillators."
  },
  {
    name: "Square Wave Grid",
    formulaX: "w/2 + (Math.abs((t * 200 + i * 50) % w - w/2) - w/4) * 2",
    formulaY: "h/2 + (Math.abs((t * 150 + i * 30) % h - h/2) - h/4) * 2",
    description: "Oscillators moving in a sharp, square-like grid pattern."
  },
  {
    name: "Circular Pulse",
    formulaX: "w/2 + Math.cos(i * (Math.PI * 2 / n)) * (h/4) * (1 + 0.5 * Math.sin(t * 4))",
    formulaY: "h/2 + Math.sin(i * (Math.PI * 2 / n)) * (h/4) * (1 + 0.5 * Math.sin(t * 4))",
    description: "A ring of oscillators that pulses in and out."
  },
  {
    name: "Diagonal Scan",
    formulaX: "(t * 300 + i * 20) % w",
    formulaY: "(t * 300 + i * 20) % h",
    description: "A linear scan that moves diagonally across the image."
  },
  {
    name: "Random Walk",
    formulaX: "w/2 + Math.sin(t * 10 + i) * 50 + Math.cos(t * 3.7) * 100",
    formulaY: "h/2 + Math.cos(t * 11 + i) * 50 + Math.sin(t * 4.2) * 100",
    description: "Jittery, pseudo-random motion across the matrix."
  },
  {
    name: "Heart Shape",
    formulaX: "w/2 + 16 * Math.pow(Math.sin(t + i*0.1), 3) * 10",
    formulaY: "h/2 - (13 * Math.cos(t + i*0.1) - 5 * Math.cos(2*(t + i*0.1)) - 2 * Math.cos(3*(t + i*0.1)) - Math.cos(4*(t + i*0.1))) * 10",
    description: "Oscillators follow a mathematical heart curve."
  },
  {
    name: "Butterfly Curve",
    formulaX: "w/2 + Math.sin(t + i*0.1) * (Math.exp(Math.cos(t + i*0.1)) - 2 * Math.cos(4 * (t + i*0.1)) - Math.pow(Math.sin((t + i*0.1) / 12), 5)) * 40",
    formulaY: "h/2 - Math.cos(t + i*0.1) * (Math.exp(Math.cos(t + i*0.1)) - 2 * Math.cos(4 * (t + i*0.1)) - Math.pow(Math.sin((t + i*0.1) / 12), 5)) * 40",
    description: "Complex, organic motion following a butterfly curve."
  },
  {
    name: "Spiral Galaxy",
    formulaX: "w/2 + (i/n) * (w/2) * Math.cos(t * 2 + i * 0.5)",
    formulaY: "h/2 + (i/n) * (h/2) * Math.sin(t * 2 + i * 0.5)",
    description: "A rotating spiral galaxy pattern."
  },
  {
    name: "Star Field",
    formulaX: "(Math.sin(i * 123.45 + t * 0.1) * 0.5 + 0.5) * w",
    formulaY: "(Math.cos(i * 678.90 + t * 0.1) * 0.5 + 0.5) * h",
    description: "Oscillators scattered like stars in a field."
  },
  {
    name: "Grid Morph",
    formulaX: "((i % 4) / 3) * w * (0.8 + 0.2 * Math.sin(t))",
    formulaY: "(Math.floor(i / 4) / 3) * h * (0.8 + 0.2 * Math.cos(t))",
    description: "A grid that expands and contracts rhythmically."
  },
  {
    name: "Diamond Pulse",
    formulaX: "w/2 + (Math.abs((i % 4) - 1.5) - 0.75) * (w/2) * Math.sin(t)",
    formulaY: "h/2 + (Math.abs(Math.floor(i / 4) - 1.5) - 0.75) * (h/2) * Math.cos(t)",
    description: "A diamond-shaped arrangement that pulses."
  },
  {
    name: "Vertical Wave",
    formulaX: "(i/n) * w",
    formulaY: "h/2 + Math.sin(t * 5 + i * 0.8) * (h/2.5)",
    description: "A fast-moving vertical wave."
  },
  {
    name: "Horizontal Wave",
    formulaX: "w/2 + Math.cos(t * 5 + i * 0.8) * (w/2.5)",
    formulaY: "(i/n) * h",
    description: "A fast-moving horizontal wave."
  },
  {
    name: "Circular Ripple",
    formulaX: "w/2 + Math.cos(i * 0.4) * (h/3) * Math.sin(t + i*0.1)",
    formulaY: "h/2 + Math.sin(i * 0.4) * (h/3) * Math.sin(t + i*0.1)",
    description: "Rippling circular motion."
  },
  {
    name: "Square Spiral",
    formulaX: "w/2 + Math.max(-1, Math.min(1, Math.cos(t*2 + i*0.1))) * (t*20 % (w/2))",
    formulaY: "h/2 + Math.max(-1, Math.min(1, Math.sin(t*2 + i*0.1))) * (t*20 % (h/2))",
    description: "A spiral that moves in square steps."
  },
  {
    name: "Cross Scan",
    formulaX: "i < n/2 ? (t * 400) % w : w/2",
    formulaY: "i < n/2 ? h/2 : (t * 400) % h",
    description: "Simultaneous horizontal and vertical scans."
  },
  {
    name: "Orbital Dance",
    formulaX: "w/2 + Math.cos(t * 1.1 + i) * (w/4) + Math.cos(t * 2.2) * (w/10)",
    formulaY: "h/2 + Math.sin(t * 1.3 + i) * (h/4) + Math.sin(t * 2.5) * (h/10)",
    description: "Complex orbital paths that dance around each other."
  },
  {
    name: "Quantum Tunneling",
    formulaX: "(Math.floor(t * 5 + i) * 123.456) % w",
    formulaY: "(Math.floor(t * 5 + i) * 789.012) % h",
    description: "Rapid, discrete jumps between positions."
  }
];

const PATCHES = [
  {
    name: "Ethereal Clouds",
    description: "Lush, evolving ambient textures using circular scanning and deep space reverb.",
    icon: Sparkles,
    settings: {
      baseFreq: 220,
      freqRange: 440,
      freqMod: 100,
      ampMod: 0.8,
      cutoffMod: 2000,
      qMod: 5,
      scanSpeed: 0.5,
      scanScale: 1.5,
      scanCenterX: 0.5,
      scanCenterY: 0.5,
      formulaX: "w/2 + Math.cos(t + i*0.2) * (h/3)",
      formulaY: "h/2 + Math.sin(t + i*0.2) * (h/3)",
      activePreset: 2,
      enabledVoices: [true, true, true, true, false, false, false, false, true, true, true, true, false, false, false, false],
      isSequencerEnabled: false,
      bpm: 60,
      scaleName: 'Pentatonic Major' as const,
      rootNoteIndex: 0,
      isEvolving: true,
      mutationAmount: 0.05,
      sequenceLength: 32,
      quantizeAmount: 1.0,
      characterEffect: 'sweeten' as const,
      movementEffect: 'vibrato' as const,
      diffusionEffect: 'space' as const,
      textureEffect: 'filter' as const,
      characterAmount: 0.7,
      movementAmount: 0.3,
      diffusionAmount: 0.9,
      textureAmount: 0.4,
      adsr: { attack: 0.8, decay: 0.4, sustain: 0.7, release: 1.5 }
    },
    droneSettings: {
      isDroneEnabled: true,
      isDroneSequencerEnabled: true,
      droneMasterVolume: 0.4,
      droneFilterCutoff: 800,
      droneFilterResonance: 2,
      droneVoices: [
        { type: 'sine', freq: 55, volume: 0.6, detune: 2, pan: -0.4, adsr: { attack: 1.0, decay: 0.5, sustain: 0.8, release: 2.0 } },
        { type: 'sine', freq: 110, volume: 0.4, detune: -2, pan: 0.4, adsr: { attack: 1.5, decay: 0.8, sustain: 0.7, release: 2.5 } },
        { type: 'sine', freq: 164.81, volume: 0.3, detune: 0, pan: -0.2, adsr: { attack: 2.0, decay: 1.0, sustain: 0.6, release: 3.0 } },
        { type: 'sine', freq: 220, volume: 0.2, detune: 4, pan: 0.2, adsr: { attack: 2.5, decay: 1.2, sustain: 0.5, release: 3.5 } }
      ],
      droneSequencerBpm: 60,
      droneSequencerLinkToMatrix: true,
      droneSequencerVoices: [
        { name: 'Sub', type: 'sine', steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [0.8, 0.5, 0.5, 0.5, 0.8, 0.5, 0.5, 0.5, 0.8, 0.5, 0.5, 0.5, 0.8, 0.5, 0.5, 0.5], adsr: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.5 } },
        { name: 'Bass', type: 'sine', steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], pitch: [48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48], volume: [0.5, 0.5, 0.6, 0.5, 0.5, 0.5, 0.6, 0.5, 0.5, 0.5, 0.6, 0.5, 0.5, 0.5, 0.6, 0.5], adsr: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.2 } },
        { name: 'Pad', type: 'sine', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60], volume: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2], adsr: { attack: 0.5, decay: 0.5, sustain: 1.0, release: 1.0 } },
        { name: 'Perc', type: 'auto', steps: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], adsr: { attack: 0.01, decay: 0.05, sustain: 0.1, release: 0.1 } }
      ]
    }
  },
  {
    name: "Neon Pulse",
    description: "Driving rhythmic sequence with aggressive drive and synchronized delays.",
    icon: Zap,
    settings: {
      baseFreq: 110,
      freqRange: 220,
      freqMod: 300,
      ampMod: 1.5,
      cutoffMod: 5000,
      qMod: 10,
      scanSpeed: 2.0,
      scanScale: 0.8,
      scanCenterX: 0.5,
      scanCenterY: 0.5,
      formulaX: "(t * 500) % w",
      formulaY: "(i / n) * h",
      activePreset: 0,
      enabledVoices: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      isSequencerEnabled: true,
      bpm: 128,
      scaleName: 'Minor' as const,
      rootNoteIndex: 2,
      isEvolving: false,
      mutationAmount: 0.2,
      sequenceLength: 16,
      quantizeAmount: 1.0,
      characterEffect: 'drive' as const,
      movementEffect: 'tremolo' as const,
      diffusionEffect: 'cascade' as const,
      textureEffect: 'squash' as const,
      characterAmount: 0.6,
      movementAmount: 0.8,
      diffusionAmount: 0.5,
      textureAmount: 0.7,
      adsr: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.2 }
    },
    droneSettings: {
      isDroneEnabled: true,
      isDroneSequencerEnabled: true,
      droneMasterVolume: 0.5,
      droneFilterCutoff: 1200,
      droneFilterResonance: 5,
      droneVoices: [
        { type: 'sawtooth', freq: 55, volume: 0.4, detune: 10, pan: -0.5, adsr: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.1 } },
        { type: 'sawtooth', freq: 55, volume: 0.4, detune: -10, pan: 0.5, adsr: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.1 } },
        { type: 'square', freq: 110, volume: 0.3, detune: 5, pan: -0.2, adsr: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.2 } },
        { type: 'square', freq: 110, volume: 0.3, detune: -5, pan: 0.2, adsr: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.2 } }
      ],
      droneSequencerBpm: 128,
      droneSequencerLinkToMatrix: true,
      droneSequencerVoices: [
        { name: 'Sub', type: 'sine', steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [1.0, 0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5], adsr: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.1 } },
        { name: 'Bass', type: 'sawtooth', steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [0.8, 0.5, 0.8, 0.5, 0.8, 0.5, 0.8, 0.5, 0.8, 0.5, 0.8, 0.5, 0.8, 0.5, 0.8, 0.5], adsr: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.1 } },
        { name: 'Lead', type: 'square', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [48, 51, 53, 55, 58, 60, 63, 65, 67, 70, 72, 75, 77, 79, 82, 84], volume: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4], adsr: { attack: 0.01, decay: 0.05, sustain: 0.2, release: 0.05 } },
        { name: 'Perc', type: 'auto', steps: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [0.6, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.5], adsr: { attack: 0.001, decay: 0.02, sustain: 0.0, release: 0.02 } }
      ]
    }
  },
  {
    name: "Midnight Synthwave",
    description: "Driving, cinematic 80s-inspired sequence with deep bass and tape-like textures.",
    icon: Music,
    settings: {
      baseFreq: 82.41,
      freqRange: 329.63,
      freqMod: 200,
      ampMod: 1.8,
      cutoffMod: 3500,
      qMod: 12,
      scanSpeed: 1.0,
      scanScale: 1.0,
      scanCenterX: 0.5,
      scanCenterY: 0.5,
      formulaX: "(t * 500) % w",
      formulaY: "(i / n) * h",
      activePreset: 0,
      enabledVoices: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      isSequencerEnabled: true,
      bpm: 115,
      scaleName: 'Minor' as const,
      rootNoteIndex: 4,
      isEvolving: true,
      mutationAmount: 0.1,
      sequenceLength: 32,
      quantizeAmount: 1.0,
      characterEffect: 'drive' as const,
      movementEffect: 'doubler' as const,
      diffusionEffect: 'reels' as const,
      textureEffect: 'cassette' as const,
      characterAmount: 0.5,
      movementAmount: 0.6,
      diffusionAmount: 0.7,
      textureAmount: 0.8,
      adsr: { attack: 0.05, decay: 0.3, sustain: 0.5, release: 0.4 }
    },
    droneSettings: {
      isDroneEnabled: true,
      isDroneSequencerEnabled: true,
      droneMasterVolume: 0.6,
      droneFilterCutoff: 600,
      droneFilterResonance: 3,
      droneVoices: [
        { type: 'sawtooth', freq: 41.2, volume: 0.7, detune: 5, pan: -0.3, adsr: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.5 } },
        { type: 'sawtooth', freq: 82.41, volume: 0.5, detune: -5, pan: 0.3, adsr: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.5 } },
        { type: 'triangle', freq: 123.47, volume: 0.4, detune: 0, pan: 0.0, adsr: { attack: 0.2, decay: 0.4, sustain: 0.6, release: 0.8 } },
        { type: 'sine', freq: 164.81, volume: 0.3, detune: 2, pan: 0.5, adsr: { attack: 0.3, decay: 0.5, sustain: 0.5, release: 1.0 } }
      ],
      droneSequencerBpm: 115,
      droneSequencerLinkToMatrix: true,
      droneSequencerVoices: [
        { name: 'Sub', type: 'sine', steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], pitch: [28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28], volume: [0.9, 0.5, 0.5, 0.5, 0.9, 0.5, 0.5, 0.5, 0.9, 0.5, 0.5, 0.5, 0.9, 0.5, 0.5, 0.5], adsr: { attack: 0.05, decay: 0.1, sustain: 0.4, release: 0.2 } },
        { name: 'Bass', type: 'sawtooth', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [40, 40, 40, 40, 43, 43, 43, 43, 45, 45, 45, 45, 40, 40, 40, 40], volume: [0.6, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.5], adsr: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.1 } },
        { name: 'Lead', type: 'triangle', steps: [false, false, false, false, true, true, false, false, true, true, false, false, true, true, false, false], pitch: [64, 64, 64, 64, 67, 67, 67, 67, 69, 69, 69, 69, 64, 64, 64, 64], volume: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], adsr: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.3 } },
        { name: 'Perc', type: 'auto', steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [0.7, 0.5, 0.7, 0.5, 0.7, 0.5, 0.7, 0.5, 0.7, 0.5, 0.7, 0.5, 0.7, 0.5, 0.7, 0.5], adsr: { attack: 0.005, decay: 0.05, sustain: 0.0, release: 0.05 } }
      ]
    }
  },
  {
    name: "Celestial Helix",
    description: "Shimmering, generative melodies following a double helix path with lush space reverb.",
    icon: Sparkles,
    settings: {
      baseFreq: 440,
      freqRange: 880,
      freqMod: 200,
      ampMod: 1.2,
      cutoffMod: 5000,
      qMod: 15,
      scanSpeed: 0.8,
      scanScale: 1.2,
      scanCenterX: 0.5,
      scanCenterY: 0.5,
      formulaX: "w/2 + Math.sin(t * 4 + (i%2)*Math.PI + i*0.2) * (w/4)",
      formulaY: "(t * 200 + i*20) % h",
      activePreset: 6,
      enabledVoices: [true, true, true, true, false, false, false, false, true, true, true, true, false, false, false, false],
      isSequencerEnabled: true,
      bpm: 90,
      scaleName: 'Lydian' as const,
      rootNoteIndex: 0,
      isEvolving: true,
      mutationAmount: 0.15,
      sequenceLength: 32,
      quantizeAmount: 1.0,
      characterEffect: 'sweeten' as const,
      movementEffect: 'vibrato' as const,
      diffusionEffect: 'space' as const,
      textureEffect: 'filter' as const,
      characterAmount: 0.4,
      movementAmount: 0.7,
      diffusionAmount: 0.9,
      textureAmount: 0.3,
      adsr: { attack: 0.4, decay: 0.6, sustain: 0.6, release: 1.2 }
    },
    droneSettings: {
      isDroneEnabled: true,
      isDroneSequencerEnabled: true,
      droneMasterVolume: 0.3,
      droneFilterCutoff: 3000,
      droneFilterResonance: 8,
      droneVoices: [
        { type: 'sine', freq: 440, volume: 0.4, detune: 0, pan: -0.6, adsr: { attack: 2.0, decay: 1.0, sustain: 0.7, release: 2.0 } },
        { type: 'sine', freq: 659.25, volume: 0.3, detune: 5, pan: 0.6, adsr: { attack: 2.5, decay: 1.2, sustain: 0.6, release: 2.5 } },
        { type: 'sine', freq: 880, volume: 0.2, detune: -5, pan: -0.2, adsr: { attack: 3.0, decay: 1.5, sustain: 0.5, release: 3.0 } },
        { type: 'triangle', freq: 220, volume: 0.5, detune: 2, pan: 0.2, adsr: { attack: 1.5, decay: 0.8, sustain: 0.8, release: 1.5 } }
      ],
      droneSequencerBpm: 90,
      droneSequencerLinkToMatrix: true,
      droneSequencerVoices: [
        { name: 'Sub', type: 'sine', steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [0.6, 0.4, 0.4, 0.4, 0.6, 0.4, 0.4, 0.4, 0.6, 0.4, 0.4, 0.4, 0.6, 0.4, 0.4, 0.4], adsr: { attack: 0.2, decay: 0.3, sustain: 0.5, release: 0.5 } },
        { name: 'Bass', type: 'sine', steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], pitch: [48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48], volume: [0.4, 0.4, 0.5, 0.4, 0.4, 0.4, 0.5, 0.4, 0.4, 0.4, 0.5, 0.4, 0.4, 0.4, 0.5, 0.4], adsr: { attack: 0.1, decay: 0.2, sustain: 0.4, release: 0.3 } },
        { name: 'Lead', type: 'sine', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [72, 76, 79, 84, 88, 91, 96, 100, 103, 108, 112, 115, 120, 124, 127, 132], volume: [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3], adsr: { attack: 0.8, decay: 0.8, sustain: 1.0, release: 1.0 } },
        { name: 'Perc', type: 'auto', steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], adsr: { attack: 0.05, decay: 0.2, sustain: 0.1, release: 0.2 } }
      ]
    }
  },
  {
    name: "Deep Sea Echo",
    description: "Submerged, pressure-heavy textures with long, dark reverberations.",
    icon: Waves,
    settings: {
      baseFreq: 41.2, freqRange: 164.81, freqMod: 50, ampMod: 0.5, cutoffMod: 400, qMod: 2,
      scanSpeed: 0.2, scanScale: 2.0, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "w/2 + Math.cos(t*0.1) * w/4", formulaY: "h/2 + Math.sin(t*0.1) * h/4",
      activePreset: 2, enabledVoices: new Array(16).fill(true), isSequencerEnabled: false, bpm: 40,
      scaleName: 'Minor' as const, rootNoteIndex: 4, isEvolving: true, mutationAmount: 0.02,
      sequenceLength: 32, quantizeAmount: 1.0, characterEffect: 'howl' as const,
      movementEffect: 'vortex' as const, diffusionEffect: 'space' as const, textureEffect: 'filter' as const,
      characterAmount: 0.8, movementAmount: 0.4, diffusionAmount: 1.0, textureAmount: 0.6,
      adsr: { attack: 2.0, decay: 1.0, sustain: 0.8, release: 4.0 }
    }
  },
  {
    name: "Solar Flare",
    description: "Intense, radiating heat with aggressive harmonic distortion.",
    icon: Zap,
    settings: {
      baseFreq: 110, freqRange: 880, freqMod: 500, ampMod: 2.0, cutoffMod: 8000, qMod: 20,
      scanSpeed: 3.0, scanScale: 0.5, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "w/2 + Math.tan(t) * 10", formulaY: "h/2 + Math.sin(t*10) * h/2",
      activePreset: 0, enabledVoices: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      isSequencerEnabled: true, bpm: 140, scaleName: 'Pentatonic Minor' as const, rootNoteIndex: 9,
      isEvolving: false, mutationAmount: 0.3, sequenceLength: 16, quantizeAmount: 1.0,
      characterEffect: 'fuzz' as const, movementEffect: 'tremolo' as const, diffusionEffect: 'cascade' as const, textureEffect: 'squash' as const,
      characterAmount: 0.9, movementAmount: 0.7, diffusionAmount: 0.4, textureAmount: 0.8,
      adsr: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.1 }
    }
  },
  {
    name: "Crystal Lattice",
    description: "Pure, geometric tones with precise, mathematical reflections.",
    icon: Layers,
    settings: {
      baseFreq: 880, freqRange: 1760, freqMod: 100, ampMod: 0.8, cutoffMod: 10000, qMod: 30,
      scanSpeed: 0.5, scanScale: 1.0, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "((i*w/n) + t*100) % w", formulaY: "((i*h/n) + t*50) % h",
      activePreset: 1, enabledVoices: new Array(16).fill(true), isSequencerEnabled: true, bpm: 120,
      scaleName: 'Major' as const, rootNoteIndex: 0, isEvolving: false, mutationAmount: 0.05,
      sequenceLength: 16, quantizeAmount: 1.0, characterEffect: 'sweeten' as const,
      movementEffect: 'doubler' as const, diffusionEffect: 'echo' as const, textureEffect: 'none' as const,
      characterAmount: 0.5, movementAmount: 0.3, diffusionAmount: 0.6, textureAmount: 0.0,
      adsr: { attack: 0.05, decay: 0.2, sustain: 0.1, release: 0.2 }
    }
  },
  {
    name: "Ghost Machine",
    description: "Haunting, mechanical whispers from a forgotten era.",
    icon: Activity,
    settings: {
      baseFreq: 220, freqRange: 440, freqMod: 150, ampMod: 1.2, cutoffMod: 2000, qMod: 8,
      scanSpeed: 0.4, scanScale: 1.5, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "w/2 + Math.sin(t*0.5) * w/3", formulaY: "h/2 + Math.cos(t*0.7) * h/3",
      activePreset: 4, enabledVoices: [true, true, false, false, true, true, false, false, true, true, false, false, true, true, false, false],
      isSequencerEnabled: true, bpm: 75, scaleName: 'Minor' as const, rootNoteIndex: 2,
      isEvolving: true, mutationAmount: 0.1, sequenceLength: 32, quantizeAmount: 0.5,
      characterEffect: 'crush' as const, movementEffect: 'vibrato' as const, diffusionEffect: 'reverse' as const, textureEffect: 'broken' as const,
      characterAmount: 0.6, movementAmount: 0.5, diffusionAmount: 0.8, textureAmount: 0.7,
      adsr: { attack: 0.5, decay: 0.5, sustain: 0.3, release: 1.0 }
    }
  },
  {
    name: "Emerald Forest",
    description: "Lush, organic growth patterns with shimmering canopy light.",
    icon: Wind,
    settings: {
      baseFreq: 329.63, freqRange: 659.25, freqMod: 120, ampMod: 0.9, cutoffMod: 3000, qMod: 5,
      scanSpeed: 0.6, scanScale: 1.3, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "w/2 + Math.sin(t + i*0.5) * w/4", formulaY: "h/2 + Math.cos(t*0.8 + i*0.3) * h/4",
      activePreset: 2, enabledVoices: new Array(16).fill(true), isSequencerEnabled: false, bpm: 80,
      scaleName: 'Lydian' as const, rootNoteIndex: 5, isEvolving: true, mutationAmount: 0.08,
      sequenceLength: 32, quantizeAmount: 1.0, characterEffect: 'sweeten' as const,
      movementEffect: 'phaser' as const, diffusionEffect: 'space' as const, textureEffect: 'filter' as const,
      characterAmount: 0.5, movementAmount: 0.6, diffusionAmount: 0.9, textureAmount: 0.4,
      adsr: { attack: 1.0, decay: 0.8, sustain: 0.6, release: 2.0 }
    }
  },
  {
    name: "Crimson Tide",
    description: "Powerful, surging low-end with rhythmic wave-like motion.",
    icon: Waves,
    settings: {
      baseFreq: 55, freqRange: 110, freqMod: 200, ampMod: 1.5, cutoffMod: 1200, qMod: 10,
      scanSpeed: 1.2, scanScale: 0.9, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "(t * 100) % w", formulaY: "h/2 + Math.sin(t*2) * h/3",
      activePreset: 0, enabledVoices: [true, true, true, true, false, false, false, false, true, true, true, true, false, false, false, false],
      isSequencerEnabled: true, bpm: 110, scaleName: 'Phrygian' as const, rootNoteIndex: 0,
      isEvolving: false, mutationAmount: 0.15, sequenceLength: 16, quantizeAmount: 1.0,
      characterEffect: 'drive' as const, movementEffect: 'tremolo' as const, diffusionEffect: 'cascade' as const, textureEffect: 'squash' as const,
      characterAmount: 0.7, movementAmount: 0.8, diffusionAmount: 0.5, textureAmount: 0.6,
      adsr: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 0.4 }
    }
  },
  {
    name: "Stardust Memory",
    description: "Flickering, distant light patterns with cosmic delay trails.",
    icon: Sparkles,
    settings: {
      baseFreq: 1320, freqRange: 2640, freqMod: 50, ampMod: 0.7, cutoffMod: 12000, qMod: 40,
      scanSpeed: 0.3, scanScale: 1.8, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "Math.random() * w", formulaY: "Math.random() * h",
      activePreset: 5, enabledVoices: [true, false, false, true, false, true, true, false, true, false, false, true, false, true, true, false],
      isSequencerEnabled: true, bpm: 60, scaleName: 'Mixolydian' as const, rootNoteIndex: 7,
      isEvolving: true, mutationAmount: 0.2, sequenceLength: 64, quantizeAmount: 0.2,
      characterEffect: 'none' as const, movementEffect: 'vibrato' as const, diffusionEffect: 'collage' as const, textureEffect: 'interference' as const,
      characterAmount: 0.3, movementAmount: 0.9, diffusionAmount: 1.0, textureAmount: 0.5,
      adsr: { attack: 0.01, decay: 0.05, sustain: 0.1, release: 0.5 }
    }
  },
  {
    name: "Binary Sunset",
    description: "Warm, nostalgic digital landscape with evolving horizons.",
    icon: Music,
    settings: {
      baseFreq: 164.81, freqRange: 329.63, freqMod: 180, ampMod: 1.3, cutoffMod: 2500, qMod: 6,
      scanSpeed: 0.7, scanScale: 1.1, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "(t * 50) % w", formulaY: "h/2 + Math.cos(t*0.5) * h/4",
      activePreset: 0, enabledVoices: new Array(16).fill(true), isSequencerEnabled: true, bpm: 95,
      scaleName: 'Major' as const, rootNoteIndex: 4, isEvolving: true, mutationAmount: 0.05,
      sequenceLength: 32, quantizeAmount: 1.0, characterEffect: 'sweeten' as const,
      movementEffect: 'doubler' as const, diffusionEffect: 'reels' as const, textureEffect: 'cassette' as const,
      characterAmount: 0.6, movementAmount: 0.4, diffusionAmount: 0.8, textureAmount: 0.7,
      adsr: { attack: 0.5, decay: 0.4, sustain: 0.6, release: 1.0 }
    }
  },
  {
    name: "Arctic Wind",
    description: "Cold, whistling textures with icy, crystalline reflections.",
    icon: Wind,
    settings: {
      baseFreq: 660, freqRange: 1320, freqMod: 300, ampMod: 1.1, cutoffMod: 6000, qMod: 15,
      scanSpeed: 1.5, scanScale: 1.4, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "w/2 + Math.sin(t*2) * w/2", formulaY: "h/2 + Math.cos(t*3) * h/2",
      activePreset: 3, enabledVoices: [true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false],
      isSequencerEnabled: false, bpm: 120, scaleName: 'Aeolian' as const, rootNoteIndex: 0,
      isEvolving: true, mutationAmount: 0.12, sequenceLength: 32, quantizeAmount: 1.0,
      characterEffect: 'howl' as const, movementEffect: 'vortex' as const, diffusionEffect: 'space' as const, textureEffect: 'filter' as const,
      characterAmount: 0.5, movementAmount: 0.8, diffusionAmount: 0.9, textureAmount: 0.3,
      adsr: { attack: 1.5, decay: 1.0, sustain: 0.7, release: 3.0 }
    }
  },
  {
    name: "Volcanic Ash",
    description: "Gritty, dark textures with explosive rhythmic bursts.",
    icon: Activity,
    settings: {
      baseFreq: 82.41, freqRange: 164.81, freqMod: 400, ampMod: 1.8, cutoffMod: 1500, qMod: 12,
      scanSpeed: 2.5, scanScale: 0.7, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "Math.random() * 50", formulaY: "(t * 1000) % h",
      activePreset: 0, enabledVoices: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      isSequencerEnabled: true, bpm: 150, scaleName: 'Locrian' as const, rootNoteIndex: 1,
      isEvolving: false, mutationAmount: 0.25, sequenceLength: 16, quantizeAmount: 1.0,
      characterEffect: 'fuzz' as const, movementEffect: 'tremolo' as const, diffusionEffect: 'cascade' as const, textureEffect: 'broken' as const,
      characterAmount: 0.8, movementAmount: 0.9, diffusionAmount: 0.3, textureAmount: 0.9,
      adsr: { attack: 0.005, decay: 0.1, sustain: 0.1, release: 0.05 }
    }
  },
  {
    name: "Digital Rain",
    description: "Cascading, rhythmic pulses inspired by vertical data streams.",
    icon: Cloud,
    settings: {
      baseFreq: 440, freqRange: 880, freqMod: 250, ampMod: 1.4, cutoffMod: 4500, qMod: 18,
      scanSpeed: 1.8, scanScale: 0.6, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "(i * w / n)", formulaY: "(t * 800 + i * 50) % h",
      activePreset: 0, enabledVoices: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      isSequencerEnabled: true, bpm: 135, scaleName: 'Minor' as const, rootNoteIndex: 0,
      isEvolving: false, mutationAmount: 0.1, sequenceLength: 16, quantizeAmount: 1.0,
      characterEffect: 'crush' as const, movementEffect: 'tremolo' as const, diffusionEffect: 'echo' as const, textureEffect: 'interference' as const,
      characterAmount: 0.6, movementAmount: 0.7, diffusionAmount: 0.5, textureAmount: 0.8,
      adsr: { attack: 0.01, decay: 0.05, sustain: 0.2, release: 0.1 }
    }
  },
  {
    name: "Prism Shard",
    description: "Multi-faceted, bright harmonic reflections with rapid shifts.",
    icon: Target,
    settings: {
      baseFreq: 1760, freqRange: 3520, freqMod: 150, ampMod: 0.9, cutoffMod: 15000, qMod: 50,
      scanSpeed: 0.9, scanScale: 0.4, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "w/2 + Math.sin(t*5 + i) * w/3", formulaY: "h/2 + Math.cos(t*4 + i) * h/3",
      activePreset: 6, enabledVoices: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      isSequencerEnabled: true, bpm: 160, scaleName: 'Major' as const, rootNoteIndex: 0,
      isEvolving: true, mutationAmount: 0.15, sequenceLength: 32, quantizeAmount: 1.0,
      characterEffect: 'none' as const, movementEffect: 'vibrato' as const, diffusionEffect: 'collage' as const, textureEffect: 'none' as const,
      characterAmount: 0.2, movementAmount: 0.8, diffusionAmount: 0.7, textureAmount: 0.0,
      adsr: { attack: 0.02, decay: 0.1, sustain: 0.1, release: 0.2 }
    }
  },
  {
    name: "Gravity Well",
    description: "Dense, collapsing low-end that pulls surrounding frequencies in.",
    icon: Circle,
    settings: {
      baseFreq: 30.87, freqRange: 123.47, freqMod: 80, ampMod: 0.6, cutoffMod: 300, qMod: 4,
      scanSpeed: 0.1, scanScale: 2.5, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "w/2 + Math.cos(t*0.05) * w/10", formulaY: "h/2 + Math.sin(t*0.05) * h/10",
      activePreset: 2, enabledVoices: new Array(16).fill(true), isSequencerEnabled: false, bpm: 30,
      scaleName: 'Minor' as const, rootNoteIndex: 11, isEvolving: true, mutationAmount: 0.01,
      sequenceLength: 32, quantizeAmount: 1.0, characterEffect: 'howl' as const,
      movementEffect: 'vortex' as const, diffusionEffect: 'space' as const, textureEffect: 'filter' as const,
      characterAmount: 1.0, movementAmount: 0.2, diffusionAmount: 1.0, textureAmount: 0.8,
      adsr: { attack: 5.0, decay: 2.0, sustain: 0.9, release: 8.0 }
    }
  },
  {
    name: "Plasma Storm",
    description: "Highly energetic, unstable electrical discharges with rapid modulation.",
    icon: Zap,
    settings: {
      baseFreq: 220, freqRange: 1760, freqMod: 600, ampMod: 2.5, cutoffMod: 9000, qMod: 25,
      scanSpeed: 4.0, scanScale: 0.3, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "Math.random() * w", formulaY: "(t * 2000) % h",
      activePreset: 0, enabledVoices: [true, true, false, true, true, false, true, true, false, true, true, false, true, true, false, true],
      isSequencerEnabled: true, bpm: 180, scaleName: 'Diminished' as const, rootNoteIndex: 0,
      isEvolving: false, mutationAmount: 0.4, sequenceLength: 16, quantizeAmount: 1.0,
      characterEffect: 'crush' as const, movementEffect: 'tremolo' as const, diffusionEffect: 'reverse' as const, textureEffect: 'broken' as const,
      characterAmount: 0.9, movementAmount: 0.7, diffusionAmount: 0.6, textureAmount: 1.0,
      adsr: { attack: 0.001, decay: 0.05, sustain: 0.1, release: 0.01 }
    }
  },
  {
    name: "Ancient Echoes",
    description: "Dusty, resonant textures reminiscent of stone chambers and old spirits.",
    icon: BookOpen,
    settings: {
      baseFreq: 110, freqRange: 220, freqMod: 100, ampMod: 1.0, cutoffMod: 1000, qMod: 15,
      scanSpeed: 0.3, scanScale: 1.6, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "w/2 + Math.sin(t*0.2) * w/4", formulaY: "h/2 + Math.cos(t*0.3) * h/4",
      activePreset: 4, enabledVoices: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      isSequencerEnabled: true, bpm: 50, scaleName: 'Dorian' as const, rootNoteIndex: 9,
      isEvolving: true, mutationAmount: 0.05, sequenceLength: 32, quantizeAmount: 0.8,
      characterEffect: 'howl' as const, movementEffect: 'phaser' as const, diffusionEffect: 'space' as const, textureEffect: 'cassette' as const,
      characterAmount: 0.7, movementAmount: 0.3, diffusionAmount: 1.0, textureAmount: 0.8,
      adsr: { attack: 1.5, decay: 1.0, sustain: 0.5, release: 2.5 }
    }
  },
  {
    name: "Cybernetic Dreams",
    description: "Glitched, evolving digital consciousness with rhythmic logic.",
    icon: Cpu,
    settings: {
      baseFreq: 440, freqRange: 880, freqMod: 300, ampMod: 1.6, cutoffMod: 5500, qMod: 20,
      scanSpeed: 1.4, scanScale: 0.8, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "(t * 400) % w", formulaY: "(Math.floor(t * 10) % 10) * h / 10",
      activePreset: 0, enabledVoices: [true, false, true, true, false, true, true, false, true, true, false, true, true, false, true, true],
      isSequencerEnabled: true, bpm: 124, scaleName: 'Minor' as const, rootNoteIndex: 0,
      isEvolving: true, mutationAmount: 0.2, sequenceLength: 16, quantizeAmount: 1.0,
      characterEffect: 'crush' as const, movementEffect: 'vortex' as const, diffusionEffect: 'cascade' as const, textureEffect: 'broken' as const,
      characterAmount: 0.6, movementAmount: 0.7, diffusionAmount: 0.5, textureAmount: 0.9,
      adsr: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.2 }
    }
  },
  {
    name: "Golden Hour",
    description: "Warm, saturated ambient glow with gentle harmonic movement.",
    icon: Clock,
    settings: {
      baseFreq: 220, freqRange: 440, freqMod: 80, ampMod: 0.9, cutoffMod: 2200, qMod: 4,
      scanSpeed: 0.4, scanScale: 1.2, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "w/2 + Math.sin(t*0.3) * w/5", formulaY: "h/2 + Math.cos(t*0.4) * h/5",
      activePreset: 2, enabledVoices: new Array(16).fill(true), isSequencerEnabled: false, bpm: 70,
      scaleName: 'Major' as const, rootNoteIndex: 7, isEvolving: true, mutationAmount: 0.04,
      sequenceLength: 32, quantizeAmount: 1.0, characterEffect: 'sweeten' as const,
      movementEffect: 'doubler' as const, diffusionEffect: 'reels' as const, textureEffect: 'filter' as const,
      characterAmount: 0.8, movementAmount: 0.4, diffusionAmount: 0.8, textureAmount: 0.5,
      adsr: { attack: 1.2, decay: 0.6, sustain: 0.7, release: 1.8 }
    }
  },
  {
    name: "Void Walker",
    description: "Empty, vast spaces with occasional rhythmic anomalies.",
    icon: Eye,
    settings: {
      baseFreq: 27.5, freqRange: 55, freqMod: 30, ampMod: 0.4, cutoffMod: 200, qMod: 2,
      scanSpeed: 0.05, scanScale: 3.0, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "w/2 + Math.cos(t*0.02) * w/2", formulaY: "h/2 + Math.sin(t*0.02) * h/2",
      activePreset: 2, enabledVoices: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
      isSequencerEnabled: false, bpm: 20, scaleName: 'Minor' as const, rootNoteIndex: 9,
      isEvolving: true, mutationAmount: 0.01, sequenceLength: 64, quantizeAmount: 1.0,
      characterEffect: 'howl' as const, movementEffect: 'none' as const, diffusionEffect: 'space' as const, textureEffect: 'interference' as const,
      characterAmount: 0.9, movementAmount: 0.1, diffusionAmount: 1.0, textureAmount: 0.7,
      adsr: { attack: 10.0, decay: 5.0, sustain: 0.8, release: 15.0 }
    }
  },
  {
    name: "Supernova",
    description: "Blinding, explosive harmonic expansion with massive trails.",
    icon: Sparkles,
    settings: {
      baseFreq: 440, freqRange: 3520, freqMod: 800, ampMod: 2.2, cutoffMod: 12000, qMod: 15,
      scanSpeed: 5.0, scanScale: 0.2, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "w/2 + Math.tan(t*2) * 5", formulaY: "h/2 + Math.tan(t*3) * 5",
      activePreset: 0, enabledVoices: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      isSequencerEnabled: true, bpm: 170, scaleName: 'Major' as const, rootNoteIndex: 0,
      isEvolving: false, mutationAmount: 0.5, sequenceLength: 16, quantizeAmount: 1.0,
      characterEffect: 'fuzz' as const, movementEffect: 'vibrato' as const, diffusionEffect: 'space' as const, textureEffect: 'squash' as const,
      characterAmount: 1.0, movementAmount: 0.9, diffusionAmount: 1.0, textureAmount: 0.9,
      adsr: { attack: 0.001, decay: 0.2, sustain: 0.4, release: 0.1 }
    }
  },
  {
    name: "Bioluminescence",
    description: "Soft, pulsing organic light patterns with gentle rhythmic flow.",
    icon: Activity,
    settings: {
      baseFreq: 523.25, freqRange: 1046.5, freqMod: 150, ampMod: 1.1, cutoffMod: 3500, qMod: 10,
      scanSpeed: 0.5, scanScale: 1.1, scanCenterX: 0.5, scanCenterY: 0.5,
      formulaX: "w/2 + Math.sin(t + i*0.4) * w/6", formulaY: "h/2 + Math.cos(t*0.6 + i*0.2) * h/6",
      activePreset: 2, enabledVoices: [true, true, true, true, false, false, false, false, true, true, true, true, false, false, false, false],
      isSequencerEnabled: true, bpm: 85, scaleName: 'Lydian' as const, rootNoteIndex: 0,
      isEvolving: true, mutationAmount: 0.06, sequenceLength: 32, quantizeAmount: 1.0,
      characterEffect: 'sweeten' as const, movementEffect: 'phaser' as const, diffusionEffect: 'space' as const, textureEffect: 'filter' as const,
      characterAmount: 0.4, movementAmount: 0.5, diffusionAmount: 0.9, textureAmount: 0.3,
      adsr: { attack: 0.8, decay: 0.6, sustain: 0.5, release: 1.5 }
    }
  }
];

const DRONE_PATCHES = [
  {
    name: "Deep Space Drone",
    description: "Low frequency sine waves with slow evolving filters and wide spread.",
    settings: {
      isDroneEnabled: true,
      isDroneSequencerEnabled: true,
      droneMasterVolume: 0.6,
      droneFilterCutoff: 150,
      droneFilterResonance: 4,
      droneSpread: 0.15,
      droneLfoFreq: 0.05,
      droneLfoAmount: 300,
      droneLfoTarget: 'cutoff',
      droneSaturation: 0.2,
      droneReverbSend: 0.4,
      droneSubAmount: 0.3,
      droneVoices: [
        { type: 'sine', freq: 55, volume: 0.8, detune: 0, pan: -0.2, adsr: { attack: 1.5, decay: 0.5, sustain: 0.8, release: 2.0 } },
        { type: 'sine', freq: 110, volume: 0.4, detune: 5, pan: 0.2, adsr: { attack: 2.0, decay: 0.8, sustain: 0.6, release: 2.5 } },
        { type: 'triangle', freq: 82.41, volume: 0.3, detune: -3, pan: -0.5, adsr: { attack: 1.0, decay: 0.4, sustain: 0.5, release: 1.5 } },
        { type: 'sine', freq: 41.2, volume: 0.5, detune: 0, pan: 0.5, adsr: { attack: 3.0, decay: 1.0, sustain: 0.9, release: 3.0 } }
      ],
      droneSequencerBpm: 60,
      droneSequencerSwing: 0,
      droneSequencerLinkToMatrix: true,
      droneSequencerVoices: [
        { name: 'Sub', type: 'sine', steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [0.8, 0.5, 0.5, 0.5, 0.8, 0.5, 0.5, 0.5, 0.8, 0.5, 0.5, 0.5, 0.8, 0.5, 0.5, 0.5], probability: new Array(16).fill(1.0), duration: new Array(16).fill(0.8), adsr: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.5 } },
        { name: 'Bass', type: 'triangle', steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], pitch: [48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48], volume: [0.5, 0.5, 0.6, 0.5, 0.5, 0.5, 0.6, 0.5, 0.5, 0.5, 0.6, 0.5, 0.5, 0.5, 0.6, 0.5], probability: new Array(16).fill(0.9), duration: new Array(16).fill(0.4), adsr: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.2 } },
        { name: 'Pad', type: 'sine', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60], volume: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2], probability: new Array(16).fill(0.7), duration: new Array(16).fill(1.0), adsr: { attack: 0.5, decay: 0.5, sustain: 1.0, release: 1.0 } },
        { name: 'Perc', type: 'auto', steps: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], probability: new Array(16).fill(0.5), duration: new Array(16).fill(0.1), adsr: { attack: 0.01, decay: 0.05, sustain: 0.1, release: 0.1 } }
      ]
    }
  },
  {
    name: "Techno Grit",
    description: "Aggressive square waves with a driving 16th note sequence and rhythmic LFO.",
    settings: {
      isDroneEnabled: true,
      isDroneSequencerEnabled: true,
      droneMasterVolume: 0.5,
      droneFilterCutoff: 1200,
      droneFilterResonance: 6,
      droneSpread: 0.05,
      droneLfoFreq: 2.0,
      droneLfoAmount: 500,
      droneLfoTarget: 'cutoff',
      droneSaturation: 0.6,
      droneReverbSend: 0.2,
      droneSubAmount: 0.5,
      droneVoices: [
        { type: 'square', freq: 55, volume: 0.5, detune: 10, pan: -0.3, adsr: { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.1 } },
        { type: 'square', freq: 55, volume: 0.5, detune: -10, pan: 0.3, adsr: { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.1 } },
        { type: 'sawtooth', freq: 110, volume: 0.3, detune: 5, pan: -0.5, adsr: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.2 } },
        { type: 'square', freq: 110, volume: 0.3, detune: -5, pan: 0.5, adsr: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.2 } }
      ],
      droneSequencerBpm: 128,
      droneSequencerSwing: 0.1,
      droneSequencerLinkToMatrix: true,
      droneSequencerVoices: [
        { name: 'Sub', type: 'sine', steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [1.0, 0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5, 1.0, 0.5, 0.5, 0.5], probability: new Array(16).fill(1.0), duration: new Array(16).fill(0.2), adsr: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.1 } },
        { name: 'Bass', type: 'square', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [36, 36, 36, 36, 39, 39, 39, 39, 41, 41, 41, 41, 36, 36, 36, 36], volume: [0.8, 0.6, 0.8, 0.6, 0.8, 0.6, 0.8, 0.6, 0.8, 0.6, 0.8, 0.6, 0.8, 0.6, 0.8, 0.6], probability: new Array(16).fill(1.0), duration: new Array(16).fill(0.1), adsr: { attack: 0.01, decay: 0.05, sustain: 0.3, release: 0.05 } },
        { name: 'Lead', type: 'sawtooth', steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], pitch: [48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48], volume: [0.6, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.5, 0.6, 0.5], probability: new Array(16).fill(0.8), duration: new Array(16).fill(0.3), adsr: { attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.1 } },
        { name: 'Perc', type: 'auto', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [0.4, 0.3, 0.4, 0.3, 0.4, 0.3, 0.4, 0.3, 0.4, 0.3, 0.4, 0.3, 0.4, 0.3, 0.4, 0.3], probability: new Array(16).fill(0.6), duration: new Array(16).fill(0.05), adsr: { attack: 0.001, decay: 0.02, sustain: 0.0, release: 0.02 } }
      ]
    }
  },
  {
    name: "Ambient Shimmer",
    description: "High frequency sine waves with melodic sequencer and long release.",
    settings: {
      isDroneEnabled: true,
      isDroneSequencerEnabled: true,
      droneMasterVolume: 0.4,
      droneFilterCutoff: 2500,
      droneFilterResonance: 2,
      droneSpread: 0.3,
      droneLfoFreq: 0.2,
      droneLfoAmount: 0.5,
      droneLfoTarget: 'pan',
      droneSaturation: 0.1,
      droneReverbSend: 0.8,
      droneSubAmount: 0.1,
      droneVoices: [
        { type: 'sine', freq: 440, volume: 0.4, detune: 0, pan: -0.5, adsr: { attack: 2.0, decay: 1.0, sustain: 0.7, release: 3.0 } },
        { type: 'sine', freq: 659.25, volume: 0.3, detune: 5, pan: 0.5, adsr: { attack: 2.5, decay: 1.2, sustain: 0.6, release: 3.5 } },
        { type: 'sine', freq: 880, volume: 0.2, detune: -5, pan: -0.2, adsr: { attack: 3.0, decay: 1.5, sustain: 0.5, release: 4.0 } },
        { type: 'triangle', freq: 220, volume: 0.5, detune: 2, pan: 0.2, adsr: { attack: 1.5, decay: 0.8, sustain: 0.8, release: 2.5 } }
      ],
      droneSequencerBpm: 80,
      droneSequencerSwing: 0,
      droneSequencerLinkToMatrix: true,
      droneSequencerVoices: [
        { name: 'Sub', type: 'sine', steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [0.5, 0.3, 0.3, 0.3, 0.5, 0.3, 0.3, 0.3, 0.5, 0.3, 0.3, 0.3, 0.5, 0.3, 0.3, 0.3], probability: new Array(16).fill(1.0), duration: new Array(16).fill(0.9), adsr: { attack: 0.5, decay: 0.5, sustain: 0.5, release: 1.0 } },
        { name: 'Bass', type: 'sine', steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], pitch: [48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48], volume: [0.3, 0.3, 0.4, 0.3, 0.3, 0.3, 0.4, 0.3, 0.3, 0.3, 0.4, 0.3, 0.3, 0.3, 0.4, 0.3], probability: new Array(16).fill(0.9), duration: new Array(16).fill(0.5), adsr: { attack: 0.3, decay: 0.3, sustain: 0.4, release: 0.8 } },
        { name: 'Lead', type: 'sine', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [60, 64, 67, 72, 76, 79, 84, 88, 91, 96, 100, 103, 108, 112, 115, 120], volume: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2], probability: new Array(16).fill(0.7), duration: new Array(16).fill(1.0), adsr: { attack: 1.0, decay: 1.0, sustain: 1.0, release: 2.0 } },
        { name: 'Perc', type: 'auto', steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4], probability: new Array(16).fill(0.5), duration: new Array(16).fill(0.2), adsr: { attack: 0.1, decay: 0.5, sustain: 0.1, release: 0.5 } }
      ]
    }
  },
  {
    name: "Industrial Pulse",
    description: "Sawtooth drones with a heavy, distorted rhythmic sequence and aggressive LFO.",
    settings: {
      isDroneEnabled: true,
      isDroneSequencerEnabled: true,
      droneMasterVolume: 0.7,
      droneFilterCutoff: 500,
      droneFilterResonance: 8,
      droneSpread: 0.1,
      droneLfoFreq: 4.0,
      droneLfoAmount: 800,
      droneLfoTarget: 'cutoff',
      droneSaturation: 0.8,
      droneReverbSend: 0.3,
      droneSubAmount: 0.6,
      droneVoices: [
        { type: 'sawtooth', freq: 41.2, volume: 0.8, detune: 15, pan: -0.4, adsr: { attack: 0.1, decay: 0.2, sustain: 0.9, release: 0.5 } },
        { type: 'sawtooth', freq: 41.2, volume: 0.8, detune: -15, pan: 0.4, adsr: { attack: 0.1, decay: 0.2, sustain: 0.9, release: 0.5 } },
        { type: 'square', freq: 82.41, volume: 0.6, detune: 8, pan: -0.2, adsr: { attack: 0.2, decay: 0.3, sustain: 0.7, release: 0.8 } },
        { type: 'sawtooth', freq: 123.47, volume: 0.4, detune: 0, pan: 0.2, adsr: { attack: 0.3, decay: 0.4, sustain: 0.6, release: 1.0 } }
      ],
      droneSequencerBpm: 100,
      droneSequencerSwing: 0.2,
      droneSequencerLinkToMatrix: true,
      droneSequencerVoices: [
        { name: 'Sub', type: 'sine', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28], volume: [1.0, 0.8, 1.0, 0.8, 1.0, 0.8, 1.0, 0.8, 1.0, 0.8, 1.0, 0.8, 1.0, 0.8, 1.0, 0.8], probability: new Array(16).fill(1.0), duration: new Array(16).fill(0.1), adsr: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.1 } },
        { name: 'Bass', type: 'sawtooth', steps: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false], pitch: [40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40], volume: [0.9, 0.5, 0.9, 0.5, 0.9, 0.5, 0.9, 0.5, 0.9, 0.5, 0.9, 0.5, 0.9, 0.5, 0.9, 0.5], probability: new Array(16).fill(1.0), duration: new Array(16).fill(0.1), adsr: { attack: 0.01, decay: 0.1, sustain: 0.4, release: 0.1 } },
        { name: 'Lead', type: 'square', steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], pitch: [52, 52, 52, 52, 55, 55, 55, 55, 52, 52, 52, 52, 55, 55, 55, 55], volume: [0.7, 0.5, 0.7, 0.5, 0.7, 0.5, 0.7, 0.5, 0.7, 0.5, 0.7, 0.5, 0.7, 0.5, 0.7, 0.5], probability: new Array(16).fill(0.8), duration: new Array(16).fill(0.2), adsr: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.2 } },
        { name: 'Perc', type: 'auto', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [0.6, 0.4, 0.6, 0.4, 0.6, 0.4, 0.6, 0.4, 0.6, 0.4, 0.6, 0.4, 0.6, 0.4, 0.6, 0.4], probability: new Array(16).fill(0.6), duration: new Array(16).fill(0.05), adsr: { attack: 0.005, decay: 0.03, sustain: 0.0, release: 0.03 } }
      ]
    }
  },
  {
    name: "Ethereal Waves",
    description: "Wide spread oscillators with slow volume LFO and probabilistic sequencing.",
    settings: {
      isDroneEnabled: true,
      isDroneSequencerEnabled: true,
      droneMasterVolume: 0.5,
      droneFilterCutoff: 3000,
      droneFilterResonance: 1.5,
      droneSpread: 0.8,
      droneLfoFreq: 0.1,
      droneLfoAmount: 0.8,
      droneLfoTarget: 'volume',
      droneSaturation: 0.3,
      droneReverbSend: 0.6,
      droneSubAmount: 0.2,
      droneVoices: [
        { type: 'sine', freq: 220, volume: 0.5, detune: 0, pan: -0.8, adsr: { attack: 4.0, decay: 2.0, sustain: 0.8, release: 5.0 } },
        { type: 'sine', freq: 330, volume: 0.4, detune: 10, pan: 0.8, adsr: { attack: 5.0, decay: 2.5, sustain: 0.7, release: 6.0 } },
        { type: 'sine', freq: 440, volume: 0.3, detune: -10, pan: -0.4, adsr: { attack: 6.0, decay: 3.0, sustain: 0.6, release: 7.0 } },
        { type: 'sine', freq: 110, volume: 0.6, detune: 0, pan: 0.4, adsr: { attack: 3.0, decay: 1.5, sustain: 0.9, release: 4.0 } }
      ],
      droneSequencerBpm: 45,
      droneSequencerSwing: 0,
      droneSequencerLinkToMatrix: true,
      droneSequencerVoices: [
        { name: 'Lead', type: 'sine', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96, 98, 100, 103, 105, 108], volume: [0.3, 0.2, 0.3, 0.2, 0.3, 0.2, 0.3, 0.2, 0.3, 0.2, 0.3, 0.2, 0.3, 0.2, 0.3, 0.2], probability: [0.4, 0.2, 0.5, 0.3, 0.6, 0.4, 0.7, 0.5, 0.8, 0.6, 0.9, 0.7, 1.0, 0.8, 0.9, 0.7], duration: new Array(16).fill(1.0), adsr: { attack: 2.0, decay: 1.0, sustain: 1.0, release: 3.0 } },
        { name: 'Bass', type: 'sine', steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], pitch: [48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48], volume: [0.4, 0.3, 0.3, 0.3, 0.4, 0.3, 0.3, 0.3, 0.4, 0.3, 0.3, 0.3, 0.4, 0.3, 0.3, 0.3], probability: new Array(16).fill(1.0), duration: new Array(16).fill(0.8), adsr: { attack: 1.0, decay: 1.0, sustain: 0.8, release: 2.0 } },
        { name: 'Pad', type: 'sine', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60], volume: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1], probability: new Array(16).fill(0.6), duration: new Array(16).fill(1.0), adsr: { attack: 3.0, decay: 3.0, sustain: 1.0, release: 4.0 } },
        { name: 'Perc', type: 'auto', steps: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2], probability: new Array(16).fill(0.3), duration: new Array(16).fill(0.1), adsr: { attack: 0.5, decay: 0.5, sustain: 0.1, release: 0.5 } }
      ]
    }
  },
  {
    name: "Cosmic Cathedral",
    description: "Wide reverby drone with slow arpeggiated sequencer and celestial sine waves.",
    settings: {
      isDroneEnabled: true,
      isDroneSequencerEnabled: true,
      droneMasterVolume: 0.45,
      droneFilterCutoff: 2200,
      droneFilterResonance: 2.5,
      droneSpread: 0.7,
      droneLfoFreq: 0.08,
      droneLfoAmount: 400,
      droneLfoTarget: 'cutoff',
      droneSaturation: 0.15,
      droneReverbSend: 0.9,
      droneSubAmount: 0.2,
      droneVoices: [
        { type: 'sine', freq: 130.81, volume: 0.5, detune: 3, pan: -0.6, adsr: { attack: 3.0, decay: 1.5, sustain: 0.8, release: 5.0 } },
        { type: 'sine', freq: 196.0, volume: 0.4, detune: -3, pan: 0.6, adsr: { attack: 3.5, decay: 2.0, sustain: 0.7, release: 5.5 } },
        { type: 'sine', freq: 261.63, volume: 0.3, detune: 5, pan: -0.3, adsr: { attack: 4.0, decay: 2.5, sustain: 0.6, release: 6.0 } },
        { type: 'triangle', freq: 65.41, volume: 0.6, detune: 0, pan: 0.3, adsr: { attack: 2.5, decay: 1.0, sustain: 0.9, release: 4.0 } }
      ],
      droneSequencerBpm: 70,
      droneSequencerSwing: 0.05,
      droneSequencerLinkToMatrix: true,
      droneSequencerVoices: [
        { name: 'Sub', type: 'sine', steps: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [0.6, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.6, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3], probability: new Array(16).fill(1.0), duration: new Array(16).fill(1.0), adsr: { attack: 0.8, decay: 0.5, sustain: 0.7, release: 1.5 } },
        { name: 'Bass', type: 'sine', steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], pitch: [48, 48, 48, 48, 52, 52, 52, 52, 48, 48, 48, 48, 55, 55, 55, 55], volume: [0.4, 0.3, 0.3, 0.3, 0.5, 0.3, 0.3, 0.3, 0.4, 0.3, 0.3, 0.3, 0.5, 0.3, 0.3, 0.3], probability: new Array(16).fill(0.9), duration: new Array(16).fill(0.8), adsr: { attack: 0.5, decay: 0.4, sustain: 0.6, release: 1.0 } },
        { name: 'Lead', type: 'sine', steps: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false], pitch: [60, 60, 64, 64, 67, 67, 72, 72, 76, 76, 72, 72, 67, 67, 64, 64], volume: [0.25, 0.2, 0.25, 0.2, 0.25, 0.2, 0.25, 0.2, 0.25, 0.2, 0.25, 0.2, 0.25, 0.2, 0.25, 0.2], probability: new Array(16).fill(0.7), duration: new Array(16).fill(1.0), adsr: { attack: 1.5, decay: 1.0, sustain: 0.8, release: 2.5 } },
        { name: 'Perc', type: 'auto', steps: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2], probability: new Array(16).fill(0.3), duration: new Array(16).fill(0.2), adsr: { attack: 0.3, decay: 0.3, sustain: 0.1, release: 0.5 } }
      ]
    }
  },
  {
    name: "Neon Underground",
    description: "Punchy sawtooth and square waves with fast glitchy sequencer and high saturation.",
    settings: {
      isDroneEnabled: true,
      isDroneSequencerEnabled: true,
      droneMasterVolume: 0.6,
      droneFilterCutoff: 1800,
      droneFilterResonance: 7,
      droneSpread: 0.15,
      droneLfoFreq: 3.0,
      droneLfoAmount: 600,
      droneLfoTarget: 'cutoff',
      droneSaturation: 0.75,
      droneReverbSend: 0.15,
      droneSubAmount: 0.5,
      droneVoices: [
        { type: 'sawtooth', freq: 55, volume: 0.6, detune: 8, pan: -0.3, adsr: { attack: 0.01, decay: 0.08, sustain: 0.7, release: 0.1 } },
        { type: 'square', freq: 55, volume: 0.5, detune: -8, pan: 0.3, adsr: { attack: 0.01, decay: 0.08, sustain: 0.7, release: 0.1 } },
        { type: 'sawtooth', freq: 110, volume: 0.35, detune: 12, pan: -0.5, adsr: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.15 } },
        { type: 'square', freq: 110, volume: 0.3, detune: -12, pan: 0.5, adsr: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.15 } }
      ],
      droneSequencerBpm: 140,
      droneSequencerSwing: 0.15,
      droneSequencerLinkToMatrix: true,
      droneSequencerVoices: [
        { name: 'Sub', type: 'sine', steps: [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false], pitch: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], volume: [1.0, 0.5, 0.5, 0.8, 0.5, 0.5, 1.0, 0.5, 0.9, 0.5, 0.5, 0.8, 0.5, 0.5, 1.0, 0.5], probability: new Array(16).fill(1.0), duration: new Array(16).fill(0.1), adsr: { attack: 0.005, decay: 0.05, sustain: 0.3, release: 0.05 } },
        { name: 'Bass', type: 'square', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [36, 36, 39, 36, 41, 36, 39, 36, 36, 36, 39, 36, 43, 36, 41, 36], volume: [0.8, 0.5, 0.7, 0.5, 0.8, 0.5, 0.7, 0.5, 0.8, 0.5, 0.7, 0.5, 0.9, 0.5, 0.7, 0.5], probability: new Array(16).fill(1.0), duration: new Array(16).fill(0.08), adsr: { attack: 0.005, decay: 0.03, sustain: 0.4, release: 0.03 } },
        { name: 'Lead', type: 'sawtooth', steps: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true], pitch: [48, 51, 48, 53, 48, 55, 48, 53, 48, 51, 48, 53, 48, 56, 48, 53], volume: [0.5, 0.6, 0.5, 0.7, 0.5, 0.6, 0.5, 0.7, 0.5, 0.6, 0.5, 0.7, 0.5, 0.8, 0.5, 0.7], probability: [1.0, 0.9, 1.0, 0.8, 1.0, 0.7, 1.0, 0.9, 1.0, 0.9, 1.0, 0.8, 1.0, 0.6, 1.0, 0.9], duration: new Array(16).fill(0.15), adsr: { attack: 0.005, decay: 0.05, sustain: 0.5, release: 0.08 } },
        { name: 'Perc', type: 'auto', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [42, 38, 42, 38, 42, 38, 42, 38, 42, 38, 42, 38, 42, 38, 42, 38], volume: [0.5, 0.3, 0.5, 0.3, 0.5, 0.3, 0.5, 0.3, 0.5, 0.3, 0.5, 0.3, 0.5, 0.3, 0.5, 0.3], probability: [1.0, 0.5, 0.8, 0.4, 1.0, 0.5, 0.8, 0.4, 1.0, 0.5, 0.8, 0.4, 1.0, 0.5, 0.8, 0.4], duration: new Array(16).fill(0.03), adsr: { attack: 0.001, decay: 0.02, sustain: 0.0, release: 0.02 } }
      ]
    }
  },
  {
    name: "Frozen Tundra",
    description: "Sparse, cold sine tones with minimal sequencing and wide stereo field.",
    settings: {
      isDroneEnabled: true,
      isDroneSequencerEnabled: true,
      droneMasterVolume: 0.35,
      droneFilterCutoff: 350,
      droneFilterResonance: 3,
      droneSpread: 0.95,
      droneLfoFreq: 0.03,
      droneLfoAmount: 150,
      droneLfoTarget: 'cutoff',
      droneSaturation: 0.05,
      droneReverbSend: 0.85,
      droneSubAmount: 0.15,
      droneVoices: [
        { type: 'sine', freq: 73.42, volume: 0.4, detune: 1, pan: -0.9, adsr: { attack: 5.0, decay: 3.0, sustain: 0.7, release: 8.0 } },
        { type: 'sine', freq: 110.0, volume: 0.3, detune: -1, pan: 0.9, adsr: { attack: 6.0, decay: 3.5, sustain: 0.6, release: 9.0 } },
        { type: 'triangle', freq: 146.83, volume: 0.2, detune: 2, pan: -0.5, adsr: { attack: 7.0, decay: 4.0, sustain: 0.5, release: 10.0 } },
        { type: 'sine', freq: 55.0, volume: 0.5, detune: 0, pan: 0.0, adsr: { attack: 4.0, decay: 2.0, sustain: 0.8, release: 7.0 } }
      ],
      droneSequencerBpm: 50,
      droneSequencerSwing: 0,
      droneSequencerLinkToMatrix: true,
      droneSequencerVoices: [
        { name: 'Sub', type: 'sine', steps: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [0.5, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2], probability: new Array(16).fill(1.0), duration: new Array(16).fill(1.0), adsr: { attack: 1.5, decay: 1.0, sustain: 0.6, release: 3.0 } },
        { name: 'Bass', type: 'sine', steps: [false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false], pitch: [48, 48, 48, 48, 48, 48, 48, 48, 50, 50, 50, 50, 48, 48, 48, 48], volume: [0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.35, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2], probability: new Array(16).fill(0.8), duration: new Array(16).fill(0.9), adsr: { attack: 1.0, decay: 0.8, sustain: 0.5, release: 2.0 } },
        { name: 'Pad', type: 'sine', steps: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false], pitch: [60, 60, 60, 60, 60, 60, 60, 60, 64, 64, 64, 64, 60, 60, 60, 60], volume: [0.15, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.15, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1], probability: new Array(16).fill(0.6), duration: new Array(16).fill(1.0), adsr: { attack: 3.0, decay: 2.0, sustain: 0.9, release: 5.0 } },
        { name: 'Perc', type: 'auto', steps: [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [0.15, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.1, 0.1, 0.1], probability: new Array(16).fill(0.4), duration: new Array(16).fill(0.3), adsr: { attack: 0.2, decay: 0.3, sustain: 0.1, release: 0.5 } }
      ]
    }
  },
  {
    name: "Volcanic Rumble",
    description: "Deep aggressive bass with driving rhythm, high saturation, and square/sawtooth waves.",
    settings: {
      isDroneEnabled: true,
      isDroneSequencerEnabled: true,
      droneMasterVolume: 0.75,
      droneFilterCutoff: 700,
      droneFilterResonance: 9,
      droneSpread: 0.08,
      droneLfoFreq: 1.5,
      droneLfoAmount: 500,
      droneLfoTarget: 'cutoff',
      droneSaturation: 0.85,
      droneReverbSend: 0.2,
      droneSubAmount: 0.7,
      droneVoices: [
        { type: 'square', freq: 36.71, volume: 0.8, detune: 6, pan: -0.2, adsr: { attack: 0.05, decay: 0.15, sustain: 0.85, release: 0.3 } },
        { type: 'sawtooth', freq: 36.71, volume: 0.7, detune: -6, pan: 0.2, adsr: { attack: 0.05, decay: 0.15, sustain: 0.85, release: 0.3 } },
        { type: 'square', freq: 73.42, volume: 0.5, detune: 10, pan: -0.4, adsr: { attack: 0.08, decay: 0.2, sustain: 0.7, release: 0.4 } },
        { type: 'sawtooth', freq: 55.0, volume: 0.6, detune: -3, pan: 0.4, adsr: { attack: 0.1, decay: 0.25, sustain: 0.75, release: 0.5 } }
      ],
      droneSequencerBpm: 110,
      droneSequencerSwing: 0.25,
      droneSequencerLinkToMatrix: true,
      droneSequencerVoices: [
        { name: 'Sub', type: 'sine', steps: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false], pitch: [24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24], volume: [1.0, 0.6, 0.9, 0.6, 1.0, 0.6, 0.9, 0.6, 1.0, 0.6, 0.9, 0.6, 1.0, 0.6, 0.9, 0.6], probability: new Array(16).fill(1.0), duration: new Array(16).fill(0.15), adsr: { attack: 0.01, decay: 0.08, sustain: 0.4, release: 0.08 } },
        { name: 'Bass', type: 'sawtooth', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [36, 36, 36, 36, 38, 38, 38, 38, 36, 36, 36, 36, 41, 41, 41, 41], volume: [0.9, 0.6, 0.8, 0.6, 0.9, 0.6, 0.8, 0.6, 0.9, 0.6, 0.8, 0.6, 1.0, 0.7, 0.9, 0.6], probability: new Array(16).fill(1.0), duration: new Array(16).fill(0.1), adsr: { attack: 0.01, decay: 0.06, sustain: 0.5, release: 0.06 } },
        { name: 'Lead', type: 'square', steps: [false, false, false, true, false, false, false, true, false, false, false, true, false, false, true, true], pitch: [48, 48, 48, 48, 48, 48, 48, 51, 48, 48, 48, 53, 48, 48, 48, 48], volume: [0.5, 0.4, 0.5, 0.7, 0.5, 0.4, 0.5, 0.7, 0.5, 0.4, 0.5, 0.8, 0.5, 0.4, 0.7, 0.7], probability: new Array(16).fill(0.9), duration: new Array(16).fill(0.12), adsr: { attack: 0.01, decay: 0.08, sustain: 0.4, release: 0.1 } },
        { name: 'Perc', type: 'auto', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [36, 40, 36, 40, 36, 40, 36, 40, 36, 40, 36, 40, 36, 40, 36, 40], volume: [0.7, 0.4, 0.6, 0.4, 0.7, 0.4, 0.6, 0.4, 0.7, 0.4, 0.6, 0.4, 0.7, 0.4, 0.6, 0.4], probability: [1.0, 0.7, 0.9, 0.6, 1.0, 0.7, 0.9, 0.6, 1.0, 0.7, 0.9, 0.6, 1.0, 0.7, 0.9, 0.6], duration: new Array(16).fill(0.04), adsr: { attack: 0.002, decay: 0.02, sustain: 0.0, release: 0.02 } }
      ]
    }
  },
  {
    name: "Stellar Nursery",
    description: "Ethereal high-frequency tones with probabilistic sequencing and gentle sine/triangle blend.",
    settings: {
      isDroneEnabled: true,
      isDroneSequencerEnabled: true,
      droneMasterVolume: 0.4,
      droneFilterCutoff: 3200,
      droneFilterResonance: 1.8,
      droneSpread: 0.85,
      droneLfoFreq: 0.12,
      droneLfoAmount: 0.6,
      droneLfoTarget: 'pan',
      droneSaturation: 0.1,
      droneReverbSend: 0.75,
      droneSubAmount: 0.1,
      droneVoices: [
        { type: 'sine', freq: 523.25, volume: 0.35, detune: 4, pan: -0.7, adsr: { attack: 3.0, decay: 2.0, sustain: 0.7, release: 5.0 } },
        { type: 'triangle', freq: 659.25, volume: 0.25, detune: -4, pan: 0.7, adsr: { attack: 3.5, decay: 2.5, sustain: 0.6, release: 5.5 } },
        { type: 'sine', freq: 783.99, volume: 0.2, detune: 7, pan: -0.4, adsr: { attack: 4.0, decay: 3.0, sustain: 0.5, release: 6.0 } },
        { type: 'triangle', freq: 392.0, volume: 0.4, detune: -2, pan: 0.4, adsr: { attack: 2.5, decay: 1.5, sustain: 0.8, release: 4.5 } }
      ],
      droneSequencerBpm: 90,
      droneSequencerSwing: 0,
      droneSequencerLinkToMatrix: true,
      droneSequencerVoices: [
        { name: 'Sub', type: 'sine', steps: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false], pitch: [48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48], volume: [0.4, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2], probability: new Array(16).fill(0.8), duration: new Array(16).fill(1.0), adsr: { attack: 0.8, decay: 0.5, sustain: 0.6, release: 1.5 } },
        { name: 'Bass', type: 'triangle', steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], pitch: [60, 60, 64, 60, 60, 60, 67, 60, 60, 60, 64, 60, 60, 60, 72, 60], volume: [0.2, 0.2, 0.3, 0.2, 0.2, 0.2, 0.3, 0.2, 0.2, 0.2, 0.3, 0.2, 0.2, 0.2, 0.35, 0.2], probability: new Array(16).fill(0.7), duration: new Array(16).fill(0.8), adsr: { attack: 0.5, decay: 0.4, sustain: 0.5, release: 1.0 } },
        { name: 'Lead', type: 'sine', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [72, 76, 79, 84, 79, 76, 72, 67, 72, 76, 79, 84, 88, 84, 79, 76], volume: [0.2, 0.15, 0.2, 0.15, 0.2, 0.15, 0.2, 0.15, 0.2, 0.15, 0.2, 0.15, 0.25, 0.15, 0.2, 0.15], probability: [0.5, 0.3, 0.6, 0.4, 0.7, 0.3, 0.5, 0.2, 0.6, 0.4, 0.7, 0.5, 0.8, 0.3, 0.5, 0.4], duration: new Array(16).fill(1.0), adsr: { attack: 1.5, decay: 1.0, sustain: 0.8, release: 2.5 } },
        { name: 'Perc', type: 'auto', steps: [false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, true], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: [0.15, 0.1, 0.1, 0.2, 0.1, 0.1, 0.1, 0.2, 0.1, 0.1, 0.1, 0.2, 0.1, 0.1, 0.1, 0.25], probability: [0.3, 0.2, 0.2, 0.6, 0.3, 0.2, 0.2, 0.6, 0.3, 0.2, 0.2, 0.6, 0.3, 0.2, 0.2, 0.7], duration: new Array(16).fill(0.15), adsr: { attack: 0.1, decay: 0.2, sustain: 0.1, release: 0.3 } }
      ]
    }
  }
];

const DRONE_PRESETS = [
  {
    name: "Deep Space",
    description: "Low-frequency rumbles and ethereal high-frequency sparkles.",
    cutoff: 400,
    resonance: 4,
    spread: 0.8,
    voices: [
      { type: 'sine', freq: 55, volume: 0.6, detune: 2, pan: -0.4, adsr: { attack: 1.0, decay: 0.5, sustain: 0.8, release: 2.0 } },
      { type: 'sine', freq: 110, volume: 0.4, detune: -2, pan: 0.4, adsr: { attack: 1.5, decay: 0.8, sustain: 0.7, release: 2.5 } },
      { type: 'sine', freq: 164.81, volume: 0.3, detune: 0, pan: -0.2, adsr: { attack: 2.0, decay: 1.0, sustain: 0.6, release: 3.0 } },
      { type: 'sine', freq: 220, volume: 0.2, detune: 4, pan: 0.2, adsr: { attack: 2.5, decay: 1.2, sustain: 0.5, release: 3.5 } }
    ]
  },
  {
    name: "Industrial Hum",
    description: "Gritty, resonant textures with a mechanical feel.",
    cutoff: 1200,
    resonance: 8,
    spread: 0.3,
    voices: [
      { type: 'square', freq: 60, volume: 0.5, detune: 10, pan: -0.2, adsr: { attack: 0.1, decay: 0.2, sustain: 0.9, release: 0.5 } },
      { type: 'sawtooth', freq: 120, volume: 0.3, detune: -10, pan: 0.2, adsr: { attack: 0.2, decay: 0.3, sustain: 0.8, release: 0.6 } },
      { type: 'square', freq: 180, volume: 0.2, detune: 5, pan: -0.5, adsr: { attack: 0.3, decay: 0.4, sustain: 0.7, release: 0.7 } },
      { type: 'sawtooth', freq: 240, volume: 0.1, detune: -5, pan: 0.5, adsr: { attack: 0.4, decay: 0.5, sustain: 0.6, release: 0.8 } }
    ]
  },
  {
    name: "Angelic Choir",
    description: "Soft, harmonic sine waves creating a peaceful atmosphere.",
    cutoff: 2500,
    resonance: 1,
    spread: 0.9,
    voices: [
      { type: 'sine', freq: 220, volume: 0.4, detune: 1, pan: -0.6, adsr: { attack: 2.0, decay: 1.0, sustain: 1.0, release: 4.0 } },
      { type: 'sine', freq: 330, volume: 0.3, detune: -1, pan: 0.6, adsr: { attack: 2.5, decay: 1.5, sustain: 0.9, release: 4.5 } },
      { type: 'sine', freq: 440, volume: 0.2, detune: 2, pan: -0.3, adsr: { attack: 3.0, decay: 2.0, sustain: 0.8, release: 5.0 } },
      { type: 'sine', freq: 660, volume: 0.1, detune: -2, pan: 0.3, adsr: { attack: 3.5, decay: 2.5, sustain: 0.7, release: 5.5 } }
    ]
  },
  {
    name: "Vortex",
    description: "Swirling, detuned saw waves with wide stereo spread.",
    cutoff: 800,
    resonance: 12,
    spread: 1.0,
    voices: [
      { type: 'sawtooth', freq: 82.41, volume: 0.5, detune: 15, pan: -0.8, adsr: { attack: 0.5, decay: 0.5, sustain: 0.7, release: 1.0 } },
      { type: 'sawtooth', freq: 164.81, volume: 0.4, detune: -15, pan: 0.8, adsr: { attack: 0.6, decay: 0.6, sustain: 0.6, release: 1.2 } },
      { type: 'sawtooth', freq: 246.94, volume: 0.3, detune: 10, pan: -0.4, adsr: { attack: 0.7, decay: 0.7, sustain: 0.5, release: 1.4 } },
      { type: 'sawtooth', freq: 329.63, volume: 0.2, detune: -10, pan: 0.4, adsr: { attack: 0.8, decay: 0.8, sustain: 0.4, release: 1.6 } }
    ]
  },
  {
    name: "Subterranean",
    description: "Ultra-low frequency rumbles from deep below the earth.",
    cutoff: 200,
    resonance: 6,
    spread: 0.5,
    voices: [
      { type: 'triangle', freq: 30, volume: 0.7, detune: 3, pan: -0.3, adsr: { attack: 2.0, decay: 1.0, sustain: 0.9, release: 3.0 } },
      { type: 'sine', freq: 45, volume: 0.6, detune: -2, pan: 0.3, adsr: { attack: 2.5, decay: 1.5, sustain: 0.85, release: 3.5 } },
      { type: 'triangle', freq: 60, volume: 0.5, detune: 1, pan: -0.5, adsr: { attack: 3.0, decay: 2.0, sustain: 0.8, release: 4.0 } },
      { type: 'sine', freq: 80, volume: 0.4, detune: -1, pan: 0.5, adsr: { attack: 3.5, decay: 2.5, sustain: 0.75, release: 4.5 } }
    ]
  },
  {
    name: "Crystal Caves",
    description: "High-pitched shimmering tones with crystalline detune.",
    cutoff: 4000,
    resonance: 2,
    spread: 0.7,
    voices: [
      { type: 'triangle', freq: 880, volume: 0.3, detune: 20, pan: -0.6, adsr: { attack: 0.8, decay: 0.4, sustain: 0.6, release: 1.5 } },
      { type: 'triangle', freq: 1200, volume: 0.25, detune: -25, pan: 0.6, adsr: { attack: 1.0, decay: 0.5, sustain: 0.5, release: 1.8 } },
      { type: 'triangle', freq: 1600, volume: 0.2, detune: 30, pan: -0.3, adsr: { attack: 1.2, decay: 0.6, sustain: 0.4, release: 2.0 } },
      { type: 'triangle', freq: 2000, volume: 0.15, detune: -18, pan: 0.3, adsr: { attack: 1.5, decay: 0.8, sustain: 0.3, release: 2.5 } }
    ]
  },
  {
    name: "Dark Matter",
    description: "Thick, dissonant square waves creating an ominous wall of sound.",
    cutoff: 600,
    resonance: 10,
    spread: 0.4,
    voices: [
      { type: 'square', freq: 40, volume: 0.6, detune: 25, pan: -0.4, adsr: { attack: 0.3, decay: 0.2, sustain: 0.95, release: 0.8 } },
      { type: 'square', freq: 42, volume: 0.55, detune: -30, pan: 0.4, adsr: { attack: 0.35, decay: 0.25, sustain: 0.9, release: 0.9 } },
      { type: 'square', freq: 80, volume: 0.4, detune: 18, pan: -0.2, adsr: { attack: 0.4, decay: 0.3, sustain: 0.85, release: 1.0 } },
      { type: 'square', freq: 100, volume: 0.35, detune: -22, pan: 0.2, adsr: { attack: 0.5, decay: 0.35, sustain: 0.8, release: 1.2 } }
    ]
  },
  {
    name: "Solar Wind",
    description: "Gentle sawtooth currents sweeping across the stereo field.",
    cutoff: 1800,
    resonance: 3,
    spread: 1.0,
    voices: [
      { type: 'sawtooth', freq: 150, volume: 0.35, detune: 5, pan: -0.9, adsr: { attack: 1.5, decay: 0.8, sustain: 0.7, release: 2.5 } },
      { type: 'sawtooth', freq: 225, volume: 0.3, detune: -7, pan: 0.9, adsr: { attack: 2.0, decay: 1.0, sustain: 0.6, release: 3.0 } },
      { type: 'sawtooth', freq: 337, volume: 0.25, detune: 3, pan: -0.5, adsr: { attack: 2.5, decay: 1.2, sustain: 0.55, release: 3.5 } },
      { type: 'sawtooth', freq: 500, volume: 0.2, detune: -4, pan: 0.5, adsr: { attack: 3.0, decay: 1.5, sustain: 0.5, release: 4.0 } }
    ]
  },
  {
    name: "Tibetan Bowl",
    description: "Pure sine harmonics in perfect ratios evoking singing bowls.",
    cutoff: 3500,
    resonance: 1,
    spread: 0.6,
    voices: [
      { type: 'sine', freq: 130.81, volume: 0.5, detune: 0, pan: -0.4, adsr: { attack: 4.0, decay: 2.0, sustain: 0.9, release: 6.0 } },
      { type: 'sine', freq: 261.63, volume: 0.4, detune: 1, pan: 0.4, adsr: { attack: 4.5, decay: 2.5, sustain: 0.85, release: 6.5 } },
      { type: 'sine', freq: 392.44, volume: 0.3, detune: -1, pan: -0.2, adsr: { attack: 5.0, decay: 3.0, sustain: 0.8, release: 7.0 } },
      { type: 'sine', freq: 523.25, volume: 0.25, detune: 0, pan: 0.2, adsr: { attack: 5.5, decay: 3.5, sustain: 0.75, release: 7.5 } }
    ]
  },
  {
    name: "Machine Room",
    description: "Aggressive mechanical squares with tight panning and heavy resonance.",
    cutoff: 900,
    resonance: 14,
    spread: 0.2,
    voices: [
      { type: 'square', freq: 50, volume: 0.6, detune: 0, pan: -0.15, adsr: { attack: 0.02, decay: 0.05, sustain: 0.95, release: 0.1 } },
      { type: 'square', freq: 100, volume: 0.5, detune: 3, pan: 0.15, adsr: { attack: 0.02, decay: 0.05, sustain: 0.9, release: 0.1 } },
      { type: 'square', freq: 150, volume: 0.4, detune: -3, pan: -0.1, adsr: { attack: 0.03, decay: 0.06, sustain: 0.85, release: 0.12 } },
      { type: 'square', freq: 200, volume: 0.3, detune: 5, pan: 0.1, adsr: { attack: 0.03, decay: 0.06, sustain: 0.8, release: 0.12 } }
    ]
  },
  {
    name: "Northern Lights",
    description: "Slowly evolving sine and triangle blend with aurora-like movement.",
    cutoff: 2000,
    resonance: 2.5,
    spread: 0.9,
    voices: [
      { type: 'sine', freq: 180, volume: 0.4, detune: 25, pan: -0.7, adsr: { attack: 5.0, decay: 3.0, sustain: 0.7, release: 7.0 } },
      { type: 'triangle', freq: 270, volume: 0.35, detune: -30, pan: 0.7, adsr: { attack: 6.0, decay: 3.5, sustain: 0.65, release: 8.0 } },
      { type: 'sine', freq: 400, volume: 0.3, detune: 20, pan: -0.4, adsr: { attack: 7.0, decay: 4.0, sustain: 0.6, release: 9.0 } },
      { type: 'triangle', freq: 600, volume: 0.2, detune: -35, pan: 0.4, adsr: { attack: 8.0, decay: 5.0, sustain: 0.55, release: 10.0 } }
    ]
  },
  {
    name: "Tectonic Plates",
    description: "Very low frequency rumbles at the threshold of hearing.",
    cutoff: 100,
    resonance: 5,
    spread: 0.3,
    voices: [
      { type: 'sine', freq: 20, volume: 0.8, detune: 2, pan: -0.2, adsr: { attack: 4.0, decay: 2.0, sustain: 0.95, release: 5.0 } },
      { type: 'triangle', freq: 30, volume: 0.7, detune: -3, pan: 0.2, adsr: { attack: 4.5, decay: 2.5, sustain: 0.9, release: 5.5 } },
      { type: 'sine', freq: 40, volume: 0.6, detune: 1, pan: -0.3, adsr: { attack: 5.0, decay: 3.0, sustain: 0.85, release: 6.0 } },
      { type: 'triangle', freq: 55, volume: 0.5, detune: -2, pan: 0.3, adsr: { attack: 5.5, decay: 3.5, sustain: 0.8, release: 6.5 } }
    ]
  }
];

const SEQUENCER_PRESETS = [
  {
    name: "Minimal Pulse",
    description: "A clean, driving 4/4 rhythm with a simple bassline.",
    bpm: 124,
    voices: [
      { name: 'Kick', type: 'sine', steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], pitch: new Array(16).fill(36), volume: new Array(16).fill(0.8), probability: new Array(16).fill(1.0), duration: new Array(16).fill(0.1), adsr: { attack: 0.01, decay: 0.1, sustain: 0.0, release: 0.1 } },
      { name: 'Bass', type: 'triangle', steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], pitch: [36, 36, 39, 36, 36, 36, 41, 36, 36, 36, 39, 36, 36, 36, 43, 36], volume: new Array(16).fill(0.6), probability: new Array(16).fill(0.9), duration: new Array(16).fill(0.2), adsr: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.2 } },
      { name: 'Hats', type: 'auto', steps: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true], pitch: new Array(16).fill(72), volume: new Array(16).fill(0.3), probability: new Array(16).fill(0.7), duration: new Array(16).fill(0.05), adsr: { attack: 0.001, decay: 0.02, sustain: 0.0, release: 0.02 } },
      { name: 'Lead', type: 'sine', steps: [false, false, false, false, false, false, false, false, true, false, true, false, false, true, false, false], pitch: [60, 63, 65, 67, 70, 72, 75, 77, 60, 63, 65, 67, 70, 72, 75, 77], volume: new Array(16).fill(0.4), probability: new Array(16).fill(0.6), duration: new Array(16).fill(0.4), adsr: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 0.4 } }
    ]
  },
  {
    name: "Dreamy Arp",
    description: "Soft, cascading melodies with long release times.",
    bpm: 90,
    voices: [
      { name: 'Low', type: 'sine', steps: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false], pitch: new Array(16).fill(48), volume: new Array(16).fill(0.5), probability: new Array(16).fill(1.0), duration: new Array(16).fill(0.8), adsr: { attack: 0.5, decay: 0.5, sustain: 0.5, release: 1.0 } },
      { name: 'Mid', type: 'sine', steps: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false], pitch: [60, 64, 67, 72, 60, 64, 67, 72, 60, 64, 67, 72, 60, 64, 67, 72], volume: new Array(16).fill(0.3), probability: new Array(16).fill(0.8), duration: new Array(16).fill(0.4), adsr: { attack: 0.2, decay: 0.4, sustain: 0.6, release: 0.8 } },
      { name: 'High', type: 'sine', steps: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true], pitch: [72, 76, 79, 84, 72, 76, 79, 84, 72, 76, 79, 84, 72, 76, 79, 84], volume: new Array(16).fill(0.2), probability: new Array(16).fill(0.6), duration: new Array(16).fill(0.3), adsr: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 1.2 } },
      { name: 'Perc', type: 'auto', steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], pitch: new Array(16).fill(36), volume: new Array(16).fill(0.2), probability: new Array(16).fill(0.4), duration: new Array(16).fill(0.1), adsr: { attack: 0.05, decay: 0.2, sustain: 0.1, release: 0.5 } }
    ]
  },
  {
    name: "Glitch Hop",
    description: "Complex, syncopated rhythms with varying probabilities.",
    bpm: 110,
    voices: [
      { name: 'Kick', type: 'sine', steps: [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, false], pitch: new Array(16).fill(36), volume: new Array(16).fill(0.7), probability: new Array(16).fill(1.0), duration: new Array(16).fill(0.1), adsr: { attack: 0.01, decay: 0.1, sustain: 0.0, release: 0.1 } },
      { name: 'Snare', type: 'auto', steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], pitch: new Array(16).fill(48), volume: new Array(16).fill(0.6), probability: new Array(16).fill(0.9), duration: new Array(16).fill(0.05), adsr: { attack: 0.001, decay: 0.05, sustain: 0.0, release: 0.05 } },
      { name: 'Glitch', type: 'square', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [48, 52, 55, 60, 64, 67, 72, 76, 48, 52, 55, 60, 64, 67, 72, 76], volume: new Array(16).fill(0.3), probability: [0.2, 0.4, 0.1, 0.5, 0.3, 0.6, 0.2, 0.4, 0.1, 0.5, 0.3, 0.6, 0.2, 0.4, 0.1, 0.5], duration: new Array(16).fill(0.05), adsr: { attack: 0.001, decay: 0.02, sustain: 0.1, release: 0.02 } },
      { name: 'Lead', type: 'sawtooth', steps: [false, true, false, false, true, false, true, true, false, false, true, false, false, true, false, true], pitch: [60, 62, 64, 65, 67, 69, 71, 72, 60, 62, 64, 65, 67, 69, 71, 72], volume: new Array(16).fill(0.4), probability: new Array(16).fill(0.7), duration: new Array(16).fill(0.2), adsr: { attack: 0.05, decay: 0.1, sustain: 0.4, release: 0.2 } }
    ]
  },
  {
    name: "Solar Winds",
    description: "Bright, shimmering textures that evolve over time.",
    bpm: 75,
    voices: [
      { name: 'Drone', type: 'sine', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: new Array(16).fill(60), volume: new Array(16).fill(0.2), probability: new Array(16).fill(1.0), duration: new Array(16).fill(1.0), adsr: { attack: 1.0, decay: 1.0, sustain: 1.0, release: 2.0 } },
      { name: 'Sparkle', type: 'sine', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [72, 79, 84, 91, 96, 103, 108, 115, 72, 79, 84, 91, 96, 103, 108, 115], volume: new Array(16).fill(0.15), probability: new Array(16).fill(0.5), duration: new Array(16).fill(0.5), adsr: { attack: 0.5, decay: 0.5, sustain: 0.5, release: 1.5 } },
      { name: 'Bass', type: 'sine', steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], pitch: new Array(16).fill(36), volume: new Array(16).fill(0.4), probability: new Array(16).fill(0.9), duration: new Array(16).fill(0.8), adsr: { attack: 0.2, decay: 0.4, sustain: 0.6, release: 0.8 } },
      { name: 'Effect', type: 'auto', steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], pitch: new Array(16).fill(60), volume: new Array(16).fill(0.1), probability: new Array(16).fill(0.3), duration: new Array(16).fill(0.2), adsr: { attack: 0.1, decay: 0.8, sustain: 0.1, release: 0.8 } }
    ]
  },
  {
    name: "Acid Rain",
    description: "Squelchy, resonant basslines with high-energy percussion.",
    bpm: 132,
    voices: [
      { name: 'Kick', type: 'sine', steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: new Array(16).fill(0.9), probability: new Array(16).fill(1.0), duration: new Array(16).fill(0.1), adsr: { attack: 0.005, decay: 0.15, sustain: 0.0, release: 0.1 } },
      { name: '303', type: 'sawtooth', steps: [true, true, false, true, true, false, true, true, false, true, true, false, true, true, false, true], pitch: [36, 48, 36, 39, 48, 36, 41, 48, 36, 43, 48, 36, 39, 48, 36, 41], volume: new Array(16).fill(0.6), probability: new Array(16).fill(1.0), duration: new Array(16).fill(0.2), adsr: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.1 } },
      { name: 'Hats', type: 'auto', steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], pitch: new Array(16).fill(72), volume: new Array(16).fill(0.4), probability: new Array(16).fill(0.8), duration: new Array(16).fill(0.05), adsr: { attack: 0.001, decay: 0.05, sustain: 0.0, release: 0.05 } },
      { name: 'Lead', type: 'square', steps: [false, false, false, false, true, true, true, true, false, false, false, false, true, true, true, true], pitch: [60, 63, 65, 67, 72, 75, 77, 84, 60, 63, 65, 67, 72, 75, 77, 84], volume: new Array(16).fill(0.3), probability: new Array(16).fill(0.7), duration: new Array(16).fill(0.1), adsr: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.2 } }
    ]
  },
  {
    name: "Cyber Jazz",
    description: "Complex chords and syncopated rhythms with a futuristic feel.",
    bpm: 105,
    voices: [
      { name: 'Kick', type: 'sine', steps: [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: new Array(16).fill(0.7), probability: new Array(16).fill(1.0), duration: new Array(16).fill(0.1), adsr: { attack: 0.01, decay: 0.1, sustain: 0.0, release: 0.1 } },
      { name: 'Keys', type: 'sine', steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], pitch: [60, 64, 67, 71, 60, 64, 67, 71, 60, 64, 67, 71, 60, 64, 67, 71], volume: new Array(16).fill(0.4), probability: new Array(16).fill(0.9), duration: new Array(16).fill(0.6), adsr: { attack: 0.2, decay: 0.4, sustain: 0.6, release: 0.8 } },
      { name: 'Bass', type: 'sine', steps: [false, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false], pitch: [36, 41, 43, 48, 36, 41, 43, 48, 36, 41, 43, 48, 36, 41, 43, 48], volume: new Array(16).fill(0.5), probability: new Array(16).fill(0.8), duration: new Array(16).fill(0.3), adsr: { attack: 0.1, decay: 0.2, sustain: 0.4, release: 0.3 } },
      { name: 'Hats', type: 'auto', steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: new Array(16).fill(72), volume: [0.1, 0.2, 0.1, 0.3, 0.1, 0.2, 0.1, 0.3, 0.1, 0.2, 0.1, 0.3, 0.1, 0.2, 0.1, 0.3], probability: new Array(16).fill(0.9), duration: new Array(16).fill(0.02), adsr: { attack: 0.001, decay: 0.01, sustain: 0.0, release: 0.01 } }
    ]
  },
  {
    name: "Ambient Drift",
    description: "Slow, evolving melodic textures.",
    bpm: 60,
    voices: [
      { name: "Pad 1", type: "sine", steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], pitch: [48, 52, 55, 60, 48, 52, 55, 60, 48, 52, 55, 60, 48, 52, 55, 60], volume: new Array(16).fill(0.5), probability: new Array(16).fill(1.0), duration: new Array(16).fill(1.0), adsr: { attack: 2.0, decay: 1.0, sustain: 0.8, release: 3.0 } },
      { name: "Pad 2", type: "sine", steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], pitch: [60, 64, 67, 72, 60, 64, 67, 72, 60, 64, 67, 72, 60, 64, 67, 72], volume: new Array(16).fill(0.4), probability: new Array(16).fill(0.8), duration: new Array(16).fill(1.0), adsr: { attack: 2.5, decay: 1.5, sustain: 0.7, release: 3.5 } },
      { name: "Pluck", type: "triangle", steps: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true], pitch: [72, 76, 79, 84, 72, 76, 79, 84, 72, 76, 79, 84, 72, 76, 79, 84], volume: new Array(16).fill(0.2), probability: new Array(16).fill(0.6), duration: new Array(16).fill(0.3), adsr: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.5 } },
      { name: "Bass", type: "sine", steps: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36], volume: new Array(16).fill(0.6), probability: new Array(16).fill(1.0), duration: new Array(16).fill(1.0), adsr: { attack: 0.5, decay: 0.5, sustain: 0.5, release: 1.0 } }
    ]
  },
  {
    name: "Techno Pulse",
    description: "Driving 4/4 beat with industrial accents.",
    bpm: 128,
    voices: [
      { name: "Kick", type: "sine", steps: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], pitch: new Array(16).fill(36), volume: new Array(16).fill(0.9), probability: new Array(16).fill(1.0), duration: new Array(16).fill(0.1), adsr: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 } },
      { name: "Clap", type: "auto", steps: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], pitch: new Array(16).fill(60), volume: new Array(16).fill(0.7), probability: new Array(16).fill(0.8), duration: new Array(16).fill(0.05), adsr: { attack: 0.01, decay: 0.05, sustain: 0, release: 0.05 } },
      { name: "Hat", type: "auto", steps: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], pitch: new Array(16).fill(84), volume: new Array(16).fill(0.5), probability: new Array(16).fill(0.9), duration: new Array(16).fill(0.02), adsr: { attack: 0.01, decay: 0.02, sustain: 0, release: 0.02 } },
      { name: "Synth", type: "sawtooth", steps: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], pitch: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36].map(p => p + (Math.random() > 0.5 ? 12 : 0)), volume: new Array(16).fill(0.3), probability: new Array(16).fill(0.7), duration: new Array(16).fill(0.1), adsr: { attack: 0.01, decay: 0.05, sustain: 0.2, release: 0.1 } }
    ]
  }
];

interface PixelData {
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
  brightness: number;
}

// --- Helper Functions ---

const _distortionCurveCache = new Map<string, Float32Array>();
// Warm tanh-based distortion curve — naturally bounded to [-1, 1], no clipping
function makeDistortionCurve(amount: number) {
  const k = typeof amount === 'number' ? amount : 2;
  const key = k.toFixed(2);
  if (_distortionCurveCache.has(key)) return _distortionCurveCache.get(key)!;
  const n_samples = 8192;
  const curve = new Float32Array(n_samples);
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = Math.tanh(k * x);
  }
  _distortionCurveCache.set(key, curve);
  return curve;
}

// Generate a rich reverb impulse response with frequency-dependent decay
function generateReverbIR(ctx: AudioContext, duration: number, decay: number, brightness: number = 0.5) {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const impulse = ctx.createBuffer(2, length, sampleRate);
  // Pre-compute per-sample decay with high-frequency damping
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      // Exponential decay envelope
      const env = Math.pow(1 - t, decay);
      // High-frequency damping: reduce brightness over time
      const noise = Math.random() * 2 - 1;
      // Simple lowpass: blend current noise with previous sample
      const damping = 0.3 + (1 - brightness) * 0.6; // 0.3 (bright) to 0.9 (dark)
      const dampedNoise = i > 0 ? noise * (1 - damping * t) + data[i - 1] * damping * t : noise;
      data[i] = dampedNoise * env;
    }
  }
  return impulse;
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, l };
}

function quantizeFrequency(freq: number, adjustedScale: number[]) {
  // Convert frequency to MIDI note number (float)
  const midiNote = 69 + 12 * Math.log2(freq / 440);

  // Find the nearest note in the scale
  const octave = Math.floor(midiNote / 12);
  const noteInOctave = ((midiNote % 12) + 12) % 12;

  // Find closest note in adjusted scale
  let closestNote = adjustedScale[0];
  let minDiff = Math.abs(noteInOctave - adjustedScale[0]);
  
  for (const n of adjustedScale) {
    const diff = Math.abs(noteInOctave - n);
    if (diff < minDiff) {
      minDiff = diff;
      closestNote = n;
    }
  }
  
  // Handle wrap-around (nearest note might be in next/previous octave)
  if (Math.abs(noteInOctave - (adjustedScale[0] + 12)) < minDiff) {
    closestNote = adjustedScale[0] + 12;
  }
  
  const quantizedMidi = octave * 12 + closestNote;
  
  // Convert back to frequency
  return 440 * Math.pow(2, (quantizedMidi - 69) / 12);
}

// --- Components ---

export default function App() {
  // State
  const [image, setImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [scanTime, setScanTime] = useState(0);
  const scanTimeRef = useRef(0);
  const phaseRef = useRef<HTMLSpanElement>(null);
  const [volume, setVolume] = useState(0.5);
  const volumeRef = useRef(0.5);
  const [synthMatrixVolume, setSynthMatrixVolume] = useState(0.8);
  const [showSettings, setShowSettings] = useState(false);
  const [showDroneModule, setShowDroneModule] = useState(false);
  const [showSequencerModule, setShowSequencerModule] = useState(false);
  const [showMixer, setShowMixer] = useState(false);
  const [masterReverbSend, setMasterReverbSend] = useState(0);
  const [masterCompression, setMasterCompression] = useState(0);
  const [masterSaturation, setMasterSaturation] = useState(0);
  const [masterFilterCutoff, setMasterFilterCutoff] = useState(1); // 0-1 normalized, 1 = fully open
  const [showVisualsModule, setShowVisualsModule] = useState(false);
  const [isPerformanceMode, setIsPerformanceMode] = useState(() => {
    // Auto-detect weak devices on mount
    if (typeof navigator !== 'undefined') {
      const cores = navigator.hardwareConcurrency || 2;
      const memory = (navigator as any).deviceMemory || 4;
      const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
      if (cores <= 2 || memory <= 2 || isMobile) return true;
    }
    return false;
  });
  const [isVisualsEnabled, setIsVisualsEnabled] = useState(true);
  const perfFrameCountRef = useRef(0);
  
  const closeAllPanels = () => {
    setShowMixer(false);
    setShowSettings(false);
    setShowDroneModule(false);
    setShowSequencerModule(false);
    setShowVisualsModule(false);
  };

  // Helper for performance mode panel positioning
  const getPerfOffset = (moduleIndex: number) => {
    if (!isPerformanceMode) return {};
    // Consistent spatial location: each module has its own fixed slot
    // 0: Mixer, 1: Matrix, 2: Drone, 3: Sequencer, 4: Visuals
    return { 
      right: `calc(1rem + ${moduleIndex * 270}px)`, 
      width: '260px',
      top: '72px' // Position below the master control bar
    };
  };
  const [isSynthMatrixEnabled, setIsSynthMatrixEnabled] = useState(true);
  const [showManual, setShowManual] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGeneratingArt, setIsGeneratingArt] = useState(false);
  
  // Visual Settings State
  const [visualColorMode, setVisualColorMode] = useState<'preset' | 'auto'>('preset');
  const [visualPalette, setVisualPalette] = useState<string[]>(['#ff3b30', '#ffffff', '#007aff']);
  const [visualPaletteName, setVisualPaletteName] = useState<string>('');
  const [visualBackgroundFilter, setVisualBackgroundFilter] = useState<'none' | 'lens-flare' | 'trippy' | 'subtle'>('none');
  const [autoPalette, setAutoPalette] = useState<string[]>([]);
  const autoPaletteFrameCountRef = useRef(0);

  // Helper for background filters
  const getBackgroundFilter = () => {
    switch (visualBackgroundFilter) {
      case 'lens-flare':
        return 'brightness(0.9) contrast(1.1) saturate(1.2)';
      case 'trippy':
        return 'hue-rotate(45deg) saturate(2) brightness(0.8)';
      case 'subtle-blur':
        return 'blur(2px) brightness(0.7)';
      case 'high-contrast':
        return 'contrast(1.5) brightness(0.6) saturate(0.5)';
      case 'dreamy':
        return 'brightness(0.8) saturate(1.2) sepia(0.2) blur(1px)';
      default:
        return 'brightness(0.7) grayscale(0)';
    }
  };

  const [enabledVoices, setEnabledVoices] = useState<boolean[]>(new Array(SAMPLE_POINTS).fill(true));
  const [error, setError] = useState<string | null>(null);
  const [baseFreq, setBaseFreq] = useState(110);
  const [freqRange, setFreqRange] = useState(880);
  const [freqMod, setFreqMod] = useState(200);
  const [ampMod, setAmpMod] = useState(1.0);
  const [cutoffMod, setCutoffMod] = useState(4000);
  const [qMod, setQMod] = useState(15);
  const [scanSpeed, setScanSpeed] = useState(1);
  const [voiceWaveShapes, setVoiceWaveShapes] = useState<WaveOption[]>(
    new Array(SAMPLE_POINTS).fill('auto')
  );
  const [formulaX, setFormulaX] = useState(SCAN_PRESETS[0].formulaX);
  const [formulaY, setFormulaY] = useState(SCAN_PRESETS[0].formulaY);
  const [activePreset, setActivePreset] = useState(0);
  const [scanCenterX, setScanCenterX] = useState(0.5);
  const [scanCenterY, setScanCenterY] = useState(0.5);
  const [scanScale, setScanScale] = useState(1.0);
  const [scanPointSize, setScanPointSize] = useState(1);
  const [triggerThreshold, setTriggerThreshold] = useState(0.1);
  const [adsr, setAdsr] = useState<{attack: number, decay: number, sustain: number, release: number}[]>(
    new Array(SAMPLE_POINTS).fill(null).map(() => ({
      attack: 0.1,
      decay: 0.2,
      sustain: 0.5,
      release: 0.8
    }))
  );

  const initialMapping: Record<SoundParam, ImageTrait> = {
    frequency: 'hue',
    amplitude: 'brightness',
    cutoff: 'lightness',
    q: 'saturation',
    pan: 'x',
    attack: 'brightness',
    decay: 'saturation',
    sustain: 'lightness',
    release: 'hue'
  };

  const [voiceMappings, setVoiceMappings] = useState<Record<SoundParam, ImageTrait>[]>(
    new Array(SAMPLE_POINTS).fill(null).map(() => ({ ...initialMapping }))
  );
  
  const [selectedVoice, setSelectedVoice] = useState<number>(0);
  const [activePatch, setActivePatch] = useState<number | null>(null);
  const [activeDronePatch, setActiveDronePatch] = useState<number | null>(null);

  // Drone & Sequence Module State
  const [isDroneEnabled, setIsDroneEnabled] = useState(false);
  const [droneMasterVolume, setDroneMasterVolume] = useState(0.5);
  const [droneFilterCutoff, setDroneFilterCutoff] = useState(2000);
  const [droneFilterResonance, setDroneFilterResonance] = useState(1);
  const [droneSpread, setDroneSpread] = useState(0.1);
  const [droneLfoFreq, setDroneLfoFreq] = useState(0.5);
  const [droneLfoAmount, setDroneLfoAmount] = useState(0);
  const [droneLfoTarget, setDroneLfoTarget] = useState<'cutoff' | 'pan' | 'volume' | 'spread' | 'resonance'>('cutoff');
  const [droneSaturation, setDroneSaturation] = useState(0);
  const [droneReverbSend, setDroneReverbSend] = useState(0);
  const [droneSubAmount, setDroneSubAmount] = useState(0);
  const [droneVoices, setDroneVoices] = useState<{ type: WaveOption, freq: number, volume: number, detune: number, pan: number, adsr: { attack: number, decay: number, sustain: number, release: number } }[]>(
    new Array(4).fill(null).map((_, i) => ({
      type: 'sine',
      freq: 55 * (i + 1),
      volume: 0.5,
      detune: 0,
      pan: (i % 2 === 0 ? -0.5 : 0.5),
      adsr: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 1.0 }
    }))
  );

  const [isDroneSequencerEnabled, setIsDroneSequencerEnabled] = useState(false);
  const [droneSequencerBpm, setDroneSequencerBpm] = useState(120);
  const [droneSequencerSwing, setDroneSequencerSwing] = useState(0);
  const [droneSequencerLinkToMatrix, setDroneSequencerLinkToMatrix] = useState(false);
  const [droneSequencerVoices, setDroneSequencerVoices] = useState<{ name: string, type: WaveOption | 'auto', steps: boolean[], probability: number[], duration: number[], pitch: number[], volume: number[], adsr: { attack: number, decay: number, sustain: number, release: number } }[]>(
    ['Lead', 'Bass', 'Pad', 'Perc'].map((name, i) => ({
      name,
      type: i === 3 ? 'auto' : 'sine',
      steps: new Array(16).fill(false),
      probability: new Array(16).fill(1.0),
      duration: new Array(16).fill(0.5),
      pitch: new Array(16).fill(60), // MIDI note
      volume: new Array(16).fill(0.5),
      adsr: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2 }
    }))
  );
  const droneSequencerVoicesRefState = useRef(droneSequencerVoices);
  useEffect(() => {
    droneSequencerVoicesRefState.current = droneSequencerVoices;
  }, [droneSequencerVoices]);

  const [droneSequencerMasterVolumes, setDroneSequencerMasterVolumes] = useState<number[]>([0.8, 0.8, 0.8, 0.8]);
  const droneSequencerMasterVolumesRef = useRef(droneSequencerMasterVolumes);
  useEffect(() => {
    droneSequencerMasterVolumesRef.current = droneSequencerMasterVolumes;
  }, [droneSequencerMasterVolumes]);

  const [isSequencerGenerative, setIsSequencerGenerative] = useState(false);
  const [sequencerMutationRate, setSequencerMutationRate] = useState(0.05);
  const [currentDroneStep, setCurrentDroneStep] = useState(0);
  const [selectedDroneSequencerVoice, setSelectedDroneSequencerVoice] = useState(0);
  const [selectedDroneSequencerStep, setSelectedDroneSequencerStep] = useState(0);
  const [isDroneEvolving, setIsDroneEvolving] = useState(false);
  const [droneEvolutionAmount, setDroneEvolutionAmount] = useState(0.2);
  const [droneSequencerSyncToGlobal, setDroneSequencerSyncToGlobal] = useState(false);
  const [isScanSpeedSynced, setIsScanSpeedSynced] = useState(false);

  const [droneSequencerOverallVolume, setDroneSequencerOverallVolume] = useState(0.8);
  const droneSequencerOverallVolumeRef = useRef(droneSequencerOverallVolume);
  useEffect(() => {
    droneSequencerOverallVolumeRef.current = droneSequencerOverallVolume;
    if (droneSeqGainRef.current && audioContextRef.current) {
      droneSeqGainRef.current.gain.setTargetAtTime(droneSequencerOverallVolume, audioContextRef.current.currentTime, 0.05);
    }
  }, [droneSequencerOverallVolume]);
  const [isVisualsEvolving, setIsVisualsEvolving] = useState(false);
  const [visualsEvolutionAmount, setVisualsEvolutionAmount] = useState(0.3);
  const [isEvolutionLinked, setIsEvolutionLinked] = useState(false);

  const autoMix = () => {
    setVolume(0.8);
    setSynthMatrixVolume(0.7);
    setDroneMasterVolume(0.6);
    setDroneSequencerMasterVolumes([0.75, 0.75, 0.75, 0.75]);
    setDroneVoices(prev => prev.map(v => ({ ...v, volume: 0.5 })));
  };

  // Sequencer State
  const [isSequencerEnabled, setIsSequencerEnabled] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [scaleName, setScaleName] = useState<keyof typeof SCALES>('Pentatonic Major');
  const [rootNoteIndex, setRootNoteIndex] = useState(0); // 0 = C
  const adjustedScale = useMemo(
    () => SCALES[scaleName].map(n => (n + rootNoteIndex) % 12).sort((a, b) => a - b),
    [scaleName, rootNoteIndex]
  );
  const [quantizeAmount, setQuantizeAmount] = useState(1.0);
  const [sequenceLength, setSequenceLength] = useState(32);
  const [mutationAmount, setMutationAmount] = useState(0.2);
  const [isEvolving, setIsEvolving] = useState(false);
  const [mouseInfluence, setMouseInfluence] = useState(0.5);

  // Chroma Console Effects State
  const [characterEffect, setCharacterEffect] = useState<CharacterEffect>('none');
  const [movementEffect, setMovementEffect] = useState<MovementEffect>('none');
  const [diffusionEffect, setDiffusionEffect] = useState<DiffusionEffect>('none');
  const [textureEffect, setTextureEffect] = useState<TextureEffect>('none');

  const [characterAmount, setCharacterAmount] = useState(0.5);
  const [movementAmount, setMovementAmount] = useState(0.5);
  const [diffusionAmount, setDiffusionAmount] = useState(0.5);
  const [textureAmount, setTextureAmount] = useState(0.5);

  // Drone Effects State
  const [droneCharacterEffect, setDroneCharacterEffect] = useState<CharacterEffect>('none');
  const [droneMovementEffect, setDroneMovementEffect] = useState<MovementEffect>('none');
  const [droneDiffusionEffect, setDroneDiffusionEffect] = useState<DiffusionEffect>('none');
  const [droneTextureEffect, setDroneTextureEffect] = useState<TextureEffect>('none');
  const [droneCharacterAmount, setDroneCharacterAmount] = useState(0.5);
  const [droneMovementAmount, setDroneMovementAmount] = useState(0.5);
  const [droneDiffusionAmount, setDroneDiffusionAmount] = useState(0.5);
  const [droneTextureAmount, setDroneTextureAmount] = useState(0.5);

  // Sequencer Effects State
  const [seqCharacterEffect, setSeqCharacterEffect] = useState<CharacterEffect>('none');
  const [seqMovementEffect, setSeqMovementEffect] = useState<MovementEffect>('none');
  const [seqDiffusionEffect, setSeqDiffusionEffect] = useState<DiffusionEffect>('none');
  const [seqTextureEffect, setSeqTextureEffect] = useState<TextureEffect>('none');
  const [seqCharacterAmount, setSeqCharacterAmount] = useState(0.5);
  const [seqMovementAmount, setSeqMovementAmount] = useState(0.5);
  const [seqDiffusionAmount, setSeqDiffusionAmount] = useState(0.5);
  const [seqTextureAmount, setSeqTextureAmount] = useState(0.5);

  const resetToDefaults = () => {
    setBaseFreq(110);
    setFreqRange(880);
    setFreqMod(200);
    setAmpMod(1.0);
    setCutoffMod(4000);
    setQMod(15);
    setScanSpeed(1);
    setVoiceWaveShapes(new Array(SAMPLE_POINTS).fill('auto'));
    setFormulaX(SCAN_PRESETS[0].formulaX);
    setFormulaY(SCAN_PRESETS[0].formulaY);
    setActivePreset(0);
    setScanCenterX(0.5);
    setScanCenterY(0.5);
    setScanScale(1.0);
    setTriggerThreshold(0.1);
    setAdsr(new Array(SAMPLE_POINTS).fill(null).map(() => ({
      attack: 0.1,
      decay: 0.2,
      sustain: 0.5,
      release: 0.8
    })));
    setEnabledVoices(new Array(SAMPLE_POINTS).fill(true));
    setVoiceMappings(new Array(SAMPLE_POINTS).fill(null).map(() => ({ ...initialMapping })));
    setCharacterEffect('none');
    setMovementEffect('none');
    setDiffusionEffect('none');
    setTextureEffect('none');
    setCharacterAmount(0.5);
    setMovementAmount(0.5);
    setDiffusionAmount(0.5);
    setTextureAmount(0.5);
  };

  const [videoDuration, setVideoDuration] = useState(0);
  const scanPointsRef = useRef<{x: number, y: number}[]>([]);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoRange, setVideoRange] = useState<[number, number]>([0, 100]); // percentage
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'audio' | 'video' | 'both'>('video');
  const [audioFormat, setAudioFormat] = useState<'wav' | 'mp3' | 'flac'>('flac');
  const [videoFormat, setVideoFormat] = useState<'webm' | 'mp4'>('webm');
  const [recordingQuality, setRecordingQuality] = useState<'lossless' | 'high' | 'medium' | 'low'>('high');
  const [showRecordingSettings, setShowRecordingSettings] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordingResolution, setRecordingResolution] = useState<'720p' | '1080p' | '1440p' | '4k' | '1080v' | '1440v'>('1080p');
  const [recordingCapture, setRecordingCapture] = useState<'visualization' | 'full'>('visualization');
  const [recordingElapsed, setRecordingElapsed] = useState(0);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isVideoAudioRouted, setIsVideoAudioRouted] = useState(false);

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const oscillatorsRef = useRef<{ osc: OscillatorNode; noiseSource?: AudioBufferSourceNode; gain: GainNode; filter: BiquadFilterNode; panner: StereoPannerNode }[]>([]);
  const noiseBufferRef = useRef<AudioBuffer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const samplingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const samplingCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const cachedImageDataRef = useRef<Uint8ClampedArray | null>(null);
  const cachedImageKeyRef = useRef<string | null>(null);
  const voiceWaveStateRef = useRef<string[]>(new Array(SAMPLE_POINTS).fill(''));
  const visualsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const voiceStatesRef = useRef<boolean[]>(new Array(SAMPLE_POINTS).fill(false));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioStreamDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const masterBusReverbRef = useRef<ConvolverNode | null>(null);
  const masterBusReverbWetRef = useRef<GainNode | null>(null);
  const masterBusReverbDryRef = useRef<GainNode | null>(null);
  const masterBusCompRef = useRef<DynamicsCompressorNode | null>(null);
  const masterBusSatRef = useRef<WaveShaperNode | null>(null);
  const masterBusSatGainRef = useRef<GainNode | null>(null);
  const masterBusFilterRef = useRef<BiquadFilterNode | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appContainerRef = useRef<HTMLDivElement | null>(null);
  const fullCaptureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const finalGainRef = useRef<GainNode | null>(null);
  const synthMatrixGainRef = useRef<GainNode | null>(null);
  const videoAudioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const periodicWavesRef = useRef<Record<string, PeriodicWave>>({});
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const mousePosRef = useRef<{x: number, y: number} | null>(null);
  const mutationOffsetsRef = useRef<{x: number, y: number}[]>(new Array(SAMPLE_POINTS).fill({x: 0, y: 0}));
  const lastFrameTimeRef = useRef<number>(performance.now());
  const globalClockRef = useRef<number>(0);
  const droneEvolutionTimeRef = useRef<number>(0);
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const applyPatch = useCallback((patchIdx: number) => {
    const patch = PATCHES[patchIdx];
    const s = patch.settings;
    setBaseFreq(s.baseFreq);
    setFreqRange(s.freqRange);
    setFreqMod(s.freqMod);
    setAmpMod(s.ampMod);
    setCutoffMod(s.cutoffMod);
    setQMod(s.qMod);
    setScanSpeed(s.scanSpeed);
    setScanScale(s.scanScale);
    setScanCenterX(s.scanCenterX);
    setScanCenterY(s.scanCenterY);
    setFormulaX(s.formulaX);
    setFormulaY(s.formulaY);
    setActivePreset(s.activePreset);
    setEnabledVoices(s.enabledVoices);
    setIsSequencerEnabled(s.isSequencerEnabled);
    setBpm(s.bpm);
    setScaleName(s.scaleName);
    setRootNoteIndex(s.rootNoteIndex);
    setIsEvolving(s.isEvolving);
    setMutationAmount(s.mutationAmount);
    setSequenceLength(s.sequenceLength || 32);
    setQuantizeAmount(s.quantizeAmount || 1.0);
    setCharacterEffect(s.characterEffect);
    setMovementEffect(s.movementEffect);
    setDiffusionEffect(s.diffusionEffect);
    setTextureEffect(s.textureEffect);
    setCharacterAmount(s.characterAmount);
    setMovementAmount(s.movementAmount);
    setDiffusionAmount(s.diffusionAmount);
    setTextureAmount(s.textureAmount);
    if (s.adsr) {
      setAdsr(new Array(SAMPLE_POINTS).fill(null).map(() => ({ ...s.adsr })));
    }
    setVoiceMappings(new Array(SAMPLE_POINTS).fill(null).map(() => ({ ...initialMapping })));
    setActivePatch(patchIdx);
  }, [setBaseFreq, setFreqRange, setFreqMod, setAmpMod, setCutoffMod, setQMod, setScanSpeed, setScanScale, setScanCenterX, setScanCenterY, setFormulaX, setFormulaY, setActivePreset, setEnabledVoices, setIsSequencerEnabled, setBpm, setScaleName, setRootNoteIndex, setIsEvolving, setMutationAmount, setSequenceLength, setQuantizeAmount, setCharacterEffect, setMovementEffect, setDiffusionEffect, setTextureEffect, setCharacterAmount, setMovementAmount, setDiffusionAmount, setTextureAmount, setAdsr, setVoiceMappings, setActivePatch]);

  const applyDronePatch = (patchIdx: number) => {
    const patch = DRONE_PATCHES[patchIdx];
    const s = patch.settings;
    setIsDroneEnabled(s.isDroneEnabled);
    setIsDroneSequencerEnabled(s.isDroneSequencerEnabled);
    setDroneMasterVolume(s.droneMasterVolume);
    setDroneFilterCutoff(s.droneFilterCutoff);
    setDroneFilterResonance(s.droneFilterResonance);
    setDroneVoices(s.droneVoices.map(v => ({ ...v, adsr: { ...v.adsr } })));
    setDroneSequencerBpm(s.droneSequencerBpm);
    setDroneSequencerLinkToMatrix(s.droneSequencerLinkToMatrix);
    
    // New parameters
    if (s.droneSpread !== undefined) setDroneSpread(s.droneSpread);
    if (s.droneLfoFreq !== undefined) setDroneLfoFreq(s.droneLfoFreq);
    if (s.droneLfoAmount !== undefined) setDroneLfoAmount(s.droneLfoAmount);
    if (s.droneLfoTarget !== undefined) setDroneLfoTarget(s.droneLfoTarget as any);
    if (s.droneSequencerSwing !== undefined) setDroneSequencerSwing(s.droneSequencerSwing);
    if (s.droneSaturation !== undefined) setDroneSaturation(s.droneSaturation);
    if (s.droneReverbSend !== undefined) setDroneReverbSend(s.droneReverbSend);
    if (s.droneSubAmount !== undefined) setDroneSubAmount(s.droneSubAmount);

    setDroneSequencerVoices(s.droneSequencerVoices.map(v => ({
      ...v,
      steps: [...v.steps],
      pitch: [...v.pitch],
      volume: [...v.volume],
      probability: v.probability ? [...v.probability] : new Array(16).fill(1.0),
      duration: v.duration ? [...v.duration] : new Array(16).fill(0.5),
      adsr: { ...v.adsr }
    })));
    setActiveDronePatch(patchIdx);
  };

  const [activeDronePreset, setActiveDronePreset] = useState<number | null>(null);

  const applyDronePreset = (presetIdx: number) => {
    const preset = DRONE_PRESETS[presetIdx];
    setDroneFilterCutoff(preset.cutoff);
    setDroneFilterResonance(preset.resonance);
    setDroneSpread(preset.spread);
    setDroneVoices(preset.voices.map(v => ({
      ...v,
      adsr: { ...v.adsr }
    })));
    setIsDroneEnabled(true);
    setActiveDronePreset(presetIdx);
  };

  const [activeSequencerPreset, setActiveSequencerPreset] = useState<number | null>(null);

  const applySequencerPreset = (presetIdx: number) => {
    const preset = SEQUENCER_PRESETS[presetIdx];
    setDroneSequencerBpm(preset.bpm);
    setDroneSequencerVoices(preset.voices.map(v => ({
      ...v,
      steps: [...v.steps],
      pitch: [...v.pitch],
      volume: [...v.volume],
      probability: v.probability ? [...v.probability] : new Array(16).fill(1.0),
      duration: v.duration ? [...v.duration] : new Array(16).fill(0.5),
      adsr: { ...v.adsr }
    })));
    setIsDroneSequencerEnabled(true);
    setActiveSequencerPreset(presetIdx);
  };

  // Chroma Console Nodes Refs
  const characterNodesRef = useRef<{ input: GainNode, output: GainNode, effectNodes: any[], currentEffect: string } | null>(null);
  const movementNodesRef = useRef<{ input: GainNode, output: GainNode, effectNodes: any[], currentEffect: string } | null>(null);
  const diffusionNodesRef = useRef<{ input: GainNode, output: GainNode, effectNodes: any[], currentEffect: string } | null>(null);
  const textureNodesRef = useRef<{ input: GainNode, output: GainNode, effectNodes: any[], currentEffect: string } | null>(null);
  
  // Drone Effects Refs
  const droneCharacterNodesRef = useRef<{ input: GainNode, output: GainNode, effectNodes: any[], currentEffect: string } | null>(null);
  const droneMovementNodesRef = useRef<{ input: GainNode, output: GainNode, effectNodes: any[], currentEffect: string } | null>(null);
  const droneDiffusionNodesRef = useRef<{ input: GainNode, output: GainNode, effectNodes: any[], currentEffect: string } | null>(null);
  const droneTextureNodesRef = useRef<{ input: GainNode, output: GainNode, effectNodes: any[], currentEffect: string } | null>(null);

  // Sequencer Effects Refs
  const seqCharacterNodesRef = useRef<{ input: GainNode, output: GainNode, effectNodes: any[], currentEffect: string } | null>(null);
  const seqMovementNodesRef = useRef<{ input: GainNode, output: GainNode, effectNodes: any[], currentEffect: string } | null>(null);
  const seqDiffusionNodesRef = useRef<{ input: GainNode, output: GainNode, effectNodes: any[], currentEffect: string } | null>(null);
  const seqTextureNodesRef = useRef<{ input: GainNode, output: GainNode, effectNodes: any[], currentEffect: string } | null>(null);

  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);

    // Drone & Sequence Module Refs
    const droneOscillatorsRef = useRef<{ osc: OscillatorNode; gain: GainNode; filter: BiquadFilterNode; panner: StereoPannerNode }[]>([]);
    const droneLfoRef = useRef<OscillatorNode | null>(null);
    const droneLfoGainRef = useRef<GainNode | null>(null);
    const droneSequencerVoicesRef = useRef<{ osc: OscillatorNode; gain: GainNode; filter: BiquadFilterNode; panner: StereoPannerNode }[]>([]);
    const droneUnitGainRef = useRef<GainNode | null>(null);
    const droneSeqGainRef = useRef<GainNode | null>(null);
    const droneSaturationNodeRef = useRef<WaveShaperNode | null>(null);
    const droneReverbGainRef = useRef<GainNode | null>(null);
    const droneSubOscillatorsRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);
  const droneSequencerClockRef = useRef<number>(0);
  const droneSequencerLastStepRef = useRef<number>(-1);

  // Initialize Audio
  const initAudio = useCallback(async () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
      return;
    }
    
    if (audioContextRef.current) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    
    // Set ref immediately to prevent multiple initializations
    audioContextRef.current = ctx;

    const masterGain = ctx.createGain();
    const synthMatrixGain = ctx.createGain();
    const finalGain = ctx.createGain();
    const analyser = ctx.createAnalyser();
    
    // Chroma Console Chain
    const charIn = ctx.createGain();
    const charOut = ctx.createGain();
    const moveIn = ctx.createGain();
    const moveOut = ctx.createGain();
    const diffIn = ctx.createGain();
    const diffOut = ctx.createGain();
    const textIn = ctx.createGain();
    const textOut = ctx.createGain();

    synthMatrixGain.connect(charIn);
    charIn.connect(charOut);
    charOut.connect(moveIn);
    moveIn.connect(moveOut);
    moveOut.connect(diffIn);
    diffIn.connect(diffOut);
    diffOut.connect(textIn);
    textIn.connect(textOut);
    textOut.connect(masterGain);
    // Safety limiter — prevents clipping from effects, resonant filters, feedback loops
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -3;
    limiter.knee.value = 2;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.001;
    limiter.release.value = 0.1;

    // === Master Bus Effects Chain ===
    // masterGain → busFilter → busSat → busComp → [reverbSend+dry] → finalGain

    // Master bus filter (lowpass, fully open by default)
    const busFilter = ctx.createBiquadFilter();
    busFilter.type = 'lowpass';
    busFilter.frequency.value = 20000; // fully open
    busFilter.Q.value = 0.7; // gentle slope
    masterBusFilterRef.current = busFilter;

    // Master bus saturation (bypass by default — tanh(1) = identity)
    const busSat = ctx.createWaveShaper();
    busSat.curve = makeDistortionCurve(1);
    busSat.oversample = '4x';
    const busSatPostGain = ctx.createGain();
    busSatPostGain.gain.value = 1;
    masterBusSatRef.current = busSat;
    masterBusSatGainRef.current = busSatPostGain;

    // Master bus glue compression (transparent by default)
    const busComp = ctx.createDynamicsCompressor();
    busComp.threshold.value = 0; // no compression by default
    busComp.knee.value = 30;
    busComp.ratio.value = 1; // 1:1 = no compression
    busComp.attack.value = 0.003;
    busComp.release.value = 0.25;
    masterBusCompRef.current = busComp;

    // Master bus reverb (convolution, silent by default)
    const busReverb = ctx.createConvolver();
    busReverb.buffer = generateReverbIR(ctx, 4, 1.2, 0.4); // 4s spacey reverb
    const busReverbWet = ctx.createGain();
    busReverbWet.gain.value = 0; // off by default
    const busReverbDry = ctx.createGain();
    busReverbDry.gain.value = 1;
    masterBusReverbRef.current = busReverb;
    masterBusReverbWetRef.current = busReverbWet;
    masterBusReverbDryRef.current = busReverbDry;

    // Wire: masterGain → busFilter → busSat → busSatPostGain → busComp → [reverb wet + dry] → finalGain
    masterGain.connect(busFilter);
    busFilter.connect(busSat);
    busSat.connect(busSatPostGain);
    busSatPostGain.connect(busComp);
    // Dry path
    busComp.connect(busReverbDry);
    busReverbDry.connect(finalGain);
    // Reverb send (parallel)
    busComp.connect(busReverb);
    busReverb.connect(busReverbWet);
    busReverbWet.connect(finalGain);

    finalGain.connect(analyser);
    analyser.connect(limiter);
    limiter.connect(ctx.destination);

    analyser.fftSize = 256;
    masterGain.gain.value = volumeRef.current;
    finalGain.gain.value = isPlaying ? 1 : 0;

    // Drone Effects Chain
    const dCharIn = ctx.createGain();
    const dCharOut = ctx.createGain();
    const dMoveIn = ctx.createGain();
    const dMoveOut = ctx.createGain();
    const dDiffIn = ctx.createGain();
    const dDiffOut = ctx.createGain();
    const dTextIn = ctx.createGain();
    const dTextOut = ctx.createGain();

    // Sequencer Effects Chain
    const sCharIn = ctx.createGain();
    const sCharOut = ctx.createGain();
    const sMoveIn = ctx.createGain();
    const sMoveOut = ctx.createGain();
    const sDiffIn = ctx.createGain();
    const sDiffOut = ctx.createGain();
    const sTextIn = ctx.createGain();
    const sTextOut = ctx.createGain();

    characterNodesRef.current = { input: charIn, output: charOut, effectNodes: [], currentEffect: 'none' };
    movementNodesRef.current = { input: moveIn, output: moveOut, effectNodes: [], currentEffect: 'none' };
    diffusionNodesRef.current = { input: diffIn, output: diffOut, effectNodes: [], currentEffect: 'none' };
    textureNodesRef.current = { input: textIn, output: textOut, effectNodes: [], currentEffect: 'none' };

    droneCharacterNodesRef.current = { input: dCharIn, output: dCharOut, effectNodes: [], currentEffect: 'none' };
    droneMovementNodesRef.current = { input: dMoveIn, output: dMoveOut, effectNodes: [], currentEffect: 'none' };
    droneDiffusionNodesRef.current = { input: dDiffIn, output: dDiffOut, effectNodes: [], currentEffect: 'none' };
    droneTextureNodesRef.current = { input: dTextIn, output: dTextOut, effectNodes: [], currentEffect: 'none' };

    seqCharacterNodesRef.current = { input: sCharIn, output: sCharOut, effectNodes: [], currentEffect: 'none' };
    seqMovementNodesRef.current = { input: sMoveIn, output: sMoveOut, effectNodes: [], currentEffect: 'none' };
    seqDiffusionNodesRef.current = { input: sDiffIn, output: sDiffOut, effectNodes: [], currentEffect: 'none' };
    seqTextureNodesRef.current = { input: sTextIn, output: sTextOut, effectNodes: [], currentEffect: 'none' };

    // Initialize periodic waves
    Object.entries(WAVE_TABLES).forEach(([name, data]) => {
      periodicWavesRef.current[name] = ctx.createPeriodicWave(
        new Float32Array(data.real),
        new Float32Array(data.imag)
      );
    });

    const dest = ctx.createMediaStreamDestination();
    limiter.connect(dest);
    audioStreamDestRef.current = dest;

    masterGainRef.current = masterGain;
    synthMatrixGainRef.current = synthMatrixGain;
    finalGainRef.current = finalGain;
    analyserRef.current = analyser;

    // Create noise buffer
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    noiseBufferRef.current = noiseBuffer;

    // Create a bank of oscillators
    const newOscillators = [];
    for (let i = 0; i < SAMPLE_POINTS; i++) {
      const osc = ctx.createOscillator();
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBufferRef.current;
      noiseSource.loop = true;
      
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const panner = ctx.createStereoPanner();

      osc.type = 'sine';
      gain.gain.value = 0;
      filter.type = 'lowpass';
      panner.pan.value = 0;

      osc.connect(filter);
      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(panner);
      panner.connect(synthMatrixGain);

      osc.start();
      noiseSource.playbackRate.value = 0;
      noiseSource.start();
      newOscillators.push({ osc, noiseSource, gain, filter, panner });
    }
    oscillatorsRef.current = newOscillators;

    // Initialize Drone Module
    const droneUnitGain = ctx.createGain();
    const droneSeqGain = ctx.createGain();
    const droneSaturationNode = ctx.createWaveShaper();
    const droneReverbGain = ctx.createGain();
    
    droneUnitGain.gain.value = droneMasterVolume;
    droneSeqGain.gain.value = 0.8; // Default for sequencer tracks
    droneSaturationNode.curve = makeDistortionCurve(droneSaturation * 100);
    droneReverbGain.gain.value = droneReverbSend;

    // Drone Chain Connections
    droneUnitGain.connect(dCharIn);
    dCharIn.connect(dCharOut);
    dCharOut.connect(dMoveIn);
    dMoveIn.connect(dMoveOut);
    dMoveOut.connect(dDiffIn);
    dDiffIn.connect(dDiffOut);
    dDiffOut.connect(dTextIn);
    dTextIn.connect(dTextOut);
    dTextOut.connect(droneSaturationNode);
    droneSaturationNode.connect(masterGain);

    // Sequencer Chain Connections
    droneSeqGain.connect(sCharIn);
    sCharIn.connect(sCharOut);
    sCharOut.connect(sMoveIn);
    sMoveIn.connect(sMoveOut);
    sMoveOut.connect(sDiffIn);
    sDiffIn.connect(sDiffOut);
    sDiffOut.connect(sTextIn);
    sTextIn.connect(sTextOut);
    sTextOut.connect(masterGain);

    droneUnitGainRef.current = droneUnitGain;
    droneSeqGainRef.current = droneSeqGain;
    droneSaturationNodeRef.current = droneSaturationNode;
    droneReverbGainRef.current = droneReverbGain;

    const newDroneOscillators = [];
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const panner = ctx.createStereoPanner();

      osc.type = droneVoices[i].type as OscillatorType;
      osc.frequency.value = droneVoices[i].freq;
      osc.detune.value = droneVoices[i].detune;
      gain.gain.value = 0; // Start muted
      filter.type = 'lowpass';
      filter.frequency.value = droneFilterCutoff;
      filter.Q.value = droneFilterResonance;
      panner.pan.value = droneVoices[i].pan;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(panner);
      panner.connect(droneUnitGain);

      osc.start();
      newDroneOscillators.push({ osc, gain, filter, panner });
    }
    droneOscillatorsRef.current = newDroneOscillators;

    const newDroneSubOscillators = [];
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.value = droneVoices[i].freq / 2;
      gain.gain.value = 0;
      
      osc.connect(gain);
      gain.connect(droneUnitGain);
      osc.start();
      newDroneSubOscillators.push({ osc, gain });
    }
    droneSubOscillatorsRef.current = newDroneSubOscillators;
    
    // Initialize Drone LFO
    const droneLfo = ctx.createOscillator();
    const droneLfoGain = ctx.createGain();
    droneLfo.type = 'sine';
    droneLfo.frequency.value = droneLfoFreq;
    droneLfoGain.gain.value = droneLfoAmount;
    droneLfo.connect(droneLfoGain);
    droneLfo.start();
    droneLfoRef.current = droneLfo;
    droneLfoGainRef.current = droneLfoGain;

    // Initialize Drone Sequencer Voices
    const newSequencerVoices = [];
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const panner = ctx.createStereoPanner();

      const vType = droneSequencerVoices[i].type;
      osc.type = vType === 'auto' ? (i === 3 ? 'square' : 'sine') : vType as OscillatorType;
      gain.gain.value = 0;
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      panner.pan.value = (i % 2 === 0 ? -0.3 : 0.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(panner);
      panner.connect(droneSeqGain);

      osc.start();
      newSequencerVoices.push({ osc, gain, filter, panner });
    }
    droneSequencerVoicesRef.current = newSequencerVoices;
    
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }, []);

  const stopAllAudio = useCallback(() => {
    if (audioContextRef.current) {
      // Stop all oscillators
      oscillatorsRef.current.forEach(o => {
        try { o.osc.stop(); } catch(e) {}
        if (o.noiseSource) try { o.noiseSource.stop(); } catch(e) {}
      });
      droneOscillatorsRef.current.forEach(o => {
        try { o.osc.stop(); } catch(e) {}
      });
      droneSequencerVoicesRef.current.forEach(o => {
        try { o.osc.stop(); } catch(e) {}
      });
      droneSubOscillatorsRef.current.forEach(o => {
        try { o.osc.stop(); } catch(e) {}
      });
      
      // Suspend context to be absolutely sure
      audioContextRef.current.suspend();
    }
    setIsPlaying(false);
  }, []);

  const handleReset = useCallback(() => {
    // Stop Audio
    stopAllAudio();
    setIsMuted(false);
    setVolume(0.5);
    setSynthMatrixVolume(0.8);
    
    // Reset Media
    if (isWebcamActive) {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => track.stop());
        webcamStreamRef.current = null;
      }
      setIsWebcamActive(false);
    }
    setImage(null);
    setVideoUrl(null);
    setMediaType('image');
    setIsLoaded(false);
    
    // Reset Modules
    setIsSynthMatrixEnabled(true);
    setIsDroneEnabled(false);
    setIsDroneSequencerEnabled(false);
    setIsEvolving(false);
    // Reset Patches
    setActivePatch(null);
    setActiveDronePatch(null);
    
    // Reset specific synth params to defaults
    setBaseFreq(110);
    setFreqRange(880);
    setFreqMod(200);
    setAmpMod(1.0);
    setCutoffMod(4000);
    setQMod(15);
    setScanSpeed(1);
    setScanScale(1.0);
    setScanCenterX(0.5);
    setScanCenterY(0.5);
    
  }, [isWebcamActive, stopAllAudio]);

  // Update Chroma Console Effects
  useEffect(() => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;

    const updateModule = (
      moduleRef: MutableRefObject<{ input: GainNode, output: GainNode, effectNodes: any[], currentEffect: string } | null>,
      effect: string,
      amount: number,
      type: 'character' | 'movement' | 'diffusion' | 'texture'
    ) => {
      if (!moduleRef.current) return;
      const { input, output, effectNodes, currentEffect } = moduleRef.current;

      // If effect type hasn't changed, just update parameters if possible
      if (currentEffect === effect && (effect === 'none' || (effectNodes.length > 0 && isPlaying))) {
        effectNodes.forEach(node => {
          try {
            if (node instanceof BiquadFilterNode) {
              if (type === 'character') {
                if (effect === 'fuzz') node.frequency.setTargetAtTime(2000 + (1 - amount) * 8000, ctx.currentTime, 0.1);
                if (effect === 'howl') {
                  node.frequency.setTargetAtTime(500 + amount * 2000, ctx.currentTime, 0.1);
                  node.Q.setTargetAtTime(10 + amount * 20, ctx.currentTime, 0.1);
                }
                if (effect === 'crush') {
                  // No filter for crush by default
                }
              } else if (type === 'texture') {
                if (effect === 'filter') {
                  node.type = amount < 0.5 ? 'lowpass' : 'highpass';
                  node.frequency.setTargetAtTime(amount < 0.5 ? amount * 4000 + 200 : (amount - 0.5) * 8000 + 500, ctx.currentTime, 0.1);
                } else if (effect === 'cassette') {
                  node.frequency.setTargetAtTime(1000 + amount * 1000, ctx.currentTime, 0.1);
                } else if (effect === 'interference') {
                  node.frequency.setTargetAtTime(2000 + amount * 2000, ctx.currentTime, 0.1);
                } else if (effect === 'radio') {
                  node.frequency.setTargetAtTime(500 + amount * 4000, ctx.currentTime, 0.1);
                }
              } else if (type === 'diffusion') {
                if (effect === 'reels') {
                  node.frequency.setTargetAtTime(500 + amount * 2000, ctx.currentTime, 0.1);
                } else if (effect === 'echo') {
                  node.frequency.setTargetAtTime(400 + amount * 3000, ctx.currentTime, 0.1);
                }
              }
            } else if (node instanceof WaveShaperNode) {
              if (effect === 'drive') node.curve = makeDistortionCurve(amount * 100);
              if (effect === 'sweeten') node.curve = makeDistortionCurve(amount * 20);
              if (effect === 'fuzz') node.curve = makeDistortionCurve(amount * 400);
              if (effect === 'howl') node.curve = makeDistortionCurve(amount * 200);
              if (effect === 'squash') node.curve = makeDistortionCurve(amount * 50);
              if (effect === 'broken' || effect === 'crush' || effect === 'radio') {
                const n = effect === 'crush' ? Math.floor(2 + (1 - amount) * 4) : Math.floor(2 + (1 - amount) * 10);
                const curve = new Float32Array(1024);
                for (let i = 0; i < 1024; i++) {
                  const x = (i * 2) / 1024 - 1;
                  curve[i] = Math.round(x * n) / n;
                }
                node.curve = curve;
              }
            } else if (node instanceof GainNode) {
              if (effect === 'cassette') node.gain.setTargetAtTime(0.02 * amount, ctx.currentTime, 0.1);
              if (effect === 'interference') node.gain.setTargetAtTime(0.05 * amount, ctx.currentTime, 0.1);
              if (effect === 'radio') node.gain.setTargetAtTime(0.03 * amount, ctx.currentTime, 0.1);
              if (effect === 'cascade') node.gain.setTargetAtTime(0.3 + amount * 0.4, ctx.currentTime, 0.1);
              if (effect === 'echo') node.gain.setTargetAtTime(0.2 + amount * 0.6, ctx.currentTime, 0.1);
              if (effect === 'vortex') node.gain.setTargetAtTime(0.4 + amount * 0.5, ctx.currentTime, 0.1);
              if (effect === 'doubler') node.gain.setTargetAtTime(0.3 + amount * 0.4, ctx.currentTime, 0.1);
              if (effect === 'space') node.gain.setTargetAtTime(amount, ctx.currentTime, 0.1);
            } else if (node instanceof OscillatorNode) {
              if (effect === 'vibrato') node.frequency.setTargetAtTime(0.5 + amount * 8, ctx.currentTime, 0.1);
              if (effect === 'phaser') node.frequency.setTargetAtTime(0.1 + amount * 2, ctx.currentTime, 0.1);
              if (effect === 'tremolo') node.frequency.setTargetAtTime(1 + amount * 10, ctx.currentTime, 0.1);
              if (effect === 'pitch') node.frequency.setTargetAtTime(10 + amount * 100, ctx.currentTime, 0.1);
              if (effect === 'vortex') node.frequency.setTargetAtTime(0.05 + amount * 0.5, ctx.currentTime, 0.1);
              if (effect === 'reels') node.frequency.setTargetAtTime(0.5 + amount * 2, ctx.currentTime, 0.1);
              if (effect === 'echo') node.frequency.setTargetAtTime(0.2 + amount * 1, ctx.currentTime, 0.1);
            } else if (node instanceof DelayNode) {
              if (effect === 'doubler') node.delayTime.setTargetAtTime(0.01 + amount * 0.04, ctx.currentTime, 0.1);
              if (effect === 'cascade') node.delayTime.setTargetAtTime(0.2 + amount * 0.8, ctx.currentTime, 0.1);
              if (effect === 'echo') node.delayTime.setTargetAtTime(0.1 + amount * 1.9, ctx.currentTime, 0.1);
              if (effect === 'reels') node.delayTime.setTargetAtTime(0.1 + amount * 0.3, ctx.currentTime, 0.1);
              if (effect === 'reverse') node.delayTime.setTargetAtTime(0.5 + amount * 1.5, ctx.currentTime, 0.1);
              if (effect === 'collage') node.delayTime.setTargetAtTime(0.05 + amount * 0.4, ctx.currentTime, 0.1);
              if (effect === 'vortex') node.delayTime.setTargetAtTime(0.001 + amount * 0.01, ctx.currentTime, 0.1);
            } else if (node instanceof DynamicsCompressorNode) {
              if (effect === 'squash') node.threshold.setTargetAtTime(-50 * amount, ctx.currentTime, 0.1);
              if (effect === 'sweeten') node.threshold.setTargetAtTime(-10 - amount * 30, ctx.currentTime, 0.1);
            }
          } catch (e) {
            console.warn("Error updating node parameter:", e);
          }
        });
        return;
      }

      // Disconnect old nodes
      try {
        input.disconnect();
      } catch (e) {
        console.warn("Error disconnecting input:", e);
      }
      
      effectNodes.forEach(node => {
        try {
          if (node.disconnect) node.disconnect();
          if (node.stop) try { node.stop(); } catch(e) {}
          if (node.cleanup) node.cleanup();
        } catch (e) {
          console.warn("Error cleaning up node:", e);
        }
      });
      moduleRef.current.effectNodes = [];
      moduleRef.current.currentEffect = effect;

      if (effect === 'none' || !isPlaying) {
        try {
          input.connect(output);
        } catch (e) {
          console.error("Error connecting input to output:", e);
        }
        return;
      }

      const nodes: any[] = [];

      try {
        if (type === 'character') {
          if (effect === 'drive') {
            // Warm tube-like drive with tanh curve — oversampled for clean harmonics
            const preGain = ctx.createGain();
            preGain.gain.value = 1 + amount * 5; // drive amount into curve
            const shaper = ctx.createWaveShaper();
            shaper.curve = makeDistortionCurve(2 + amount * 8); // tanh(2-10)
            shaper.oversample = '4x';
            const postGain = ctx.createGain();
            postGain.gain.value = 0.7 / (1 + amount * 2); // compensate for drive boost
            input.connect(preGain);
            preGain.connect(shaper);
            shaper.connect(postGain);
            postGain.connect(output);
            nodes.push(preGain, shaper, postGain);
          } else if (effect === 'sweeten') {
            // Gentle compression + warmth + low-end presence
            const comp = ctx.createDynamicsCompressor();
            comp.threshold.value = -20;
            comp.knee.value = 20;
            comp.ratio.value = 2.5;
            comp.attack.value = 0.003;
            comp.release.value = 0.15;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowshelf';
            filter.frequency.value = 250;
            filter.gain.value = amount * 6; // max +6dB low shelf (was 10)
            const shaper = ctx.createWaveShaper();
            shaper.curve = makeDistortionCurve(1 + amount * 3); // subtle warmth
            shaper.oversample = '4x';
            const postGain = ctx.createGain();
            postGain.gain.value = 0.85;
            input.connect(comp);
            comp.connect(filter);
            filter.connect(shaper);
            shaper.connect(postGain);
            postGain.connect(output);
            nodes.push(comp, filter, shaper, postGain);
          } else if (effect === 'fuzz') {
            // Heavy fuzz with post-filter to tame harshness
            const preGain = ctx.createGain();
            preGain.gain.value = 1 + amount * 3;
            const shaper = ctx.createWaveShaper();
            shaper.curve = makeDistortionCurve(5 + amount * 25); // tanh(5-30) — aggressive but bounded
            shaper.oversample = '4x';
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 3000 + (1 - amount) * 7000; // darker at higher amounts
            const postGain = ctx.createGain();
            postGain.gain.value = 0.5 / (1 + amount); // aggressive compensation
            input.connect(preGain);
            preGain.connect(shaper);
            shaper.connect(filter);
            filter.connect(postGain);
            postGain.connect(output);
            nodes.push(preGain, shaper, filter, postGain);
          } else if (effect === 'howl') {
            // Resonant filter fuzz — musical resonance, not screeching
            const shaper = ctx.createWaveShaper();
            shaper.curve = makeDistortionCurve(3 + amount * 12); // moderate drive
            shaper.oversample = '4x';
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400 + amount * 2500;
            filter.Q.value = 2 + amount * 10; // max Q=12 (was 30!) — sings without screeching
            const postGain = ctx.createGain();
            postGain.gain.value = 0.4 / (1 + amount * 0.5); // compensate for resonance boost
            input.connect(shaper);
            shaper.connect(filter);
            filter.connect(postGain);
            postGain.connect(output);
            nodes.push(shaper, filter, postGain);
          } else if (effect === 'swell') {
            const swellGain = ctx.createGain();
            swellGain.gain.value = 0;
            const checkSwell = () => {
              const anyActive = voiceStatesRef.current.some(s => s);
              if (anyActive) {
                swellGain.gain.setTargetAtTime(1, ctx.currentTime, 0.5 + (1 - amount) * 2);
              } else {
                swellGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
              }
            };
            const interval = setInterval(checkSwell, 100);
            input.connect(swellGain);
            swellGain.connect(output);
            nodes.push(swellGain, { disconnect: () => {}, cleanup: () => clearInterval(interval) });
          } else if (effect === 'crush') {
            // Bitcrusher with controlled gain — no double-waveshaper pileup
            const shaper = ctx.createWaveShaper();
            const n = Math.floor(3 + (1 - amount) * 8); // quantization steps
            const curve = new Float32Array(8192);
            for (let i = 0; i < 8192; i++) {
              const x = (i * 2) / 8192 - 1;
              curve[i] = Math.round(x * n) / n;
            }
            shaper.curve = curve;
            shaper.oversample = '2x';
            // Light saturation before crush for warmth
            const sat = ctx.createWaveShaper();
            sat.curve = makeDistortionCurve(1 + amount * 3);
            sat.oversample = '2x';
            const postGain = ctx.createGain();
            postGain.gain.value = 0.7;
            input.connect(sat);
            sat.connect(shaper);
            shaper.connect(postGain);
            postGain.connect(output);
            nodes.push(sat, shaper, postGain);
          }
        } else if (type === 'movement') {
          if (effect === 'doubler') {
            const delay = ctx.createDelay();
            delay.delayTime.value = 0.01 + amount * 0.04;
            const dry = ctx.createGain();
            const wet = ctx.createGain();
            dry.gain.value = 0.6;
            wet.gain.value = 0.4;
            input.connect(dry);
            input.connect(delay);
            delay.connect(wet);
            dry.connect(output);
            wet.connect(output);
            nodes.push(delay, dry, wet);
          } else if (effect === 'vibrato') {
            const delay = ctx.createDelay();
            delay.delayTime.value = 0.005; // center delay
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.frequency.value = 1 + amount * 6; // 1-7 Hz — musical vibrato range
            lfoGain.gain.value = 0.001 + amount * 0.004; // subtle pitch modulation
            lfo.connect(lfoGain);
            lfoGain.connect(delay.delayTime);
            lfo.start();
            input.connect(delay);
            delay.connect(output);
            nodes.push(delay, lfo, lfoGain);
          } else if (effect === 'phaser') {
            // 8-stage phaser for lush, deep sweeps (was 4 stages)
            const stages = 8;
            const allPasses = Array.from({ length: stages }, () => {
              const ap = ctx.createBiquadFilter();
              ap.type = 'allpass';
              ap.Q.value = 0.5 + amount * 2; // moderate Q for resonance
              return ap;
            });
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.frequency.value = 0.1 + amount * 1.5; // slow hypnotic sweep
            lfoGain.gain.value = 800 + amount * 2000; // sweep across wider range
            lfo.connect(lfoGain);
            // Feedback for resonance at notch frequencies
            const fbGain = ctx.createGain();
            fbGain.gain.value = amount * 0.5; // max 0.5 feedback — resonant but safe
            allPasses.forEach((ap, i) => {
              lfoGain.connect(ap.frequency);
              if (i === 0) input.connect(ap);
              else allPasses[i-1].connect(ap);
            });
            allPasses[stages - 1].connect(fbGain);
            fbGain.connect(allPasses[0]);
            // Mix wet (phased) + dry for notch comb effect
            const dry = ctx.createGain();
            dry.gain.value = 0.5;
            const wet = ctx.createGain();
            wet.gain.value = 0.5;
            input.connect(dry);
            dry.connect(output);
            allPasses[stages - 1].connect(wet);
            wet.connect(output);
            lfo.start();
            nodes.push(...allPasses, lfo, lfoGain, fbGain, dry, wet);
          } else if (effect === 'tremolo') {
            const tremGain = ctx.createGain();
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.frequency.value = 1 + amount * 10;
            lfoGain.gain.value = amount * 0.8; // slightly less extreme
            const offset = ctx.createConstantSource();
            offset.offset.value = 1 - amount * 0.8;
            offset.start();
            lfo.connect(lfoGain);
            lfoGain.connect(tremGain.gain);
            offset.connect(tremGain.gain);
            lfo.start();
            input.connect(tremGain);
            tremGain.connect(output);
            nodes.push(tremGain, lfo, lfoGain, offset);
          } else if (effect === 'pitch') {
            // Pitch shifting with smoother modulation
            const delay = ctx.createDelay();
            const lfo = ctx.createOscillator();
            lfo.type = 'sawtooth';
            lfo.frequency.value = 5 + amount * 40; // gentler range
            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 0.005 + amount * 0.005;
            lfo.connect(lfoGain);
            lfoGain.connect(delay.delayTime);
            lfo.start();
            const dry = ctx.createGain();
            dry.gain.value = 0.5;
            const wet = ctx.createGain();
            wet.gain.value = 0.5;
            input.connect(dry);
            input.connect(delay);
            delay.connect(wet);
            dry.connect(output);
            wet.connect(output);
            nodes.push(delay, lfo, lfoGain, dry, wet);
          } else if (effect === 'vortex') {
            // Flanger with LP filter in feedback to prevent buildup
            const delay = ctx.createDelay();
            delay.delayTime.value = 0.003;
            const feedback = ctx.createGain();
            feedback.gain.value = 0.3 + amount * 0.45; // max 0.75 (was 0.9)
            const fbFilter = ctx.createBiquadFilter();
            fbFilter.type = 'lowpass';
            fbFilter.frequency.value = 4000; // tame high-freq feedback
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.frequency.value = 0.08 + amount * 0.4;
            lfoGain.gain.value = 0.003;
            lfo.connect(lfoGain);
            lfoGain.connect(delay.delayTime);
            lfo.start();
            input.connect(delay);
            delay.connect(fbFilter);
            fbFilter.connect(feedback);
            feedback.connect(delay);
            const dry = ctx.createGain();
            dry.gain.value = 0.6;
            const wet = ctx.createGain();
            wet.gain.value = 0.4;
            input.connect(dry);
            delay.connect(wet);
            dry.connect(output);
            wet.connect(output);
            nodes.push(delay, feedback, fbFilter, lfo, lfoGain, dry, wet);
          }
        } else if (type === 'diffusion') {
          if (effect === 'cascade') {
            // Delay with HP+LP filtering in feedback loop to prevent muddy buildup
            const delay = ctx.createDelay(5);
            delay.delayTime.value = 0.2 + amount * 0.6;
            const feedback = ctx.createGain();
            feedback.gain.value = 0.25 + amount * 0.45; // max 0.7 — safe, long trails
            const fbLP = ctx.createBiquadFilter();
            fbLP.type = 'lowpass';
            fbLP.frequency.value = 5000 - amount * 2000; // darken repeats over time
            const fbHP = ctx.createBiquadFilter();
            fbHP.type = 'highpass';
            fbHP.frequency.value = 80 + amount * 100; // prevent bass buildup
            input.connect(delay);
            delay.connect(fbLP);
            fbLP.connect(fbHP);
            fbHP.connect(feedback);
            feedback.connect(delay);
            const dry = ctx.createGain();
            dry.gain.value = 0.7;
            const wet = ctx.createGain();
            wet.gain.value = 0.5;
            input.connect(dry);
            dry.connect(output);
            delay.connect(wet);
            wet.connect(output);
            nodes.push(delay, feedback, fbLP, fbHP, dry, wet);
          } else if (effect === 'reels') {
            // Tape delay — LP+HP in feedback, subtle saturation, wow/flutter
            const delay = ctx.createDelay(5);
            delay.delayTime.value = 0.15 + amount * 0.35;
            const feedback = ctx.createGain();
            feedback.gain.value = 0.3 + amount * 0.4; // max 0.7
            // Tape-like filtering in feedback loop
            const fbLP = ctx.createBiquadFilter();
            fbLP.type = 'lowpass';
            fbLP.frequency.value = 3500 - amount * 1500; // each repeat loses highs
            const fbHP = ctx.createBiquadFilter();
            fbHP.type = 'highpass';
            fbHP.frequency.value = 100;
            // Subtle tape saturation in feedback
            const fbSat = ctx.createWaveShaper();
            fbSat.curve = makeDistortionCurve(1.5 + amount * 2);
            fbSat.oversample = '2x';
            // Wow (slow pitch drift)
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.frequency.value = 0.4 + amount * 1.2; // 0.4-1.6 Hz wow
            lfoGain.gain.value = 0.001 + amount * 0.003; // subtle wobble
            lfo.connect(lfoGain);
            lfoGain.connect(delay.delayTime);
            lfo.start();
            // Flutter (fast subtle warble)
            const flutter = ctx.createOscillator();
            const flutterGain = ctx.createGain();
            flutter.frequency.value = 4 + amount * 3;
            flutterGain.gain.value = 0.0002 + amount * 0.0003;
            flutter.connect(flutterGain);
            flutterGain.connect(delay.delayTime);
            flutter.start();
            input.connect(delay);
            delay.connect(fbLP);
            fbLP.connect(fbHP);
            fbHP.connect(fbSat);
            fbSat.connect(feedback);
            feedback.connect(delay);
            const dry = ctx.createGain();
            dry.gain.value = 0.65;
            const wet = ctx.createGain();
            wet.gain.value = 0.5;
            input.connect(dry);
            dry.connect(output);
            delay.connect(wet);
            wet.connect(output);
            nodes.push(delay, feedback, fbLP, fbHP, fbSat, lfo, lfoGain, flutter, flutterGain, dry, wet);
          } else if (effect === 'echo') {
            // Spacey echo — filtered feedback with slow modulation for psychedelic trails
            const delay = ctx.createDelay(5);
            delay.delayTime.value = 0.15 + amount * 0.8;
            const feedback = ctx.createGain();
            feedback.gain.value = 0.3 + amount * 0.45; // max 0.75
            const fbLP = ctx.createBiquadFilter();
            fbLP.type = 'lowpass';
            fbLP.frequency.value = 4000 - amount * 1500; // darken echoes
            const fbHP = ctx.createBiquadFilter();
            fbHP.type = 'highpass';
            fbHP.frequency.value = 120;
            // Slow LFO on delay time for pitch-drifting echoes
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.frequency.value = 0.1 + amount * 0.4; // very slow modulation
            lfoGain.gain.value = 0.002 + amount * 0.004;
            lfo.connect(lfoGain);
            lfoGain.connect(delay.delayTime);
            lfo.start();
            input.connect(delay);
            delay.connect(fbLP);
            fbLP.connect(fbHP);
            fbHP.connect(feedback);
            feedback.connect(delay);
            const dry = ctx.createGain();
            dry.gain.value = 0.65;
            const wet = ctx.createGain();
            wet.gain.value = 0.5;
            input.connect(dry);
            dry.connect(output);
            delay.connect(wet);
            wet.connect(output);
            nodes.push(delay, feedback, fbLP, fbHP, lfo, lfoGain, dry, wet);
          } else if (effect === 'space') {
            // Rich spacey reverb — long, frequency-dependent decay, pre-delay, shimmer
            const reverbDuration = 2 + amount * 6; // 2-8 seconds
            const reverbDecay = 1.5 - amount * 0.7; // slower decay at higher amounts
            const reverb = ctx.createConvolver();
            reverb.buffer = generateReverbIR(ctx, reverbDuration, reverbDecay, 0.4 + (1 - amount) * 0.3);
            // Pre-delay for spaciousness (30-80ms)
            const preDelay = ctx.createDelay();
            preDelay.delayTime.value = 0.03 + amount * 0.05;
            // HP filter before reverb to prevent low-end mud
            const reverbHP = ctx.createBiquadFilter();
            reverbHP.type = 'highpass';
            reverbHP.frequency.value = 150 + amount * 100; // cut below 150-250 Hz
            // Wet/dry mix
            const dry = ctx.createGain();
            dry.gain.value = 1 - amount * 0.4; // keep dry strong
            const wet = ctx.createGain();
            wet.gain.value = 0.3 + amount * 0.5; // 30-80% wet
            input.connect(reverbHP);
            reverbHP.connect(preDelay);
            preDelay.connect(reverb);
            reverb.connect(wet);
            wet.connect(output);
            input.connect(dry);
            dry.connect(output);
            nodes.push(reverb, preDelay, reverbHP, dry, wet);
          } else if (effect === 'collage') {
            // Multi-tap delay with Fibonacci-spaced taps for psychedelic diffusion
            const fibTimes = [0.089, 0.144, 0.233, 0.377, 0.610]; // Fibonacci ratios
            const taps = fibTimes.map((t, i) => {
              const d = ctx.createDelay(5);
              d.delayTime.value = t * (0.5 + amount * 1.5);
              const g = ctx.createGain();
              g.gain.value = 0.25 / (i + 1); // decreasing volume per tap
              return { d, g };
            });
            taps.forEach(tap => {
              input.connect(tap.d);
              tap.d.connect(tap.g);
              tap.g.connect(output);
            });
            const dry = ctx.createGain();
            dry.gain.value = 0.6;
            input.connect(dry);
            dry.connect(output);
            nodes.push(...taps.flatMap(t => [t.d, t.g]), dry);
          } else if (effect === 'reverse') {
            // Reverse swell effect using reversed impulse response
            const reverb = ctx.createConvolver();
            const length = Math.floor(ctx.sampleRate * (0.5 + amount * 2));
            const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
            for (let ch = 0; ch < 2; ch++) {
              const data = impulse.getChannelData(ch);
              for (let i = 0; i < length; i++) {
                // Reversed envelope — builds up instead of decaying
                const t = i / length;
                data[i] = (Math.random() * 2 - 1) * Math.pow(t, 1.5) * 0.8;
              }
            }
            reverb.buffer = impulse;
            const dry = ctx.createGain();
            dry.gain.value = 0.6;
            const wet = ctx.createGain();
            wet.gain.value = 0.3 + amount * 0.4;
            input.connect(reverb);
            reverb.connect(wet);
            wet.connect(output);
            input.connect(dry);
            dry.connect(output);
            nodes.push(reverb, dry, wet);
          }
        } else if (type === 'texture') {
          if (effect === 'filter') {
            // Musical multi-mode filter with moderate resonance
            const filter = ctx.createBiquadFilter();
            filter.type = amount < 0.5 ? 'lowpass' : 'highpass';
            filter.frequency.value = amount < 0.5 ? amount * 4000 + 200 : (amount - 0.5) * 8000 + 500;
            filter.Q.value = 1 + amount * 4; // gentle resonance, max Q=5
            input.connect(filter);
            filter.connect(output);
            nodes.push(filter);
          } else if (effect === 'squash') {
            // Heavy compression with gentle saturation (no extreme clipping)
            const comp = ctx.createDynamicsCompressor();
            comp.threshold.value = -30 - amount * 20; // -30 to -50
            comp.knee.value = 10;
            comp.ratio.value = 4 + amount * 12; // 4:1 to 16:1
            comp.attack.value = 0.001;
            comp.release.value = 0.05 + amount * 0.15;
            const shaper = ctx.createWaveShaper();
            shaper.curve = makeDistortionCurve(1 + amount * 4); // gentle saturation (was amount*50!)
            shaper.oversample = '2x';
            const postGain = ctx.createGain();
            postGain.gain.value = 0.8;
            input.connect(comp);
            comp.connect(shaper);
            shaper.connect(postGain);
            postGain.connect(output);
            nodes.push(comp, shaper, postGain);
          } else if (effect === 'cassette') {
            // Tape texture with bandwidth limiting and subtle hiss
            const lpFilter = ctx.createBiquadFilter();
            lpFilter.type = 'lowpass';
            lpFilter.frequency.value = 6000 - amount * 3000; // bandwidth narrows with amount
            const hpFilter = ctx.createBiquadFilter();
            hpFilter.type = 'highpass';
            hpFilter.frequency.value = 60 + amount * 100;
            // Subtle tape hiss
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBufferRef.current;
            noise.loop = true;
            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'highpass';
            noiseFilter.frequency.value = 4000; // hiss is high-frequency
            const noiseGain = ctx.createGain();
            noiseGain.gain.value = 0.008 * amount;
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(output);
            noise.start();
            input.connect(hpFilter);
            hpFilter.connect(lpFilter);
            lpFilter.connect(output);
            nodes.push(lpFilter, hpFilter, noise, noiseFilter, noiseGain);
          } else if (effect === 'broken') {
            // Bitcrusher with oversampling to reduce aliasing
            const shaper = ctx.createWaveShaper();
            const n = Math.floor(3 + (1 - amount) * 12);
            const curve = new Float32Array(8192);
            for (let i = 0; i < 8192; i++) {
              const x = (i * 2) / 8192 - 1;
              curve[i] = Math.round(x * n) / n;
            }
            shaper.curve = curve;
            shaper.oversample = '2x';
            const postGain = ctx.createGain();
            postGain.gain.value = 0.8;
            input.connect(shaper);
            shaper.connect(postGain);
            postGain.connect(output);
            nodes.push(shaper, postGain);
          } else if (effect === 'interference') {
            // Filtered noise bed — atmospheric static
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBufferRef.current;
            noise.loop = true;
            const noiseGain = ctx.createGain();
            noiseGain.gain.value = 0.03 * amount; // reduced from 0.05
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 2000 + amount * 2000;
            filter.Q.value = 1;
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(output);
            noise.start();
            input.connect(output);
            nodes.push(noise, noiseGain, filter);
          } else if (effect === 'radio') {
            // Lo-fi AM radio with bandwidth limiting and subtle noise
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 800 + amount * 2000;
            filter.Q.value = 2 + amount * 3; // reduced from 5, prevents resonance spike
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBufferRef.current;
            noise.loop = true;
            const noiseGain = ctx.createGain();
            noiseGain.gain.value = 0.015 * amount; // reduced from 0.03
            noise.connect(noiseGain);
            noiseGain.connect(output);
            noise.start();
            const shaper = ctx.createWaveShaper();
            const n = Math.floor(4 + (1 - amount) * 12); // less extreme quantization
            const curve = new Float32Array(8192);
            for (let i = 0; i < 8192; i++) {
              const x = (i * 2) / 8192 - 1;
              curve[i] = Math.round(x * n) / n;
            }
            shaper.curve = curve;
            shaper.oversample = '2x';
            const postGain = ctx.createGain();
            postGain.gain.value = 0.75;
            input.connect(filter);
            filter.connect(shaper);
            shaper.connect(postGain);
            postGain.connect(output);
            nodes.push(filter, noise, noiseGain, shaper, postGain);
          }
        }
      } catch (e) {
        console.error("Error setting up effect:", e);
        input.connect(output);
      }

      moduleRef.current.effectNodes = nodes;
    };

    updateModule(characterNodesRef, characterEffect, characterAmount, 'character');
    updateModule(movementNodesRef, movementEffect, movementAmount, 'movement');
    updateModule(diffusionNodesRef, diffusionEffect, diffusionAmount, 'diffusion');
    updateModule(textureNodesRef, textureEffect, textureAmount, 'texture');

    // Drone Module Effects
    updateModule(droneCharacterNodesRef, droneCharacterEffect, droneCharacterAmount, 'character');
    updateModule(droneMovementNodesRef, droneMovementEffect, droneMovementAmount, 'movement');
    updateModule(droneDiffusionNodesRef, droneDiffusionEffect, droneDiffusionAmount, 'diffusion');
    updateModule(droneTextureNodesRef, droneTextureEffect, droneTextureAmount, 'texture');

    // Sequencer Module Effects
    updateModule(seqCharacterNodesRef, seqCharacterEffect, seqCharacterAmount, 'character');
    updateModule(seqMovementNodesRef, seqMovementEffect, seqMovementAmount, 'movement');
    updateModule(seqDiffusionNodesRef, seqDiffusionEffect, seqDiffusionAmount, 'diffusion');
    updateModule(seqTextureNodesRef, seqTextureEffect, seqTextureAmount, 'texture');

  }, [
    characterEffect, characterAmount, movementEffect, movementAmount, diffusionEffect, diffusionAmount, textureEffect, textureAmount,
    droneCharacterEffect, droneCharacterAmount, droneMovementEffect, droneMovementAmount, droneDiffusionEffect, droneDiffusionAmount, droneTextureEffect, droneTextureAmount,
    seqCharacterEffect, seqCharacterAmount, seqMovementEffect, seqMovementAmount, seqDiffusionEffect, seqDiffusionAmount, seqTextureEffect, seqTextureAmount,
    isPlaying
  ]);

  const getAmountLabel = (type: 'character' | 'movement' | 'diffusion' | 'texture', effect: string) => {
    if (effect === 'none') return 'Amount';
    switch (type) {
      case 'character':
        if (effect === 'drive') return 'Drive';
        if (effect === 'sweeten') return 'Compression';
        if (effect === 'fuzz') return 'Fuzz';
        if (effect === 'howl') return 'Resonance';
        if (effect === 'swell') return 'Swell Time';
        if (effect === 'crush') return 'Bit Depth';
        return 'Amount';
      case 'movement':
        if (effect === 'doubler') return 'Delay';
        if (effect === 'vibrato') return 'Rate';
        if (effect === 'phaser') return 'Speed';
        if (effect === 'tremolo') return 'Rate';
        if (effect === 'pitch') return 'Shift';
        if (effect === 'vortex') return 'Feedback';
        return 'Rate / Depth';
      case 'diffusion':
        if (effect === 'cascade') return 'Feedback';
        if (effect === 'reels') return 'Wow/Flutter';
        if (effect === 'space') return 'Size';
        if (effect === 'collage') return 'Density';
        if (effect === 'reverse') return 'Time';
        if (effect === 'echo') return 'Feedback';
        return 'Decay / Mix';
      case 'texture':
        if (effect === 'filter') return 'Cutoff';
        if (effect === 'squash') return 'Threshold';
        if (effect === 'cassette') return 'Noise';
        if (effect === 'broken') return 'Bit Depth';
        if (effect === 'interference') return 'Static';
        if (effect === 'radio') return 'Tuning';
        return 'Grit / Filter';
      default:
        return 'Amount';
    }
  };

  const toggleWebcam = async () => {
    if (isWebcamActive) {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => track.stop());
        webcamStreamRef.current = null;
      }
      setIsWebcamActive(false);
      setMediaType('image');
      setIsLoaded(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        webcamStreamRef.current = stream;
        
        setIsWebcamActive(true);
        setMediaType('video'); // Treat webcam as video for sampling
        setImage(null);
        setVideoUrl(null);
        setIsLoaded(true);
        setIsPlaying(true);
        initAudio();
      } catch (err) {
        console.error("Error accessing webcam:", err);
        alert("Could not access webcam. Please check permissions.");
      }
    }
  };

  // Sync webcam stream to video element
  useEffect(() => {
    if (isWebcamActive && webcamStreamRef.current && webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = webcamStreamRef.current;
      webcamVideoRef.current.play().catch(err => console.error("Webcam play error:", err));
    }
  }, [isWebcamActive]);

  // Handle Media Upload
  const handleMediaUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (isWebcamActive) {
      toggleWebcam();
    }
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (isVideo) {
          setVideoUrl(result);
          setImage(null);
          setMediaType('video');
        } else {
          setImage(result);
          setVideoUrl(null);
          setMediaType('image');
        }
        setVideoRange([0, 100]);
        setScanTime(0);
        scanTimeRef.current = 0;
        setIsPlaying(false);
        setIsLoaded(true);
        initAudio();
      };
      reader.readAsDataURL(file);
    }
  };

  // Recording Compositing Loop — throttled to target FPS to avoid GPU overload
  useEffect(() => {
    if (!isRecording) return;

    const isFullCapture = recordingCapture === 'full';

    // For full-interface capture, getDisplayMedia handles everything — no compositing needed
    if (isFullCapture) return;

    // For visualization-only: composite onto the recording canvas
    if (!canvasRef.current) return;
    const recordingCanvas = canvasRef.current;
    const ctx = recordingCanvas.getContext('2d');
    if (!ctx) return;

    // Enable high-quality upscaling and configure context
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    let animationFrameId: number;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;
    let lastFrameTime = 0;

    const draw = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(draw);

      // Throttle to target FPS
      const elapsed = timestamp - lastFrameTime;
      if (elapsed < frameInterval) return;
      lastFrameTime = timestamp - (elapsed % frameInterval);

      const cw = recordingCanvas.width;
      const ch = recordingCanvas.height;

      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, cw, ch);

      // Draw media source — use object-fit cover style for vertical recordings
      let source: CanvasImageSource | null = null;
      let srcW = 0, srcH = 0;
      if (mediaType === 'image' && imageRef.current) {
        source = imageRef.current;
        srcW = imageRef.current.naturalWidth || imageRef.current.width;
        srcH = imageRef.current.naturalHeight || imageRef.current.height;
      } else if (mediaType === 'video' && videoRef.current) {
        source = videoRef.current;
        srcW = videoRef.current.videoWidth || videoRef.current.width;
        srcH = videoRef.current.videoHeight || videoRef.current.height;
      } else if (isWebcamActive && webcamVideoRef.current) {
        source = webcamVideoRef.current;
        srcW = webcamVideoRef.current.videoWidth || webcamVideoRef.current.width;
        srcH = webcamVideoRef.current.videoHeight || webcamVideoRef.current.height;
      }

      if (source && srcW > 0 && srcH > 0) {
        // Cover-fit: fill canvas while maintaining aspect ratio
        const scale = Math.max(cw / srcW, ch / srcH);
        const drawW = srcW * scale;
        const drawH = srcH * scale;
        const offsetX = (cw - drawW) / 2;
        const offsetY = (ch - drawH) / 2;
        ctx.drawImage(source, offsetX, offsetY, drawW, drawH);
      }

      // Overlay scan visuals
      if (visualsCanvasRef.current) {
        ctx.drawImage(visualsCanvasRef.current, 0, 0, cw, ch);
      }
    };
    animationFrameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRecording, mediaType, recordingCapture, isWebcamActive]);

  // Resolution presets
  const getRecordingDimensions = (res: typeof recordingResolution) => {
    switch (res) {
      case '720p': return { w: 1280, h: 720 };
      case '1080p': return { w: 1920, h: 1080 };
      case '1440p': return { w: 2560, h: 1440 };
      case '4k': return { w: 3840, h: 2160 };
      case '1080v': return { w: 1080, h: 1920 }; // 9:16 vertical
      case '1440v': return { w: 1440, h: 2560 }; // 9:16 vertical
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    if (!audioStreamDestRef.current) {
      initAudio();
    }

    recordedChunksRef.current = [];
    setRecordingElapsed(0);

    let stream: MediaStream;
    const isVideo = recordingMode === 'video' || recordingMode === 'both';
    const isAudio = recordingMode === 'audio' || recordingMode === 'both';
    const isFullCapture = recordingCapture === 'full';
    const { w: recW, h: recH } = getRecordingDimensions(recordingResolution);

    if (isVideo) {
      if (isFullCapture) {
        // Full interface capture via getDisplayMedia (screen capture)
        try {
          const displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: { width: { ideal: recW }, height: { ideal: recH }, frameRate: { ideal: 30 } },
            audio: false
          });
          const tracks = [...displayStream.getTracks()];
          // Mix in our audio
          if (isAudio && audioStreamDestRef.current) {
            tracks.push(...audioStreamDestRef.current.stream.getTracks());
          }
          stream = new MediaStream(tracks);
          // Stop recording if user cancels the screen share
          displayStream.getVideoTracks()[0].addEventListener('ended', () => {
            stopRecording();
          });
        } catch (err) {
          console.error("Screen capture denied:", err);
          return;
        }
      } else if (canvasRef.current) {
        // Visualization-only: set canvas to chosen resolution
        canvasRef.current.width = recW;
        canvasRef.current.height = recH;
        const canvasStream = canvasRef.current.captureStream(30);
        const tracks = [...canvasStream.getTracks()];
        if (isAudio && audioStreamDestRef.current) {
          tracks.push(...audioStreamDestRef.current.stream.getTracks());
        }
        stream = new MediaStream(tracks);
      } else {
        stream = audioStreamDestRef.current!.stream;
      }
    } else {
      stream = audioStreamDestRef.current!.stream;
    }

    // Bitrate settings based on quality
    let audioBitrate = 320000;
    let videoBitrate = 5000000;

    switch (recordingQuality) {
      case 'lossless':
        audioBitrate = 512000;
        videoBitrate = 15000000;
        break;
      case 'high':
        audioBitrate = 320000;
        videoBitrate = 8000000;
        break;
      case 'medium':
        audioBitrate = 192000;
        videoBitrate = 4000000;
        break;
      case 'low':
        audioBitrate = 96000;
        videoBitrate = 1500000;
        break;
    }

    const format = isVideo ? videoFormat : audioFormat;
    let mimeType = '';

    if (isVideo) {
      const mp4Types = [
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4;codecs=h264,aac',
        'video/mp4;codecs=h264',
        'video/mp4'
      ];
      const webmH264 = 'video/webm;codecs=h264';
      const webmVP9 = 'video/webm;codecs=vp9';

      if (videoFormat === 'mp4') {
        mimeType = mp4Types.find(t => MediaRecorder.isTypeSupported(t)) ||
                   (MediaRecorder.isTypeSupported(webmH264) ? webmH264 : 'video/webm');
      } else {
        mimeType = MediaRecorder.isTypeSupported(webmVP9) ? webmVP9 : 'video/webm';
      }
    } else {
      if (audioFormat === 'mp3') {
        mimeType = 'audio/mpeg';
      } else if (audioFormat === 'wav') {
        mimeType = 'audio/wav';
      } else if (audioFormat === 'flac') {
        mimeType = 'audio/flac';
      } else {
        mimeType = 'audio/webm;codecs=opus';
      }
    }

    // Final fallback
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = isVideo ? 'video/webm' : 'audio/webm';
    }

    const options = {
      mimeType,
      audioBitsPerSecond: audioBitrate,
      videoBitsPerSecond: videoBitrate,
    };

    const startTimer = () => {
      recordingStartTimeRef.current = Date.now();
      recordingTimerRef.current = setInterval(() => {
        setRecordingElapsed(Math.floor((Date.now() - recordingStartTimeRef.current) / 1000));
      }, 1000);
    };

    const stopTimer = () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    };

    try {
      const recorder = new MediaRecorder(stream, options);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      recorder.onstop = () => {
        stopTimer();
        const blob = new Blob(recordedChunksRef.current, { type: options.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = isVideo ? videoFormat : audioFormat;
        a.download = `chromesthesia-export-${new Date().getTime()}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
        setRecordingElapsed(0);
        // Stop any display media tracks
        stream.getTracks().forEach(t => { if (t.readyState === 'live' && t.kind === 'video') t.stop(); });
      };

      mediaRecorderRef.current = recorder;
      if (!isPlaying) setIsPlaying(true);
      setIsRecording(true);
      startTimer();
      recorder.start(1000); // 1s timeslice for chunked data collection
    } catch (err) {
      console.error("Failed to start recording:", err);
      try {
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        recorder.onstop = () => {
          stopTimer();
          const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `chromesthesia-export-${new Date().getTime()}.webm`;
          a.click();
          URL.revokeObjectURL(url);
          setIsRecording(false);
          setRecordingElapsed(0);
          stream.getTracks().forEach(t => { if (t.readyState === 'live' && t.kind === 'video') t.stop(); });
        };
        mediaRecorderRef.current = recorder;
        if (!isPlaying) setIsPlaying(true);
        setIsRecording(true);
        startTimer();
        recorder.start(1000);
      } catch (innerErr) {
        console.error("Absolute failure starting recorder:", innerErr);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };


  // Generate hallucinogenic procedural art — no API key or cost required
  const generateProceduralArt = useCallback((size: number = 512): string => {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d')!;
    const PI2 = Math.PI * 2;
    const rnd = Math.random;

    // Psychedelic palettes — saturated, neon, contrasting
    const palettes = [
      ['#ff0080', '#ff00ff', '#8000ff', '#0080ff', '#00ffff', '#00ff80'],
      ['#ff3300', '#ff9900', '#ffff00', '#33ff00', '#00ffcc', '#0033ff'],
      ['#ff006e', '#ff4dff', '#4dffff', '#ffff4d', '#ff4d4d', '#4dff4d'],
      ['#0affef', '#f72585', '#7209b7', '#3a86ff', '#ffbe0b', '#fb5607'],
      ['#39ff14', '#ff073a', '#0ff0fc', '#ff6eff', '#fff01f', '#ff6600'],
      ['#fe019a', '#bc13fe', '#05ffa1', '#01ff07', '#ffe800', '#ff6900'],
      ['#ff124f', '#ff00a0', '#fe75fe', '#7a04eb', '#120458', '#00d4ff'],
    ];
    const pal = palettes[Math.floor(rnd() * palettes.length)];
    const c0 = () => pal[Math.floor(rnd() * pal.length)];

    // Plasma field via pixel manipulation — pure hallucinogenic base
    const imgData = ctx.createImageData(size, size);
    const d = imgData.data;
    const seed = rnd() * 100;
    const f1 = 3 + rnd() * 8, f2 = 2 + rnd() * 6, f3 = 4 + rnd() * 10;
    const hueShift = rnd() * 360;
    for (let py = 0; py < size; py++) {
      for (let px = 0; px < size; px++) {
        const nx = px / size, ny = py / size;
        // Plasma formula: sum of sines at different frequencies/angles
        const v = (
          Math.sin(nx * f1 + seed) +
          Math.sin(ny * f2 + seed * 0.7) +
          Math.sin((nx + ny) * f3 * 0.5 + seed * 1.3) +
          Math.sin(Math.sqrt(
            (nx - 0.5 + Math.sin(seed * 0.1) * 0.3) ** 2 +
            (ny - 0.5 + Math.cos(seed * 0.1) * 0.3) ** 2
          ) * f1 * 2.5 + seed)
        ) / 4; // -1 to 1
        const hue = ((v + 1) * 180 + hueShift) % 360;
        const sat = 0.8 + v * 0.2;
        const lit = 0.35 + Math.abs(v) * 0.35;
        // HSL to RGB inline
        const hh = hue / 60, q = lit < 0.5 ? lit * (1 + sat) : lit + sat - lit * sat;
        const pp = 2 * lit - q;
        const hue2rgb = (t: number) => {
          if (t < 0) t += 1; if (t > 1) t -= 1;
          if (t < 1/6) return pp + (q - pp) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return pp + (q - pp) * (2/3 - t) * 6;
          return pp;
        };
        const i = (py * size + px) * 4;
        d[i]   = hue2rgb((hh + 2) / 6 % 1) * 255;
        d[i+1] = hue2rgb(hh / 6 % 1) * 255;
        d[i+2] = hue2rgb((hh - 2 + 6) / 6 % 1) * 255;
        d[i+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Layer multiple psychedelic passes on top
    const style = Math.floor(rnd() * 6);
    ctx.globalCompositeOperation = 'screen';

    if (style === 0) {
      // Fractal spiral bursts
      for (let burst = 0; burst < 4 + Math.floor(rnd() * 4); burst++) {
        const cx = rnd() * size, cy = rnd() * size;
        const arms = 3 + Math.floor(rnd() * 7);
        const turns = 2 + rnd() * 5;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.5);
        grad.addColorStop(0, c0()); grad.addColorStop(0.5, c0()); grad.addColorStop(1, 'transparent');
        ctx.save();
        ctx.globalAlpha = 0.4 + rnd() * 0.4;
        for (let arm = 0; arm < arms; arm++) {
          ctx.beginPath();
          ctx.strokeStyle = c0();
          ctx.lineWidth = 1 + rnd() * 6;
          const steps = 300;
          for (let s = 0; s < steps; s++) {
            const t = s / steps;
            const angle = (arm / arms) * PI2 + t * PI2 * turns;
            const r = t * size * 0.48;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.15;
        ctx.fillRect(0, 0, size, size);
        ctx.restore();
      }

    } else if (style === 1) {
      // Interference rings — concentric ripple collision
      const numCenters = 3 + Math.floor(rnd() * 4);
      const centers = Array.from({length: numCenters}, () => ({x: rnd() * size, y: rnd() * size, f: 8 + rnd() * 30}));
      const imgData2 = ctx.createImageData(size, size);
      const d2 = imgData2.data;
      for (let py = 0; py < size; py++) {
        for (let px = 0; px < size; px++) {
          let v = 0;
          for (const ctr of centers) {
            const dist = Math.sqrt((px - ctr.x) ** 2 + (py - ctr.y) ** 2);
            v += Math.sin(dist / size * ctr.f * PI2);
          }
          v = (v / numCenters + 1) / 2;
          const hue = (v * 360 * 3 + hueShift) % 360;
          const i = (py * size + px) * 4;
          d2[i]   = Math.sin(hue / 360 * PI2) * 127 + 128;
          d2[i+1] = Math.sin((hue / 360 + 0.333) * PI2) * 127 + 128;
          d2[i+2] = Math.sin((hue / 360 + 0.667) * PI2) * 127 + 128;
          d2[i+3] = Math.floor(v * 180 + 40);
        }
      }
      ctx.putImageData(imgData2, 0, 0);

    } else if (style === 2) {
      // Kaleidoscope petals
      const segments = (2 + Math.floor(rnd() * 5)) * 2;
      const cx = size / 2, cy = size / 2;
      ctx.save();
      ctx.translate(cx, cy);
      for (let seg = 0; seg < segments; seg++) {
        ctx.save();
        ctx.rotate((seg / segments) * PI2);
        ctx.globalAlpha = 0.5 + rnd() * 0.4;
        for (let i = 0; i < 8 + Math.floor(rnd() * 12); i++) {
          const t = i / 12;
          const r1 = t * size * 0.5, r2 = (t + 0.1) * size * 0.5;
          const a1 = (PI2 / segments) * rnd(), a2 = a1 + (PI2 / segments) * (0.5 + rnd() * 0.5);
          const grad = ctx.createRadialGradient(0, 0, r1, 0, 0, r2);
          grad.addColorStop(0, c0()); grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, r2, a1, a2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.restore();

    } else if (style === 3) {
      // Lissajous tunnel — overlapping parametric curves
      const freqs = [[3,2],[5,4],[7,6],[8,7],[5,3],[11,8]];
      const [fa, fb] = freqs[Math.floor(rnd() * freqs.length)];
      const layers = 18 + Math.floor(rnd() * 20);
      for (let l = 0; l < layers; l++) {
        const t = l / layers;
        const phase = rnd() * PI2;
        const r = (0.1 + t * 0.8) * size * 0.5;
        ctx.beginPath();
        ctx.strokeStyle = c0();
        ctx.lineWidth = 1 + (1 - t) * 8;
        ctx.globalAlpha = 0.25 + rnd() * 0.5;
        const steps = 500;
        for (let s = 0; s <= steps; s++) {
          const tt = (s / steps) * PI2;
          const x = size / 2 + Math.sin(fa * tt + phase) * r;
          const y = size / 2 + Math.sin(fb * tt) * r;
          s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

    } else if (style === 4) {
      // Mandala — recursive petal rings
      const rings = 5 + Math.floor(rnd() * 5);
      const cx = size / 2, cy = size / 2;
      for (let ring = 1; ring <= rings; ring++) {
        const petals = ring * (3 + Math.floor(rnd() * 3));
        const r = (ring / rings) * size * 0.47;
        const petalR = r * 0.45;
        for (let p = 0; p < petals; p++) {
          const angle = (p / petals) * PI2;
          const px2 = cx + Math.cos(angle) * r;
          const py2 = cy + Math.sin(angle) * r;
          const grad = ctx.createRadialGradient(px2, py2, 0, px2, py2, petalR);
          grad.addColorStop(0, c0()); grad.addColorStop(0.6, c0()); grad.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.fillStyle = grad;
          ctx.globalAlpha = 0.3 + rnd() * 0.45;
          ctx.arc(px2, py2, petalR, 0, PI2);
          ctx.fill();
        }
      }

    } else {
      // Wormhole — nested distorted ellipses zooming inward
      const cx = size * (0.3 + rnd() * 0.4), cy = size * (0.3 + rnd() * 0.4);
      const twist = (rnd() - 0.5) * 4;
      for (let i = 60; i > 0; i--) {
        const t = i / 60;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * twist);
        ctx.scale(1, 0.4 + rnd() * 0.6);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, t * size * 0.5);
        grad.addColorStop(0, c0()); grad.addColorStop(1, 'transparent');
        ctx.strokeStyle = c0();
        ctx.lineWidth = 2 + rnd() * 8;
        ctx.globalAlpha = 0.2 + rnd() * 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, t * size * 0.48, 0, PI2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Chromatic aberration overlay — splits RGB channels slightly for a trippy fringe
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.18;
    const aberrationCanvas = document.createElement('canvas');
    aberrationCanvas.width = size; aberrationCanvas.height = size;
    const aberCtx = aberrationCanvas.getContext('2d')!;
    aberCtx.drawImage(c, 0, 0);
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.25;
    ctx.drawImage(aberrationCanvas, -4, 2);  // red shift
    ctx.globalAlpha = 0.25;
    ctx.drawImage(aberrationCanvas, 4, -2);  // blue shift

    // Vignette
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.55;
    const vig = ctx.createRadialGradient(size/2, size/2, size * 0.15, size/2, size/2, size * 0.75);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, '#000000');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, size, size);

    return c.toDataURL('image/png');
  }, []);

  // Pre-select random image, patches, and presets on first load
  useEffect(() => {
    if (!image) {
      // Random optical synth patch
      const randomPatchIdx = Math.floor(Math.random() * PATCHES.length);
      applyPatch(randomPatchIdx);

      // Random drone patch
      const randomDronePatchIdx = Math.floor(Math.random() * DRONE_PATCHES.length);
      applyDronePatch(randomDronePatchIdx);

      // Random sequencer preset
      const randomSeqPresetIdx = Math.floor(Math.random() * SEQUENCER_PRESETS.length);
      applySequencerPreset(randomSeqPresetIdx);

      // Enable drone and sequencer
      setIsDroneEnabled(true);
      setIsDroneSequencerEnabled(true);

      // Random visual palette
      const randomPaletteIdx = Math.floor(Math.random() * VISUAL_PALETTES.length);
      setVisualPalette(VISUAL_PALETTES[randomPaletteIdx].colors);
      setVisualPaletteName(VISUAL_PALETTES[randomPaletteIdx].name);

      // Reset scan center
      setScanCenterX(0.5);
      setScanCenterY(0.5);

      // Generate procedural art
      setImage(generateProceduralArt(512));
      setMediaType('image');
      setIsLoaded(true);
      setIsSynthMatrixEnabled(true);
    }
  }, [generateProceduralArt]);

  const handleFeelingLucky = useCallback(async () => {
    if (isGeneratingArt) return;
    setIsGeneratingArt(true);

    // Start audio first (must be triggered directly from user gesture)
    await initAudio();

    // Yield to browser so spinner renders before heavy canvas work
    await new Promise(resolve => setTimeout(resolve, 30));

    try {
      // Pick a random patch
      const randomPatchIdx = Math.floor(Math.random() * PATCHES.length);
      applyPatch(randomPatchIdx);
      setScanTime(0);
      scanTimeRef.current = 0;

      // Reset scan center
      setScanCenterX(0.5);
      setScanCenterY(0.5);

      // Apply random drone patch
      const randomDronePatchIdx = Math.floor(Math.random() * DRONE_PATCHES.length);
      applyDronePatch(randomDronePatchIdx);

      // Apply random sequencer preset
      const randomSeqPresetIdx = Math.floor(Math.random() * SEQUENCER_PRESETS.length);
      applySequencerPreset(randomSeqPresetIdx);

      // Enable drone and sequencer
      setIsDroneEnabled(true);
      setIsDroneSequencerEnabled(true);

      // Randomize visual palette
      const randomPaletteIdx = Math.floor(Math.random() * VISUAL_PALETTES.length);
      setVisualPalette(VISUAL_PALETTES[randomPaletteIdx].colors);
      setVisualPaletteName(VISUAL_PALETTES[randomPaletteIdx].name);

      // Generate procedural art
      const imageUrl = generateProceduralArt(512);
      if (!imageUrl || imageUrl === 'data:,') throw new Error('canvas empty');
      setImage(imageUrl);
      setVideoUrl(null);
      setMediaType('image');
      setIsLoaded(true);
      setIsPlaying(true);
      setIsSynthMatrixEnabled(true);
    } catch (e) {
      // Fallback: solid gradient image via SVG data URL
      const hue = Math.floor(Math.random() * 360);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="hsl(${hue},80%,30%)"/><stop offset="100%" stop-color="hsl(${(hue+120)%360},80%,60%)"/></linearGradient></defs><rect width="512" height="512" fill="url(#g)"/></svg>`;
      setImage('data:image/svg+xml;base64,' + btoa(svg));
      setMediaType('image');
      setIsLoaded(true);
    } finally {
      setIsGeneratingArt(false);
    }
  }, [generateProceduralArt, applyPatch, applyDronePatch, applySequencerPreset, initAudio, isGeneratingArt]);

  const playStep = useCallback((vIdx: number, sIdx: number) => {
    if (!audioContextRef.current || !droneSequencerVoicesRef.current[vIdx]) return;
    const audioNow = audioContextRef.current.currentTime;
    const voice = droneSequencerVoicesRef.current[vIdx];
    const vSettings = droneSequencerVoices[vIdx];
    
    let midiNote = vSettings.pitch[sIdx];
    
    // Quantization Link
    if (droneSequencerLinkToMatrix) {
      const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
      const quantizedFreq = quantizeFrequency(freq, adjustedScale);
      midiNote = 69 + 12 * Math.log2(quantizedFreq / 440);
    }

    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const stepVol = vSettings.volume[sIdx] * droneSequencerMasterVolumesRef.current[vIdx];
    const adsr = vSettings.adsr;
    const duration = vSettings.duration[sIdx] ?? 0.5;
    const baseStepDuration = 60 / (bpm * 4); // 16th notes
    const noteDuration = baseStepDuration * duration;
    
    voice.osc.type = vSettings.type === 'auto' ? (vIdx === 3 ? 'square' : 'sine') : vSettings.type as OscillatorType;
    voice.osc.frequency.setValueAtTime(freq, audioNow);
    
    // Trigger ADSR
    voice.gain.gain.cancelScheduledValues(audioNow);
    voice.gain.gain.setValueAtTime(0, audioNow);
    voice.gain.gain.linearRampToValueAtTime(stepVol, audioNow + adsr.attack);
    voice.gain.gain.linearRampToValueAtTime(stepVol * adsr.sustain, audioNow + adsr.attack + adsr.decay);
    voice.gain.gain.setValueAtTime(stepVol * adsr.sustain, audioNow + noteDuration - adsr.release);
    voice.gain.gain.linearRampToValueAtTime(0, audioNow + noteDuration);
  }, [droneSequencerVoices, droneSequencerMasterVolumes, droneSequencerLinkToMatrix, scaleName, rootNoteIndex, adjustedScale, bpm]);

  const formulaXRef = useRef<Function | null>(null);
  const formulaYRef = useRef<Function | null>(null);

  useEffect(() => {
    try {
      formulaXRef.current = new Function('t', 'i', 'n', 'w', 'h', 'Math', `return ${formulaX}`);
      formulaYRef.current = new Function('t', 'i', 'n', 'w', 'h', 'Math', `return ${formulaY}`);
    } catch (e) {
      console.error("Formula compilation error:", e);
    }
  }, [formulaX, formulaY]);

  // Ref-based prop syncing for the audio loop — avoids 35-dependency useCallback
  const synthParamsRef = useRef({
    isPlaying, isSynthMatrixEnabled, isMuted, scanSpeed, baseFreq, freqRange,
    freqMod, ampMod, cutoffMod, qMod, voiceMappings, voiceWaveShapes,
    scanCenterX, scanCenterY, scanScale, scanPointSize, triggerThreshold, adsr,
    isWebcamActive, mediaType, isSequencerEnabled, bpm, adjustedScale,
    quantizeAmount, mutationAmount, isEvolving, mouseInfluence, enabledVoices,
    isScanSpeedSynced, isPerformanceMode, visualColorMode
  });
  synthParamsRef.current = {
    isPlaying, isSynthMatrixEnabled, isMuted, scanSpeed, baseFreq, freqRange,
    freqMod, ampMod, cutoffMod, qMod, voiceMappings, voiceWaveShapes,
    scanCenterX, scanCenterY, scanScale, scanPointSize, triggerThreshold, adsr,
    isWebcamActive, mediaType, isSequencerEnabled, bpm, adjustedScale,
    quantizeAmount, mutationAmount, isEvolving, mouseInfluence, enabledVoices,
    isScanSpeedSynced, isPerformanceMode, visualColorMode
  };

  // Sound Synthesis Loop — mount-only effect, reads all params from refs
  useEffect(() => {
    let alive = true;

    const updateSound = () => {
    if (!alive) return;

    const {
      isPlaying, isSynthMatrixEnabled, isMuted, scanSpeed, baseFreq, freqRange,
      freqMod, ampMod, cutoffMod, qMod, voiceMappings, voiceWaveShapes,
      scanCenterX, scanCenterY, scanScale, scanPointSize, triggerThreshold, adsr,
      isWebcamActive, mediaType, isSequencerEnabled, bpm, adjustedScale,
      quantizeAmount, mutationAmount, isEvolving, mouseInfluence, enabledVoices,
      isScanSpeedSynced, isPerformanceMode, visualColorMode
    } = synthParamsRef.current;

    if (!isPlaying || !isSynthMatrixEnabled || !samplingCanvasRef.current || !audioContextRef.current || oscillatorsRef.current.length === 0) {
      requestRef.current = requestAnimationFrame(updateSound);
      return;
    }

    // Performance mode: throttle to ~30fps by skipping every other frame
    if (isPerformanceMode && perfFrameCountRef.current++ % 2 !== 0) {
      requestRef.current = requestAnimationFrame(updateSound);
      return;
    }

    const canvas = samplingCanvasRef.current;

    // Cache the 2D context — getContext is non-trivial; no need to call every frame
    if (!samplingCtxRef.current) {
      samplingCtxRef.current = canvas.getContext('2d', { willReadFrequently: true });
    }
    const ctx = samplingCtxRef.current;
    if (!ctx) {
      requestRef.current = requestAnimationFrame(updateSound);
      return;
    }

    // Optimization: Limit sampling resolution for performance
    const sampleW = isPerformanceMode ? 160 : 320;
    const sampleH = isPerformanceMode ? 90 : 180;

    // If video or webcam, draw current frame to canvas every frame (content changes)
    if (isWebcamActive && webcamVideoRef.current) {
      const video = webcamVideoRef.current;
      if (video.readyState >= 2) {
        if (canvas.width !== sampleW || canvas.height !== sampleH) {
          canvas.width = sampleW;
          canvas.height = sampleH;
          samplingCtxRef.current = null;
          requestRef.current = requestAnimationFrame(updateSound);
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    } else if (mediaType === 'video' && videoRef.current) {
      const video = videoRef.current;
      if (video.videoWidth > 0) {
        if (canvas.width !== sampleW || canvas.height !== sampleH) {
          canvas.width = sampleW;
          canvas.height = sampleH;
          samplingCtxRef.current = null;
          requestRef.current = requestAnimationFrame(updateSound);
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    } else if (mediaType === 'image' && imageRef.current) {
      // For static images, only redraw when image or resolution changes; cache pixel data
      const img = imageRef.current;
      if (img.naturalWidth > 0) {
        const cacheKey = `${img.src}|${sampleW}x${sampleH}`;
        if (cacheKey !== cachedImageKeyRef.current || !cachedImageDataRef.current) {
          if (canvas.width !== sampleW || canvas.height !== sampleH) {
            canvas.width = sampleW;
            canvas.height = sampleH;
            samplingCtxRef.current = null;
            requestRef.current = requestAnimationFrame(updateSound);
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          cachedImageDataRef.current = ctx.getImageData(0, 0, sampleW, sampleH).data.slice();
          cachedImageKeyRef.current = cacheKey;
        }
      }
    }

    const currentW = canvas.width;
    const currentH = canvas.height;
    const n = SAMPLE_POINTS;

    // Increment scan time
    const now = performance.now();
    const deltaTime = (now - lastFrameTimeRef.current) / 1000;
    lastFrameTimeRef.current = now;

    let effectiveScanSpeed = scanSpeed;
    if (isScanSpeedSynced) {
      // Sync scan speed to BPM: 1.0 = 1 loop per 4 beats (standard bar)
      // We'll make scanSpeed a multiplier of this base sync
      effectiveScanSpeed = (bpm / 60) * 0.25 * scanSpeed;
    } else {
      // Maintain old behavior approximately (0.01 per frame at 60fps = 0.6 per second)
      effectiveScanSpeed = scanSpeed * 0.6;
    }

    scanTimeRef.current += (deltaTime * effectiveScanSpeed);
    let t = scanTimeRef.current;

    if (isSequencerEnabled) {
      const stepDuration = 60 / (bpm * 4); // 16th notes
      const currentStep = Math.floor(t / stepDuration);

      // Quantize time to steps
      t = currentStep * stepDuration;
    }

    if (phaseRef.current) {
      phaseRef.current.textContent = String(Math.floor(t));
    }

    const newPoints: {x: number, y: number}[] = [];

    const evalX = formulaXRef.current;
    const evalY = formulaYRef.current;

    if (!evalX || !evalY) {
      requestRef.current = requestAnimationFrame(updateSound);
      return;
    }

    // Use cached pixel data for static images; otherwise read from canvas
    const imageData = (mediaType === 'image' && cachedImageDataRef.current)
      ? cachedImageDataRef.current
      : ctx.getImageData(0, 0, currentW, currentH).data;

    // Precompute raw scan positions once — reused by both palette extraction and voice loop
    const rawX = new Float32Array(n);
    const rawY = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      rawX[i] = evalX(t, i, n, currentW, currentH, Math);
      rawY[i] = evalY(t, i, n, currentW, currentH, Math);
    }

    // Extract colors for auto palette — only do work on update frames
    if (visualColorMode === 'auto' && isPlaying && autoPaletteFrameCountRef.current++ % 6 === 0) {
      const newAutoPalette: string[] = [];
      for (let i = 0; i < SAMPLE_POINTS; i++) {
        const x = Math.floor(Math.max(0, Math.min(currentW - 1, rawX[i])));
        const y = Math.floor(Math.max(0, Math.min(currentH - 1, rawY[i])));
        const idx = (y * currentW + x) * 4;
        const compR = 255 - imageData[idx];
        const compG = 255 - imageData[idx + 1];
        const compB = 255 - imageData[idx + 2];
        newAutoPalette.push(`rgb(${compR}, ${compG}, ${compB})`);
      }
      setAutoPalette(newAutoPalette);
    }

    // Precompute constants outside the voice loop
    const mousePos = mousePosRef.current;
    const mouseRadius = currentW * 0.3;
    const mouseRadiusSq = mouseRadius * mouseRadius;
    const vizW = isPerformanceMode ? 320 : 640;
    const vizH = isPerformanceMode ? 180 : 360;
    const vizScaleX = vizW / currentW;
    const vizScaleY = vizH / currentH;

    // Evaluate formulas and sample
    const audioNow = audioContextRef.current.currentTime;
    const voiceStep = isPerformanceMode ? 2 : 1; // Skip alternate voices in perf mode
    for (let i = 0; i < SAMPLE_POINTS; i += voiceStep) {
      try {
        const { osc, noiseSource, gain, filter, panner } = oscillatorsRef.current[i];

        let x = rawX[i];
        let y = rawY[i];

        // Apply Mutation Offsets
        if (isEvolving) {
          x += mutationOffsetsRef.current[i].x * currentW * mutationAmount;
          y += mutationOffsetsRef.current[i].y * currentH * mutationAmount;
        }

        // Apply Scanner Transform (Center and Scale)
        x = (x - currentW/2) * scanScale + currentW * scanCenterX;
        y = (y - currentH/2) * scanScale + currentH * scanCenterY;

        // Apply Mouse Influence — use squared-distance check to avoid sqrt when out of range
        if (mousePos) {
          const dx = mousePos.x * currentW - x;
          const dy = mousePos.y * currentH - y;
          const distSq = dx * dx + dy * dy;
          if (distSq < mouseRadiusSq) {
            const force = (1 - Math.sqrt(distSq) / mouseRadius) * mouseInfluence;
            x += dx * force;
            y += dy * force;
          }
        }

        // Clamp to canvas bounds
        x = Math.max(0, Math.min(currentW - 1, x));
        y = Math.max(0, Math.min(currentH - 1, y));

        // Map to visual canvas coordinates (matching ScanningVisuals dimensions)
        newPoints.push({ x: x * vizScaleX, y: y * vizScaleY });

        if (!enabledVoices[i]) {
          gain.gain.setTargetAtTime(0, audioNow, 0.05);
          voiceStatesRef.current[i] = false;
          continue;
        }

        // Spatial averaging: sample area around scan point based on scanPointSize
        const sampleX = Math.floor(x);
        const sampleY = Math.floor(y);

        if (sampleX >= 0 && sampleX < currentW && sampleY >= 0 && sampleY < currentH) {
          let r: number, g: number, b: number;
          if (scanPointSize <= 1) {
            // Single pixel sampling (original behavior)
            const index = (sampleY * currentW + sampleX) * 4;
            r = imageData[index];
            g = imageData[index + 1];
            b = imageData[index + 2];
          } else {
            // Spatial averaging with stride — cap samples to ~25 max for performance
            const radius = Math.floor(scanPointSize / 2);
            const x0 = Math.max(0, sampleX - radius);
            const x1 = Math.min(currentW - 1, sampleX + radius);
            const y0 = Math.max(0, sampleY - radius);
            const y1 = Math.min(currentH - 1, sampleY + radius);
            const span = Math.max(x1 - x0, y1 - y0, 1);
            const stride = span > 5 ? Math.ceil(span / 5) : 1;
            let totalR = 0, totalG = 0, totalB = 0, count = 0;
            for (let py = y0; py <= y1; py += stride) {
              const rowBase = py * currentW;
              for (let px = x0; px <= x1; px += stride) {
                const idx = (rowBase + px) * 4;
                totalR += imageData[idx];
                totalG += imageData[idx + 1];
                totalB += imageData[idx + 2];
                count++;
              }
            }
            r = totalR / count;
            g = totalG / count;
            b = totalB / count;
          }

          const hsl = rgbToHsl(r, g, b);
          const traits: Record<ImageTrait, number> = {
            brightness: (r + g + b) / (3 * 255),
            hue: hsl.h,
            saturation: hsl.s,
            lightness: hsl.l,
            x: x / currentW,
            y: y / currentH
          };

          const voiceMapping = voiceMappings[i];
          const voiceAdsr = adsr[i];

          // Apply Mappings
          const freqTrait = traits[voiceMapping.frequency];
          let freq = baseFreq + (SAMPLE_POINTS - i) * (freqRange / SAMPLE_POINTS) + (freqTrait * freqMod);

          if (isSequencerEnabled) {
            const quantizedFreq = quantizeFrequency(freq, adjustedScale);
            freq = freq + (quantizedFreq - freq) * quantizeAmount;
          }

          const ampTrait = traits[voiceMapping.amplitude];
          const isTriggered = ampTrait > triggerThreshold;

          // Standard scanning synthesis for all voices
          osc.frequency.setTargetAtTime(freq, audioNow, 0.05);
          if (noiseSource) (noiseSource as any).playbackRate.setTargetAtTime(0, audioNow, 0.01);

          if (isTriggered && !voiceStatesRef.current[i]) {
            // GATE ON: Attack -> Decay -> Sustain
            voiceStatesRef.current[i] = true;
            const attackTime = Math.max(0.005, voiceAdsr.attack * traits[voiceMapping.attack] * 2);
            const decayTime = Math.max(0.005, voiceAdsr.decay * traits[voiceMapping.decay] * 2);
            const sustainLevel = voiceAdsr.sustain * traits[voiceMapping.sustain];
            const peakLevel = ampTrait * (1 / SAMPLE_POINTS) * ampMod * (isMuted ? 0 : 1);

            gain.gain.cancelScheduledValues(audioNow);
            gain.gain.setValueAtTime(gain.gain.value, audioNow);
            gain.gain.linearRampToValueAtTime(peakLevel, audioNow + attackTime);
            gain.gain.linearRampToValueAtTime(peakLevel * sustainLevel, audioNow + attackTime + decayTime);
          } else if (!isTriggered && voiceStatesRef.current[i]) {
            // GATE OFF: Release
            voiceStatesRef.current[i] = false;
            const releaseTime = Math.max(0.005, voiceAdsr.release * traits[voiceMapping.release] * 3);
            gain.gain.cancelScheduledValues(audioNow);
            gain.gain.setValueAtTime(gain.gain.value, audioNow);
            gain.gain.linearRampToValueAtTime(0, audioNow + releaseTime);
          }

          const cutoffTrait = traits[voiceMapping.cutoff];
          filter.frequency.setTargetAtTime(500 + cutoffTrait * cutoffMod, audioNow, 0.05);

          const qTrait = traits[voiceMapping.q];
          filter.Q.setTargetAtTime(qTrait * qMod, audioNow, 0.05);

          // filter.type is 'lowpass' by default and never changes — no need to set it each frame

          const panTrait = traits[voiceMapping.pan];
          const targetPan = (panTrait * 2) - 1; // Map 0..1 to -1..1
          panner.pan.setTargetAtTime(targetPan, audioNow, 0.05);

          // Update Mutation Offsets based on current traits
          if (isEvolving && isTriggered) {
            mutationOffsetsRef.current[i] = {
              x: (mutationOffsetsRef.current[i].x * 0.95) + (traits.hue - 0.5) * 0.1,
              y: (mutationOffsetsRef.current[i].y * 0.95) + (traits.brightness - 0.5) * 0.1
            };
          }

          // Only update oscillator wave type when it has actually changed
          const voiceWave = voiceWaveShapes[i];
          if (voiceWave === 'auto') {
            const newType: OscillatorType = hsl.h < 0.66 ? (hsl.h < 0.33 ? 'sine' : 'triangle') : 'sine';
            if (osc.type !== newType) osc.type = newType;
          } else if (voiceWave in WAVE_TABLES) {
            if (voiceWaveStateRef.current[i] !== voiceWave) {
              const periodicWave = periodicWavesRef.current[voiceWave];
              if (periodicWave) {
                osc.setPeriodicWave(periodicWave);
                voiceWaveStateRef.current[i] = voiceWave;
              }
            }
          } else {
            const wt = voiceWave as OscillatorType;
            if (osc.type !== wt) osc.type = wt;
          }
        }
      } catch (e) {
        console.error("Scanning error at point", i, e);
      }
    }
    scanPointsRef.current = newPoints;

    requestRef.current = requestAnimationFrame(updateSound);
    };

    // Start the loop
    requestRef.current = requestAnimationFrame(updateSound);
    return () => {
      alive = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mount-only: all params read from synthParamsRef

  // Play/pause side effects (video play/pause, oscillator fade-out)
  useEffect(() => {
    if (isPlaying) {
      if (videoRef.current) {
        videoRef.current.play().catch(e => console.error("Video play error:", e));
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      voiceStatesRef.current.fill(false);
      // Fade out all oscillators
      if (audioContextRef.current) {
        const now = audioContextRef.current.currentTime;
        oscillatorsRef.current.forEach(({ gain }) => {
          gain.gain.cancelScheduledValues(now);
          gain.gain.setTargetAtTime(0, now, 0.1);
        });
      }
    }
  }, [isPlaying]);

  // Keep volumeRef in sync so initAudio can read it without a stale closure
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  // Handle Master Volume
  useEffect(() => {
    if (masterGainRef.current && finalGainRef.current && synthMatrixGainRef.current && audioContextRef.current) {
      const targetVolume = (!isPlaying || isMuted) ? 0 : volume;
      const synthVolume = (!isPlaying || isMuted) ? 0 : synthMatrixVolume;
      const finalTarget = (!isPlaying || isMuted) ? 0 : 1;
      
      masterGainRef.current.gain.setTargetAtTime(targetVolume, audioContextRef.current.currentTime, 0.05);
      synthMatrixGainRef.current.gain.setTargetAtTime(synthVolume, audioContextRef.current.currentTime, 0.05);
      finalGainRef.current.gain.setTargetAtTime(finalTarget, audioContextRef.current.currentTime, 0.05);
    }
  }, [volume, synthMatrixVolume, isMuted, isPlaying]);

  // Update Master Bus Effects
  useEffect(() => {
    if (!audioContextRef.current) return;
    const now = audioContextRef.current.currentTime;

    // Master Reverb — wet/dry crossfade
    if (masterBusReverbWetRef.current && masterBusReverbDryRef.current) {
      masterBusReverbWetRef.current.gain.setTargetAtTime(masterReverbSend * 0.7, now, 0.05);
      masterBusReverbDryRef.current.gain.setTargetAtTime(1 - masterReverbSend * 0.3, now, 0.05);
    }

    // Master Compression — from transparent (0) to heavy glue (1)
    if (masterBusCompRef.current) {
      masterBusCompRef.current.threshold.value = masterCompression > 0 ? -6 - masterCompression * 24 : 0; // -6 to -30
      masterBusCompRef.current.ratio.value = 1 + masterCompression * 5; // 1:1 to 6:1
      masterBusCompRef.current.knee.value = 30 - masterCompression * 20; // soft to hard
    }

    // Master Saturation — from clean (0) to warm tape (1)
    if (masterBusSatRef.current && masterBusSatGainRef.current) {
      masterBusSatRef.current.curve = makeDistortionCurve(1 + masterSaturation * 6); // tanh(1-7)
      // Compensate for volume boost from saturation
      masterBusSatGainRef.current.gain.setTargetAtTime(1 / (1 + masterSaturation * 0.5), now, 0.05);
    }

    // Master Filter — LP sweep from 200Hz to 20kHz
    if (masterBusFilterRef.current) {
      // Exponential mapping: 0 = 200Hz, 1 = 20000Hz
      const freq = 200 * Math.pow(100, masterFilterCutoff);
      masterBusFilterRef.current.frequency.setTargetAtTime(Math.min(freq, 20000), now, 0.05);
    }
  }, [masterReverbSend, masterCompression, masterSaturation, masterFilterCutoff]);

  // Update Drone Module Parameters
  useEffect(() => {
    if (!audioContextRef.current || droneOscillatorsRef.current.length === 0) return;
    const now = audioContextRef.current.currentTime;

    // Update LFO
    if (droneLfoRef.current && droneLfoGainRef.current) {
      droneLfoRef.current.frequency.setTargetAtTime(droneLfoFreq, now, 0.1);
      droneLfoGainRef.current.gain.setTargetAtTime(droneLfoAmount, now, 0.1);

      // Disconnect from all possible targets first
      try {
        droneLfoGainRef.current.disconnect();
      } catch (e) {}

      // Connect to new target
      if (droneLfoAmount > 0) {
        droneOscillatorsRef.current.forEach((voice) => {
          if (droneLfoTarget === 'cutoff') {
            droneLfoGainRef.current?.connect(voice.filter.frequency);
          } else if (droneLfoTarget === 'pan') {
            droneLfoGainRef.current?.connect(voice.panner.pan);
          } else if (droneLfoTarget === 'volume') {
            droneLfoGainRef.current?.connect(voice.gain.gain);
          } else if (droneLfoTarget === 'spread') {
            droneLfoGainRef.current?.connect(voice.osc.detune);
          } else if (droneLfoTarget === 'resonance') {
            droneLfoGainRef.current?.connect(voice.filter.Q);
          }
        });
      }
    }

    if (droneSaturationNodeRef.current) {
      droneSaturationNodeRef.current.curve = makeDistortionCurve(droneSaturation * 100);
    }
    if (droneReverbGainRef.current) {
      droneReverbGainRef.current.gain.setTargetAtTime(droneReverbSend, now, 0.1);
    }

    droneOscillatorsRef.current.forEach((voice, i) => {
      const settings = droneVoices[i];
      const subVoice = droneSubOscillatorsRef.current[i];

      if (isDroneEnabled && isPlaying) {
        voice.osc.type = settings.type as OscillatorType;
        voice.osc.frequency.setTargetAtTime(settings.freq, now, 0.1);
        
        if (subVoice) {
          subVoice.osc.frequency.setTargetAtTime(settings.freq / 2, now, 0.1);
          subVoice.gain.gain.setTargetAtTime(settings.volume * droneMasterVolume * droneSubAmount, now, 0.1);
        }
        
        // Apply Spread to detune
        const spreadDetune = (i - 1.5) * droneSpread * 100; // Spread across voices
        voice.osc.detune.setTargetAtTime(settings.detune + spreadDetune, now, 0.1);
        
        voice.gain.gain.setTargetAtTime(settings.volume, now, 0.1);
        voice.panner.pan.setTargetAtTime(settings.pan, now, 0.1);
        voice.filter.frequency.setTargetAtTime(droneFilterCutoff, now, 0.1);
        voice.filter.Q.setTargetAtTime(droneFilterResonance, now, 0.1);
      } else {
        voice.gain.gain.setTargetAtTime(0, now, 0.1);
      }
    });

    if (droneUnitGainRef.current) {
      droneUnitGainRef.current.gain.setTargetAtTime(droneMasterVolume, now, 0.1);
    }
  }, [isDroneEnabled, droneVoices, droneMasterVolume, droneFilterCutoff, droneFilterResonance, isPlaying, droneSpread, droneLfoFreq, droneLfoAmount, droneLfoTarget, droneSaturation, droneReverbSend, droneSubAmount]);

  // Drone Sequencer Loop
  useEffect(() => {
    if (!isPlaying || !isDroneSequencerEnabled || !audioContextRef.current || droneSequencerVoicesRef.current.length === 0) {
      if (audioContextRef.current) {
        const now = audioContextRef.current.currentTime;
        droneSequencerVoicesRef.current.forEach(v => v.gain.gain.setTargetAtTime(0, now, 0.1));
      }
      return;
    }

    let lastTime = performance.now();
    let accumulatedTime = 0;

    let animationFrameId: number;
    const tick = () => {
      if (!isPlaying || !isDroneSequencerEnabled) return;

      const now = performance.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;
      accumulatedTime += deltaTime;

      const effectiveBpm = droneSequencerSyncToGlobal ? bpm : droneSequencerBpm;
      const baseStepDuration = 60 / (effectiveBpm * 4); // 16th notes
      const isEvenStep = droneSequencerLastStepRef.current % 2 === 0;
      const currentStepDuration = isEvenStep 
        ? baseStepDuration * (1 + droneSequencerSwing) 
        : baseStepDuration * (1 - droneSequencerSwing);

      if (accumulatedTime >= currentStepDuration) {
        accumulatedTime -= currentStepDuration;
        
        const nextStep = (droneSequencerLastStepRef.current + 1) % 16;
        droneSequencerLastStepRef.current = nextStep;
        setCurrentDroneStep(nextStep);

        // Generative Evolution
        if (isSequencerGenerative) {
          setDroneSequencerVoices(prev => {
            let newVoices: typeof prev | null = null;
            
            prev.forEach((voice, i) => {
              if (Math.random() < sequencerMutationRate) {
                if (!newVoices) {
                  newVoices = prev.map(v => ({
                    ...v,
                    steps: [...v.steps],
                    pitch: [...v.pitch],
                    duration: [...v.duration]
                  }));
                }
                
                const r = Math.random();
                if (r < 0.4) {
                  // Flip step
                  newVoices[i].steps[nextStep] = !newVoices[i].steps[nextStep];
                } else if (r < 0.7) {
                  // Shift pitch (within reasonable range)
                  const currentPitch = newVoices[i].pitch[nextStep];
                  const shift = Math.random() > 0.5 ? 2 : -2;
                  newVoices[i].pitch[nextStep] = Math.max(24, Math.min(108, currentPitch + shift));
                } else {
                  // Change duration
                  newVoices[i].duration[nextStep] = Math.random() * 0.9 + 0.1;
                }
              }
            });
            
            return newVoices || prev;
          });
        }

        const audioNow = audioContextRef.current!.currentTime;

        droneSequencerVoicesRef.current.forEach((voice, i) => {
          const vSettings = droneSequencerVoicesRefState.current[i];
          
          // Probability Check
          const prob = vSettings.probability[nextStep] ?? 1.0;
          const shouldTrigger = vSettings.steps[nextStep] && Math.random() < prob;

          if (shouldTrigger) {
            let midiNote = vSettings.pitch[nextStep];
            
            // Quantization Link
            if (droneSequencerLinkToMatrix) {
              const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
              const quantizedFreq = quantizeFrequency(freq, adjustedScale);
              midiNote = 69 + 12 * Math.log2(quantizedFreq / 440);
            }

            const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
            const stepVol = vSettings.volume[nextStep] * droneSequencerMasterVolumesRef.current[i];
            const adsr = vSettings.adsr;
            const duration = vSettings.duration[nextStep] ?? 0.5;
            const noteDuration = baseStepDuration * duration;
            
            voice.osc.type = vSettings.type === 'auto' ? (i === 3 ? 'square' : 'sine') : vSettings.type as OscillatorType;
            voice.osc.frequency.setValueAtTime(freq, audioNow);
            
            // Trigger ADSR
            voice.gain.gain.cancelScheduledValues(audioNow);
            voice.gain.gain.setValueAtTime(0, audioNow);
            voice.gain.gain.linearRampToValueAtTime(stepVol, audioNow + adsr.attack);
            voice.gain.gain.linearRampToValueAtTime(stepVol * adsr.sustain, audioNow + adsr.attack + adsr.decay);
            voice.gain.gain.setValueAtTime(stepVol * adsr.sustain, audioNow + noteDuration - adsr.release);
            voice.gain.gain.linearRampToValueAtTime(0, audioNow + noteDuration);
          }
        });
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, isDroneSequencerEnabled, droneSequencerBpm, droneSequencerLinkToMatrix, scaleName, rootNoteIndex, adjustedScale, droneSequencerSwing, isSequencerGenerative, sequencerMutationRate, droneSequencerSyncToGlobal, bpm]);

  // Optical Synth Evolution Effect
  useEffect(() => {
    if (!isEvolving || !isPlaying) return;

    const interval = setInterval(() => {
      // Modulate optical synth parameters — round to keep values clean
      setScanSpeed(prev => {
        const delta = (Math.random() - 0.5) * 0.05 * mutationAmount;
        return Math.round(Math.max(0.01, Math.min(2, prev + delta)) * 10) / 10;
      });

      setBaseFreq(prev => {
        const delta = (Math.random() - 0.5) * 10 * mutationAmount;
        return Math.round(Math.max(20, Math.min(440, prev + delta)));
      });

      setFreqRange(prev => {
        const delta = (Math.random() - 0.5) * 0.1 * mutationAmount;
        return Math.round(Math.max(0.1, Math.min(4, prev + delta)));
      });

      setCutoffMod(prev => {
        const delta = (Math.random() - 0.5) * 500 * mutationAmount;
        return Math.round(Math.max(0, Math.min(10000, prev + delta)));
      });

      setScanScale(prev => {
        const delta = (Math.random() - 0.5) * 0.1 * mutationAmount;
        return Math.round(Math.max(0.1, Math.min(5, prev + delta)) * 10) / 10;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isEvolving, isPlaying, mutationAmount]);

  // Drone Evolution Effect
  useEffect(() => {
    if (!isDroneEvolving || !isPlaying) return;

    const interval = setInterval(() => {
      // Modulate drone parameters slightly — round to keep values clean
      setDroneFilterCutoff(prev => {
        const delta = (Math.random() - 0.5) * 100 * droneEvolutionAmount;
        return Math.round(Math.max(100, Math.min(8000, prev + delta)));
      });

      setDroneSpread(prev => {
        const delta = (Math.random() - 0.5) * 0.1 * droneEvolutionAmount;
        return Math.round(Math.max(0, Math.min(1, prev + delta)) * 100) / 100;
      });

      setDroneLfoFreq(prev => {
        const delta = (Math.random() - 0.5) * 0.2 * droneEvolutionAmount;
        return Math.round(Math.max(0.01, Math.min(10, prev + delta)) * 10) / 10;
      });

      setDroneVoices(prev => prev.map(v => ({
        ...v,
        detune: Math.round(v.detune + (Math.random() - 0.5) * 4 * droneEvolutionAmount),
        pan: Math.round(Math.max(-1, Math.min(1, v.pan + (Math.random() - 0.5) * 0.1 * droneEvolutionAmount)) * 100) / 100
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, [isDroneEvolving, isPlaying, droneEvolutionAmount]);

  // Visuals Evolution Effect
  useEffect(() => {
    if (!isVisualsEvolving || !isPlaying) return;

    const interval = setInterval(() => {
      // Modulate visual parameters
      if (visualColorMode === 'preset') {
        setVisualPalette(prev => prev.map(color => {
          // Subtle color shifting
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          
          const shift = () => (Math.random() - 0.5) * 10 * visualsEvolutionAmount;
          const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
          
          const newR = clamp(r + shift());
          const newG = clamp(g + shift());
          const newB = clamp(b + shift());
          
          return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
        }));
      }

      setQuantizeAmount(prev => {
        const delta = (Math.random() - 0.5) * 0.05 * visualsEvolutionAmount;
        return Math.round(Math.max(0, Math.min(1, prev + delta)) * 100) / 100;
      });

      // Occasionally cycle background filter
      if (Math.random() < 0.1 * visualsEvolutionAmount) {
        const filters: ('none' | 'lens-flare' | 'trippy' | 'subtle')[] = ['none', 'lens-flare', 'trippy', 'subtle'];
        setVisualBackgroundFilter(filters[Math.floor(Math.random() * filters.length)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisualsEvolving, isPlaying, visualsEvolutionAmount, visualColorMode]);

  // Linked Evolution Logic
  useEffect(() => {
    if (!isEvolutionLinked) return;
    
    // If linked, sync all evolution states and amounts to the visuals one
    setIsEvolving(isVisualsEvolving);
    setIsDroneEvolving(isVisualsEvolving);
    setIsSequencerGenerative(isVisualsEvolving);
    
    setMutationAmount(visualsEvolutionAmount);
    setDroneEvolutionAmount(visualsEvolutionAmount);
    setSequencerMutationRate(visualsEvolutionAmount);
  }, [isEvolutionLinked, isVisualsEvolving, visualsEvolutionAmount]);

  // Handle Video Audio Routing
  useEffect(() => {
    if (!audioContextRef.current || !videoRef.current || !masterGainRef.current) return;
    
    const ctx = audioContextRef.current;
    const video = videoRef.current;
    
    if (!videoAudioSourceRef.current) {
      try {
        videoAudioSourceRef.current = ctx.createMediaElementSource(video);
      } catch (e) {
        console.warn("Could not create media element source:", e);
      }
    }
    
    if (videoAudioSourceRef.current) {
      videoAudioSourceRef.current.disconnect();
      video.muted = false;
      if (isVideoAudioRouted) {
        videoAudioSourceRef.current.connect(masterGainRef.current);
      } else {
        videoAudioSourceRef.current.connect(ctx.destination);
      }
    }
  }, [isVideoAudioRouted, videoUrl, isLoaded]);

  // Draw Visualizer
  useEffect(() => {
    const visualizerCanvas = visualizerCanvasRef.current;
    if (!visualizerCanvas || !analyserRef.current) return;

    const ctx = visualizerCanvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let animationFrameId: number;
    const draw = () => {
      animationFrameId = requestAnimationFrame(draw);
      if (!isPlaying) {
        ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
        return;
      }
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
      const barWidth = (visualizerCanvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * visualizerCanvas.height;
        ctx.fillStyle = `rgba(29, 29, 31, ${dataArray[i] / 255 * 0.5})`;
        ctx.fillRect(x, visualizerCanvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isLoaded, isPlaying]);

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !showSettings && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
      if (e.key.toLowerCase() === 'e' && !showSettings && document.activeElement?.tagName !== 'INPUT') {
        setIsEvolving(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSettings]);

  return (
    <div ref={appContainerRef} className="min-h-screen text-white font-sans selection:bg-black selection:text-white overflow-hidden flex flex-col relative">
      {/* Dedicated Psychedelic Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020617]">
        <motion.div 
          className="absolute inset-[-30%] bg-psychedelic animate-slow-hue opacity-60" 
          style={{ willChange: 'transform', mixBlendMode: 'screen' }}
          animate={{
            scale: [1, 1.15, 1.1, 1.25, 1],
            rotate: [0, 10, -10, 5, 0],
            x: ["-3%", "3%", "-1%", "2%", "-3%"],
            y: ["-2%", "1%", "2%", "-1%", "-2%"],
          }}
          transition={{
            duration: 90,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute inset-[-30%] bg-psychedelic animate-slow-hue opacity-50" 
          style={{ willChange: 'transform', animationDelay: '-30s', mixBlendMode: 'multiply' }}
          animate={{
            scale: [1.2, 1, 1.25, 1.1, 1.2],
            rotate: [0, -10, 10, -5, 0],
            x: ["2%", "-2%", "1%", "-3%", "2%"],
            y: ["1%", "-2%", "-1%", "2%", "1%"],
          }}
          transition={{
            duration: 110,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute inset-[-30%] bg-psychedelic animate-slow-hue opacity-30" 
          style={{ willChange: 'transform', animationDelay: '-60s', mixBlendMode: 'multiply' }}
          animate={{
            scale: [1.1, 1.2, 1, 1.15, 1.1],
            rotate: [-5, 5, -5, 5, -5],
            x: ["-1%", "2%", "-2%", "1%", "-1%"],
            y: ["1%", "-1%", "2%", "-1%", "1%"],
          }}
          transition={{
            duration: 130,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Background Media - Full Screen */}
      <AnimatePresence mode="wait">
        {(image || videoUrl || isWebcamActive) && (
          <motion.div 
            key={isWebcamActive ? 'webcam' : (videoUrl ? 'video' : 'image')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5]"
          >
            {isWebcamActive && (
              <video
                ref={webcamVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover opacity-90 grayscale-0 brightness-[0.9] cursor-crosshair"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  mousePosRef.current = {
                    x: (e.clientX - rect.left) / rect.width,
                    y: (e.clientY - rect.top) / rect.height
                  };
                }}
                onMouseLeave={() => {
                  mousePosRef.current = null;
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width;
                  const y = (e.clientY - rect.top) / rect.height;
                  setScanCenterX(x);
                  setScanCenterY(y);
                }}
              />
            )}
            {isWebcamActive && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
              </div>
            )}
            {mediaType === 'image' && image && (
              <img 
                ref={imageRef}
                src={image} 
                alt="Background" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-80 cursor-crosshair"
                style={{ filter: getBackgroundFilter() }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  mousePosRef.current = {
                    x: (e.clientX - rect.left) / rect.width,
                    y: (e.clientY - rect.top) / rect.height
                  };
                }}
                onMouseLeave={() => {
                  mousePosRef.current = null;
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width;
                  const y = (e.clientY - rect.top) / rect.height;
                  setScanCenterX(x);
                  setScanCenterY(y);
                }}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  const canvas = canvasRef.current;
                  if (canvas) {
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0);
                  }
                }}
              />
            )}
            {mediaType === 'image' && image && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
              </div>
            )}
            {mediaType === 'video' && videoUrl && (
              <video
                ref={videoRef}
                src={videoUrl}
                loop
                playsInline
                autoPlay
                crossOrigin="anonymous"
                className="w-full h-full object-cover opacity-80 cursor-crosshair"
                style={{ filter: getBackgroundFilter() }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  mousePosRef.current = {
                    x: (e.clientX - rect.left) / rect.width,
                    y: (e.clientY - rect.top) / rect.height
                  };
                }}
                onMouseLeave={() => {
                  mousePosRef.current = null;
                }}
                onCanPlay={(e) => {
                  if (isPlaying) {
                    const video = e.currentTarget;
                    if (video.paused) {
                      video.play().catch(err => {
                        console.warn("Autoplay blocked or failed:", err);
                        // If blocked, we might need a user interaction to start audio
                      });
                    }
                  }
                }}
                onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
                onError={(e) => {
                  const video = e.currentTarget;
                  console.error("Video play error:", video.error?.message || "Unknown error", "Source:", video.src);
                  setError(`Video play error: ${video.error?.message || "The element has no supported sources."}`);
                }}
                onTimeUpdate={(e) => {
                  const video = e.currentTarget;
                  setVideoCurrentTime(video.currentTime);
                  
                  // Handle loop range
                  const start = (videoRange[0] / 100) * video.duration;
                  const end = (videoRange[1] / 100) * video.duration;
                  if (video.currentTime >= end) {
                    video.currentTime = start;
                  }
                  if (video.currentTime < start) {
                    video.currentTime = start;
                  }
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width;
                  const y = (e.clientY - rect.top) / rect.height;
                  setScanCenterX(x);
                  setScanCenterY(y);
                }}
              />
            )}
            <canvas ref={canvasRef} width={1280} height={720} style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }} />
            <canvas ref={samplingCanvasRef} width={640} height={360} className="hidden" />
            
            {/* Scan Points Visualization - Optimized Canvas Component */}
            {isVisualsEnabled && (
              <ScanningVisuals
                pointsRef={scanPointsRef}
                canvasRef={visualsCanvasRef}
                width={isPerformanceMode ? 320 : 640}
                height={isPerformanceMode ? 180 : 360}
                isPlaying={isPlaying}
                transparency={0.6}
                colorMode={visualColorMode}
                manualColor="#ffffff"
                palette={visualColorMode === 'auto' ? autoPalette : (visualColorMode === 'preset' ? visualPalette : [])}
                trippy={0}
                subtle={0}
                performanceMode={isPerformanceMode}
                pointSize={scanPointSize}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header 
        animate={{ 
          y: [0, -1, 0],
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="px-4 py-2 flex flex-col lg:flex-row justify-between items-center gap-3 border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-xl z-20 relative"
      >
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md transform -rotate-2 hover:rotate-0 transition-transform duration-500">
              <Activity className="text-white w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter uppercase text-white leading-none">Chromesthesia</h1>
              <p className="text-[7px] text-white/40 uppercase tracking-[0.4em] font-bold mt-0.5">Optical Synthesizer</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 sm:gap-3 w-full lg:w-auto">
          {/* Streamlined Global Bar */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 shadow-inner">
            <div className="flex items-center gap-1.5 px-1.5">
              <button 
                onClick={async () => {
                  await initAudio();
                  setIsPlaying(!isPlaying);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isPlaying
                    ? 'bg-pedal-accent text-white shadow-[0_0_12px_rgba(255,59,48,0.4)]'
                    : 'bg-white/10 text-white/20 hover:bg-white/20'
                }`}
                title={isPlaying ? "Stop" : "Play"}
              >
                {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-4 h-4" />}
              </button>

              <button 
                onClick={handleReset}
                className="w-7 h-7 flex items-center justify-center hover:bg-white/5 rounded-full transition-colors text-white/20 hover:text-white"
                title="Reset Optical Synth"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center bg-white/5 rounded-full border border-white/10 p-0.5">
                <button
                  onClick={() => isRecording ? stopRecording() : startRecording()}
                  className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white shadow-lg animate-pulse'
                      : 'hover:bg-white/5 text-white/20 hover:text-red-500'
                  }`}
                  title={isRecording ? "Stop Recording" : "Start Recording"}
                >
                  <Circle className={`w-3.5 h-3.5 ${isRecording ? 'fill-current' : ''}`} />
                </button>
                {isRecording && (
                  <span className="text-[10px] font-mono font-bold text-red-400 px-1.5 tabular-nums min-w-[36px] text-center">
                    {formatRecordingTime(recordingElapsed)}
                  </span>
                )}
                <div className="w-px h-3 bg-white/10 mx-0.5" />
                <button
                  onClick={() => setShowRecordingSettings(!showRecordingSettings)}
                  className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                    showRecordingSettings
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'hover:bg-white/5 text-white/20 hover:text-white'
                  }`}
                  title="Recording Settings"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="w-px h-5 bg-white/10" />

            <div className="flex items-center gap-2 px-2">
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className="text-white/40 hover:text-white transition-colors flex items-center justify-center h-7 w-7"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <div className="flex items-center h-7">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={volume} 
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-14 sm:w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            <div className="w-px h-5 bg-white/10" />

            <div className="hidden xl:flex items-center px-1.5">
              <div className="w-20 h-5 relative bg-white/5 rounded-md overflow-hidden border border-white/10">
                <canvas ref={visualizerCanvasRef} id="visualizer" width="80" height="20" className="w-full h-full opacity-50" />
              </div>
            </div>

            <div className="w-px h-5 bg-white/10" />

            <div className="flex flex-col items-end px-2 min-w-[44px] justify-center h-7">
              <span className="text-[5px] font-mono text-white/20 uppercase tracking-widest font-bold leading-none mb-0.5">Phase</span>
              <span ref={phaseRef} className="text-[10px] font-mono font-medium tabular-nums text-white leading-none">
                {Math.floor(scanTime)}
              </span>
            </div>
          </div>

          {/* Streamlined Module Toggles */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            {/* Synth Matrix */}
            <div className={`flex items-center rounded-lg transition-all duration-300 overflow-hidden ${
              showSettings 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-transparent text-white/40'
            }`}>
              <button 
                onClick={async () => {
                  const nextState = !isSynthMatrixEnabled;
                  setIsSynthMatrixEnabled(nextState);
                  if (nextState && !isPlaying) {
                    await initAudio();
                    setIsPlaying(true);
                  }
                }}
                className={`px-2 py-2 hover:bg-white/10 transition-colors border-r ${showSettings ? 'border-white/10' : 'border-white/5'}`}
                title="Toggle Optical Synth"
              >
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isSynthMatrixEnabled ? 'bg-white animate-pulse' : 'bg-white/20'}`} />
              </button>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="px-2.5 py-2 flex items-center gap-1.5 hover:bg-white/10 transition-colors"
                title="Optical Settings"
              >
                <Settings2 className="w-3 h-3 opacity-70" />
                <span className="text-[8px] font-black uppercase tracking-widest">Optical</span>
              </button>
            </div>

            {/* Drone Unit */}
            <div className={`flex items-center rounded-lg transition-all duration-300 overflow-hidden ${
              showDroneModule 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-transparent text-white/40'
            }`}>
              <button 
                onClick={async () => {
                  const nextState = !isDroneEnabled;
                  setIsDroneEnabled(nextState);
                  if (nextState && !isPlaying) {
                    await initAudio();
                    setIsPlaying(true);
                  }
                }}
                className={`px-2 py-2 hover:bg-white/10 transition-colors border-r ${showDroneModule ? 'border-white/10' : 'border-white/5'}`}
                title="Toggle Drone"
              >
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isDroneEnabled ? 'bg-white animate-pulse' : 'bg-white/20'}`} />
              </button>
              <button 
                onClick={() => setShowDroneModule(!showDroneModule)}
                className="px-2.5 py-2 flex items-center gap-1.5 hover:bg-white/10 transition-colors"
                title="Drone Settings"
              >
                <Layers className="w-3 h-3 opacity-70" />
                <span className="text-[8px] font-black uppercase tracking-widest">Drone</span>
              </button>
            </div>

            {/* Drone Seq */}
            <div className={`flex items-center rounded-lg transition-all duration-300 overflow-hidden ${
              showSequencerModule 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'bg-transparent text-white/40'
            }`}>
              <button 
                onClick={async () => {
                  const nextState = !isDroneSequencerEnabled;
                  setIsDroneSequencerEnabled(nextState);
                  if (nextState && !isPlaying) {
                    await initAudio();
                    setIsPlaying(true);
                  }
                }}
                className={`px-2 py-2 hover:bg-white/10 transition-colors border-r ${showSequencerModule ? 'border-white/10' : 'border-white/5'}`}
                title="Toggle Sequencer"
              >
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${isDroneSequencerEnabled ? 'bg-white animate-pulse' : 'bg-white/20'}`} />
              </button>
              <button 
                onClick={() => setShowSequencerModule(!showSequencerModule)}
                className="px-2.5 py-2 flex items-center gap-1.5 hover:bg-white/10 transition-colors"
                title="Sequencer Settings"
              >
                <Zap className="w-3 h-3 opacity-70" />
                <span className="text-[8px] font-black uppercase tracking-widest">Seq</span>
              </button>
            </div>

            {/* Visuals Settings */}
            <div className={`flex items-center rounded-lg transition-all duration-300 overflow-hidden ${
              showVisualsModule
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-transparent text-white/40'
            }`}>
              <button
                onClick={() => setIsVisualsEnabled(!isVisualsEnabled)}
                className={`px-2 py-2 hover:bg-white/10 transition-colors border-r ${showVisualsModule ? 'border-white/10' : 'border-white/5'}`}
                title={isVisualsEnabled ? 'Hide Scan Overlay' : 'Show Scan Overlay'}
              >
                <Eye className={`w-3 h-3 transition-all duration-300 ${isVisualsEnabled ? 'opacity-100' : 'opacity-30'}`} />
              </button>
              <button
                onClick={() => setShowVisualsModule(!showVisualsModule)}
                className="px-2.5 py-2 flex items-center gap-1.5 hover:bg-white/10 transition-colors"
                title="Visual Settings"
              >
                <Sparkles className="w-3 h-3 opacity-70" />
                <span className="text-[8px] font-black uppercase tracking-widest">Visuals</span>
              </button>
            </div>

            <div className="w-px h-5 bg-white/10 mx-0.5" />

            {/* Performance Mode */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsPerformanceMode(true);
                setShowSettings(true);
                setShowDroneModule(true);
                setShowSequencerModule(true);
                setShowVisualsModule(true);
                setShowMixer(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 bg-white/5 text-white/40 hover:bg-white/10"
            >
              <Activity className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">Perf</span>
            </motion.button>

            {isPerformanceMode && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeAllPanels}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all duration-300"
                title="Close All Panels"
              >
                <XCircle className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">Close All</span>
              </motion.button>
            )}

            {/* Mixer */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowMixer(!showMixer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                showMixer 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-white/10 text-white/40 hover:bg-white/20'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">Mixer</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main 
        animate={{ 
          scale: [1, 1.005, 1],
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="flex-1 relative flex flex-col items-center justify-center p-4 z-10 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {(!image && !videoUrl && !isWebcamActive) ? null : (
            <div className="w-full h-full flex flex-col items-center justify-end pb-12">
              {/* Video Scrubber */}
              {mediaType === 'video' && videoUrl && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 w-full max-w-2xl bg-black/5 p-6 rounded-3xl border border-black/5 shadow-inner"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-[10px] text-white/40 uppercase tracking-widest">
                      <div className="flex items-center gap-4">
                        <span>Video Loop Range</span>
                        <button 
                          onClick={() => setIsVideoAudioRouted(!isVideoAudioRouted)}
                          className={`px-2 py-0.5 rounded border transition-colors ${isVideoAudioRouted ? 'bg-synth-accent/20 border-synth-accent text-synth-accent' : 'border-white/10 hover:bg-white/5'}`}
                        >
                          Route Audio to Effects: {isVideoAudioRouted ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono">
                          {Math.round((videoRange[0] / 100) * videoDuration * 10) / 10}s - {Math.round((videoRange[1] / 100) * videoDuration * 10) / 10}s
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative h-6 flex items-center">
                      {/* Track */}
                      <div className="absolute inset-0 h-1 bg-black/5 rounded-full my-auto" />
                      
                      {/* Active Range */}
                      <div 
                        className="absolute h-1 bg-white/40 rounded-full my-auto"
                        style={{ 
                          left: `${videoRange[0]}%`, 
                          width: `${videoRange[1] - videoRange[0]}%` 
                        }}
                      />
                      
                      {/* Playhead */}
                      <div 
                        className="absolute h-full w-0.5 bg-white z-10 transition-all duration-100"
                        style={{ left: `${(videoCurrentTime / videoDuration) * 100}%` }}
                      />

                      {/* Start Handle */}
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={videoRange[0]}
                        onChange={(e) => {
                          const val = Math.min(parseFloat(e.target.value), videoRange[1] - 1);
                          setVideoRange([val, videoRange[1]]);
                          if (videoRef.current) {
                            videoRef.current.currentTime = (val / 100) * videoDuration;
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />
                      
                      {/* End Handle */}
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={videoRange[1]}
                        onChange={(e) => {
                          const val = Math.max(parseFloat(e.target.value), videoRange[0] + 1);
                          setVideoRange([videoRange[0], val]);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />
                      
                      {/* Visual Handles */}
                      <div 
                        className="absolute w-3 h-3 bg-white rounded-full border-2 border-black pointer-events-none"
                        style={{ left: `calc(${videoRange[0]}% - 6px)` }}
                      />
                      <div 
                        className="absolute w-3 h-3 bg-white rounded-full border-2 border-black pointer-events-none"
                        style={{ left: `calc(${videoRange[1]}% - 6px)` }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

            </div>
          )}
        </AnimatePresence>
      </motion.main>

      {/* Footer Info */}
      <div className="relative z-20">
        <AnimatePresence>
          {showManual && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden w-full glass-dark border-t border-white/10"
            >
              <div className="max-w-7xl mx-auto p-8 relative">
                <button 
                  onClick={() => setShowManual(false)}
                  className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 bg-synth-accent rounded-2xl flex items-center justify-center shadow-lg shadow-synth-accent/20">
                    <BookOpen className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Synesthchroming for beginners</h2>
                    <p className="text-[10px] text-synth-accent uppercase tracking-[0.4em] font-bold">Comprehensive Guide & Operational Manual</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="glass-dark rounded-3xl p-8 space-y-4 border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <Play className="w-5 h-5 text-synth-accent" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tighter text-white">Getting Started</h3>
                    <p className="text-xs text-white/70 leading-relaxed font-medium">
                      Load an image, video, or activate your webcam to provide visual input. Press the **Play** button to engage the scanning engine. Use the **Master Mixer** to balance the levels between the Optical Synth, Drone Unit, and Poly Sequencer.
                    </p>
                  </div>

                  <div className="glass-dark rounded-3xl p-8 space-y-4 border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tighter text-white">Core Modules</h3>
                    <p className="text-xs text-white/70 leading-relaxed font-medium">
                      **Optical Synth**: Translates pixels into 16 voices (Hue = Pitch, Brightness = Volume). **Drone Unit**: Generates evolving atmospheric textures. **Poly Sequencer**: Creates rhythmic patterns and melodies synced to the global BPM.
                    </p>
                  </div>

                  <div className="glass-dark rounded-3xl p-8 space-y-4 border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tighter text-white">Evolution Engine</h3>
                    <p className="text-xs text-white/70 leading-relaxed font-medium">
                      Engage the **Evolution** controls to add organic mutation to your patches. When **Link All Evolution** is active, all modules synchronize their generative behavior to the Visuals Evolution settings for a cohesive sonic journey.
                    </p>
                  </div>

                  <div className="glass-dark rounded-3xl p-8 space-y-4 border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tighter text-white">Tips & Tricks</h3>
                    <ul className="space-y-3">
                      <li className="flex flex-col gap-1">
                        <span className="text-[10px] text-synth-accent font-black uppercase tracking-widest">High Contrast</span>
                        <p className="text-[10px] text-white/50 leading-tight">Use images with strong light/dark areas for dramatic rhythmic patterns.</p>
                      </li>
                      <li className="flex flex-col gap-1">
                        <span className="text-[10px] text-synth-accent font-black uppercase tracking-widest">AI Synergy</span>
                        <p className="text-[10px] text-white/50 leading-tight">Use "I'm Feeling Lucky" to generate a random hallucinogenic image and patch — no AI needed.</p>
                      </li>
                      <li className="flex flex-col gap-1">
                        <span className="text-[10px] text-synth-accent font-black uppercase tracking-widest">Spectral Sculpting</span>
                        <p className="text-[10px] text-white/50 leading-tight">Adjust Scan Speed and Scale to find the "sweet spot" for each visual.</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.footer 
          animate={{ 
            y: [0, 2, 0],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="p-8 flex justify-between items-center text-[10px] text-white/40 uppercase tracking-[0.3em] font-black border-t border-white/10 bg-[#0f172a]/80 backdrop-blur-xl relative"
        >
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setShowManual(!showManual)}
              className="flex items-center gap-2 hover:text-white transition-colors group"
            >
              <BookOpen className="w-3 h-3 group-hover:text-synth-accent transition-colors" />
              <span>Synesthchroming for beginners</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleFeelingLucky}
                disabled={isGeneratingArt}
                className="flex items-center gap-2 px-4 py-2 rounded-full transition-all group shadow-sm active:scale-95 border border-white/10 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed bg-white/5 text-white hover:bg-white/10"
              >
                <Sparkles className={`w-4 h-4 transition-transform ${isGeneratingArt ? 'animate-spin' : 'group-hover:rotate-12'}`} />
                <span className="font-black uppercase tracking-widest text-[10px]">
                  {isGeneratingArt ? 'Generating…' : "I'm Feeling Lucky"}
                </span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <button
              onClick={handleFeelingLucky}
              disabled={isGeneratingArt}
              className="text-white/20 font-bold hover:text-synth-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isGeneratingArt ? 'Generating…' : 'Powered by Math and Rainbows'}
            </button>
            <span>Chromesthesia v2.5</span>
            <span>Optical Scanning Synthesizer</span>
          </div>
        </motion.footer>
      </div>

      {/* Mixer Console Overlay */}
      <AnimatePresence>
        {showMixer && (
          <motion.div 
            initial={isPerformanceMode ? { opacity: 0, x: 100 } : { opacity: 0, y: 100 }}
            animate={isPerformanceMode ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }}
            exit={isPerformanceMode ? { opacity: 0, x: 100 } : { opacity: 0, y: 100 }}
            className={`fixed top-0 right-0 bottom-0 sm:top-4 sm:right-4 sm:bottom-4 w-full sm:w-[480px] lg:w-[500px] max-w-full bg-[#0f172a] sm:squircle p-4 sm:p-5 z-50 shadow-2xl flex flex-col border-l sm:border border-white/10 text-white ${isPerformanceMode ? 'sm:w-[260px] lg:w-[260px] !p-4' : ''}`}
            style={getPerfOffset(0)}
          >
            <div className={`flex justify-between items-center ${isPerformanceMode ? 'mb-3' : 'mb-4 sm:mb-5'}`}>
              <div className="flex items-center gap-4">
                <div className={`${isPerformanceMode ? 'w-8 h-8' : 'w-10 h-10'} bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20`}>
                  <Sliders className={`text-white ${isPerformanceMode ? 'w-4 h-4' : 'w-6 h-6'}`} />
                </div>
                <div>
                  <h2 className={`${isPerformanceMode ? 'text-sm' : 'text-xl sm:text-2xl'} font-black uppercase tracking-tighter text-white`}>Master Mixer</h2>
                  <p className="text-[9px] text-emerald-400 uppercase tracking-[0.4em] font-bold">Signal Balance</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={async () => {
                    await initAudio();
                    setIsPlaying(!isPlaying);
                  }}
                  className={`w-8 h-4 rounded-full relative transition-colors ${isPlaying ? 'bg-emerald-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isPlaying ? 'left-4.5' : 'left-0.5'}`} />
                </button>
                <button 
                  onClick={autoMix}
                  className={`bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-full font-black uppercase tracking-widest border border-emerald-500/30 transition-all ${isPerformanceMode ? 'px-2 py-1 text-[7px]' : 'px-3 py-1.5 text-[9px]'}`}
                >
                  Auto
                </button>
                <button onClick={() => setShowMixer(false)} className="text-white/40 hover:text-white p-2 transition-colors">✕</button>
              </div>
            </div>

            <div className={`flex-1 overflow-y-auto pr-2 sm:pr-4 custom-scrollbar ${isPerformanceMode ? 'space-y-4' : 'space-y-6'}`}>
              {/* Master Section */}
              <section className="grid grid-cols-1 gap-6">
                <div className={`bg-white/5 border border-white/10 space-y-6 ${isPerformanceMode ? 'p-6 rounded-2xl' : 'p-8 rounded-[32px]'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Main Output</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span>Master Volume</span>
                      <span className="text-emerald-400">{(volume * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.01" value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                </div>

                <div className={`bg-white/5 border border-purple-500/20 space-y-6 ${isPerformanceMode ? 'p-6 rounded-2xl' : 'p-8 rounded-[32px]'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Waves className="w-4 h-4 text-purple-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-purple-300">Master Bus FX</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/30">
                        <span>Reverb</span>
                        <span className="text-purple-400">{(masterReverbSend * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range" min="0" max="1" step="0.01" value={masterReverbSend}
                        onChange={(e) => setMasterReverbSend(parseFloat(e.target.value))}
                        className="w-full accent-purple-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/30">
                        <span>Glue Compression</span>
                        <span className="text-purple-400">{(masterCompression * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range" min="0" max="1" step="0.01" value={masterCompression}
                        onChange={(e) => setMasterCompression(parseFloat(e.target.value))}
                        className="w-full accent-purple-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/30">
                        <span>Saturation</span>
                        <span className="text-purple-400">{(masterSaturation * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range" min="0" max="1" step="0.01" value={masterSaturation}
                        onChange={(e) => setMasterSaturation(parseFloat(e.target.value))}
                        className="w-full accent-purple-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/30">
                        <span>Filter Cutoff</span>
                        <span className="text-purple-400">
                          {masterFilterCutoff >= 0.99 ? 'Open' : `${Math.round(200 * Math.pow(100, masterFilterCutoff))}Hz`}
                        </span>
                      </div>
                      <input
                        type="range" min="0" max="1" step="0.01" value={masterFilterCutoff}
                        onChange={(e) => setMasterFilterCutoff(parseFloat(e.target.value))}
                        className="w-full accent-purple-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div className={`bg-white/5 border border-white/10 space-y-6 ${isPerformanceMode ? 'p-6 rounded-2xl' : 'p-8 rounded-[32px]'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Optical Scanning Synth</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span>Optical Gain</span>
                      <span className="text-emerald-400">{(synthMatrixVolume * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.01" value={synthMatrixVolume}
                      onChange={(e) => setSynthMatrixVolume(parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                </div>

                <div className={`bg-white/5 border border-white/10 space-y-6 ${isPerformanceMode ? 'p-6 rounded-2xl' : 'p-8 rounded-[32px]'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Drone Unit</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span>Drone Gain</span>
                        <span className="text-emerald-400">{(droneMasterVolume * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01" value={droneMasterVolume}
                        onChange={(e) => setDroneMasterVolume(parseFloat(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/5">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/30">
                          <span>Saturation</span>
                          <span className="text-emerald-400">{(droneSaturation * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="1" step="0.01" value={droneSaturation}
                          onChange={(e) => setDroneSaturation(parseFloat(e.target.value))}
                          className="w-full accent-emerald-500/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/30">
                          <span>Reverb Send</span>
                          <span className="text-emerald-400">{(droneReverbSend * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="1" step="0.01" value={droneReverbSend}
                          onChange={(e) => setDroneReverbSend(parseFloat(e.target.value))}
                          className="w-full accent-emerald-500/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/30">
                          <span>Sub-Harmonic</span>
                          <span className="text-emerald-400">{(droneSubAmount * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="1" step="0.01" value={droneSubAmount}
                          onChange={(e) => setDroneSubAmount(parseFloat(e.target.value))}
                          className="w-full accent-emerald-500/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`bg-white/5 border border-white/10 space-y-6 ${isPerformanceMode ? 'p-6 rounded-2xl' : 'p-8 rounded-[32px]'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Poly Sequencer</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span>Sequencer Master</span>
                      <span className="text-emerald-400">{(droneSequencerOverallVolume * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.01" value={droneSequencerOverallVolume}
                      onChange={(e) => setDroneSequencerOverallVolume(parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                </div>

                <div className={`bg-white/5 border border-white/10 space-y-6 ${isPerformanceMode ? 'p-6 rounded-2xl' : 'p-8 rounded-[32px]'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Evolution Link</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Master Evolution</span>
                    <button 
                      onClick={() => setIsVisualsEvolving(!isVisualsEvolving)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${isVisualsEvolving ? 'bg-emerald-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isVisualsEvolving ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Link All Evolution</span>
                    <button 
                      onClick={() => setIsEvolutionLinked(!isEvolutionLinked)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${isEvolutionLinked ? 'bg-emerald-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isEvolutionLinked ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                  <p className="text-[8px] text-white/20 uppercase tracking-widest font-black leading-relaxed">
                    When linked, all modules evolve together based on the visuals evolution state.
                  </p>
                </div>
              </section>

              {/* Drone Voices Mixer */}
              <section className={isPerformanceMode ? 'space-y-4' : 'space-y-6'}>
                <div className="flex items-center gap-4">
                  <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-white/40">Drone Voices</h3>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
                <div className={`grid gap-6 ${isPerformanceMode ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
                  {droneVoices.map((voice, i) => (
                    <div key={i} className={`bg-white/5 border border-white/10 space-y-4 ${isPerformanceMode ? 'p-4 rounded-2xl' : 'p-6 rounded-3xl'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Voice {i + 1}</span>
                        <span className="text-[10px] font-black text-white/40">{(voice.volume * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01" value={voice.volume}
                        onChange={(e) => {
                          const newVoices = [...droneVoices];
                          newVoices[i].volume = parseFloat(e.target.value);
                          setDroneVoices(newVoices);
                        }}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div className="flex justify-between text-[8px] uppercase tracking-tighter text-white/20">
                        <span>{voice.type}</span>
                        <span>{Math.round(voice.freq)}Hz</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Sequencer Voices Mixer */}
              <section className={isPerformanceMode ? 'space-y-4' : 'space-y-6'}>
                <div className="flex items-center gap-4">
                  <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-white/40">Sequencer Voices</h3>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
                <div className={`grid gap-6 ${isPerformanceMode ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
                  {droneSequencerVoices.map((voice, i) => (
                    <div key={i} className={`bg-white/5 border border-white/10 space-y-4 ${isPerformanceMode ? 'p-4 rounded-2xl' : 'p-6 rounded-3xl'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{voice.name}</span>
                        <span className="text-[10px] font-black text-white/40">{(droneSequencerMasterVolumes[i] * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01" value={droneSequencerMasterVolumes[i]}
                        onChange={(e) => {
                          const newVols = [...droneSequencerMasterVolumes];
                          newVols[i] = parseFloat(e.target.value);
                          setDroneSequencerMasterVolumes(newVols);
                        }}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div className="flex justify-between text-[8px] uppercase tracking-tighter text-white/20">
                        <span>{voice.type}</span>
                        <span>{voice.pitch.length} Steps</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDroneModule && (
          <motion.div 
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className={`fixed top-0 right-0 bottom-0 sm:top-4 sm:right-4 sm:bottom-4 w-full sm:w-[480px] lg:w-[500px] max-w-full bg-[#0f172a] sm:squircle p-4 sm:p-5 z-50 shadow-2xl flex flex-col border-l sm:border border-white/10 text-white ${isPerformanceMode ? 'sm:w-[260px] lg:w-[260px] !p-4' : ''}`}
            style={getPerfOffset(2)}
          >
            <div className={`flex justify-between items-center ${isPerformanceMode ? 'mb-3' : 'mb-4 sm:mb-5'}`}>
              <div className="flex items-center gap-4">
                <div className={`${isPerformanceMode ? 'w-8 h-8' : 'w-10 h-10'} bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20`}>
                  <Layers className={`text-white ${isPerformanceMode ? 'w-4 h-4' : 'w-6 h-6'}`} />
                </div>
                <div>
                  <h2 className={`${isPerformanceMode ? 'text-sm' : 'text-xl sm:text-2xl'} font-black uppercase tracking-tighter text-white`}>Drone Unit</h2>
                  <p className="text-[9px] text-emerald-400 uppercase tracking-[0.3em] font-bold">Independent Signal Path</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsDroneEnabled(!isDroneEnabled)}
                  className={`w-8 h-4 rounded-full relative transition-colors ${isDroneEnabled ? 'bg-emerald-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isDroneEnabled ? 'left-4.5' : 'left-0.5'}`} />
                </button>
                <button onClick={() => setShowDroneModule(false)} className="text-white/40 hover:text-white p-2 transition-colors">✕</button>
              </div>
            </div>
            
            <div className={`flex-1 overflow-y-auto pr-2 sm:pr-4 custom-scrollbar ${isPerformanceMode ? 'space-y-4' : 'space-y-5 sm:space-y-6'}`}>
              {/* Master Controls */}
              <section className={`bg-white/5 rounded-3xl border border-white/10 ${isPerformanceMode ? 'p-4' : 'p-6'}`}>
                <div className={`flex items-center justify-between ${isPerformanceMode ? 'mb-4' : 'mb-6'}`}>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={async () => {
                        const nextState = !isDroneEnabled;
                        setIsDroneEnabled(nextState);
                        if (nextState && !isPlaying) {
                          await initAudio();
                          setIsPlaying(true);
                        }
                      }}
                      className={`${isPerformanceMode ? 'px-4 py-2 text-[9px]' : 'px-8 py-3 text-[11px]'} rounded-full font-black uppercase tracking-widest transition-all flex items-center gap-3 ${isDroneEnabled ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-white/10 text-white/40'}`}
                    >
                      {isDroneEnabled ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                      {isDroneEnabled ? 'Stop' : 'Start'}
                    </button>
                  </div>
                </div>

                <div className={`grid gap-4 ${isPerformanceMode ? 'grid-cols-1' : 'grid-cols-2 sm:gap-6'} mb-6`}>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/60">
                      <span>Cutoff</span>
                      <span className="text-emerald-400">{Math.round(droneFilterCutoff)}Hz</span>
                    </div>
                    <input 
                      type="range" min="20" max="10000" step="10" value={droneFilterCutoff}
                      onChange={(e) => setDroneFilterCutoff(parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/60">
                      <span>Res</span>
                      <span className="text-emerald-400">{Math.round(droneFilterResonance * 10) / 10}</span>
                    </div>
                    <input 
                      type="range" min="0.1" max="20" step="0.1" value={droneFilterResonance}
                      onChange={(e) => setDroneFilterResonance(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className={`grid gap-4 ${isPerformanceMode ? 'grid-cols-1' : 'grid-cols-2 sm:gap-6'}`}>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/60">
                      <span>Voice Spread</span>
                      <span className="text-emerald-400">{(droneSpread * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.01" value={droneSpread}
                      onChange={(e) => setDroneSpread(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/60">
                      <span>LFO Freq</span>
                      <span className="text-emerald-400">{Math.round(droneLfoFreq * 10) / 10}Hz</span>
                    </div>
                    <input 
                      type="range" min="0.1" max="20" step="0.1" value={droneLfoFreq}
                      onChange={(e) => setDroneLfoFreq(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className={`grid gap-4 ${isPerformanceMode ? 'grid-cols-1 mt-4' : 'grid-cols-2 gap-6 mt-6'}`}>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/60">
                      <span>LFO Amount</span>
                      <span className="text-emerald-400">{(droneLfoAmount / 10).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1000" step="1" value={droneLfoAmount}
                      onChange={(e) => setDroneLfoAmount(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/60">
                      <span>LFO Target</span>
                      <span className="text-emerald-400 uppercase">{droneLfoTarget}</span>
                    </div>
                    <select 
                      value={droneLfoTarget}
                      onChange={(e) => setDroneLfoTarget(e.target.value as any)}
                      className="w-full bg-white/5 text-[10px] p-2 rounded-xl border border-white/10 text-white outline-none focus:border-emerald-500/50 font-black uppercase tracking-widest"
                    >
                      <option value="cutoff" className="bg-[#0f172a]">Cutoff</option>
                      <option value="pan" className="bg-[#0f172a]">Panning</option>
                      <option value="volume" className="bg-[#0f172a]">Volume</option>
                      <option value="spread" className="bg-[#0f172a]">Spread</option>
                      <option value="resonance" className="bg-[#0f172a]">Resonance</option>
                    </select>
                  </div>
                </div>

                <div className={`grid gap-4 ${isPerformanceMode ? 'grid-cols-1 mt-4' : 'grid-cols-2 gap-6 mt-6'}`}>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/60">
                      <span>Drone Saturation</span>
                      <span className="text-emerald-400">{(droneSaturation * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.01" value={droneSaturation}
                      onChange={(e) => setDroneSaturation(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/60">
                      <span>Reverb Send</span>
                      <span className="text-emerald-400">{(droneReverbSend * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.01" value={droneReverbSend}
                      onChange={(e) => setDroneReverbSend(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 mt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/60">
                      <span>Sub-Harmonic Mix</span>
                      <span className="text-emerald-400">{(droneSubAmount * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.01" value={droneSubAmount}
                      onChange={(e) => setDroneSubAmount(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-8 pt-8 border-t border-white/5">
                  <div className="space-y-3">
                    <label className="text-[9px] text-white/60 uppercase tracking-widest font-black">Generative Evolution</label>
                    <button 
                      onClick={() => setIsDroneEvolving(!isDroneEvolving)}
                      className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isDroneEvolving ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' : 'bg-white/5 text-white/40 border-white/10'}`}
                    >
                      {isDroneEvolving ? 'Evolving' : 'Static'}
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/60">
                      <span>Evol. Rate</span>
                      <span className="text-emerald-400">{Math.round(droneEvolutionAmount * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.01" value={droneEvolutionAmount}
                      onChange={(e) => setDroneEvolutionAmount(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </section>

              {/* Drone Presets */}
              <section className="space-y-4">
                <label className="text-[11px] text-white/40 uppercase tracking-[0.3em] block font-black">Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  {DRONE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyDronePreset(idx)}
                      className={`group relative p-3 rounded-2xl border transition-all text-left flex flex-col justify-center ${
                        activeDronePreset === idx
                          ? 'bg-emerald-500/20 border-white ring-2 ring-white/50 shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-[1.02] z-10'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[11px] font-black uppercase tracking-widest ${activeDronePreset === idx ? 'text-white' : 'text-white/60 group-hover:text-emerald-400'}`}>
                          {preset.name}
                        </span>
                        {activeDronePreset === idx && (
                          <motion.div
                            layoutId="drone-preset-selection-dot"
                            className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-[0_0_8px_white] z-20"
                          />
                        )}
                        {activeDronePreset === idx && <Zap className="w-3 h-3 text-white animate-pulse" />}
                      </div>
                      <p className={`text-[8px] line-clamp-1 transition-colors ${activeDronePreset === idx ? 'text-white/60' : 'text-white/30 group-hover:text-white/50'}`}>
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Drone Voices */}
              <section>
                <label className="text-[11px] text-white/40 uppercase tracking-[0.3em] block mb-6 font-black">Drone Oscillators</label>
                <div className="grid grid-cols-1 gap-4">
                  {droneVoices.map((voice, idx) => (
                    <div key={idx} className="bg-white/5 p-5 rounded-2xl border border-white/10 flex items-center gap-6">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-[10px] font-black text-emerald-400 border border-emerald-500/30">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <span className="text-[8px] uppercase tracking-widest font-black text-white/30">Wave</span>
                            <select 
                              value={voice.type}
                              onChange={(e) => {
                                const newVoices = [...droneVoices];
                                newVoices[idx].type = e.target.value as WaveOption;
                                setDroneVoices(newVoices);
                              }}
                              className="w-full bg-black/40 text-[10px] p-1 rounded border border-white/10 text-white"
                            >
                              <option value="sine">Sine</option>
                              <option value="triangle">Triangle</option>
                              <option value="square">Square</option>
                              <option value="sawtooth">Sawtooth</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <span className="text-[8px] uppercase tracking-widest font-black text-white/30">Freq</span>
                            <input 
                              type="number" value={voice.freq}
                              onChange={(e) => {
                                const newVoices = [...droneVoices];
                                newVoices[idx].freq = parseFloat(e.target.value);
                                setDroneVoices(newVoices);
                              }}
                              className="w-full bg-black/40 text-[10px] p-1 rounded border border-white/10 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <span className="text-[8px] uppercase tracking-widest font-black text-white/30">Detune</span>
                            <input 
                              type="range" min="-50" max="50" value={voice.detune}
                              onChange={(e) => {
                                const newVoices = [...droneVoices];
                                newVoices[idx].detune = parseFloat(e.target.value);
                                setDroneVoices(newVoices);
                              }}
                              className="w-full accent-emerald-500"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-white/5">
                          {['attack', 'decay', 'sustain', 'release'].map((param) => (
                            <div key={param} className="space-y-1">
                              <div className="flex justify-between text-[7px] uppercase tracking-widest font-black text-white/20">
                                <span>{param.slice(0, 1)}</span>
                                <span>{Math.round(voice.adsr[param as keyof typeof voice.adsr] * 10) / 10}</span>
                              </div>
                              <input 
                                type="range" 
                                min={param === 'sustain' ? 0 : 0.01} 
                                max={param === 'sustain' ? 1 : 5} 
                                step="0.01" 
                                value={voice.adsr[param as keyof typeof voice.adsr]}
                                onChange={(e) => {
                                  const newVoices = [...droneVoices];
                                  (newVoices[idx].adsr as any)[param] = parseFloat(e.target.value);
                                  setDroneVoices(newVoices);
                                }}
                                className="w-full accent-emerald-500/50"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Drone Effects Chain */}
              <section className="border-t border-white/10 pt-10">
                <label className="text-[11px] text-white/40 uppercase tracking-[0.3em] block mb-4 font-black">Drone Effects Chain</label>
                
                <div className="grid grid-cols-1 gap-8">
                  {/* Character Module */}
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                        <Zap size={16} strokeWidth={3} />
                      </div>
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-white leading-none mb-1">Character</h3>
                        <p className="text-[9px] text-white/40 uppercase tracking-tighter font-bold leading-none">Drive & Saturation</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {CHARACTER_EFFECTS.map((eff) => (
                        <button
                          key={eff.id}
                          onClick={() => setDroneCharacterEffect(eff.id as any)}
                          className={`px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${
                            droneCharacterEffect === eff.id 
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' 
                              : 'bg-white/5 text-white/40 border-transparent hover:border-white/10'
                          }`}
                        >
                          {eff.name}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">{getAmountLabel('character', droneCharacterEffect)}</span>
                        <span className="font-mono text-[10px] font-black text-white">{Math.round(droneCharacterAmount * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        value={droneCharacterAmount} 
                        onChange={(e) => setDroneCharacterAmount(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                  </div>

                  {/* Movement Module */}
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                        <Wind size={16} strokeWidth={3} />
                      </div>
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-white leading-none mb-1">Movement</h3>
                        <p className="text-[9px] text-white/40 uppercase tracking-tighter font-bold leading-none">Modulation & Warp</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {MOVEMENT_EFFECTS.map((eff) => (
                        <button
                          key={eff.id}
                          onClick={() => setDroneMovementEffect(eff.id as any)}
                          className={`px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${
                            droneMovementEffect === eff.id 
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' 
                              : 'bg-white/5 text-white/40 border-transparent hover:border-white/10'
                          }`}
                        >
                          {eff.name}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">{getAmountLabel('movement', droneMovementEffect)}</span>
                        <span className="font-mono text-[10px] font-black text-white">{Math.round(droneMovementAmount * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        value={droneMovementAmount} 
                        onChange={(e) => setDroneMovementAmount(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                  </div>

                  {/* Diffusion Module */}
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                        <Cloud size={16} strokeWidth={3} />
                      </div>
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-white leading-none mb-1">Diffusion</h3>
                        <p className="text-[9px] text-white/40 uppercase tracking-tighter font-bold leading-none">Time & Space</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {DIFFUSION_EFFECTS.map((eff) => (
                        <button
                          key={eff.id}
                          onClick={() => setDroneDiffusionEffect(eff.id as any)}
                          className={`px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${
                            droneDiffusionEffect === eff.id 
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' 
                              : 'bg-white/5 text-white/40 border-transparent hover:border-white/10'
                          }`}
                        >
                          {eff.name}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">{getAmountLabel('diffusion', droneDiffusionEffect)}</span>
                        <span className="font-mono text-[10px] font-black text-white">{Math.round(droneDiffusionAmount * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        value={droneDiffusionAmount} 
                        onChange={(e) => setDroneDiffusionAmount(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                  </div>

                  {/* Texture Module */}
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                        <Waves size={16} strokeWidth={3} />
                      </div>
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-white leading-none mb-1">Texture</h3>
                        <p className="text-[9px] text-white/40 uppercase tracking-tighter font-bold leading-none">Grit & Noise</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {TEXTURE_EFFECTS.map((eff) => (
                        <button
                          key={eff.id}
                          onClick={() => setDroneTextureEffect(eff.id as any)}
                          className={`px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${
                            droneTextureEffect === eff.id 
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' 
                              : 'bg-white/5 text-white/40 border-transparent hover:border-white/10'
                          }`}
                        >
                          {eff.name}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">{getAmountLabel('texture', droneTextureEffect)}</span>
                        <span className="font-mono text-[10px] font-black text-white">{Math.round(droneTextureAmount * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        value={droneTextureAmount} 
                        onChange={(e) => setDroneTextureAmount(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSequencerModule && (
          <motion.div 
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className={`fixed top-0 right-0 bottom-0 sm:top-4 sm:right-4 sm:bottom-4 w-full sm:w-[480px] lg:w-[500px] max-w-full bg-[#0f172a] sm:squircle p-4 sm:p-5 z-50 shadow-2xl flex flex-col border-l sm:border border-white/10 text-white ${isPerformanceMode ? 'sm:w-[260px] lg:w-[260px] !p-4' : ''}`}
            style={getPerfOffset(3)}
          >
            <div className={`flex justify-between items-center ${isPerformanceMode ? 'mb-3' : 'mb-4 sm:mb-5'}`}>
              <div className="flex items-center gap-4">
                <div className={`${isPerformanceMode ? 'w-8 h-8' : 'w-10 h-10'} bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20`}>
                  <Zap className={`text-white ${isPerformanceMode ? 'w-4 h-4' : 'w-6 h-6'}`} />
                </div>
                <div>
                  <h2 className={`${isPerformanceMode ? 'text-sm' : 'text-xl sm:text-2xl'} font-black uppercase tracking-tighter text-white`}>Poly Sequencer</h2>
                  <p className="text-[9px] text-emerald-400 uppercase tracking-[0.3em] font-bold">Rhythmic Engine</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsDroneSequencerEnabled(!isDroneSequencerEnabled)}
                  className={`w-8 h-4 rounded-full relative transition-colors ${isDroneSequencerEnabled ? 'bg-emerald-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isDroneSequencerEnabled ? 'left-4.5' : 'left-0.5'}`} />
                </button>
                <button onClick={() => setShowSequencerModule(false)} className="text-white/40 hover:text-white p-2 transition-colors">✕</button>
              </div>
            </div>
            
            <div className={`flex-1 overflow-y-auto pr-2 sm:pr-4 custom-scrollbar ${isPerformanceMode ? 'space-y-4' : 'space-y-5 sm:space-y-6'}`}>
              <section className={`bg-white/5 rounded-3xl border border-white/10 ${isPerformanceMode ? 'p-4' : 'p-6'}`}>
                <div className="flex items-center justify-between gap-4">
                  <button 
                    onClick={async () => {
                      const nextState = !isDroneSequencerEnabled;
                      setIsDroneSequencerEnabled(nextState);
                      if (nextState && !isPlaying) {
                        await initAudio();
                        setIsPlaying(true);
                      }
                    }}
                    className={`flex-1 ${isPerformanceMode ? 'py-2 text-[9px]' : 'py-3 text-[11px]'} rounded-full font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isDroneSequencerEnabled ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-white/10 text-white/40'}`}
                  >
                    {isDroneSequencerEnabled ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                    {isDroneSequencerEnabled ? 'Stop' : 'Start'}
                  </button>
                  <button 
                    onClick={() => setDroneSequencerSyncToGlobal(!droneSequencerSyncToGlobal)}
                    className={`${isPerformanceMode ? 'px-3 py-2 text-[8px]' : 'px-6 py-3 text-[10px]'} rounded-full font-black uppercase tracking-widest transition-all border ${droneSequencerSyncToGlobal ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' : 'bg-white/5 text-white/40 border-white/10'}`}
                  >
                    {droneSequencerSyncToGlobal ? 'Synced' : 'Free'}
                  </button>
                </div>
              </section>

              {/* Sequencer Presets */}
              <section className={`border-t border-white/10 ${isPerformanceMode ? 'pt-6' : 'pt-10'}`}>
                <label className={`text-[11px] text-white/40 uppercase tracking-[0.3em] block font-black ${isPerformanceMode ? 'mb-4' : 'mb-6'}`}>Presets</label>
                <div className={`grid gap-4 ${isPerformanceMode ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {SEQUENCER_PRESETS.map((preset, idx) => (
                    <button
                      key={preset.name}
                      onClick={() => applySequencerPreset(idx)}
                      className={`flex flex-col items-start rounded-2xl border transition-all text-left group relative overflow-hidden ${isPerformanceMode ? 'p-3' : 'p-4'} ${
                        activeSequencerPreset === idx 
                          ? 'bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {activeSequencerPreset === idx && (
                        <motion.div 
                          layoutId="active-preset-glow"
                          className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"
                        />
                      )}
                      <div className="flex items-center gap-2 mb-1 relative z-10">
                        <span className={`text-[11px] font-black uppercase tracking-widest ${activeSequencerPreset === idx ? 'text-emerald-400' : 'text-white/60 group-hover:text-emerald-400'}`}>
                          {preset.name}
                        </span>
                        {activeSequencerPreset === idx && <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />}
                      </div>
                      <p className="text-[8px] text-white/30 uppercase tracking-widest font-bold relative z-10">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </section>

              {/* Generative Mode */}
              <section className={`border-t border-white/10 ${isPerformanceMode ? 'pt-6' : 'pt-10'}`}>
                <div className={`flex items-center justify-between ${isPerformanceMode ? 'mb-4' : 'mb-6'}`}>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setIsSequencerGenerative(!isSequencerGenerative)}
                      className={`${isPerformanceMode ? 'px-3 py-1.5 text-[8px]' : 'px-6 py-2 text-[10px]'} rounded-full font-black uppercase tracking-widest transition-all ${isSequencerGenerative ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-white/10 text-white/40'}`}
                    >
                      Gen {isSequencerGenerative ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <div className={`flex flex-col items-end gap-1 flex-1 ${isPerformanceMode ? 'ml-4' : 'ml-8'}`}>
                    <div className="flex justify-between w-full text-[9px] text-white/40 uppercase tracking-widest font-black">
                      <span>Evolution</span>
                      <span className="text-emerald-400">{(sequencerMutationRate * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="0.2" step="0.01" value={sequencerMutationRate}
                      onChange={(e) => setSequencerMutationRate(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                </div>
                <p className="text-[8px] text-white/20 uppercase tracking-widest font-black text-center">Melodies mutate over time</p>
              </section>

              {/* Sequencer Section */}
              <section className={`border-t border-white/10 ${isPerformanceMode ? 'pt-6' : 'pt-10'}`}>
                <div className={`flex flex-col justify-between gap-6 ${isPerformanceMode ? 'mb-3' : 'mb-4 sm:mb-5'}`}>
                  <label className="text-[11px] text-white/40 uppercase tracking-[0.3em] font-black">Sequencer</label>
                  <div className={`flex flex-wrap items-center ${isPerformanceMode ? 'gap-2' : 'gap-4 sm:gap-6'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-white/40 uppercase tracking-widest font-black">BPM</span>
                      <input 
                        type="number" value={droneSequencerBpm}
                        onChange={(e) => setDroneSequencerBpm(parseInt(e.target.value))}
                        className="w-10 bg-black/40 text-[10px] p-1 rounded border border-white/10 text-white text-center"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-white/40 uppercase tracking-widest font-black">Swing</span>
                      <input 
                        type="range" min="0" max="0.5" step="0.01" value={droneSequencerSwing}
                        onChange={(e) => setDroneSequencerSwing(parseFloat(e.target.value))}
                        className={`${isPerformanceMode ? 'w-10' : 'w-16 sm:w-20'} accent-emerald-500`}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          const newVoices = droneSequencerVoices.map(v => ({
                            ...v,
                            steps: v.steps.map(() => Math.random() > 0.7),
                            probability: v.probability.map(() => Math.random() * 0.5 + 0.5),
                            pitch: v.pitch.map(() => {
                              const scale = SCALES[scaleName];
                              const octave = Math.floor(Math.random() * 3) + 2; // Octave 2-4
                              const noteInScale = scale[Math.floor(Math.random() * scale.length)];
                              return rootNoteIndex + noteInScale + (octave * 12);
                            })
                          }));
                          setDroneSequencerVoices(newVoices);
                        }}
                        className={`${isPerformanceMode ? 'px-2 py-1 text-[8px]' : 'px-3 py-1.5 text-[9px]'} bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-full font-black uppercase tracking-widest border border-emerald-500/30 transition-all`}
                      >
                        Rand
                      </button>
                      <button 
                        onClick={() => setDroneSequencerLinkToMatrix(!droneSequencerLinkToMatrix)}
                        className={`flex items-center gap-2 ${isPerformanceMode ? 'px-2 py-1 text-[8px]' : 'px-4 py-1.5 text-[9px]'} rounded-full font-black uppercase tracking-widest transition-all ${droneSequencerLinkToMatrix ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/30 border border-white/10'}`}
                      >
                        <Zap className="w-3 h-3" />
                        {isPerformanceMode ? 'Link' : 'Link to Optical'}
                      </button>
                    </div>
                  </div>
                                <div className={isPerformanceMode ? 'space-y-3' : 'space-y-5'}>
                  {droneSequencerVoices.map((v, vIdx) => (
                    <div key={vIdx} className={isPerformanceMode ? 'space-y-2' : 'space-y-4'}>
                      <div className={`flex ${isPerformanceMode ? 'flex-col items-start gap-1' : 'items-center gap-4'} min-w-0`}>
                        <div className="flex-shrink-0 relative">
                          <button 
                            onClick={() => setSelectedDroneSequencerVoice(vIdx)}
                            className={`text-[10px] font-black uppercase tracking-widest transition-all ${selectedDroneSequencerVoice === vIdx ? 'text-emerald-400' : 'text-white/40 hover:text-white/60'}`}
                          >
                            {v.name}
                          </button>
                          {selectedDroneSequencerVoice === vIdx && (
                            <motion.div 
                              layoutId="poly-seq-voice-dot"
                              className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_5px_rgba(52,211,153,0.5)]"
                            />
                          )}
                        </div>
                        <div className={`w-full grid grid-cols-8 gap-2 min-w-0 py-3`}>
                          {v.steps.map((active, sIdx) => (
                            <button
                              key={sIdx}
                              onMouseDown={(e) => {
                                const isCurrentlySelected = selectedDroneSequencerVoice === vIdx && selectedDroneSequencerStep === sIdx;
                                
                                if (e.shiftKey) {
                                  setDroneSequencerVoices(prev => prev.map((voice, i) => 
                                    i === vIdx ? { ...voice, steps: voice.steps.map((s, si) => si === sIdx ? !s : s) } : voice
                                  ));
                                  if (!active) playStep(vIdx, sIdx);
                                } else {
                                  if (!active) {
                                    // If inactive, activate and select
                                    setDroneSequencerVoices(prev => prev.map((voice, i) => 
                                      i === vIdx ? { ...voice, steps: voice.steps.map((s, si) => si === sIdx ? !s : s) } : voice
                                    ));
                                    setSelectedDroneSequencerVoice(vIdx);
                                    setSelectedDroneSequencerStep(sIdx);
                                    playStep(vIdx, sIdx);
                                  } else {
                                    if (isCurrentlySelected) {
                                      // If already active and selected, deactivate
                                      setDroneSequencerVoices(prev => prev.map((voice, i) => 
                                        i === vIdx ? { ...voice, steps: voice.steps.map((s, si) => si === sIdx ? !s : s) } : voice
                                      ));
                                    } else {
                                      // If active but not selected, just select
                                      setSelectedDroneSequencerVoice(vIdx);
                                      setSelectedDroneSequencerStep(sIdx);
                                      playStep(vIdx, sIdx);
                                    }
                                  }
                                }
                              }}
                              className={`w-full aspect-square rounded-md transition-all border relative ${
                                active 
                                  ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                                  : 'bg-white/5 border-white/5 hover:bg-white/10'
                              } ${currentDroneStep === sIdx ? 'ring-2 ring-white/40' : ''} ${selectedDroneSequencerVoice === vIdx && selectedDroneSequencerStep === sIdx ? 'border-white ring-2 ring-white/50 scale-110 z-10 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : ''}`}
                            >
                              {selectedDroneSequencerVoice === vIdx && selectedDroneSequencerStep === sIdx && (
                                <motion.div 
                                  layoutId="selection-dot"
                                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"
                                />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {/* Step Editor */}
                  <div className="bg-white/5 p-4 sm:p-5 rounded-3xl border border-white/10">
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">Step Editor</span>
                          <span className="text-[12px] text-emerald-400 font-black uppercase tracking-widest">
                            {droneSequencerVoices[selectedDroneSequencerVoice].name} - Step {selectedDroneSequencerStep + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => playStep(selectedDroneSequencerVoice, selectedDroneSequencerStep)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                            title="Preview Step"
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </button>
                          <button 
                            onClick={() => {
                              const wasActive = droneSequencerVoices[selectedDroneSequencerVoice].steps[selectedDroneSequencerStep];
                              setDroneSequencerVoices(prev => prev.map((voice, i) => 
                                i === selectedDroneSequencerVoice ? { ...voice, steps: voice.steps.map((s, si) => si === selectedDroneSequencerStep ? !s : s) } : voice
                              ));
                              if (!wasActive) playStep(selectedDroneSequencerVoice, selectedDroneSequencerStep);
                            }}
                            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${droneSequencerVoices[selectedDroneSequencerVoice].steps[selectedDroneSequencerStep] ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-white/10 text-white/40'}`}
                          >
                            {droneSequencerVoices[selectedDroneSequencerVoice].steps[selectedDroneSequencerStep] ? 'Step Active' : 'Step Inactive'}
                          </button>
                        </div>
                      </div>

                      {/* Settings Stack */}
                      <div className="space-y-5">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-white/40">
                            <div className="flex items-center gap-2">
                              <Music className="w-3 h-3" />
                              <span>Pitch</span>
                            </div>
                            <span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded text-xs">{NOTES[droneSequencerVoices[selectedDroneSequencerVoice].pitch[selectedDroneSequencerStep] % 12]}{Math.floor(droneSequencerVoices[selectedDroneSequencerVoice].pitch[selectedDroneSequencerStep] / 12) - 1}</span>
                          </div>
                          <input 
                            type="range" min="24" max="96" step="1" 
                            value={droneSequencerVoices[selectedDroneSequencerVoice].pitch[selectedDroneSequencerStep]}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setDroneSequencerVoices(prev => prev.map((voice, i) => 
                                i === selectedDroneSequencerVoice ? { ...voice, pitch: voice.pitch.map((p, si) => si === selectedDroneSequencerStep ? val : p) } : voice
                              ));
                            }}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-white/40">
                            <div className="flex items-center gap-2">
                              <Zap className="w-3 h-3" />
                              <span>Velocity</span>
                            </div>
                            <span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded text-xs">{Math.round(droneSequencerVoices[selectedDroneSequencerVoice].volume[selectedDroneSequencerStep] * 100)}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="1" step="0.01" 
                            value={droneSequencerVoices[selectedDroneSequencerVoice].volume[selectedDroneSequencerStep]}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setDroneSequencerVoices(prev => prev.map((voice, i) => 
                                i === selectedDroneSequencerVoice ? { ...voice, volume: voice.volume.map((v, si) => si === selectedDroneSequencerStep ? val : v) } : voice
                              ));
                            }}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-white/40">
                            <div className="flex items-center gap-2">
                              <Target className="w-3 h-3" />
                              <span>Probability</span>
                            </div>
                            <span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded text-xs">{Math.round(droneSequencerVoices[selectedDroneSequencerVoice].probability[selectedDroneSequencerStep] * 100)}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="1" step="0.01" 
                            value={droneSequencerVoices[selectedDroneSequencerVoice].probability[selectedDroneSequencerStep]}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setDroneSequencerVoices(prev => prev.map((voice, i) => 
                                i === selectedDroneSequencerVoice ? { ...voice, probability: voice.probability.map((p, si) => si === selectedDroneSequencerStep ? val : p) } : voice
                              ));
                            }}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-white/40">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span>Duration</span>
                            </div>
                            <span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded text-xs">{Math.round(droneSequencerVoices[selectedDroneSequencerVoice].duration[selectedDroneSequencerStep] * 100)}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="1" step="0.01" 
                            value={droneSequencerVoices[selectedDroneSequencerVoice].duration[selectedDroneSequencerStep]}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setDroneSequencerVoices(prev => prev.map((voice, i) => 
                                i === selectedDroneSequencerVoice ? { ...voice, duration: voice.duration.map((d, si) => si === selectedDroneSequencerStep ? val : d) } : voice
                              ));
                            }}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Voice Sonic Editor */}
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-8">
                    <div className="flex flex-col gap-8">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-white/40 uppercase tracking-widest font-black">Voice Sonic Editor</span>
                          <span className="text-[12px] text-emerald-400 font-black uppercase tracking-widest">
                            {droneSequencerVoices[selectedDroneSequencerVoice].name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] text-white/30 uppercase tracking-widest font-black">Waveform</span>
                          <select 
                            value={droneSequencerVoices[selectedDroneSequencerVoice].type}
                            onChange={(e) => {
                              const val = e.target.value as WaveOption;
                              setDroneSequencerVoices(prev => prev.map((voice, i) => 
                                i === selectedDroneSequencerVoice ? { ...voice, type: val } : voice
                              ));
                            }}
                            className="bg-black/40 text-[10px] px-4 py-2 rounded-full border border-white/10 text-white uppercase tracking-widest font-black focus:outline-none focus:border-emerald-500/50"
                          >
                            <option value="sine">Sine</option>
                            <option value="triangle">Triangle</option>
                            <option value="square">Square</option>
                            <option value="sawtooth">Sawtooth</option>
                            <option value="auto">Noise</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-white/60">
                            <span>Attack</span>
                            <span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded text-xs">{Math.round(droneSequencerVoices[selectedDroneSequencerVoice].adsr.attack * 100) / 100}s</span>
                          </div>
                          <input 
                            type="range" min="0.01" max="1" step="0.01"
                            value={droneSequencerVoices[selectedDroneSequencerVoice].adsr.attack}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setDroneSequencerVoices(prev => prev.map((voice, i) => 
                                i === selectedDroneSequencerVoice ? { ...voice, adsr: { ...voice.adsr, attack: val } } : voice
                              ));
                            }}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-white/60">
                            <span>Decay</span>
                            <span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded text-xs">{Math.round(droneSequencerVoices[selectedDroneSequencerVoice].adsr.decay * 100) / 100}s</span>
                          </div>
                          <input 
                            type="range" min="0.01" max="1" step="0.01"
                            value={droneSequencerVoices[selectedDroneSequencerVoice].adsr.decay}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setDroneSequencerVoices(prev => prev.map((voice, i) => 
                                i === selectedDroneSequencerVoice ? { ...voice, adsr: { ...voice.adsr, decay: val } } : voice
                              ));
                            }}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-white/60">
                            <span>Sustain</span>
                            <span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded text-xs">{Math.round(droneSequencerVoices[selectedDroneSequencerVoice].adsr.sustain * 100)}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="1" step="0.01" 
                            value={droneSequencerVoices[selectedDroneSequencerVoice].adsr.sustain}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setDroneSequencerVoices(prev => prev.map((voice, i) => 
                                i === selectedDroneSequencerVoice ? { ...voice, adsr: { ...voice.adsr, sustain: val } } : voice
                              ));
                            }}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-white/60">
                            <span>Release</span>
                            <span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded text-xs">{Math.round(droneSequencerVoices[selectedDroneSequencerVoice].adsr.release * 100) / 100}s</span>
                          </div>
                          <input 
                            type="range" min="0.01" max="2" step="0.01"
                            value={droneSequencerVoices[selectedDroneSequencerVoice].adsr.release}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setDroneSequencerVoices(prev => prev.map((voice, i) => 
                                i === selectedDroneSequencerVoice ? { ...voice, adsr: { ...voice.adsr, release: val } } : voice
                              ));
                            }}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sequencer Effects Chain */}
                <section className="border-t border-white/10 pt-10">
                  <label className="text-[11px] text-white/40 uppercase tracking-[0.3em] block mb-4 font-black">Sequencer Effects Chain</label>
                  
                  <div className="grid grid-cols-1 gap-8">
                    {/* Character Module */}
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                          <Zap size={16} strokeWidth={3} />
                        </div>
                        <div>
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-white leading-none mb-1">Character</h3>
                          <p className="text-[9px] text-white/40 uppercase tracking-tighter font-bold leading-none">Drive & Saturation</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {CHARACTER_EFFECTS.map((eff) => (
                          <button
                            key={eff.id}
                            onClick={() => setSeqCharacterEffect(eff.id as any)}
                            className={`px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${
                              seqCharacterEffect === eff.id 
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                                : 'bg-white/5 text-white/40 border-transparent hover:border-white/10'
                            }`}
                          >
                            {eff.name}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">{getAmountLabel('character', seqCharacterEffect)}</span>
                          <span className="font-mono text-[10px] font-black text-emerald-400">{Math.round(seqCharacterAmount * 100)}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="1" step="0.01"
                          value={seqCharacterAmount} 
                          onChange={(e) => setSeqCharacterAmount(parseFloat(e.target.value))}
                          className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                        />
                      </div>
                    </div>

                    {/* Movement Module */}
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                          <Wind size={16} strokeWidth={3} />
                        </div>
                        <div>
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-white leading-none mb-1">Movement</h3>
                          <p className="text-[9px] text-white/40 uppercase tracking-tighter font-bold leading-none">Modulation & Warp</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {MOVEMENT_EFFECTS.map((eff) => (
                          <button
                            key={eff.id}
                            onClick={() => setSeqMovementEffect(eff.id as any)}
                            className={`px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${
                              seqMovementEffect === eff.id 
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                                : 'bg-white/5 text-white/40 border-transparent hover:border-white/10'
                            }`}
                          >
                            {eff.name}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">{getAmountLabel('movement', seqMovementEffect)}</span>
                          <span className="font-mono text-[10px] font-black text-emerald-400">{Math.round(seqMovementAmount * 100)}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="1" step="0.01"
                          value={seqMovementAmount} 
                          onChange={(e) => setSeqMovementAmount(parseFloat(e.target.value))}
                          className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                        />
                      </div>
                    </div>

                    {/* Diffusion Module */}
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                          <Cloud size={16} strokeWidth={3} />
                        </div>
                        <div>
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-white leading-none mb-1">Diffusion</h3>
                          <p className="text-[9px] text-white/40 uppercase tracking-tighter font-bold leading-none">Time & Space</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {DIFFUSION_EFFECTS.map((eff) => (
                          <button
                            key={eff.id}
                            onClick={() => setSeqDiffusionEffect(eff.id as any)}
                            className={`px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${
                              seqDiffusionEffect === eff.id 
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                                : 'bg-white/5 text-white/40 border-transparent hover:border-white/10'
                            }`}
                          >
                            {eff.name}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">{getAmountLabel('diffusion', seqDiffusionEffect)}</span>
                          <span className="font-mono text-[10px] font-black text-emerald-400">{Math.round(seqDiffusionAmount * 100)}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="1" step="0.01"
                          value={seqDiffusionAmount} 
                          onChange={(e) => setSeqDiffusionAmount(parseFloat(e.target.value))}
                          className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                        />
                      </div>
                    </div>

                    {/* Texture Module */}
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                          <Waves size={16} strokeWidth={3} />
                        </div>
                        <div>
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-white leading-none mb-1">Texture</h3>
                          <p className="text-[9px] text-white/40 uppercase tracking-tighter font-bold leading-none">Grit & Noise</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {TEXTURE_EFFECTS.map((eff) => (
                          <button
                            key={eff.id}
                            onClick={() => setSeqTextureEffect(eff.id as any)}
                            className={`px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${
                              seqTextureEffect === eff.id 
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' 
                                : 'bg-white/5 text-white/40 border-transparent hover:border-white/10'
                            }`}
                          >
                            {eff.name}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">{getAmountLabel('texture', seqTextureEffect)}</span>
                          <span className="font-mono text-[10px] font-black text-white">{Math.round(seqTextureAmount * 100)}%</span>
                        </div>
                        <input 
                          type="range" min="0" max="1" step="0.01"
                          value={seqTextureAmount} 
                          onChange={(e) => setSeqTextureAmount(parseFloat(e.target.value))}
                          className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                        />
                      </div>
                    </div>
                  </div>
                </section>
                <p className="text-[8px] text-white/20 uppercase tracking-widest font-black mt-4 text-center">Shift+Click steps to toggle quickly</p>
              </div>
            </section>
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visuals Settings Panel */}
      <AnimatePresence>
        {showVisualsModule && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className={`fixed top-0 right-0 bottom-0 sm:top-4 sm:right-4 sm:bottom-4 w-full sm:w-[480px] lg:w-[500px] max-w-full bg-[#0f172a] sm:squircle p-4 sm:p-5 z-50 shadow-2xl flex flex-col border-l sm:border border-white/10 text-white ${isPerformanceMode ? 'sm:w-[260px] lg:w-[260px] !p-4' : ''}`}
            style={getPerfOffset(4)}
          >
            <div className={`flex justify-between items-center ${isPerformanceMode ? 'mb-3' : 'mb-4 sm:mb-5'}`}>
              <div className="flex items-center gap-4">
                <div className={`${isPerformanceMode ? 'w-8 h-8' : 'w-10 h-10'} bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20`}>
                  <Sparkles className={`text-white ${isPerformanceMode ? 'w-4 h-4' : 'w-6 h-6'}`} />
                </div>
                <div>
                  <h2 className={`${isPerformanceMode ? 'text-sm' : 'text-xl sm:text-2xl'} font-black uppercase tracking-tighter text-white`}>Visual Engine</h2>
                  <p className="text-[9px] text-emerald-400 uppercase tracking-[0.3em] font-bold">Scanning Visualization</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsVisualsEnabled(!isVisualsEnabled)}
                  className={`w-8 h-4 rounded-full relative transition-colors ${isVisualsEnabled ? 'bg-emerald-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isVisualsEnabled ? 'left-4.5' : 'left-0.5'}`} />
                </button>
                <button onClick={() => setShowVisualsModule(false)} className="text-white/40 hover:text-white p-2 transition-colors">✕</button>
              </div>
            </div>
            
            <div className={`flex-1 overflow-y-auto pr-2 sm:pr-4 custom-scrollbar ${isPerformanceMode ? 'space-y-4' : 'space-y-5 sm:space-y-6'}`}>
              {/* Active Mode Indicator */}
              <section className={`bg-white/5 rounded-3xl border border-white/10 ${isPerformanceMode ? 'p-4' : 'p-6'}`}>
                <div className={`flex items-center justify-between ${isPerformanceMode ? 'mb-4' : 'mb-6'}`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Active Mode</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${visualColorMode === 'auto' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} />
                    {visualColorMode === 'auto' ? 'Auto' : 'Preset'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                  {[
                    { id: 'preset', label: 'Preset' },
                    { id: 'auto', label: 'Auto' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setVisualColorMode(mode.id as any)}
                      className={`py-2 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest ${
                        visualColorMode === mode.id 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                          : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </section>
 
              {/* Preset Palettes */}
              {visualColorMode === 'preset' && (
                <section className={isPerformanceMode ? 'space-y-4' : 'space-y-6'}>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-white/40 uppercase tracking-[0.3em] font-black">Palettes</label>
                    <Palette className="w-3 h-3 text-white/20" />
                  </div>
                  <div className={`grid gap-4 ${isPerformanceMode ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {VISUAL_PALETTES.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => {
                          setVisualPalette(p.colors);
                          setVisualPaletteName(p.name);
                          setVisualColorMode('preset');
                        }}
                        className={`rounded-2xl border flex flex-col gap-3 transition-all group relative overflow-hidden ${isPerformanceMode ? 'p-3' : 'p-4'} ${
                          visualPaletteName === p.name
                            ? 'bg-white/10 border-white/30 shadow-lg'
                            : 'bg-white/5 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
                          visualPaletteName === p.name ? 'text-white' : 'text-white/40 group-hover:text-white/60'
                        }`}>{p.name}</span>
                        <div className="flex h-2 w-full rounded-full overflow-hidden shadow-inner">
                          {p.colors.map((c, i) => (
                            <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Auto Palette Preview */}
              {visualColorMode === 'auto' && (
                <section className={isPerformanceMode ? 'space-y-4' : 'space-y-6'}>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-white/40 uppercase tracking-[0.3em] font-black">Sampled Colors</label>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className={`bg-white/5 rounded-3xl border border-white/10 ${isPerformanceMode ? 'p-4' : 'p-6'}`}>
                    <div className="flex h-8 w-full rounded-xl overflow-hidden shadow-2xl border border-white/10">
                      {autoPalette.length > 0 ? autoPalette.map((c, i) => (
                        <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                      )) : (
                        <div className="w-full flex items-center justify-center bg-white/5 text-[9px] text-white/20 uppercase font-black tracking-widest">Sampling Media...</div>
                      )}
                    </div>
                    <p className="text-[8px] text-white/30 uppercase font-bold tracking-widest mt-4 text-center">Colors extracted from background</p>
                  </div>
                </section>
              )}

              {/* Evolution Controls */}
              <section className={isPerformanceMode ? 'space-y-4' : 'space-y-6'}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <label className="text-[11px] text-white/40 uppercase tracking-[0.3em] font-black">Visual Evolution</label>
                  </div>
                  <button 
                    onClick={() => setIsVisualsEvolving(!isVisualsEvolving)}
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${isVisualsEvolving ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/10 text-white/40 border border-white/10'}`}
                  >
                    {isVisualsEvolving ? 'Active' : 'Static'}
                  </button>
                </div>
                
                <div className={`bg-white/5 rounded-3xl border border-white/10 ${isPerformanceMode ? 'p-4' : 'p-6'} space-y-6`}>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span>Evolution Rate</span>
                      <span className="text-emerald-400">{(visualsEvolutionAmount * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.01" value={visualsEvolutionAmount}
                      onChange={(e) => setVisualsEvolutionAmount(parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-3 h-3 text-white/40" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Link All Modules</span>
                    </div>
                    <button 
                      onClick={() => setIsEvolutionLinked(!isEvolutionLinked)}
                      className={`w-8 h-4 rounded-full relative transition-colors ${isEvolutionLinked ? 'bg-emerald-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isEvolutionLinked ? 'left-4.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </section>

              {/* Background Filters */}
              <section className={isPerformanceMode ? 'space-y-4' : 'space-y-6'}>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-white/40 uppercase tracking-[0.3em] font-black">Filters</label>
                  <span className="text-[9px] text-white/20 uppercase tracking-widest font-black">Post-Process</span>
                </div>
                <div className={`grid gap-3 ${isPerformanceMode ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {[
                    { id: 'none', label: 'Clean' },
                    { id: 'lens-flare', label: 'Lens Flare' },
                    { id: 'trippy', label: 'Psychedelic' },
                    { id: 'subtle-blur', label: 'Soft Focus' },
                    { id: 'high-contrast', label: 'Noir' },
                    { id: 'dreamy', label: 'Dreamy' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setVisualBackgroundFilter(filter.id as any)}
                      className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                        visualBackgroundFilter === filter.id 
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' 
                          : 'bg-white/5 text-white/40 border-transparent hover:border-white/10'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Settings Panel */}
      <AnimatePresence>
        {showRecordingSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed top-20 right-4 w-72 max-h-[80vh] bg-[#0f172a]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Recording Settings</h3>
              </div>
              <button 
                onClick={() => setShowRecordingSettings(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white/40" />
              </button>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {/* Mode Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Output Mode</label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
                  {[
                    { id: 'audio', label: 'Audio', icon: Music },
                    { id: 'video', label: 'Video', icon: Video },
                    { id: 'both', label: 'Both', icon: Layers }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setRecordingMode(mode.id as any)}
                      className={`flex flex-col items-center gap-1 py-2 rounded-md transition-all ${
                        recordingMode === mode.id 
                          ? 'bg-emerald-500 text-white shadow-lg' 
                          : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      <mode.icon className="w-3.5 h-3.5" />
                      <span className="text-[8px] font-bold uppercase">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {recordingMode === 'audio' ? 'Audio Format' : 'Video Format'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {recordingMode === 'audio' ? (
                    <>
                      <button
                        onClick={() => setAudioFormat('flac')}
                        className={`px-3 py-2 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                          audioFormat === 'flac' 
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' 
                            : 'border-white/10 text-white/40 hover:border-white/20'
                        }`}
                      >
                        FLAC
                      </button>
                      <button
                        onClick={() => setAudioFormat('mp3')}
                        className={`px-3 py-2 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                          audioFormat === 'mp3' 
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' 
                            : 'border-white/10 text-white/40 hover:border-white/20'
                        }`}
                      >
                        MP3
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setVideoFormat('webm')}
                        className={`px-3 py-2 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                          videoFormat === 'webm' 
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' 
                            : 'border-white/10 text-white/40 hover:border-white/20'
                        }`}
                      >
                        WebM (VP9)
                      </button>
                      <button
                        onClick={() => setVideoFormat('mp4')}
                        className={`px-3 py-2 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                          videoFormat === 'mp4' 
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' 
                            : 'border-white/10 text-white/40 hover:border-white/20'
                        }`}
                      >
                        MP4 (H.264)
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Capture Mode */}
              {(recordingMode === 'video' || recordingMode === 'both') && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Capture</label>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
                    {[
                      { id: 'visualization', label: 'Visuals Only' },
                      { id: 'full', label: 'Full Interface' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setRecordingCapture(mode.id as any)}
                        className={`flex flex-col items-center gap-1 py-2 rounded-md transition-all ${
                          recordingCapture === mode.id
                            ? 'bg-emerald-500 text-white shadow-lg'
                            : 'text-white/40 hover:text-white/60'
                        }`}
                      >
                        <span className="text-[8px] font-bold uppercase">{mode.label}</span>
                      </button>
                    ))}
                  </div>
                  {recordingCapture === 'full' && (
                    <p className="text-[8px] text-white/40 italic">Your browser will ask you to select a tab or window to capture.</p>
                  )}
                </div>
              )}

              {/* Resolution */}
              {(recordingMode === 'video' || recordingMode === 'both') && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Resolution — Landscape</label>
                  <div className="grid grid-cols-4 gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
                    {[
                      { id: '720p', label: '720p' },
                      { id: '1080p', label: '1080p' },
                      { id: '1440p', label: '1440p' },
                      { id: '4k', label: '4K' }
                    ].map((res) => (
                      <button
                        key={res.id}
                        onClick={() => setRecordingResolution(res.id as any)}
                        className={`py-2 rounded-md transition-all text-[8px] font-bold uppercase ${
                          recordingResolution === res.id
                            ? 'bg-emerald-500 text-white shadow-lg'
                            : 'text-white/40 hover:text-white/60'
                        }`}
                      >
                        {res.label}
                      </button>
                    ))}
                  </div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Resolution — Vertical (9:16)</label>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
                    {[
                      { id: '1080v', label: '1080×1920', desc: 'TikTok / Shorts' },
                      { id: '1440v', label: '1440×2560', desc: 'High-Res Vertical' }
                    ].map((res) => (
                      <button
                        key={res.id}
                        onClick={() => setRecordingResolution(res.id as any)}
                        className={`py-2 rounded-md transition-all ${
                          recordingResolution === res.id
                            ? 'bg-emerald-500 text-white shadow-lg'
                            : 'text-white/40 hover:text-white/60'
                        }`}
                      >
                        <span className="text-[8px] font-bold uppercase block">{res.label}</span>
                        <span className="text-[7px] opacity-60 block">{res.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Quality Profile</label>
                <div className="space-y-1">
                  {[
                    { id: 'lossless', label: 'Lossless / Studio', desc: '512kbps Audio | 15Mbps Video' },
                    { id: 'high', label: 'High (YouTube/TikTok)', desc: '320kbps Audio | 8Mbps Video' },
                    { id: 'medium', label: 'Medium / Standard', desc: '192kbps Audio | 4Mbps Video' },
                    { id: 'low', label: 'Low / Mobile', desc: '96kbps Audio | 1.5Mbps Video' }
                  ].map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setRecordingQuality(q.id as any)}
                      className={`w-full text-left p-2 rounded-lg border transition-all ${
                        recordingQuality === q.id
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                          : 'border-transparent hover:bg-white/5 text-white/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase ${recordingQuality === q.id ? 'text-white' : 'text-white/60'}`}>
                          {q.label}
                        </span>
                        {recordingQuality === q.id && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                      </div>
                      <p className="text-[8px] text-white/40 mt-0.5">{q.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Platform Tips */}
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-1.5">
                  <Info className="w-3 h-3 text-emerald-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Compatibility Tip</span>
                </div>
                <p className="text-[8px] text-white/60 leading-relaxed">
                  For <b>QuickTime Player</b>, <b>TikTok</b>, and <b>Instagram</b>, use <b>MP4 (H.264)</b>.
                  YouTube handles <b>WebM (VP9)</b> perfectly and often processes it faster.
                  <br /><span className="opacity-60 italic">Note: MP4 support depends on your browser (Chrome/Safari recommended). For audio, <b>MP3</b> is most compatible.</span>
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-black/5 flex gap-2">
              <button 
                onClick={() => {
                  setShowRecordingSettings(false);
                  startRecording();
                }}
                className="flex-1 bg-space-gray text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors"
              >
                Start Recording
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className={`fixed top-0 right-0 bottom-0 sm:top-4 sm:right-4 sm:bottom-4 w-full sm:w-[480px] lg:w-[500px] max-w-full bg-[#0f172a] sm:squircle p-4 sm:p-5 z-50 shadow-2xl flex flex-col border-l sm:border border-white/10 text-white ${isPerformanceMode ? 'sm:w-[260px] lg:w-[260px] !p-4' : ''}`}
            style={getPerfOffset(1)}
          >
            <div className={`flex justify-between items-center ${isPerformanceMode ? 'mb-3' : 'mb-4 sm:mb-5'}`}>
              <div className="flex items-center gap-4">
                <div className={`${isPerformanceMode ? 'w-8 h-8' : 'w-10 h-10'} bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20`}>
                  <Zap className={`text-white ${isPerformanceMode ? 'w-4 h-4' : 'w-6 h-6'}`} />
                </div>
                <div>
                  <h2 className={`${isPerformanceMode ? 'text-sm' : 'text-xl sm:text-2xl'} font-black uppercase tracking-tighter text-white`}>Optical Scanning Synth</h2>
                  <p className="text-[9px] text-emerald-400 uppercase tracking-[0.3em] font-bold">Optical Engine</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSynthMatrixEnabled(!isSynthMatrixEnabled)}
                  className={`w-8 h-4 rounded-full relative transition-colors ${isSynthMatrixEnabled ? 'bg-emerald-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isSynthMatrixEnabled ? 'left-4.5' : 'left-0.5'}`} />
                </button>
                <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white p-2 transition-colors">✕</button>
              </div>
            </div>
            
            <div className={`flex-1 overflow-y-auto pr-2 sm:pr-4 custom-scrollbar ${isPerformanceMode ? 'space-y-3' : 'space-y-5 sm:space-y-6'}`}>
              {/* Patches — fastest way to change everything */}
              <section>
                <div className={`flex items-center justify-between ${isPerformanceMode ? 'mb-4' : 'mb-6'}`}>
                  <label className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black">Patches</label>
                  <span className="text-[8px] text-white/20 uppercase tracking-widest font-black">Presets</span>
                </div>
                <div className="relative">
                  <select
                    value={activePatch ?? ''}
                    onChange={(e) => applyPatch(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-[10px] text-white outline-none focus:border-emerald-500/50 font-mono appearance-none cursor-pointer hover:bg-white/10 transition-all"
                  >
                    <option value="" disabled className="bg-[#0a0a0a]">Select a Patch Preset...</option>
                    {PATCHES.map((patch, idx) => (
                      <option key={patch.name} value={idx} className="bg-[#0a0a0a]">
                        {patch.name} — {patch.description}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </section>

              {/* Signal Sources */}
              <section className={isPerformanceMode ? 'space-y-3' : 'space-y-6'}>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black">Signal Sources</label>
                  <span className="text-[8px] text-white/20 uppercase tracking-widest font-black">Inputs</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {/* File Upload */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => document.getElementById('image-input-settings')?.click()}
                    className={`bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all group ${isPerformanceMode ? 'p-3' : 'p-4'}`}
                  >
                    <div className={`${isPerformanceMode ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all`}>
                      <Upload className={isPerformanceMode ? 'w-4 h-4' : 'w-5 h-5'} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white">Upload Local File</p>
                      <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Image or Video</p>
                    </div>
                    <input id="image-input-settings" type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
                  </motion.div>

                  {/* Camera */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={toggleWebcam}
                    className={`bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all group ${isWebcamActive ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isWebcamActive ? 'bg-emerald-500 text-white' : 'bg-white/10 group-hover:bg-emerald-500 group-hover:text-white'}`}>
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-white">Live Camera</p>
                      <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{isWebcamActive ? 'Active' : 'Stream'}</p>
                    </div>
                  </motion.div>

                </div>
              </section>

              {/* Scanning Presets — choose scan pattern */}
              <section>
                <label className={`text-[11px] text-white/40 uppercase tracking-[0.3em] block font-black ${isPerformanceMode ? 'mb-4' : 'mb-6'}`}>Scanning Presets</label>
                <div className="space-y-4">
                  <select
                    value={activePreset}
                    onChange={(e) => {
                      const idx = parseInt(e.target.value);
                      const preset = SCAN_PRESETS[idx];
                      setActivePreset(idx);
                      setFormulaX(preset.formulaX);
                      setFormulaY(preset.formulaY);
                      setScanTime(0);
                      scanTimeRef.current = 0;
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-[11px] text-white outline-none focus:border-emerald-500/50 font-black uppercase tracking-widest"
                  >
                    {SCAN_PRESETS.map((preset, idx) => (
                      <option key={preset.name} value={idx} className="bg-[#0f172a]">
                        {preset.name}
                      </option>
                    ))}
                  </select>
                  {activePreset !== undefined && SCAN_PRESETS[activePreset] && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[10px] text-white/60 font-black uppercase tracking-widest leading-relaxed">
                        {SCAN_PRESETS[activePreset].description}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Engine Parameters */}
              <section>
                <label className={`text-[10px] text-white/40 uppercase tracking-[0.3em] block font-black ${isPerformanceMode ? 'mb-4' : 'mb-6'}`}>Engine Parameters</label>
                <div className={`bg-white/5 rounded-3xl border border-white/10 shadow-inner ${isPerformanceMode ? 'p-3 space-y-3' : 'p-5 space-y-5'}`}>
                  <div className={`grid gap-4 ${isPerformanceMode ? 'grid-cols-1' : 'sm:grid-cols-2 sm:gap-8'}`}>
                    {/* Frequency Range */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] text-white/80 uppercase font-black tracking-widest">Base Freq</span>
                        <span className="font-mono text-[10px] font-black text-emerald-400">{Math.round(baseFreq)}Hz</span>
                      </div>
                      <input 
                        type="range" 
                        min="20" 
                        max="1000" 
                        value={baseFreq} 
                        onChange={(e) => setBaseFreq(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] text-white/80 uppercase font-black tracking-widest">Freq Spread</span>
                        <span className="font-mono text-[10px] font-black text-emerald-400">{Math.round(freqRange)}Hz</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="2000" 
                        value={freqRange} 
                        onChange={(e) => setFreqRange(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] text-white/80 uppercase font-black tracking-widest">Freq Mod</span>
                        <span className="font-mono text-[10px] font-black text-emerald-400">{Math.round(freqMod)}Hz</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="1000" 
                        value={freqMod} 
                        onChange={(e) => setFreqMod(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                    {/* Amplitude / Modulation */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] text-white/80 uppercase font-black tracking-widest">Amp Mod</span>
                        <span className="font-mono text-[11px] font-black text-emerald-400">{Math.round(ampMod * 10) / 10}x</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="5" 
                        step="0.1"
                        value={ampMod} 
                        onChange={(e) => setAmpMod(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] text-white/60 uppercase font-black tracking-widest">Cutoff Mod</span>
                        <span className="font-mono text-[11px] font-black text-white">{Math.round(cutoffMod)}Hz</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="10000" 
                        step="100"
                        value={cutoffMod} 
                        onChange={(e) => setCutoffMod(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] text-white/60 uppercase font-black tracking-widest">Q Mod</span>
                        <span className="font-mono text-[11px] font-black text-white">{Math.round(qMod)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="50"
                        step="1"
                        value={qMod} 
                        onChange={(e) => setQMod(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/10">
                    <div className="space-y-4">
                      <div className="flex justify-between items-baseline">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/60 uppercase font-black tracking-widest">Temporal Speed</span>
                          <button 
                            onClick={() => setIsScanSpeedSynced(!isScanSpeedSynced)}
                            className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter transition-all ${isScanSpeedSynced ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/30'}`}
                          >
                            {isScanSpeedSynced ? 'Synced' : 'Free'}
                          </button>
                        </div>
                        <span className="font-mono text-[11px] font-black text-white">{isScanSpeedSynced ? `${Math.round(scanSpeed * 4) / 4} Bar` : `${Math.round(scanSpeed * 10) / 10}x`}</span>
                      </div>
                      <input 
                        type="range" 
                        min={isScanSpeedSynced ? "0.25" : "0.1"} 
                        max={isScanSpeedSynced ? "8" : "5"} 
                        step={isScanSpeedSynced ? "0.25" : "0.1"}
                        value={scanSpeed} 
                        onChange={(e) => setScanSpeed(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] text-white/60 uppercase font-black tracking-widest">Scanner Scale</span>
                        <span className="font-mono text-[11px] font-black text-white">{Math.round(scanScale * 10) / 10}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={scanScale}
                        onChange={(e) => setScanScale(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/10">
                    <div className="space-y-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] text-white/60 uppercase font-black tracking-widest">Point Size</span>
                        <span className="font-mono text-[11px] font-black text-white">{scanPointSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={scanPointSize}
                        onChange={(e) => setScanPointSize(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-[9px] text-white/30 mt-1">Larger sizes average more pixels for spatial smoothing</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/10">
                    <div className="space-y-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] text-white/60 uppercase font-black tracking-widest">Center X</span>
                        <span className="font-mono text-[11px] font-black text-white">{Math.round(scanCenterX * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01"
                        value={scanCenterX} 
                        onChange={(e) => setScanCenterX(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] text-white/60 uppercase font-black tracking-widest">Center Y</span>
                        <span className="font-mono text-[11px] font-black text-white">{Math.round(scanCenterY * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01"
                        value={scanCenterY} 
                        onChange={(e) => setScanCenterY(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="border-t border-white/10 pt-10">
                <div className="flex items-center justify-between mb-6">
                  <label className="text-[11px] text-white/40 uppercase tracking-[0.3em] font-black">Active Voices</label>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setEnabledVoices(new Array(SAMPLE_POINTS).fill(true))}
                      className="text-[9px] text-white/40 hover:text-white uppercase tracking-widest font-black transition-colors"
                    >
                      All On
                    </button>
                    <button 
                      onClick={() => setEnabledVoices(new Array(SAMPLE_POINTS).fill(false))}
                      className="text-[9px] text-white/40 hover:text-white uppercase tracking-widest font-black transition-colors"
                    >
                      All Off
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-8 gap-3">
                  {enabledVoices.map((isEnabled, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const newVoices = [...enabledVoices];
                        newVoices[idx] = !newVoices[idx];
                        setEnabledVoices(newVoices);
                        // Also select the voice for editing when toggling
                        setSelectedVoice(idx);
                      }}
                      className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-black transition-all duration-300 border ${
                        isEnabled 
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' 
                          : 'bg-white/5 text-white/20 border-white/5'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-white/20 mt-4 uppercase tracking-widest text-center font-black">
                  Toggle individual oscillators (1-16)
                </p>
              </section>

              <section className="border-t border-white/10 pt-10">
                <div className="flex items-center justify-between mb-6">
                  <label className="text-[11px] text-white/40 uppercase tracking-[0.3em] font-black">Sequencer & Scale</label>
                  <button 
                    onClick={async () => {
                      const nextState = !isSequencerEnabled;
                      setIsSequencerEnabled(nextState);
                      if (nextState && !isPlaying) {
                        await initAudio();
                        setIsPlaying(true);
                      }
                    }}
                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${isSequencerEnabled ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white/10 text-white/40 border border-white/10'}`}
                  >
                    {isSequencerEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                
                {isSequencerEnabled && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-5 overflow-hidden"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-baseline text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-2">
                        <span>Tempo (BPM)</span>
                        <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded">{bpm}</span>
                      </div>
                      <input 
                        type="range" 
                        min="40" 
                        max="240" 
                        value={bpm} 
                        onChange={(e) => setBpm(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[9px] text-white/40 uppercase tracking-widest font-black">Root Note</label>
                        <select 
                          value={rootNoteIndex}
                          onChange={(e) => setRootNoteIndex(parseInt(e.target.value))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] text-white outline-none focus:border-emerald-500/50 font-mono font-black uppercase"
                        >
                          {NOTES.map((note, i) => (
                            <option key={note} value={i} className="bg-[#0f172a]">{note}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] text-white/40 uppercase tracking-widest font-black">Scale</label>
                        <select 
                          value={scaleName}
                          onChange={(e) => setScaleName(e.target.value as any)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] text-white outline-none focus:border-emerald-500/50 font-mono font-black uppercase"
                        >
                          {Object.keys(SCALES).map(name => (
                            <option key={name} value={name} className="bg-[#0f172a]">{name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[9px] text-white/40 uppercase tracking-widest font-black">Sequence Length</label>
                        <select 
                          value={sequenceLength}
                          onChange={(e) => setSequenceLength(parseInt(e.target.value))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] text-white outline-none focus:border-emerald-500/50 font-mono font-black uppercase"
                        >
                          {[16, 32, 64, 128, 256].map(len => (
                            <option key={len} value={len} className="bg-[#0f172a]">{len} Steps</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] text-white/40 uppercase tracking-widest font-black">Evolution</label>
                        <button 
                          onClick={() => setIsEvolving(!isEvolving)}
                          className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isEvolving ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg' : 'bg-white/5 text-white/40 border-white/10'}`}
                        >
                          {isEvolving ? 'Active' : 'Static'}
                        </button>
                      </div>
                    </div>

                    {isEvolving && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-baseline text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-2">
                          <span>Mutation Rate</span>
                          <span className="font-mono text-white bg-white/5 px-2 py-0.5 rounded">{(mutationAmount * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01"
                          value={mutationAmount} 
                          onChange={(e) => setMutationAmount(parseFloat(e.target.value))}
                          className="w-full accent-emerald-500 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer" 
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex justify-between items-baseline text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-2">
                        <span>Mouse Influence</span>
                        <span className="font-mono text-white bg-white/5 px-2 py-0.5 rounded">{(mouseInfluence * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01"
                        value={mouseInfluence} 
                        onChange={(e) => setMouseInfluence(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-baseline text-[10px] uppercase tracking-[0.2em] text-white/40 font-black mb-2">
                        <span>Quantize Strength</span>
                        <span className="font-mono text-white bg-white/5 px-2 py-0.5 rounded">{(quantizeAmount * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01"
                        value={quantizeAmount} 
                        onChange={(e) => setQuantizeAmount(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                  </motion.div>
                )}
              </section>

              <section className="border-t border-white/10 pt-10">
                <label className="text-[11px] text-white/40 uppercase tracking-[0.3em] block mb-6 font-black">Mathematical Path Editor</label>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] text-white/40 uppercase font-mono block font-black tracking-widest">X(t, i, n, w, h)</span>
                    <textarea 
                      value={formulaX}
                      onChange={(e) => setFormulaX(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-xs text-white outline-none focus:border-emerald-500/50 h-24 resize-none font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] text-white/40 uppercase font-mono block font-black tracking-widest">Y(t, i, n, w, h)</span>
                    <textarea 
                      value={formulaY}
                      onChange={(e) => setFormulaY(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-xs text-white outline-none focus:border-emerald-500/50 h-24 resize-none font-medium"
                    />
                  </div>
                </div>
              </section>


              <section className="border-t border-white/10 pt-10">
                <label className="text-[11px] text-white/60 uppercase tracking-[0.3em] block mb-6 font-black">Voice Activity</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 bg-white/5 p-6 rounded-2xl border border-white/10">
                  {new Array(SAMPLE_POINTS).fill(0).map((_, i) => (
                    <div 
                      key={i}
                      onClick={() => setSelectedVoice(i)}
                      className={`h-3 rounded-full transition-all duration-300 cursor-pointer relative ${selectedVoice === i ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f172a] shadow-[0_0_15px_rgba(255,255,255,0.3)]' : ''} ${voiceStatesRef.current[i] ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-white/10'}`}
                    >
                      {selectedVoice === i && (
                        <motion.div 
                          layoutId="voice-activity-selection-dot"
                          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="border-t border-white/10 pt-10">
                <label className="text-[11px] text-white/40 uppercase tracking-[0.3em] block mb-6 font-black">Voice Selection</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 bg-white/5 p-4 rounded-3xl border border-white/10">
                  {new Array(SAMPLE_POINTS).fill(0).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVoice(i)}
                      className={`h-10 rounded-xl font-mono text-[10px] transition-all border font-black relative flex items-center justify-center ${selectedVoice === i ? 'bg-emerald-500 text-white border-white ring-2 ring-white/50 scale-105 z-10 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
                    >
                      {i + 1}
                      {selectedVoice === i && (
                        <motion.div 
                          layoutId="voice-selection-dot"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"
                        />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-white/40 mt-4 text-center uppercase tracking-wider font-black">Select a voice to customize its individual synthesis parameters</p>
              </section>

              <section className="border-t border-white/10 pt-10">
                <div className="flex items-center justify-between mb-6">
                  <label className="text-[11px] text-white/40 uppercase tracking-[0.3em] font-black">Voice {selectedVoice + 1} Configuration</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const newShapes = new Array(SAMPLE_POINTS).fill(voiceWaveShapes[selectedVoice]);
                        const newAdsr = adsr.map(() => ({ ...adsr[selectedVoice] }));
                        const newMappings = voiceMappings.map(() => ({ ...voiceMappings[selectedVoice] }));
                        setVoiceWaveShapes(newShapes);
                        setAdsr(newAdsr);
                        setVoiceMappings(newMappings);
                      }}
                      className="bg-white/5 hover:bg-white/10 text-[8px] text-white/40 uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all font-black border border-white/10"
                    >
                      Apply to All
                    </button>
                    <button 
                      onClick={() => {
                        const newMappings = [...voiceMappings];
                        newMappings[selectedVoice] = { ...initialMapping };
                        const newAdsr = [...adsr];
                        newAdsr[selectedVoice] = { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.8 };
                        const newShapes = [...voiceWaveShapes];
                        newShapes[selectedVoice] = 'auto';
                        setVoiceMappings(newMappings);
                        setAdsr(newAdsr);
                        setVoiceWaveShapes(newShapes);
                      }}
                      className="bg-white/5 hover:bg-white/10 text-[8px] text-white/40 uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all font-black border border-white/10"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Timbre & Envelope Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Timbre */}
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/10 space-y-5 flex flex-col justify-between">
                      <div className="space-y-4">
                        <span className="text-[10px] text-white/40 uppercase font-black tracking-wider block">Wave Shape</span>
                        <select 
                          value={voiceWaveShapes[selectedVoice]}
                          onChange={(e) => {
                            const newShapes = [...voiceWaveShapes];
                            newShapes[selectedVoice] = e.target.value as WaveOption;
                            setVoiceWaveShapes(newShapes);
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] uppercase font-black outline-none focus:border-emerald-500/50 text-white tracking-wider appearance-none cursor-pointer"
                        >
                          <option value="auto">Auto (Hue)</option>
                          <optgroup label="Standard">
                            <option value="sine">Sine</option>
                            <option value="square">Square</option>
                            <option value="sawtooth">Sawtooth</option>
                            <option value="triangle">Triangle</option>
                          </optgroup>
                          <optgroup label="Wave Tables">
                            {Object.keys(WAVE_TABLES).map(name => (
                              <option key={name} value={name}>{name}</option>
                            ))}
                          </optgroup>
                        </select>
                      </div>

                      <div className="pt-8 border-t border-white/10">
                        <div className="flex justify-between items-baseline mb-4">
                          <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">Trigger Threshold</span>
                          <span className="font-mono text-[10px] font-black text-white bg-white/5 px-2 py-0.5 rounded">{Math.round(triggerThreshold * 100)}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="0.5" 
                          step="0.01"
                          value={triggerThreshold} 
                          onChange={(e) => setTriggerThreshold(parseFloat(e.target.value))}
                          className="w-full accent-emerald-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                        />
                      </div>
                    </div>

                    {/* Envelope */}
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
                      <div className="h-20 w-full bg-[#020617] rounded-2xl border border-white/10 relative overflow-hidden shadow-inner">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path 
                            d={`M 0 100 
                               L ${adsr[selectedVoice].attack * 20} 10 
                               L ${adsr[selectedVoice].attack * 20 + adsr[selectedVoice].decay * 20} ${100 - adsr[selectedVoice].sustain * 90} 
                               L ${80} ${100 - adsr[selectedVoice].sustain * 90} 
                               L 100 100`}
                            fill="none"
                            stroke="var(--color-emerald-500)"
                            strokeWidth="3"
                            className="transition-all duration-500"
                          />
                        </svg>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-4">
                        {(['attack', 'decay', 'sustain', 'release'] as const).map((param) => (
                          <div key={param}>
                            <div className="flex justify-between items-baseline mb-1.5">
                              <span className="text-[8px] sm:text-[10px] text-white/40 uppercase font-mono font-black tracking-[0.2em]">{param}</span>
                              <span className="text-[8px] sm:text-[10px] font-mono font-black text-white bg-white/5 px-2 py-0.5 rounded">{Math.round(adsr[selectedVoice][param] * 10) / 10}</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="1" 
                              step="0.01"
                              value={adsr[selectedVoice][param]} 
                              onChange={(e) => {
                                const newAdsr = [...adsr];
                                newAdsr[selectedVoice] = { ...newAdsr[selectedVoice], [param]: parseFloat(e.target.value) };
                                setAdsr(newAdsr);
                              }}
                              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Modular Mapping */}
                  <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                    <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-4 font-black">Modular Mapping</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
                      {(['frequency', 'amplitude', 'cutoff', 'q', 'pan', 'attack', 'decay', 'sustain', 'release'] as SoundParam[]).map((param) => (
                        <div key={param} className="flex flex-col gap-3">
                          <span className="text-[9px] text-white/40 uppercase font-black tracking-wider">{param}</span>
                          <select 
                            value={voiceMappings[selectedVoice][param]}
                            onChange={(e) => {
                              const newMappings = [...voiceMappings];
                              newMappings[selectedVoice] = {
                                ...newMappings[selectedVoice],
                                [param]: e.target.value as ImageTrait
                              };
                              setVoiceMappings(newMappings);
                            }}
                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-[9px] uppercase font-black outline-none focus:border-emerald-500/50 text-white tracking-wider w-full appearance-none cursor-pointer"
                          >
                            <option value="brightness">Brightness</option>
                            <option value="hue">Hue</option>
                            <option value="saturation">Saturation</option>
                            <option value="lightness">Lightness</option>
                            <option value="x">X Position</option>
                            <option value="y">Y Position</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="border-t border-white/10 pt-10">
                <label className="text-[11px] text-white/40 uppercase tracking-[0.3em] block mb-4 font-black">Effects Chain</label>
                
                <div className="grid grid-cols-1 gap-8">
                  {/* Character Module */}
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <Zap size={16} strokeWidth={3} />
                      </div>
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-white leading-none mb-1">Character</h3>
                        <p className="text-[9px] text-white/40 uppercase tracking-tighter font-bold leading-none">Drive & Saturation</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {CHARACTER_EFFECTS.map((eff) => (
                        <button
                          key={eff.id}
                          onClick={() => setCharacterEffect(eff.id as any)}
                          className={`px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${
                            characterEffect === eff.id 
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                              : 'bg-white/5 text-white/40 border-transparent hover:border-white/10'
                          }`}
                        >
                          {eff.name}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">{getAmountLabel('character', characterEffect)}</span>
                        <span className="font-mono text-[10px] font-black text-white">{Math.round(characterAmount * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        value={characterAmount} 
                        onChange={(e) => setCharacterAmount(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                  </div>

                  {/* Movement Module */}
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <Wind size={16} strokeWidth={3} />
                      </div>
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-white leading-none mb-1">Movement</h3>
                        <p className="text-[9px] text-white/40 uppercase tracking-tighter font-bold leading-none">Modulation & Warp</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {MOVEMENT_EFFECTS.map((eff) => (
                        <button
                          key={eff.id}
                          onClick={() => setMovementEffect(eff.id as any)}
                          className={`px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${
                            movementEffect === eff.id 
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                              : 'bg-white/5 text-white/40 border-transparent hover:border-white/10'
                          }`}
                        >
                          {eff.name}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">{getAmountLabel('movement', movementEffect)}</span>
                        <span className="font-mono text-[10px] font-black text-white">{Math.round(movementAmount * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        value={movementAmount} 
                        onChange={(e) => setMovementAmount(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                  </div>

                  {/* Diffusion Module */}
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <Cloud size={16} strokeWidth={3} />
                      </div>
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-white leading-none mb-1">Diffusion</h3>
                        <p className="text-[9px] text-white/40 uppercase tracking-tighter font-bold leading-none">Time & Space</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {DIFFUSION_EFFECTS.map((eff) => (
                        <button
                          key={eff.id}
                          onClick={() => setDiffusionEffect(eff.id as any)}
                          className={`px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${
                            diffusionEffect === eff.id 
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                              : 'bg-white/5 text-white/40 border-transparent hover:border-white/10'
                          }`}
                        >
                          {eff.name}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">{getAmountLabel('diffusion', diffusionEffect)}</span>
                        <span className="font-mono text-[10px] font-black text-white">{Math.round(diffusionAmount * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        value={diffusionAmount} 
                        onChange={(e) => setDiffusionAmount(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                  </div>

                  {/* Texture Module */}
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <Layers size={16} strokeWidth={3} />
                      </div>
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-white leading-none mb-1">Texture</h3>
                        <p className="text-[9px] text-white/40 uppercase tracking-tighter font-bold leading-none">Filter & Grit</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {TEXTURE_EFFECTS.map((eff) => (
                        <button
                          key={eff.id}
                          onClick={() => setTextureEffect(eff.id as any)}
                          className={`px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${
                            textureEffect === eff.id 
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                              : 'bg-white/5 text-white/40 border-transparent hover:border-white/10'
                          }`}
                        >
                          {eff.name}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">{getAmountLabel('texture', textureEffect)}</span>
                        <span className="font-mono text-[10px] font-black text-white">{Math.round(textureAmount * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        value={textureAmount} 
                        onChange={(e) => setTextureAmount(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="pt-10 border-t border-white/10 pb-20">
              </section>
              <section className="pt-10 border-t border-white/10 space-y-6">

                <button
                  onClick={resetToDefaults}
                  className="w-full py-5 bg-white/5 hover:bg-white/10 text-white/20 hover:text-red-500 text-[10px] uppercase tracking-[0.4em] font-black rounded-2xl transition-all border border-white/10 hover:border-red-500/20"
                >
                  Reset Optical Synth to Defaults
                </button>

                <button
                  onClick={async () => {
                    // Clear all caches and service workers, then hard reload
                    if ('caches' in window) {
                      const names = await caches.keys();
                      await Promise.all(names.map(name => caches.delete(name)));
                    }
                    if ('serviceWorker' in navigator) {
                      const registrations = await navigator.serviceWorker.getRegistrations();
                      await Promise.all(registrations.map(r => r.unregister()));
                    }
                    window.location.reload();
                  }}
                  className="w-full py-5 bg-white/5 hover:bg-white/10 text-white/20 hover:text-emerald-400 text-[10px] uppercase tracking-[0.4em] font-black rounded-2xl transition-all border border-white/10 hover:border-emerald-500/20 flex items-center justify-center gap-3"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Check for Updates
                </button>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}


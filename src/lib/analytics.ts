/**
 * Chromesthesia Analytics Module
 *
 * Wraps Firebase Analytics (GA4) with typed event functions.
 * All calls are no-ops when analytics is not initialized.
 * No PII is ever collected — only feature usage and engagement metrics.
 */

import { logEvent, setUserProperties, type Analytics } from 'firebase/analytics';

let analytics: Analytics | null = null;
let sessionStartTime: number = 0;
let playbackStartTime: number = 0;
let hasTrackedSession = false;

// ─── Initialization ──────────────────────────────────────────────

export function initAnalytics(instance: Analytics) {
  analytics = instance;
  sessionStartTime = Date.now();

  // Track page view / session start (GA4 does this automatically,
  // but we add a custom event for the app context)
  track('app_loaded', {
    timestamp: new Date().toISOString(),
  });

  // Track session end on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      const durationSec = Math.round((Date.now() - sessionStartTime) / 1000);
      track('session_end', { duration_seconds: durationSec });
    });
  }
}

// ─── Core Track Function ──────────────────────────────────────────

function track(eventName: string, params?: Record<string, string | number | boolean>) {
  if (!analytics) return;
  try {
    logEvent(analytics, eventName, params);
  } catch (e) {
    // Never let analytics break the app
  }
}

// ─── Session & Device ─────────────────────────────────────────────

export function trackSessionConfig(performanceMode: boolean, voiceCount: number) {
  if (hasTrackedSession) return;
  hasTrackedSession = true;

  const tier = voiceCount <= 8 ? 'low' : voiceCount <= 12 ? 'mid' : 'high';

  if (analytics) {
    setUserProperties(analytics, {
      device_tier: tier,
      performance_mode: String(performanceMode),
    });
  }

  track('session_config', {
    performance_mode: performanceMode,
    device_tier: tier,
    voice_count: voiceCount,
  });
}

// ─── Media Input ──────────────────────────────────────────────────

export function trackMediaLoaded(mediaType: 'image' | 'video' | 'webcam' | 'procedural', source: 'upload' | 'generated' | 'webcam' | 'youtube') {
  track('media_loaded', { media_type: mediaType, source });
}

export function trackFeelingLucky() {
  track('feeling_lucky');
}

// ─── Playback ─────────────────────────────────────────────────────

export function trackPlaybackStart(modules: { synthMatrix: boolean; drone: boolean; sequencer: boolean }) {
  playbackStartTime = Date.now();
  track('playback_start', {
    synth_matrix: modules.synthMatrix,
    drone: modules.drone,
    sequencer: modules.sequencer,
  });
}

export function trackPlaybackStop() {
  const durationSec = playbackStartTime > 0
    ? Math.round((Date.now() - playbackStartTime) / 1000)
    : 0;
  playbackStartTime = 0;
  track('playback_stop', { duration_seconds: durationSec });
}

// ─── Effects ──────────────────────────────────────────────────────

export function trackEffectChange(
  module: 'main' | 'drone' | 'sequencer',
  chain: 'character' | 'movement' | 'diffusion' | 'texture',
  effectId: string
) {
  track('effect_change', { module, chain, effect_id: effectId });
}

export function trackEffectParamChange(
  module: 'main' | 'drone' | 'sequencer',
  chain: 'character' | 'movement' | 'diffusion' | 'texture',
  effectId: string,
  paramId: string
) {
  // Debounced — only track that a param was touched, not every slider tick
  track('effect_param_adjust', { module, chain, effect_id: effectId, param_id: paramId });
}

// ─── Modules ──────────────────────────────────────────────────────

export function trackModuleToggle(module: 'drone' | 'sequencer' | 'visuals' | 'synth_matrix' | 'mixer', enabled: boolean) {
  track('module_toggle', { module, enabled });
}

export function trackPanelOpen(panel: 'settings' | 'manual' | 'mixer' | 'drone' | 'sequencer' | 'visuals' | 'recording') {
  track('panel_open', { panel });
}

// ─── Patches & Presets ────────────────────────────────────────────

export function trackPatchApplied(patchIndex: number, patchName: string) {
  track('patch_applied', { patch_index: patchIndex, patch_name: patchName });
}

export function trackDronePatchApplied(patchIndex: number) {
  track('drone_patch_applied', { patch_index: patchIndex });
}

export function trackSeqPresetApplied(presetIndex: number) {
  track('seq_preset_applied', { preset_index: presetIndex });
}

// ─── Recording ────────────────────────────────────────────────────

export function trackRecordingStart(mode: string, quality: string, resolution: string, capture: string) {
  track('recording_start', { mode, quality, resolution, capture });
}

export function trackRecordingComplete(durationSeconds: number, mode: string) {
  track('recording_complete', { duration_seconds: durationSeconds, mode });
}

// ─── Scan & Scale ─────────────────────────────────────────────────

export function trackScanPresetChange(presetIndex: number, presetName: string) {
  track('scan_preset_change', { preset_index: presetIndex, preset_name: presetName });
}

export function trackScaleChange(scale: string, rootNote: string) {
  track('scale_change', { scale, root_note: rootNote });
}

// ─── Webcam ───────────────────────────────────────────────────────

export function trackWebcamActivated() {
  track('webcam_activated');
}

// ─── Master Bus FX ────────────────────────────────────────────────

export function trackMasterFxChange(param: 'reverb' | 'compression' | 'saturation' | 'filter', value: number) {
  track('master_fx_change', { param, value: Math.round(value * 100) });
}

// ─── Wave Table / Synth Settings ──────────────────────────────────

export function trackWaveTableChange(waveTable: string) {
  track('wave_table_change', { wave_table: waveTable });
}

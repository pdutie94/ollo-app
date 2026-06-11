import type { ProfileFingerprint } from '@shared/types'

/**
 * Translate ProfileFingerprint config into Chromium CLI launch arguments.
 */
export function buildFingerprintArgs(fingerprint: ProfileFingerprint | null): string[] {
  const args: string[] = []

  if (!fingerprint) return args

  // Language
  if (fingerprint.language) {
    args.push(`--lang=${fingerprint.language}`)
    args.push(`--accept-lang=${fingerprint.language}`)
  }

  // Resolution override
  if (fingerprint.resolution) {
    const match = fingerprint.resolution.match(/^(\d+)[×x](\d+)$/)
    if (match) {
      args.push(`--window-size=${match[1]},${match[2]}`)
    }
  }

  // Timezone — simulate via env-like via timezone JS override (injected as script)
  // Timezone is handled via initScript, not CLI args.

  // WebRTC protection
  if (fingerprint.webrtcProtection) {
    args.push('--disable-webrtc')
    args.push('--enforce-webrtc-ip-permission-check')
    args.push('--force-webrtc-ip-handling-policy=disable_non_proxied_udp')
  }

  // GPU / WebGL spoofing
  if (fingerprint.webglSpoofing) {
    args.push('--disable-gpu')
  }

  // Font guard — we use initScript for font enumeration spoofing

  return args
}

/**
 * Build browser viewport from resolution string.
 */
export function getViewportFromResolution(resolution: string | undefined): { width: number; height: number } | undefined {
  if (!resolution) return undefined
  const match = resolution.match(/^(\d+)[×x](\d+)$/)
  if (!match) return undefined
  return {
    width: parseInt(match[1], 10),
    height: parseInt(match[2], 10)
  }
}

import type { ProfileFingerprint } from '@shared/types'

/**
 * Generate an array of JavaScript source strings to inject into the browser context
 * for fingerprint spoofing via context.addInitScript().
 */
export function buildFingerprintInitScripts(fingerprint: ProfileFingerprint | null): string[] {
  if (!fingerprint) return []

  const scripts: string[] = []

  // ── 8.2.3: Canvas fingerprint spoofing ──
  if (fingerprint.canvasSpoofing) {
    scripts.push(`
(function() {
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  const originalToBlob = HTMLCanvasElement.prototype.toBlob;
  const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;

  const spoofPixel = function(pixel) {
    pixel[0] = pixel[0] ^ 1; // R
    pixel[1] = pixel[1] ^ 2; // G
    pixel[2] = pixel[2] ^ 3; // B
    return pixel;
  };

  HTMLCanvasElement.prototype.toDataURL = function() {
    const ctx = this.getContext('2d');
    if (ctx) {
      try {
        const imageData = ctx.getImageData(0, 0, this.width, this.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
          spoofPixel([imageData.data[i], imageData.data[i+1], imageData.data[i+2]]);
        }
        ctx.putImageData(imageData, 0, 0);
      } catch(e) {}
    }
    return originalToDataURL.apply(this, arguments);
  };

  HTMLCanvasElement.prototype.toBlob = function() {
    const ctx = this.getContext('2d');
    if (ctx) {
      try {
        const imageData = ctx.getImageData(0, 0, this.width, this.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
          spoofPixel([imageData.data[i], imageData.data[i+1], imageData.data[i+2]]);
        }
        ctx.putImageData(imageData, 0, 0);
      } catch(e) {}
    }
    return originalToBlob.apply(this, arguments);
  };

  CanvasRenderingContext2D.prototype.getImageData = function() {
    const imageData = originalGetImageData.apply(this, arguments);
    for (let i = 0; i < imageData.data.length; i += 4) {
      spoofPixel([imageData.data[i], imageData.data[i+1], imageData.data[i+2]]);
    }
    return imageData;
  };
})();
`)
  }

  // ── 8.2.3: WebGL fingerprint spoofing ──
  if (fingerprint.webglSpoofing) {
    const vendor = fingerprint.webglVendor || 'Google Inc. (Intel)'
    const renderer = fingerprint.webglRenderer || 'ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0)'
    scripts.push(`
(function() {
  const getParameter = WebGLRenderingContext.prototype.getParameter;
  WebGLRenderingContext.prototype.getParameter = function(param) {
    // VENDOR
    if (param === 0x1F00 || param === 7936) { return "${vendor}"; }
    // RENDERER
    if (param === 0x1F01 || param === 7937) { return "${renderer}"; }
    // UNMASKED_VENDOR_WEBGL
    if (param === 0x9245) { return "${vendor}"; }
    // UNMASKED_RENDERER_WEBGL
    if (param === 0x9246) { return "${renderer}"; }
    // VERSION
    if (param === 0x1F02 || param === 7938) { return "WebGL 1.0 (OpenGL ES 2.0 Chromium)"; }
    // SHADING_LANGUAGE_VERSION
    if (param === 0x8B8C || param === 35724) { return "WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)"; }
    return getParameter.apply(this, arguments);
  };

  // Also spoof WebGL2
  if (typeof WebGL2RenderingContext !== 'undefined') {
    const getParameter2 = WebGL2RenderingContext.prototype.getParameter;
    WebGL2RenderingContext.prototype.getParameter = function(param) {
      if (param === 0x1F00 || param === 7936) { return "${vendor}"; }
      if (param === 0x1F01 || param === 7937) { return "${renderer}"; }
      if (param === 0x9245) { return "${vendor}"; }
      if (param === 0x9246) { return "${renderer}"; }
      return getParameter2.apply(this, arguments);
    };
  }
})();
`)
  }

  // ── 8.2.3: AudioContext fingerprint spoofing ──
  if (fingerprint.audioSpoofing) {
    scripts.push(`
(function() {
  const originalGetChannelData = AudioBuffer.prototype.getChannelData;
  AudioBuffer.prototype.getChannelData = function() {
    const data = originalGetChannelData.apply(this, arguments);
    for (let i = 0; i < data.length; i++) {
      data[i] = data[i] + 0.000001;
    }
    return data;
  };

  const originalCreateOscillator = AudioContext.prototype.createOscillator;
  AudioContext.prototype.createOscillator = function() {
    const osc = originalCreateOscillator.apply(this, arguments);
    const originalGetFrequency = osc.frequency.value;
    Object.defineProperty(osc.frequency, 'value', {
      get: function() { return originalGetFrequency + 0.0001; },
      set: function(v) { originalGetFrequency = v - 0.0001; }
    });
    return osc;
  };

  const originalCreateAnalyser = AudioContext.prototype.createAnalyser || (typeof OfflineAudioContext !== 'undefined' ? OfflineAudioContext.prototype.createAnalyser : null);
  if (originalCreateAnalyser) {
    const target = typeof AudioContext !== 'undefined' ? AudioContext.prototype : OfflineAudioContext.prototype;
    target.createAnalyser = function() {
      const analyser = originalCreateAnalyser.apply(this, arguments);
      const originalGetFloatFrequencyData = analyser.getFloatFrequencyData;
      analyser.getFloatFrequencyData = function(array) {
        originalGetFloatFrequencyData.apply(this, arguments);
        for (let i = 0; i < array.length; i++) {
          array[i] = array[i] + 0.01;
        }
      };
      return analyser;
    };
  }
})();
`)
  }

  // ── 8.2.4: WebRTC leak protection ──
  if (fingerprint.webrtcProtection) {
    scripts.push(`
(function() {
  // Override RTCPeerConnection to prevent leaking local IPs
  const originalCreateDataChannel = RTCPeerConnection.prototype.createDataChannel;
  RTCPeerConnection.prototype.createDataChannel = function() {
    // No-op to prevent data channel creation for IP discovery
    return null;
  };

  // Block navigator.mediaDevices.enumerateDevices if that leaks info
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    const originalEnumerate = navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
    navigator.mediaDevices.enumerateDevices = function() {
      return originalEnumerate().then(function(devices) {
        return devices.filter(function(d) { return d.kind !== 'audioinput' && d.kind !== 'videoinput'; });
      });
    };
  }
})();
`)
  }

  // ── 8.2.5: Font fingerprint guard ──
  if (fingerprint.fontFingerprintGuard) {
    scripts.push(`
(function() {
  // Override measureText to add slight noise to font metrics
  const originalMeasureText = CanvasRenderingContext2D.prototype.measureText;
  CanvasRenderingContext2D.prototype.measureText = function(text) {
    const metrics = originalMeasureText.apply(this, arguments);
    const originalWidth = metrics.width;
    Object.defineProperty(metrics, 'width', {
      get: function() { return originalWidth + 0.001; }
    });
    return metrics;
  };

  // Block font enumeration via document.fonts
  if (document.fonts) {
    const originalCheck = document.fonts.check;
    document.fonts.check = function() { return false; };
  }
})();
`)
  }

  // ── Timezone override ──
  if (fingerprint.timezone) {
    scripts.push(`
(function() {
  const targetTimezone = "${fingerprint.timezone}";
  // Override Date.prototype.getTimezoneOffset
  const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
  Date.prototype.getTimezoneOffset = function() {
    const date = new Date();
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: targetTimezone }));
    return (utcDate - tzDate) / 60000;
  };

  // Override Intl.DateTimeFormat to return the target timezone
  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    const originalResolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
    Intl.DateTimeFormat.prototype.resolvedOptions = function() {
      const result = originalResolvedOptions.apply(this, arguments);
      result.timeZone = targetTimezone;
      return result;
    };
  }
})();
`)
  }

  // ── OS override ──
  if (fingerprint.os) {
    const osMap: Record<string, string> = {
      'Windows': 'Win32',
      'macOS': 'MacIntel',
      'Linux': 'Linux x86_64'
    }
    const platform = osMap[fingerprint.os] || 'Win32'
    scripts.push(`
(function() {
  Object.defineProperty(navigator, 'platform', {
    get: function() { return "${platform}"; },
    configurable: true
  });
  Object.defineProperty(navigator, 'oscpu', {
    get: function() { return "${fingerprint.os === 'Windows' ? 'Windows NT 10.0' : fingerprint.os === 'macOS' ? 'Intel Mac OS X 10_15_7' : 'Linux x86_64'}"; },
    configurable: true
  });
})();
`)
  }

  return scripts
}

import { WAKE_MEDIA } from './wakeMedia';

// Keeps the screen on during playback: the Screen Wake Lock API where available, plus a
// silent looping video for iOS and older browsers.
export class StayAwake {
  private video: HTMLVideoElement | null = null;
  private lock: WakeLockSentinel | null = null;
  private enabled = false;

  private onVisibility = () => {
    if (this.enabled && document.visibilityState === 'visible') {
      this.requestLock();
      this.video?.play().catch(() => {});
    }
  };

  enable(): void {
    this.enabled = true;
    this.ensureVideo().play().catch(() => {});
    this.requestLock();
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  disable(): void {
    this.enabled = false;
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.lock?.release().catch(() => {});
    this.lock = null;
    if (this.video && !this.video.paused) this.video.pause();
  }

  dispose(): void {
    this.disable();
    this.video?.remove();
    this.video = null;
  }

  private ensureVideo(): HTMLVideoElement {
    if (this.video) return this.video;
    const video = document.createElement('video');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.muted = true;
    video.loop = true;
    video.disablePictureInPicture = true;
    video.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;';
    for (const [type, src] of [
      ['webm', WAKE_MEDIA.webm],
      ['mp4', WAKE_MEDIA.mp4],
    ]) {
      const source = document.createElement('source');
      source.src = src;
      source.type = `video/${type}`;
      video.appendChild(source);
    }
    video.addEventListener('pause', () => {
      if (this.enabled) video.play().catch(() => {});
    });
    document.body.appendChild(video);
    this.video = video;
    return video;
  }

  private async requestLock(): Promise<void> {
    if (!('wakeLock' in navigator) || !this.enabled) return;
    try {
      const sentinel = await navigator.wakeLock.request('screen');
      if (!this.enabled) {
        sentinel.release().catch(() => {});
        return;
      }
      this.lock?.release().catch(() => {});
      this.lock = sentinel;
      sentinel.addEventListener('release', () => {
        if (this.lock === sentinel) this.lock = null;
      });
    } catch {
      // Denied or unsupported; the video fallback still runs.
    }
  }
}

export type MediaSessionMeta = {
  title: string;
  artist: string;
  album: string;
  /** Site path, e.g. `/og.jpg` — resolved against `window.location.origin`. */
  artworkPath: string;
};

function supported(): boolean {
  return typeof navigator !== 'undefined' && 'mediaSession' in navigator;
}

function artworkFor(path: string): MediaImage[] {
  const src = new URL(path, window.location.origin).href;
  return [
    { src, sizes: '256x256', type: 'image/jpeg' },
    { src, sizes: '512x512', type: 'image/jpeg' },
  ];
}

export class MediaSessionController {
  private playHandler: (() => void | Promise<void>) | null = null;
  private pauseHandler: (() => void | Promise<void>) | null = null;

  setHandlers(handlers: {
    play: () => void | Promise<void>;
    pause: () => void | Promise<void>;
  }): void {
    if (!supported()) return;
    this.playHandler = handlers.play;
    this.pauseHandler = handlers.pause;
    try {
      navigator.mediaSession.setActionHandler('play', () => {
        void this.playHandler?.();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        void this.pauseHandler?.();
      });
    } catch {
      // Some browsers reject unknown or duplicate handlers.
    }
  }

  setMetadata(meta: MediaSessionMeta): void {
    if (!supported()) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: meta.title,
        artist: meta.artist,
        album: meta.album,
        artwork: artworkFor(meta.artworkPath),
      });
    } catch {
      // MediaMetadata unsupported or artwork rejected.
    }
  }

  setPlaying(playing: boolean): void {
    if (!supported()) return;
    try {
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    } catch {
      // playbackState not writable in some environments.
    }
  }

  dispose(): void {
    if (!supported()) return;
    this.playHandler = null;
    this.pauseHandler = null;
    try {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
    } catch {
      // ignore
    }
    try {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
    } catch {
      // ignore
    }
  }
}

export class PreviewIframe {
  private iframe: HTMLIFrameElement;
  private currentUrl: string = '';

  constructor(iframeElement: HTMLIFrameElement) {
    this.iframe = iframeElement;
    this.setupHmrListener();
  }

  loadUrl(url: string): void {
    this.currentUrl = url;
    this.iframe.src = url;
  }

  getContent(): string {
    try {
      const doc = this.iframe.contentDocument;
      if (!doc) {
        return '';
      }
      return doc.documentElement?.outerHTML || '';
    } catch (error) {
      console.error('Error getting iframe content:', error);
      return '';
    }
  }

  private setupHmrListener(): void {
    const channel = new BroadcastChannel('vite-hmr');
    channel.onmessage = (event) => {
      if (event.data?.type === 'full-reload' || event.data?.type === 'update') {
        this.loadUrl(this.currentUrl);
      }
    };
  }
}
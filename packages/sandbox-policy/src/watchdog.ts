export class WorkerWatchdog {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private missed = 0;

  constructor(
    private worker: Worker,
    private intervalMs = 5000,
  ) {}

  start = (): void => {
    const check = (): void => {
      this.missed++;
      if (this.missed > 1) {
        this.worker.terminate();
        this.stop();
        return;
      }
      this.timer = setTimeout(check, this.intervalMs);
    };
    this.timer = setTimeout(check, this.intervalMs);
  };

  reset = (): void => {
    this.missed = 0;
  };

  stop = (): void => {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  };
}

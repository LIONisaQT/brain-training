export class ResponseTimer {
  private times: number[] = [];
  private startTime: number | null = null;

  start(): void {
    if (this.startTime !== null) {
      throw new Error("Cannot start response timer: timer is already running.");
    }

    this.startTime = Date.now();
  }

  stop(): number {
    if (this.startTime === null) {
      throw new Error(
        "Cannot stop response timer: no timer is currently running.",
      );
    }

    const elapsedMs = Date.now() - this.startTime;
    this.times.push(elapsedMs);
    this.startTime = null;
    return elapsedMs;
  }

  reset(): void {
    this.times = [];
    this.startTime = null;
  }

  isRunning(): boolean {
    return this.startTime !== null;
  }

  getTimes(): number[] {
    return [...this.times];
  }

  getLastTime(): number | null {
    return this.times.length > 0 ? this.times[this.times.length - 1] : null;
  }

  getTotalTime(): number {
    return this.times.reduce((sum, value) => sum + value, 0);
  }

  getAverageTime(): number {
    if (this.times.length === 0) {
      return 0;
    }

    return this.getTotalTime() / this.times.length;
  }
}

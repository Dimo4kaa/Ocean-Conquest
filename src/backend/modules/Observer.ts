export class Observer {
  watchers = new Set<any>();

  subscribe(watcher: any) {
    this.watchers.add(watcher);

    return () => this.watchers.delete(watcher);
  }

  dispatch(...args: any) {
    for (const watcher of this.watchers) {
      watcher(...args);
    }
  }
};

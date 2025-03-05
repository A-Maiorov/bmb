export class BmbLock {
  isMain = false;

  //private _lockProm: Promise<unknown>;

  canSync: Promise<boolean>;
  constructor(private name: string) {
    this.canSync = new Promise(async (res) => {
      const snap = await navigator.locks.query();
      const main = (snap.held ?? []).find((x) => x.name === this.name);
      res(main != undefined);
    });

    // this._lockProm =
    navigator.locks.request(
      name,
      {
        mode: "exclusive",
      },
      (lock: Lock | null) => {
        if (lock) {
          this.isMain = true;
        } else {
          this.isMain = false;
        }

        console.log("lock cb: " + this.isMain);
        return new Promise<void>(() => {});
      }
    );
  }
}

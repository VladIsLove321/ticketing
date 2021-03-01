import nats, { Stan, StanOptions } from "node-nats-streaming";

class NatsWrapper {
  private _client?: Stan;
  get client() {
    if (!this._client) {
      throw new Error("Cannot Access nats before connection");
    }
    return this._client;
  }
  connect(
    clusterID: string,
    clientID: string,
    opts?: StanOptions
  ): Promise<void> {
    this._client = nats.connect(clusterID, clientID, opts);
    return new Promise((res, rej) => {
      this.client.on("connect", () => {
        console.log("Connected to nats");
        res();
      });
      this.client.on("error", (err) => {
        rej(err);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();

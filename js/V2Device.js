class V2Device extends V2Connection {
  constructor(log, connect) {
    super(log, connect);

    return Object.seal(this);
  }

  connect(device) {
    if (this.version) {
      this.version.remove();
      this.version = null;
    }

    this.device.disconnect();
    for (const notifier of this.notifiers.reset)
      notifier();

    this.device.input = device.in;
    this.device.output = device.out;
    this.select.setConnected();

    // Dispatch incoming messages to V2MIDIDevice.
    if (this.device.input)
      this.device.input.onmidimessage = this.device.handleMessage.bind(this.device);

    for (const notifier of this.notifiers.show)
      notifier();
  }

  disconnect() {
    this.device.disconnect();
    this.select.setDisconnected();

    for (const notifier of this.notifiers.reset)
      notifier();
  }

  sendReset() {
    this.sendSystemReset();
  }
}

class V2Device extends V2Connection {
  constructor(app, log, connect) {
    super(app, log, connect);
    Object.seal(this);
  }

  connect(device) {
    if (this.version) {
      this.version.remove();
      this.version = null;
    }

    this.device.disconnect();
    this.app.callSections('reset');

    this.device.input = device.in;
    this.device.output = device.out;
    this.select.setConnected();

    // Dispatch incoming messages to V2MIDIDevice.
    if (this.device.input)
      this.device.input.onmidimessage = this.device.handleMessage.bind(this.device);

    this.app.callSections('show');
  }

  disconnect() {
    this.device.disconnect();
    this.select.setDisconnected();
    this.app.callSections('reset');
  }

  sendReset() {
    this.sendSystemReset();
  }
}

class V2Device extends V2Connection {
  constructor(app, log, connect) {
    super(app, log, connect);
    Object.seal(this);

    this.addSection();
    this.canvas.appendChild(this.connection.element);

    V2App.addElement(this.canvas, 'p', (e) => {
      e.classList.add('center');
      e.innerHTML = '<a href=' + document.querySelector('link[rel="source"]').href +
        ' target="software">' + document.querySelector('meta[name="name"]').content +
        '</a>, version ' + Number(document.querySelector('meta[name="version"]').content);
    });
  }

  connect(device) {
    this.removeSection();
    this.addSection();
    this.canvas.appendChild(this.connection.element);

    this.device.disconnect();
    this.app.callSections('reset');

    this.device.input = device.in;
    this.device.output = device.out;
    this.connection.select.setConnected();

    // Dispatch incoming messages to V2MIDIDevice.
    if (this.device.input)
      this.device.input.onmidimessage = this.device.handleMessage.bind(this.device);

    V2App.addElement(this.canvas, 'table', (e) => {
      V2App.addElement(e, 'tbody', (body) => {
        V2App.addElement(body, 'tr', (row) => {
          V2App.addElement(row, 'td', (e) => {
            e.textContent = 'Manufacturer';
          });

          V2App.addElement(row, 'td', (e) => {
            e.textContent = this.device.getValue('manufacturer');
          });
        });

        V2App.addElement(body, 'tr', (row) => {
          V2App.addElement(row, 'td', (e) => {
            e.textContent = 'Name';
          });

          V2App.addElement(row, 'td', (e) => {
            e.textContent = this.device.getValue('name');
          });
        });

        if (this.device.getValue('version')) {
          V2App.addElement(body, 'tr', (row) => {
            V2App.addElement(row, 'td', (e) => {
              e.textContent = 'Version';
            });

            V2App.addElement(row, 'td', (e) => {
              e.textContent = this.device.getValue('version');
            });
          });
        }
      });
    });

    this.app.callSections('show');
  }

  disconnect() {
    this.removeSection();
    this.addSection();
    this.canvas.appendChild(this.connection.element);

    this.device.disconnect();
    this.connection.select.setDisconnected();
    this.app.callSections('reset');
  }

  sendReset() {
    this.sendSystemReset();
  }
}

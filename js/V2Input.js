class V2Input extends V2AppSection {
  #device = null;
  #element = null;
  #wakeLock = null;
  #lock = null;
  #select = null;
  #inputDevice = null;
  #channel = null;
  #transpose = null;

  constructor(device) {
    super('input', '--right-to-bracket', 'Input', 'Listen to Events from another Device');
    this.#device = device;

    V2App.addElement(this.canvas, 'div', (e) => {
      this.#element = e;
      e.id = this.id + '.element';
    });

    this.#device.getMIDI().addNotifier('state', (event) => {
      if (this.#select)
        this.#updateSelect();
    });

    this.#device.addNotifier('show', () => {
      this.#show();
      this.attach();
    });

    this.#device.addNotifier('reset', () => {
      this.detach();
      while (this.#element.firstChild)
        this.#element.firstChild.remove();
    });

    return Object.seal(this);
  }

  #updateSelect() {
    let devices = this.#device.getMIDI().getDevices('input');

    // Remove the device we are connected to.
    devices.delete(this.#device.getDevice().getID());

    this.#select.update(devices);
  }

  #connect(device) {
    if (this.#inputDevice)
      this.#inputDevice.disconnect();

    this.#inputDevice.input = device.in;
    this.#inputDevice.output = device.out;
    this.#select.setConnected();

    // Dispatch incoming messages to V2MIDIDevice.
    this.#inputDevice.input.onmidimessage = this.#inputDevice.handleMessage.bind(this.#inputDevice);
  }

  #releaseWakeLock() {
    if (!this.#wakeLock)
      return;

    this.#wakeLock.release();
    this.#wakeLock = null;

    this.#lock.textContent = 'Lock';
  }

  #show() {
    new V2AppMenu(this.#element, (menu) => {
      menu.addElement('button', (e) => {
        this.#lock = e;
        e.disabled = true;
        e.textContent = 'Lock';

        e.addEventListener('click', () => {
          const requestWakeLock = async () => {
            if (!navigator.wakeLock)
              return;

            this.#wakeLock = await navigator.wakeLock.request('screen');
            this.#wakeLock.onrelease = () => {
              this.#releaseWakeLock();
            };
          };

          if (!this.#wakeLock) {
            requestWakeLock();
            e.textContent = 'Release';

          } else
            this.#releaseWakeLock();
        });
      });
    });

    new V2AppMenu(this.#element, (menu) => {
      menu.addElement('span', (e) => {
        e.textContent = 'Device';
      });

      menu.addItem((li) => {
        this.#select = new V2MIDISelect(li);
      });
    });

    this.#select.addNotifier('select', (device) => {
      if (device) {
        this.#connect(device);
        this.#lock.disabled = false;

      } else {
        this.#inputDevice.disconnect();
        this.#select.setDisconnected();
        this.#releaseWakeLock();
        this.#lock.disabled = true;
      }
    });

    this.#updateSelect();

    new V2AppMenu(this.#element, (menu) => {
      menu.addElement('span', (e) => {
        e.textContent = 'Transpose';
      });

      menu.addElement('select', (select) => {
        this.#transpose = select;

        for (const i of [48, 36, 24, 12, 0, -12, -24, -36, -48]) {
          V2App.addElement(select, 'option', (e) => {
            e.value = i;
            e.text = (i > 0) ? '+' + i : i;

            if (i === 0)
              e.selected = true;
          });
        }
      });
    });

    new V2AppMenu(this.#element, (menu) => {
      menu.addElement('span', (e) => {
        e.textContent = 'Channel';
      });

      menu.addElement('select', (select) => {
        this.#channel = select;
        
        V2App.addElement(select, 'option', (e) => {
          e.value = null;
          e.text = '–';
        });

        for (let i = 1; i < 17; i++) {
          V2App.addElement(select, 'option', (e) => {
            e.value = i;
            e.text = i;
          });
        }
      });
    });

    this.#inputDevice = new V2MIDIDevice();
    this.#inputDevice.addNotifier('message', (message) => {
      const status = V2MIDI.Status.getType(message[0]);
      switch (status) {
        case V2MIDI.Status.noteOn:
        case V2MIDI.Status.noteOff:
        case V2MIDI.Status.aftertouch:
          if (this.#transpose.value !== 0) {
            let note = message[1] + Number(this.#transpose.value);
            if (note < 0)
              note = 0;
            else if (note > 127)
              note = 127;

            message[1] = note;
          }

          if (!isNull(this.#channel.value))
            message[0] = status | (this.#channel.value - 1);
          break;
      }

      this.#device.getDevice().sendMessage(message);
    });
  }

  #reset() {
    this.#select = null;
    super.reset();
  }
}

class V2Input extends V2AppSection {
  #wakeLock = null;
  #lock = null;
  #select = null;
  #inputDevice = null;
  #channel = null;
  #transpose = null;

  constructor(app) {
    super(app, 'input', '--right-to-bracket', 'Input', 'Forward Events from another Device');
    Object.seal(this);
  }

  show() {
    this.removeSection();
    this.addSection();

    new V2AppMenu(this.canvas, (menu) => {
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

    new V2AppMenu(this.canvas, (menu) => {
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

    new V2AppMenu(this.canvas, (menu) => {
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

      menu.addElement('button', (e) => {
        V2App.addElement(e, 'i', (i) => {
          i.classList.add('icon', '--nospace', '--minus');
        });
        e.addEventListener('click', () => {
          if (this.#transpose.selectedIndex === 0)
            return;

          this.#transpose.selectedIndex--;
          this.#transpose.dispatchEvent(new Event('change'));
        });
      });

      menu.addElement('button', (e) => {
        V2App.addElement(e, 'i', (i) => {
          i.classList.add('icon', '--nospace', '--plus');
        });
        e.addEventListener('click', () => {
          if (this.#transpose.selectedIndex === this.#transpose.options.length - 1)
            return;

          this.#transpose.selectedIndex++;
          this.#transpose.dispatchEvent(new Event('change'));
        });
      });
    });

    new V2AppMenu(this.canvas, (menu) => {
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

      menu.addElement('button', (e) => {
        V2App.addElement(e, 'i', (i) => {
          i.classList.add('icon', '--nospace', '--minus');
        });
        e.addEventListener('click', () => {
          if (this.#channel.selectedIndex === 0)
            return;

          this.#channel.selectedIndex--;
          this.#channel.dispatchEvent(new Event('change'));
        });
      });

      menu.addElement('button', (e) => {
        V2App.addElement(e, 'i', (i) => {
          i.classList.add('icon', '--nospace', '--plus');
        });
        e.addEventListener('click', () => {
          if (this.#channel.selectedIndex === this.#channel.options.length - 1)
            return;

          this.#channel.selectedIndex++;
          this.#channel.dispatchEvent(new Event('change'));
        });
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

      this.app.main.getDevice().sendMessage(message);
    });
  }

  reset() {
    this.#select = null;
    this.removeSection();
  }

  #updateSelect() {
    let devices = this.app.main.getMIDI().getDevices('input');

    // Remove the device we are connected to.
    devices.delete(this.app.main.getDevice().getID());

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
}

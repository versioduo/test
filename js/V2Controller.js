class V2Controller extends V2AppSection {
  #device = null;
  #channel = null;
  #controller = null;
  #value = null;

  constructor(device) {
    super('controller', '--sliders', 'Controller', 'Send Control Changes');
    this.#device = device;

    this.#device.addNotifier('show', () => {
      this.removeSection();
      this.addSection();
      this.#show();
    });

    this.#device.addNotifier('reset', () => {
      this.removeSection();
    });

    return Object.seal(this);
  }

  #show() {
    new V2AppMenu(this.canvas, (menu) => {
      menu.addElement('button', (e) => {
        e.textContent = 'Notes Off';
        e.addEventListener('click', () => {
          this.#device.sendControlChange(this.#channel.value - 1, V2MIDI.CC.allNotesOff, 0);
        });
      });

      menu.addElement('button', (e) => {
        e.textContent = 'Controllers Off';
        e.addEventListener('click', () => {
          this.#device.sendControlChange(this.#channel.value - 1, V2MIDI.CC.resetAllControllers, 0);
        });
      });

      menu.addElement('button', (e) => {
        e.classList.add('primary');
        e.textContent = 'Send';
        e.addEventListener('click', () => {
          this.#device.sendControlChange(this.#channel.value - 1, this.#controller.value, this.#value.value);
        });
      });
    });

    new V2AppMenu(this.canvas, (menu) => {
      menu.addElement('span', (e) => {
        e.textContent = 'Channel';
      });

      menu.addElement('select', (select) => {
        this.#channel = select;

        for (let i = 1; i < 17; i++) {
          V2App.addElement(select, 'option', (e) => {
            e.value = i;
            e.text = i;
          });
        }
      });
    });

    {
      let text = null;
      let range = null;

      const update = (number) => {
        this.#controller.value = number;
        text.textContent = V2MIDI.CC.Name[number] || 'CC ' + number;
        range.value = number;
      };

      new V2AppMenu(this.canvas, (menu) => {
        menu.element.classList.add('full');

        menu.addElement('span', (e) => {
          e.textContent = 'Controller';
        });

        menu.addElement('span', (e) => {
          e.classList.add('grow');
          text = e;
        });

        menu.addElement('input', (e) => {
          this.#controller = e;
          e.type = 'number';
          e.value = V2MIDI.CC.channelVolume;
          e.min = 0;
          e.max = 127;
          e.addEventListener('input', () => {
            update(e.value);
          });
        });
      });

      V2App.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.type = 'range';
        e.min = 0;
        e.max = 127;
        e.addEventListener('input', () => {
          update(e.value);
        });
      });

      update(this.#controller.value);
    }

    {
      let range = null;

      new V2AppMenu(this.canvas, (menu) => {
        menu.element.classList.add('full');

        menu.addElement('span', (e) => {
          e.textContent = 'Value';
          e.classList.add('grow');
        });

        menu.addElement('input', (e) => {
          this.#value = e;
          e.type = 'number';
          e.min = 0;
          e.max = 127;
          e.value = 0;
          e.addEventListener('input', () => {
            range.value = e.value;
          });
        });

        menu.addElement('button', (e) => {
          V2App.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--minus');
          });
          e.addEventListener('click', () => {
            this.#value.stepDown();
            this.#value.dispatchEvent(new Event('input'));
          });
        });

        menu.addElement('button', (e) => {
          V2App.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--plus');
          });
          e.addEventListener('click', () => {
            this.#value.stepUp();
            this.#value.dispatchEvent(new Event('input'));
          });
        });
      });

      V2App.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.type = 'range';
        e.min = 0;
        e.max = 127;
        e.value = this.#value.value;
        e.addEventListener('input', () => {
          this.#value.value = e.value;
        });
      });
    }
  }
}

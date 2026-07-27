class V2Controller extends V2WebModule {
  #device = null;
  #element = null;
  #channel = null;
  #controller = null;
  #value = null;

  constructor(device) {
    super('controller', '--sliders', 'Controller', 'Send Control Changes');
    this.#device = device;

    V2Web.addElement(this.canvas, 'div', (e) => {
      this.#element = e;
      e.id = this.id + '.element';
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

  #show() {
    new V2WebMenu(this.#element, (menu) => {
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

    new V2WebMenu(this.#element, (menu) => {
      menu.addElement('span', (e) => {
        e.textContent = 'Channel';
      });

      menu.addElement('select', (select) => {
        this.#channel = select;

        for (let i = 1; i < 17; i++) {
          V2Web.addElement(select, 'option', (e) => {
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

      new V2WebMenu(this.#element, (menu) => {
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

      V2Web.addElement(this.#element, 'input', (e) => {
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

      new V2WebMenu(this.#element, (menu) => {
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
          V2Web.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--minus');
          });
          e.addEventListener('click', () => {
            this.#value.stepDown();
            this.#value.dispatchEvent(new Event('input'));
          });
        });

        menu.addElement('button', (e) => {
          V2Web.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--plus');
          });
          e.addEventListener('click', () => {
            this.#value.stepUp();
            this.#value.dispatchEvent(new Event('input'));
          });
        });
      });

      V2Web.addElement(this.#element, 'input', (e) => {
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

class V2Program extends V2WebModule {
  #device = null;
  #element = null;
  #channel = null;
  #program = null;
  #bank = null;

  constructor(device) {
    super('program', '--guitar', 'Program', 'Send MIDI Program Changes');
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
        e.classList.add('primary');
        e.textContent = 'Send';
        e.addEventListener('click', () => {
          this.#device.sendControlChange(this.#channel.value - 1, V2MIDI.CC.bankSelect, 0);
          this.#device.sendControlChange(this.#channel.value - 1, V2MIDI.CC.bankSelectLSB, this.#bank.value - 1);
          this.#device.sendProgramChange(this.#channel.value - 1, this.#program.value - 1);
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
        this.#program.value = number;
        text.textContent = V2MIDI.GM.Program.Name[number - 1];
        range.value = number;
      };

      new V2WebMenu(this.#element, (menu) => {
        menu.element.classList.add('full');

        menu.addElement('span', (e) => {
          e.classList.add('label');
          e.textContent = 'Program';
        });

        menu.addElement('span', (e) => {
          e.classList.add('grow');
          text = e;
        });

        menu.addElement('input', (e) => {
          this.#program = e;
          e.type = 'number';
          e.value = V2MIDI.GM.Program.acousticGrandPiano + 1;
          e.min = 1;
          e.max = 128;
          e.addEventListener('input', () => {
            update(e.value);
          });
        });
      });

      V2Web.addElement(this.#element, 'input', (e) => {
        range = e;
        e.type = 'range';
        e.min = 1;
        e.max = 128;
        e.addEventListener('input', () => {
          update(e.value);
        });
      });

      update(this.#program.value);
    }

    {
      let range = null;
      new V2WebMenu(this.#element, (menu) => {
        menu.element.classList.add('full');

        menu.addElement('span', (e) => {
          e.classList.add('grow');
          e.textContent = 'Bank';
        });

        menu.addElement('input', (e) => {
          this.#bank = e;
          e.type = 'number';
          e.value = 1;
          e.min = 1;
          e.max = 128;
          e.addEventListener('input', () => {
            range.value = e.value;
          });
        });

        menu.addElement('button', (e) => {
          V2Web.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--minus');
          });
          e.addEventListener('click', () => {
            this.#bank.stepDown();
            this.#bank.dispatchEvent(new Event('input'));
          });
        });

        menu.addElement('button', (e) => {
          V2Web.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--plus');
          });
          e.addEventListener('click', () => {
            this.#bank.stepUp();
            this.#bank.dispatchEvent(new Event('input'));
          });
        });
      });

      V2Web.addElement(this.#element, 'input', (e) => {
        range = e;
        e.type = 'range';
        e.min = 1;
        e.max = 128;
        e.value = this.#bank.value;
        e.addEventListener('input', () => {
          this.#bank.value = e.value;
        });
      });
    }
  }
}

class V2Program extends V2AppSection {
  #channel = null;
  #program = null;
  #bank = null;

  constructor(app) {
    super(app, 'program', '--guitar', 'Program', 'Send MIDI Program Changes');
    Object.seal(this);
  }

  show() {
    this.removeSection();
    this.addSection();

    new V2AppMenu(this.canvas, (menu) => {
      menu.addElement('button', (e) => {
        e.classList.add('primary');
        e.textContent = 'Send';
        e.addEventListener('click', () => {
          this.app.main.sendControlChange(this.#channel.value - 1, V2MIDI.CC.bankSelect, 0);
          this.app.main.sendControlChange(this.#channel.value - 1, V2MIDI.CC.bankSelectLSB, this.#bank.value - 1);
          this.app.main.sendProgramChange(this.#channel.value - 1, this.#program.value - 1);
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

    {
      let text = null;
      let range = null;

      const update = (number) => {
        this.#program.value = number;
        text.textContent = V2MIDI.GM.Program.Name[number - 1];
        range.value = number;
      };

      new V2AppMenu(this.canvas, (menu) => {
        menu.element.classList.add('full');

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

        menu.addElement('button', (e) => {
          V2App.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--minus');
          });
          e.addEventListener('click', () => {
            this.#program.stepDown();
            this.#program.dispatchEvent(new Event('input'));
          });
        });

        menu.addElement('button', (e) => {
          V2App.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--plus');
          });
          e.addEventListener('click', () => {
            this.#program.stepUp();
            this.#program.dispatchEvent(new Event('input'));
          });
        });
      });

      V2App.addElement(this.canvas, 'input', (e) => {
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
      new V2AppMenu(this.canvas, (menu) => {
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
          V2App.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--minus');
          });
          e.addEventListener('click', () => {
            this.#bank.stepDown();
            this.#bank.dispatchEvent(new Event('input'));
          });
        });

        menu.addElement('button', (e) => {
          V2App.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--plus');
          });
          e.addEventListener('click', () => {
            this.#bank.stepUp();
            this.#bank.dispatchEvent(new Event('input'));
          });
        });
      });

      V2App.addElement(this.canvas, 'input', (e) => {
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

  reset() {
    this.removeSection();
  }
}

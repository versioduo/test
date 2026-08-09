class V2Controller extends V2AppSection {
  #channel = null;
  #controller = null;
  #value = null;

  constructor(app) {
    super(app, 'controller', '--sliders', 'Controller', 'Send Control Changes');
    Object.seal(this);
  }

  show() {
    this.removeSection();
    this.addSection();

    new V2AppMenu(this.canvas, (menu) => {
      menu.addElement('button', (e) => {
        e.textContent = 'Notes Off';
        e.addEventListener('click', () => {
          this.app.main.sendControlChange(this.#channel.value - 1, V2MIDI.CC.allNotesOff, 0);
        });
      });

      menu.addElement('button', (e) => {
        e.textContent = 'Controllers Off';
        e.addEventListener('click', () => {
          this.app.main.sendControlChange(this.#channel.value - 1, V2MIDI.CC.resetAllControllers, 0);
        });
      });

      menu.addElement('button', (e) => {
        e.classList.add('primary');
        e.textContent = 'Send';
        e.addEventListener('click', () => {
          this.app.main.sendControlChange(this.#channel.value - 1, this.#controller.value, this.#value.value);
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
        this.#controller.value = number;
        text.textContent = V2MIDI.CC.Name[number] || 'CC ' + number;
        range.value = number;
      };

      new V2AppMenu(this.canvas, (menu) => {
        menu.element.classList.add('full');

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

        menu.addElement('button', (e) => {
          V2App.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--minus');
          });
          e.addEventListener('click', () => {
            this.#controller.stepDown();
            this.#controller.dispatchEvent(new Event('input'));
          });
        });

        menu.addElement('button', (e) => {
          V2App.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--plus');
          });
          e.addEventListener('click', () => {
            this.#controller.stepUp();
            this.#controller.dispatchEvent(new Event('input'));
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

  reset() {
    this.removeSection();
  };
}

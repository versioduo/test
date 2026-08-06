class V2Note extends V2AppSection {
  #device = null;
  #channel = null;
  #note = null;
  #velocity = null;
  #offVelocity = null;

  constructor(device) {
    super('note', '--music', 'Note', 'Send Notes');
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
        e.classList.add('primary');
        e.textContent = 'Send';
        e.addEventListener('mousedown', () => {
          this.#device.sendNote(this.#channel.value - 1, this.#note.value, this.#velocity.value);
        });
        e.addEventListener('mouseup', () => {
          this.#device.sendNoteOff(this.#channel.valuFe - 1, this.#note.value, this.#offVelocity.value);
        });
        e.addEventListener('touchstart', (event) => {
          e.classList.add('highlight');
          e.dispatchEvent(new MouseEvent('mousedown'));
        }, {
          passive: true
        });
        e.addEventListener('touchend', (event) => {
          e.classList.remove('highlight');
          e.dispatchEvent(new MouseEvent('mouseup'));
          if (event.cancelable)
            event.preventDefault();
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

      const updateNote = (number) => {
        text.textContent = V2MIDI.Note.getName(number);
        if (V2MIDI.Note.isBlack(number)) {
          text.classList.add('dark');
          text.classList.remove('light');
        } else {
          text.classList.remove('dark');
          text.classList.add('light');
        }
      };

      new V2AppMenu(this.canvas, (menu) => {
        menu.element.classList.add('full');

        menu.addElement('span', (e) => {
          e.textContent = 'Note';
          e.classList.add('label');
        });

        menu.addElement('span', (e) => {
          e.classList.add('grow');
          text = e;
        });

        menu.addElement('input', (e) => {
          this.#note = e;
          e.type = 'number';
          e.min = 0;
          e.max = 127;
          e.value = 60;
          e.addEventListener('input', () => {
            updateNote(e.value);
            range.value = e.value;
          });
        });

        menu.addElement('button', (e) => {
          V2App.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--minus');
          });
          e.addEventListener('click', () => {
            this.#note.stepDown();
            this.#note.dispatchEvent(new Event('input'));
          });
        });

        menu.addElement('button', (e) => {
          V2App.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--plus');
          });
          e.addEventListener('click', () => {
            this.#note.stepUp();
            this.#note.dispatchEvent(new Event('input'));
          });
        });
      });

      V2App.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.type = 'range';
        e.min = 0;
        e.max = 127;
        e.value = this.#note.value;
        e.addEventListener('input', () => {
          this.#note.value = Number(e.value);
          updateNote(e.value);
        });
      });

      updateNote(this.#note.value);
    }

    {
      let range = null;

      new V2AppMenu(this.canvas, (menu) => {
        menu.element.classList.add('full');

        menu.addElement('span', (e) => {
          e.textContent = 'Velocity';
          e.classList.add('grow');
        });

        menu.addElement('input', (e) => {
          this.#velocity = e;
          e.type = 'number';
          e.min = 1;
          e.max = 127;
          e.value = 10;
          e.addEventListener('input', (event) => {
            range.value = e.value;
          });
        });

        menu.addElement('button', (e) => {
          V2App.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--minus');
          });
          e.addEventListener('click', () => {
            this.#velocity.stepDown();
            this.#velocity.dispatchEvent(new Event('input'));
          });
        });

        menu.addElement('button', (e) => {
          V2App.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--plus');
          });
          e.addEventListener('click', () => {
            this.#velocity.stepUp();
            this.#velocity.dispatchEvent(new Event('input'));
          });
        });
      });

      V2App.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.type = 'range';
        e.min = 1;
        e.max = 127;
        e.value = 10;
        e.addEventListener('input', (event) => {
          this.#velocity.value = e.value;
        });
      });
    }

    {
      let range = null;

      new V2AppMenu(this.canvas, (menu) => {
        menu.element.classList.add('full');

        menu.addElement('span', (e) => {
          e.textContent = 'Release Velocity';
          e.classList.add('grow');
        });

        menu.addElement('input', (e) => {
          this.#offVelocity = e;
          e.type = 'number';
          e.min = 0;
          e.max = 127;
          e.value = 64;
          e.addEventListener('input', (event) => {
            range.value = e.value;
          });
        });

        menu.addElement('button', (e) => {
          V2App.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--minus');
          });
          e.addEventListener('click', () => {
            this.#offVelocity.stepDown();
            this.#offVelocity.dispatchEvent(new Event('input'));
          });
        });

        menu.addElement('button', (e) => {
          V2App.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--plus');
          });
          e.addEventListener('click', () => {
            this.#offVelocity.stepUp();
            this.#offVelocity.dispatchEvent(new Event('input'));
          });
        });
      });

      V2App.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.type = 'range';
        e.min = 0;
        e.max = 127;
        e.value = this.#offVelocity.value;
        e.addEventListener('input', (event) => {
          this.#offVelocity.value = e.value;
        });
      });
    }
  }
}

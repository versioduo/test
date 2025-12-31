// © Kay Sievers <kay@versioduo.com>, 2019-2022
// SPDX-License-Identifier: Apache-2.0

class V2Note extends V2WebModule {
  #device = null;
  #channel = null;
  #note = null;
  #velocity = null;
  #offVelocity = null;

  constructor(device) {
    super('note', 'Note', 'Send Note On / Off');
    this.#device = device;

    this.#device.addNotifier('show', () => {
      this.#show();
      this.attach();
    });

    this.#device.addNotifier('reset', () => {
      this.detach();
      this.reset();
    });

    return Object.seal(this);
  }

  #show() {
    V2Web.addButtons(this.canvas, (buttons) => {
      V2Web.addButton(buttons, (e) => {
        e.classList.add('is-link');
        e.textContent = 'Send';
        e.addEventListener('mousedown', () => {
          this.#device.sendNote(this.#channel.value - 1, this.#note.value, this.#velocity.value);
        });
        e.addEventListener('mouseup', () => {
          this.#device.sendNoteOff(this.#channel.value - 1, this.#note.value, this.#offVelocity.value);
        });
        e.addEventListener('touchstart', (event) => {
          e.classList.add('is-active');
          e.dispatchEvent(new MouseEvent('mousedown'));
        }, {
          passive: true
        });
        e.addEventListener('touchend', (event) => {
          e.classList.remove('is-active');
          e.dispatchEvent(new MouseEvent('mouseup'));
          if (event.cancelable)
            event.preventDefault();
        });
      });
    });

    new V2WebField(this.canvas, (field) => {
      field.addButton((e) => {
        e.classList.add('width-label');
        e.classList.add('has-background-grey-lighter');
        e.classList.add('inactive');
        e.textContent = 'Channel';
        e.tabIndex = -1;
      });

      field.addElement('span', (e) => {
        e.classList.add('select');

        V2Web.addElement(e, 'select', (select) => {
          this.#channel = select;

          for (let i = 1; i < 17; i++) {
            V2Web.addElement(select, 'option', (e) => {
              e.value = i;
              e.text = i;
            });
          }
        });
      });
    });

    {
      let text = null;
      let range = null;

      const updateNote = (number) => {
        text.textContent = V2MIDI.Note.getName(number);
        if (V2MIDI.Note.isBlack(number)) {
          text.classList.add('is-dark');
          text.classList.remove('has-background-light');
        } else {
          text.classList.remove('is-dark');
          text.classList.add('has-background-light');
        }
      }

      new V2WebField(this.canvas, (field) => {
        field.addButton((e) => {
          e.classList.add('width-label');
          e.classList.add('has-background-grey-lighter');
          e.classList.add('inactive');
          e.tabIndex = -1;
          e.textContent = 'Note';
        });

        field.addButton((e) => {
          text = e;
          e.classList.add('width-label');
          e.classList.add('inactive');
          e.tabIndex = -1;
        });

        field.addInput('number', (e) => {
          this.#note = e;
          e.classList.add('width-number');
          e.min = 0;
          e.max = 127;
          e.value = 60;
          e.addEventListener('input', () => {
            updateNote(e.value);
            range.value = e.value;
          });
        });
      });

      V2Web.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.classList.add('range');
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

      new V2WebField(this.canvas, (field) => {
        field.addButton((e) => {
          e.classList.add('width-label');
          e.classList.add('has-background-grey-lighter');
          e.classList.add('inactive');
          e.textContent = 'Velocity';
        });

        field.addInput('number', (e) => {
          this.#velocity = e;
          e.classList.add('width-number');
          e.min = 1;
          e.max = 127;
          e.value = 10;
          e.addEventListener('input', (event) => {
            range.value = e.value;
          });
        });
      });

      V2Web.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.type = 'range';
        e.classList.add('range');
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

      new V2WebField(this.canvas, (field) => {
        field.addButton((e) => {
          e.classList.add('width-label');
          e.classList.add('has-background-grey-lighter');
          e.classList.add('inactive');
          e.textContent = 'Release';
        });

        field.addInput('number', (e) => {
          this.#offVelocity = e;
          e.classList.add('width-number');
          e.min = 0;
          e.max = 127;
          e.value = 64;
          e.addEventListener('input', (event) => {
            range.value = e.value;
          });
        });
      });

      V2Web.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.type = 'range';
        e.classList.add('range');
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

// © Kay Sievers <kay@versioduo.com>, 2019-2022
// SPDX-License-Identifier: Apache-2.0

class V2Controller extends V2WebModule {
  #device = null;
  #channel = null;
  #controller = null;
  #value = null;

  constructor(device) {
    super('controller', 'Controller', 'Send Control Changes');
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
        e.textContent = 'Notes Off';
        e.addEventListener('click', () => {
          this.#device.sendControlChange(this.#channel.value - 1, V2MIDI.CC.allNotesOff, 0);
        });
      });

      V2Web.addButton(buttons, (e) => {
        e.textContent = 'Controllers Off';
        e.addEventListener('click', () => {
          this.#device.sendControlChange(this.#channel.value - 1, V2MIDI.CC.resetAllControllers, 0);
        });
      });

      V2Web.addButton(buttons, (e) => {
        e.classList.add('is-link');
        e.textContent = 'Send';
        e.addEventListener('click', () => {
          this.#device.sendControlChange(this.#channel.value - 1, this.#controller.value, this.#value.value);
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

      const update = (number) => {
        this.#controller.value = number;
        text.textContent = V2MIDI.CC.Name[number] || 'CC ' + number;
        range.value = number;
      }

      new V2WebField(this.canvas, (field) => {
        field.addButton((e) => {
          e.classList.add('width-label');
          e.classList.add('has-background-grey-lighter');
          e.classList.add('inactive');
          e.tabIndex = -1;
          e.textContent = 'Controller';
        });

        field.addButton((e) => {
          text = e;
          e.classList.add('width-text-wide');
          e.classList.add('has-background-light');
          e.classList.add('inactive');
          e.tabIndex = -1;
        });

        field.addInput('number', (e) => {
          this.#controller = e;
          e.classList.add('width-number');
          e.value = V2MIDI.CC.channelVolume;
          e.min = 0;
          e.max = 127;
          e.addEventListener('input', () => {
            update(e.value);
          });
        });
      });

      V2Web.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.classList.add('range');
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

      new V2WebField(this.canvas, (field) => {
        field.addButton((e) => {
          e.classList.add('width-label');
          e.classList.add('has-background-grey-lighter');
          e.classList.add('inactive');
          e.tabIndex = -1;
          e.textContent = 'Value';
        });

        field.addInput('number', (e) => {
          this.#value = e;
          e.classList.add('width-number');
          e.min = 0;
          e.max = 127;
          e.value = 0;
          e.addEventListener('input', () => {
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
        e.value = this.#value.value;
        e.addEventListener('input', () => {
          this.#value.value = e.value;
        });
      });
    }
  }
}

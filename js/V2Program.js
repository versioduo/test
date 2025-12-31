// © Kay Sievers <kay@versioduo.com>, 2019-2022
// SPDX-License-Identifier: Apache-2.0

class V2Program extends V2WebModule {
  #device = null;
  #channel = null;
  #program = null;
  #bank = null;

  constructor(device) {
    super('program', 'Program', 'Set the program / instrument');
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
        e.addEventListener('click', () => {
          this.#device.sendControlChange(this.#channel.value - 1, V2MIDI.CC.bankSelect, 0);
          this.#device.sendControlChange(this.#channel.value - 1, V2MIDI.CC.bankSelectLSB, this.#bank.value - 1);
          this.#device.sendProgramChange(this.#channel.value - 1, this.#program.value - 1);
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
        this.#program.value = number;
        text.textContent = V2MIDI.GM.Program.Name[number - 1];
        range.value = number;
      }

      new V2WebField(this.canvas, (field) => {
        field.addButton((e) => {
          e.classList.add('width-label');
          e.classList.add('has-background-grey-lighter');
          e.classList.add('inactive');
          e.tabIndex = -1;
          e.textContent = 'Program';
        });

        field.addButton((e) => {
          text = e;
          e.classList.add('width-text-wide');
          e.classList.add('has-background-light');
          e.classList.add('inactive');
          e.tabIndex = -1;
        });

        field.addInput('number', (e) => {
          this.#program = e;
          e.classList.add('width-number');
          e.value = V2MIDI.GM.Program.acousticGrandPiano + 1;
          e.min = 1;
          e.max = 128;
          e.addEventListener('input', () => {
            update(e.value);
          });
        });
      });

      V2Web.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.classList.add('range');
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
      new V2WebField(this.canvas, (field) => {
        field.addButton((e) => {
          e.classList.add('width-label');
          e.classList.add('has-background-grey-lighter');
          e.classList.add('inactive');
          e.tabIndex = -1;
          e.textContent = 'Bank';
        });

        field.addInput('number', (e) => {
          this.#bank = e;
          e.classList.add('width-number');
          e.value = 1;
          e.min = 1;
          e.max = 128;
          e.addEventListener('input', () => {
            range.value = e.value;
          });
        });
      });

      V2Web.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.classList.add('range');
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

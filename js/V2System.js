// © Kay Sievers <kay@versioduo.com>, 2019-2022
// SPDX-License-Identifier: Apache-2.0

class V2System extends V2WebModule {
  #device = null;
  #json = null;

  constructor(device) {
    super('sysex', 'System', 'Send System messages');
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
        e.textContent = 'Reset';
        e.addEventListener('click', () => {
          this.#device.sendSystemReset();
        });
      });
    });

    new V2WebField(this.canvas, (field) => {
      field.addButton((e) => {
        e.classList.add('width-label');
        e.textContent = 'JSON';
        e.addEventListener('click', () => {
          this.#device.sendJSON(this.#json.value);
        });
      });

      field.addInput('text', (e, p) => {
        this.#json = e;
        p.classList.add('is-expanded');
        e.value = '{}';
      });
    });
  }
}

class V2System extends V2AppSection {
  #device = null;
  #json = null;

  constructor(device) {
    super('sysex', '--screwdriver-wrench', 'System', 'Send System Messages');
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
        e.textContent = 'Reset';
        e.addEventListener('click', () => {
          this.#device.sendSystemReset();
        });
      });
    });

    new V2AppMenu(this.canvas, (menu) => {
      menu.element.classList.add('full');

      menu.addElement('button', (e) => {
        e.classList.add('primary');
        e.textContent = 'JSON';
        e.addEventListener('click', () => {
          this.#device.sendJSON(this.#json.value);
        });
      });

      menu.addElement('input', (e) => {
        this.#json = e;
        e.classList.add('grow');
        e.type = 'text';
        e.value = '{}';
      });
    });
  }
}

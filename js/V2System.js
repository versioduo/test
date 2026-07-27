class V2System extends V2WebModule {
  #device = null;
  #element = null;
  #json = null;

  constructor(device) {
    super('sysex', '--screwdriver-wrench', 'System', 'Send System Messages');
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
        e.textContent = 'Reset';
        e.addEventListener('click', () => {
          this.#device.sendSystemReset();
        });
      });
    });

    new V2WebMenu(this.#element, (menu) => {
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

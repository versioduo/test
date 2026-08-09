class V2System extends V2AppSection {
  #json = null;

  constructor(app) {
    super(app, 'sysex', '--screwdriver-wrench', 'System', 'Send System Messages');
    Object.seal(this);
  }

  show() {
    this.removeSection();
    this.addSection();

    new V2AppMenu(this.canvas, (menu) => {
      menu.addElement('button', (e) => {
        e.textContent = 'Reset';
        e.addEventListener('click', () => {
          this.app.main.sendSystemReset();
        });
      });
    });

    new V2AppMenu(this.canvas, (menu) => {
      menu.element.classList.add('full');

      menu.addElement('button', (e) => {
        e.classList.add('primary');
        e.textContent = 'JSON';
        e.addEventListener('click', () => {
          this.app.main.sendJSON(this.#json.value);
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

  reset() {
    this.removeSection();
  }
}

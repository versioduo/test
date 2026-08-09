class V2Repeat extends V2AppSection {
  #startButton = null;
  #stopButton = null;
  #notify = null;
  #danger = false;
  #channel = null;
  #note = Object.seal({
    element: null,
    update: null
  });
  #count = Object.seal({
    element: null,
    update: null
  });
  #velocity = null;
  #length = Object.seal({
    element: null,
    update: null
  });
  #beat = Object.seal({
    element: null,
    update: null,
  });
  #pause = Object.seal({
    element: null,
    update: null
  });

  #run = Object.seal({
    wakeLock: null,
    timer: null,
    lengthMsec: 0,
    beatMsec: 0,
    pauseMsec: 0,
    noteOff: [],
    note: null
  });

  constructor(app) {
    super(app, 'repeat', '--rotate', 'Repeat', 'Send Notes in a Loop');
    Object.seal(this);
  }

  show() {
    this.removeSection();
    this.addSection();

    new V2AppMenu(this.canvas, (menu) => {
      menu.addElement('button', (e) => {
        this.#stopButton = e;
        e.textContent = 'Stop';
        e.disabled = true;
        e.addEventListener('click', () => {
          this.#stop();
        });
      });

      menu.addElement('button', (e) => {
        this.#startButton = e;
        e.classList.add('primary');
        e.textContent = 'Start';
        e.addEventListener('click', () => {
          this.#start();
        });
      });
    });

    this.#notify = new V2AppNotify(this.canvas);

    new V2AppMenu(this.canvas, (menu) => {
      menu.addElement('button', (e) => {
        e.textContent = 'Danger';
      });

      menu.addElement('input', (e) => {
        e.type = 'checkbox';
        e.classList.add('danger');
        e.addEventListener('input', () => {
          this.#danger = e.checked;

          if (this.#beat.element.value > 110)
            this.#beat.update(110);
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

      this.#note.update = (number) => {
        if (isNull(number) || number < 0 || number > 127)
          return;

        this.#note.element.value = number;
        range.value = number;

        text.textContent = V2MIDI.Note.getName(number);
        if (V2MIDI.Note.isBlack(number)) {
          text.classList.add('dark');
          text.classList.remove('light');

        } else {
          text.classList.remove('dark');
          text.classList.add('light');
        }

        if (this.#count.element.value > (128 - number))
          this.#count.update(128 - number);
      };

      new V2AppMenu(this.canvas, (menu) => {
        menu.element.classList.add('full');

        menu.addElement('span', (e) => {
          e.classList.add('label');
          e.textContent = 'Note';
        });

        menu.addElement('span', (e) => {
          e.classList.add('grow');
          text = e;
        });

        menu.addElement('input', (e) => {
          this.#note.element = e;
          e.type = 'number';
          e.min = 0;
          e.max = 127;
          e.addEventListener('input', () => {
            this.#note.update(e.value);
          });
          e.addEventListener('change', () => {
            if (e.value < 0)
              e.value = 0;

            else if (e.value > 127)
              e.value = 127;

            this.#note.update(e.value);
          });
        });

        menu.addElement('button', (e) => {
          V2App.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--minus');
          });
          e.addEventListener('click', () => {
            this.#note.update(Number(this.#note.element.value) - 1);
          });
        });

        menu.addElement('button', (e) => {
          V2App.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--plus');
          });
          e.addEventListener('click', () => {
            this.#note.update(Number(this.#note.element.value) + 1);
          });
        });
      });

      V2App.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.type = 'range';
        e.min = 0;
        e.max = 127;
        e.value = this.#note.element.value;
        e.addEventListener('input', () => {
          this.#note.update(e.value);
        });
      });
    }

    {
      let range = null;

      this.#count.update = (number) => {
        if (isNull(number) || number < 1 || number > 128)
          return;

        this.#count.element.value = number;
        range.value = number;

        if (this.#note.element.value > (128 - number))
          this.#note.update(128 - number);
      };

      new V2AppMenu(this.canvas, (menu) => {
        menu.element.classList.add('full');

        menu.addElement('span', (e) => {
          e.textContent = 'Count';
          e.classList.add('grow');
        });

        menu.addElement('input', (e) => {
          this.#count.element = e;
          e.type = 'number';
          e.min = 1;
          e.max = 128;
          e.value = 1;
          e.addEventListener('input', (event) => {
            this.#count.update(e.value);
          });
          e.addEventListener('change', () => {
            if (e.value < 1)
              e.value = 1;

            else if (e.value > 128)
              e.value = 128;

            this.#count.update(e.value);
          });
        });

        menu.addElement('button', (e) => {
          V2App.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--minus');
          });
          e.addEventListener('click', () => {
            this.#count.update(Number(this.#count.element.value) - 1);
          });
        });

        menu.addElement('button', (e) => {
          V2App.addElement(e, 'i', (i) => {
            i.classList.add('icon', '--nospace', '--plus');
          });
          e.addEventListener('click', () => {
            this.#count.update(Number(this.#count.element.value) + 1);
          });
        });
      });

      V2App.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.type = 'range';
        e.min = 1;
        e.max = 128;
        e.value = this.#count.element.value;
        e.addEventListener('input', (event) => {
          this.#count.update(e.value);
        });
      });

      this.#note.update(60);
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

          e.addEventListener('change', () => {
            if (e.value < 1)
              e.value = 1;

            else if (e.value > 127)
              e.value = 127;
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
      let text = null;
      let range = null;

      this.#length.update = (number) => {
        if (isNull(number) || number < 0 || number > 127)
          return;

        this.#length.element.value = number;
        range.value = number;

        const fraction = this.#length.element.value / 127;
        this.#run.lengthMsec = Math.ceil(5000 * Math.pow(fraction, 2));
        text.textContent = this.#run.lengthMsec + ' ms';
      };

      new V2AppMenu(this.canvas, (menu) => {
        menu.element.classList.add('full');

        menu.addElement('span', (e) => {
          e.classList.add('label');
          e.textContent = 'Length';
        });

        menu.addElement('span', (e) => {
          e.classList.add('grow');
          text = e;
        });

        menu.addElement('input', (e) => {
          this.#length.element = e;
          e.type = 'number';
          e.min = 1;
          e.max = 127;
          e.addEventListener('input', (event) => {
            this.#length.update(e.value);
          });
          e.addEventListener('change', () => {
            if (e.value < 0)
              e.value = 0;

            else if (e.value > 127)
              e.value = 127;

            this.#length.update(e.value);
          });
        });
      });

      V2App.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.type = 'range';
        e.min = 1;
        e.max = 127;
        e.value = this.#length.element.value;
        e.addEventListener('input', (event) => {
          this.#length.update(e.value);
        });
      });
    }

    {
      let text = null;
      let range = null;

      this.#beat.update = (number) => {
        if (isNull(number) || number < 0 || number > 127)
          return;

        if (number > 110 && !this.#danger)
          number = 110;

        if (number > 110)
          this.#beat.element.classList.add('danger');
        else
          this.#beat.element.classList.remove('danger');

        this.#beat.element.value = number;
        range.value = number;

        if (number === 127 && this.#pause.element.value === 0)
          this.#pause.update(63);

        const fraction = 1 - (this.#beat.element.value / 127);
        this.#run.beatMsec = Math.ceil(2000 * Math.pow(fraction, 2));
        text.textContent = this.#run.beatMsec + ' ms';
      };

      new V2AppMenu(this.canvas, (menu) => {
        menu.element.classList.add('full');

        menu.addElement('span', (e) => {
          e.classList.add('label');
          e.textContent = 'Beat';
        });

        menu.addElement('span', (e) => {
          e.classList.add('grow');
          text = e;
        });

        menu.addElement('input', (e) => {
          this.#beat.element = e;
          e.type = 'number';
          e.min = 0;
          e.max = 127;
          e.addEventListener('input', (event) => {
            this.#beat.update(e.value);
          });
          e.addEventListener('change', () => {
            if (e.value < 0)
              e.value = 0;

            else if (e.value > 127)
              e.value = 127;

            this.#beat.update(e.value);
          });
        });
      });

      V2App.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.type = 'range';
        e.min = 0;
        e.max = 127;
        e.value = this.#beat.element.value;
        e.addEventListener('input', (event) => {
          this.#beat.update(e.value);
        });
      });
    }

    {
      let text = null;
      let range = null;

      this.#pause.update = (number) => {
        if (isNull(number) || number < 0 || number > 127)
          return;

        this.#pause.element.value = number;
        range.value = number;

        if (number === 0 && this.#beat.element.value === 127)
          this.#beat.update(63);

        const fraction = this.#pause.element.value / 127;
        this.#run.pauseMsec = Math.ceil(5000 * Math.pow(fraction, 2));
        text.textContent = this.#run.pauseMsec + ' ms';
      };

      new V2AppMenu(this.canvas, (menu) => {
        menu.element.classList.add('full');

        menu.addElement('span', (e) => {
          e.classList.add('label');
          e.textContent = 'Pause';
        });

        menu.addElement('span', (e) => {
          e.classList.add('grow');
          text = e;
        });

        menu.addElement('input', (e) => {
          this.#pause.element = e;
          e.type = 'number';
          e.min = 0;
          e.max = 127;
          e.addEventListener('input', (event) => {
            this.#pause.update(e.value);
          });

          e.addEventListener('change', () => {
            if (e.value < 0)
              e.value = 0;

            else if (e.value > 127)
              e.value = 127;

            this.#pause.update(e.value);
          });
        });
      });

      V2App.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.type = 'range';
        e.min = 0;
        e.max = 127;
        e.value = this.#pause.element.value;
        e.addEventListener('input', (event) => {
          this.#pause.update(e.value);
        });
      });
    }

    this.#length.update(63);
    this.#beat.update(63);
    this.#pause.update(63);
  }

  reset() {
    if (this.#run.timer)
      clearTimeout(this.#run.timer);

    this.removeSection();
  }

  #playNote() {
    const channel = this.#channel.value - 1;
    const note = this.#run.note;

    // Clear still running note.
    if (this.#run.noteOff[note]) {
      clearTimeout(this.#run.noteOff[note]);
      this.app.main.sendNoteOff(channel, note);
    }

    this.app.main.sendNote(channel, note, this.#velocity.value);

    this.#run.noteOff[note] = setTimeout(() => {
      this.#run.noteOff[note] = null;
      this.app.main.sendNoteOff(channel, note);
    }, this.#run.lengthMsec);
  }

  #timerHandler() {
    const start = Number(this.#note.element.value);
    const end = start + Number(this.#count.element.value) - 1;

    // Play all notes of a cycle at once.
    if (this.#run.beatMsec === 0) {
      this.#run.note = start;
      while (this.#run.note++ <= end)
        this.#playNote();

      this.#run.timer = setTimeout(this.#timerHandler.bind(this), this.#run.pauseMsec);
      return;
    }

    this.#playNote();
    this.#run.note++;

    // Insert pause after the end of a cycle.
    if (this.#run.note > end) {
      this.#run.note = start;
      this.#run.timer = setTimeout(this.#timerHandler.bind(this), this.#run.beatMsec + this.#run.pauseMsec);
      return;
    }

    if (this.#run.note < start)
      this.#run.note = start;

    this.#run.timer = setTimeout(this.#timerHandler.bind(this), this.#run.beatMsec);
  }

  #start() {
    this.#notify.clear();

    if (this.#run.timer) {
      clearTimeout(this.#run.timer);
      this.#run.timer = null;
    }

    this.#run.note = this.#note.element.value;

    const requestWakeLock = async () => {
      if (navigator.wakeLock) {
        this.#run.wakeLock = await navigator.wakeLock.request('screen');
        this.#run.wakeLock.onrelease = () => {
          this.#stop();
          this.#notify.warn('The playback was paused because the application moved to the background.');
        };
      }

      this.#timerHandler();
    };

    requestWakeLock();
    this.#startButton.disabled = true;
    this.#stopButton.disabled = false;
  }

  #releaseWakeLock() {
    if (!this.#run.wakeLock)
      return;

    this.#run.wakeLock.onrelease = null;
    this.#run.wakeLock.release();
    this.#run.wakeLock = null;
  }

  #stop() {
    this.#notify.clear();
    this.#releaseWakeLock();

    if (this.#run.timer) {
      clearTimeout(this.#run.timer);
      this.#run.timer = null;
    }

    this.#startButton.disabled = false;
    this.#stopButton.disabled = true;
  }
}

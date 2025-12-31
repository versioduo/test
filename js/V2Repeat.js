// © Kay Sievers <kay@versioduo.com>, 2019-2022
// SPDX-License-Identifier: Apache-2.0

class V2Repeat extends V2WebModule {
  #startButton = null;
  #stopButton = null;
  #notify = null;
  #danger = false;
  #device = null;
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

  constructor(device) {
    super('repeat', 'Repeat', 'Send notes in a loop');
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
        this.#stopButton = e;
        e.textContent = 'Stop';
        e.disabled = true;
        e.addEventListener('click', () => {
          this.#stop();
        });
      });

      V2Web.addButton(buttons, (e) => {
        this.#startButton = e;
        e.classList.add('is-link');
        e.textContent = 'Start';
        e.addEventListener('click', () => {
          this.#start();
        });
      });
    });

    this.#notify = new V2WebNotify(this.canvas);

    new V2WebField(this.canvas, (field) => {
      field.addButton((e) => {
        e.classList.add('width-label');
        e.classList.add('is-danger');
        e.classList.add('is-light');
        e.classList.add('inactive');
        e.textContent = 'Danger';
        e.tabIndex = -1;
      });

      field.addElement('label', (label) => {
        label.classList.add('switch');

        V2Web.addElement(label, 'input', (e) => {
          e.type = 'checkbox';
          e.addEventListener('input', () => {
            this.#danger = e.checked;

            if (this.#beat.element.value > 110)
              this.#beat.update(110);
          });
        });

        V2Web.addElement(label, 'span', (e) => {
          e.classList.add('check');
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

      this.#note.update = (number) => {
        if (isNull(number) || number < 0 || number > 127)
          return;

        this.#note.element.value = number;
        range.value = number;

        text.textContent = V2MIDI.Note.getName(number);
        if (V2MIDI.Note.isBlack(number)) {
          text.classList.add('is-dark');
          text.classList.remove('has-background-light');

        } else {
          text.classList.remove('is-dark');
          text.classList.add('has-background-light');
        }

        if (this.#count.element.value > (128 - number))
          this.#count.update(128 - number);
      };

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
          this.#note.element = e;
          e.classList.add('width-number');
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

        field.addButton((e) => {
          e.textContent = '-';
          e.style.width = '3rem';
          e.addEventListener('click', () => {
            this.#note.update(Number(this.#note.element.value) - 1);
          });
        });

        field.addButton((e) => {
          e.textContent = '+';
          e.style.width = '3rem';
          e.addEventListener('click', () => {
            this.#note.update(Number(this.#note.element.value) + 1);
          });
        });
      });

      V2Web.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.classList.add('range');
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

      new V2WebField(this.canvas, (field) => {
        field.addButton((e) => {
          e.classList.add('width-label');
          e.classList.add('has-background-grey-lighter');
          e.classList.add('inactive');
          e.textContent = 'Count';
        });

        field.addInput('number', (e) => {
          this.#count.element = e;
          e.classList.add('width-number');
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

        field.addButton((e) => {
          e.textContent = '-';
          e.style.width = '3rem';
          e.addEventListener('click', () => {
            this.#count.update(Number(this.#count.element.value) - 1);
          });
        });

        field.addButton((e) => {
          e.textContent = '+';
          e.style.width = '3rem';
          e.addEventListener('click', () => {
            this.#count.update(Number(this.#count.element.value) + 1);
          });
        });
      });

      V2Web.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.type = 'range';
        e.classList.add('range');
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

          e.addEventListener('change', () => {
            if (e.value < 1)
              e.value = 1;

            else if (e.value > 127)
              e.value = 127;
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

      new V2WebField(this.canvas, (field) => {
        field.addButton((e) => {
          e.classList.add('width-label');
          e.classList.add('has-background-grey-lighter');
          e.classList.add('inactive');
          e.textContent = 'Length';
        });

        field.addButton((e) => {
          text = e;
          e.classList.add('width-label');
          e.classList.add('has-background-light');
          e.classList.add('inactive');
          e.tabIndex = -1;
        });

        field.addInput('number', (e) => {
          this.#length.element = e;
          e.classList.add('width-number');
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

      V2Web.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.type = 'range';
        e.classList.add('range');
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
          this.#beat.element.classList.add('is-danger');

        else
          this.#beat.element.classList.remove('is-danger');

        this.#beat.element.value = number;
        range.value = number;

        if (number === 127 && this.#pause.element.value === 0)
          this.#pause.update(63);

        const fraction = 1 - (this.#beat.element.value / 127);
        this.#run.beatMsec = Math.ceil(2000 * Math.pow(fraction, 2));
        text.textContent = this.#run.beatMsec + ' ms';
      };

      new V2WebField(this.canvas, (field) => {
        field.addButton((e) => {
          e.classList.add('width-label');
          e.classList.add('has-background-grey-lighter');
          e.classList.add('inactive');
          e.textContent = 'Beat';
        });

        field.addButton((e) => {
          text = e;
          e.classList.add('width-label');
          e.classList.add('has-background-light');
          e.classList.add('inactive');
          e.tabIndex = -1;
        });

        field.addInput('number', (e) => {
          this.#beat.element = e;
          e.classList.add('width-number');
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

      V2Web.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.type = 'range';
        e.classList.add('range');
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

      new V2WebField(this.canvas, (field) => {
        field.addButton((e) => {
          e.classList.add('width-label');
          e.classList.add('has-background-grey-lighter');
          e.classList.add('inactive');
          e.textContent = 'Pause';
        });

        field.addButton((e) => {
          text = e;
          e.classList.add('width-label');
          e.classList.add('has-background-light');
          e.classList.add('inactive');
          e.tabIndex = -1;
        });

        field.addInput('number', (e) => {
          this.#pause.element = e;
          e.classList.add('width-number');
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

      V2Web.addElement(this.canvas, 'input', (e) => {
        range = e;
        e.type = 'range';
        e.classList.add('range');
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
    if (this.#run.timer !== null)
      clearTimeout(this.#run.timer);

    super.reset();
  }

  #playNote() {
    const channel = this.#channel.value - 1;
    const note = this.#run.note;

    // Clear stilll running note.
    if (this.#run.noteOff[note]) {
      clearTimeout(this.#run.noteOff[note]);
      this.#device.sendNoteOff(channel, note);
    }

    this.#device.sendNote(channel, note, this.#velocity.value);

    this.#run.noteOff[note] = setTimeout(() => {
      this.#run.noteOff[note] = null;
      this.#device.sendNoteOff(channel, note);
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

    if (this.#run.timer !== null) {
      clearTimeout(this.#run.timer);
      this.#run.timer = null;
    }

    this.#run.note = this.#note.element.value;

    const requestWakeLock = async () => {
      if (navigator.wakeLock) {
        this.#run.wakeLock = await navigator.wakeLock.request('screen');
        this.#run.wakeLock.onrelease = () => {
          this.#stop();
          this.#notify.warn('The playback was paused because the application moved into the background.');
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

    if (this.#run.timer !== null) {
      clearTimeout(this.#run.timer);
      this.#run.timer = null;
    }

    this.#startButton.disabled = false;
    this.#stopButton.disabled = true;
  }
}

import Storage from '../storage.js'
import Modal from '../modal.js'

export default class Notes {

    defaultNotes = {
        notes: [],
        selectedId: null
    };

    constructor(main) {
        this.main = main;
        this.notes = this.defaultNotes

        this.nav = document.querySelector('[data-notes]');
        this.textarea = document.querySelector('.note');

        if (new Storage().getStorage('notes') !== null) {
            this.notes = new Storage().getStorage('notes');
        }

        this.controllers = document.querySelectorAll('a[data-format]');

        const form = document.querySelector('[data-notes-create]');
        const remove = document.querySelector('[data-notes-remove]');
    
        // Listners
        form.addEventListener('submit', e => {
            e.preventDefault();

            this.createNote();

        });

        remove.addEventListener('click', e => {
            e.preventDefault();

            this.removeNote();
        })


        this.textarea.addEventListener('keydown', e => {
            this.noteKeydown(e);
        });

        this.textarea.addEventListener('keyup', e => {
            this.noteKeyUp(e);
        });

        this.controllers.forEach(controller => {
            controller.addEventListener('click', e => {
                e.preventDefault();
                this.format(controller.dataset.format);
            })
        })

        this.nav.addEventListener('click', e => {
            if (e.target.tagName.toLowerCase() === 'li') {
                this.notes.selectedId = e.target.dataset.noteId;
                this.saveAndRender();
            }
        })
        this.render();
    }

    createNote() {
        const input = document.querySelector('[data-notes-create] input');

        if (input.value == null || input.value == "") return;
        let note = {id: Date.now().toString(), name: input.value, note: ""}
        this.notes.selectedId = note.id;

        input.value = "";
        this.textarea.innerText = "";
        this.textarea.focus();
        this.notes.notes.push(note);
        this.saveAndRender();

    }

    removeNote() {
        this.notes.notes = this.notes.notes.filter(note => note.id !== this.notes.selectedId);
        this.notes.selectedId = null;
        this.textarea.innerText = "";
        this.saveAndRender();
    }

    noteKeydown(e) {
        if (this.notes.selectedId == null) {e.preventDefault(); document.querySelector('[data-notes-create] input').focus(); new Modal('createNote')}
        clearTimeout(this.saveInterval);

        if (e.keyCode == 9) {
            this.format('indent');
        }
  
    }

    noteKeyUp(e) {

        const selectedNote = this.notes.notes.find(note => note.id === this.notes.selectedId);

        clearTimeout(this.saveInterval);

        this.saveInterval = setTimeout(() => {
            selectedNote.note = this.textarea.innerText;
            this.save();
        }, 500);

        if (this.textarea.childNodes.length <= 1 && this.textarea.classList.contains('coding')) {
            if (this.textarea.childNodes[0].tagName.toLowerCase() !== 'div') {
                if (e.key.length > 1) {
                    this.textarea.innerHTML = "<div></div>";
                } else {
                    
                    this.textarea.innerHTML = `<div>${e.key}</div>`;
                }
            }
        }

    }

    saveAndRender() {
        this.save();
        this.render();
    }

    render() {
        this.clearElement(this.nav);
        this.renderNotes();

        if (this.notes.selectedId == null) {
            document.querySelector('[data-notes-create] input').focus();
            document.querySelector('[data-notes-remove]').style = "display:none;";
        } else {
            document.querySelector('[data-notes-remove]').style = "";
            this.textarea.innerText = "";
        }
        const selectedNote = this.notes.notes.find(note => note.id === this.notes.selectedId);

        if (selectedNote == null || selectedNote == "null" ) return;

        this.textarea.innerText = selectedNote.note;

    }

    renderNotes() {
        this.notes.notes.forEach(note => {
            const elm = document.createElement('li');
            elm.dataset.noteId = note.id;
            elm.textContent = note.name;

            if (note.id == this.notes.selectedId) {
                elm.classList.add('active-list');
            }

            this.nav.appendChild(elm);
        })
    }


    save() {
        
        new Storage('set', 'notes', this.notes);
    }

    format(command, value) {
        document.execCommand(command, false, value);
    }

    clearElement(elm) {
        while(elm.firstChild) {
            elm.removeChild(elm.firstChild);
        }
    }
}
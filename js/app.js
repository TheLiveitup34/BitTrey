import Validator from './validator.js'
import Storage from './storage.js'
import Cookies from './cookies.js'

// App import
import Todo from './apps/todo.js'
import Loan from './apps/loan.js'
import Notes from './apps/notes.js'

class Main {
    ctrActive = false;
    defaultPage = 'homepage';
    loggedInPage = 'gallery';
    clientOnline = window.navigator.onLine;
    lastPage = null;

    constructor() {

        if (window.location.search == "?password") {
            this.defaultPage = "chngpwd";
        }

        window.addEventListener('keydown', e => {
            // Checks if the Control Key is pressed
            if (e.keyCode == 17) {this.ctrActive = true};
        });

        window.addEventListener('keyup', e => {
            // Checks if Control Key is released
            if (e.keyCode == 17) {this.ctrActive = false};
        });

        window.addEventListener('offline', () => {
            // Checks if the Clients System went offline
            this.clientOnline = false;
        });

        window.addEventListener('online', () => {
            // Checks if the Clients System went online
            this.clientOnline = true;
        });

        // Loads the Inital Page
        this.drawEvent();
    }

    doEvent(method) {

        switch (method) {
            // Special Logout Event
            case "logout":
                const client = new Storage().getStorage('user');
                const ssid = new Cookies().getCookie('_SSID');

                new Validator(this, 'logout', {session_id: ssid, session_token: client.session_token, uuid: client.uuid})

                new Cookies().setCookie('_SSID', '1', '-7');
                new Storage('remove', 'user');

                

                document.querySelector('.draw').classList.remove('expand');
                this.drawEvent('homepage');
            break;

            // General Page Loading
            case "login":
            case "signup":
            case "homepage":
            case "oauthtkn":
            case "gallery":
            case "forgotpwd":
                this.drawEvent(method);
            break;
            // Render Todo App
            case "todo":

                this.drawEvent(method).then(() => {
                    new Todo(this);
                });
            break;
            // Render Loan App
            case "loan":
                this.drawEvent(method).then(() => {
                    new Loan(this);
                });
            break;
            // Render Notes App
            case "notes":
                
                this.drawEvent(method).then(() => {
                    new Notes(this);
                })

            break;
            case "loginTokn":

                new Validator(this, 'createTkn');


            break;

            // Error Page Loading
            default:
                errMsg.msg = "This page does not exist";
                this.drawEvent('error').then(() => {
                    document.querySelector('.draw').classList.remove('expand');
                });
                
            break;
        }

    }

    async drawEvent(template = null) {
        let temp;

        // Gets Main Content Painting Area
        const draw = document.querySelector('.draw');

        // Checks if the session is valid and responds true or false
        const isValid = await new Validator(this, 'session');

        draw.innerHTML = "";
        switch (template) {
            case null:
                if (!isValid) {

                    // Sets Last page 
                    this.lastPage = this.defaultPage;

                    // sets the page to load as Default page "HOMEPAGE"
                    temp = document.importNode(document.getElementById(this.defaultPage).content, true);

                    // if Session is invalid then removes storage
                    if (new Storage().getStorage('user') !== null) { new Storage('remove', 'user');new Storage('remove', 'notes');new Storage('remove', 'todo');new Storage('remove', 'loans');}

                    // if Cookie persists removes it on invalid session
                    if (new Cookies().getCookie('_SSID') !== null) {new Cookies().setCookie('_SSID', 1, '-7')}
                    if (new Cookies().getCookie('_SSIS') !== null) {new Cookies().setCookie('_SSIS', 1, '-7')}

                } else {

                    // Expands Design to fit other App Designs
                    draw.classList.add('expand');

                    // Sets Default Logged in Page
                    this.defaultPage = this.loggedInPage;
                    // Sets LastPage for Error Returning Handling
                    this.lastPage = this.defaultPage;

                    temp = document.getElementById(this.defaultPage);

                    // Sets a prepend Design to create a extra element above the page
                    if (temp.dataset.prepend !== null && temp.dataset.prepend !== undefined) {

                        let elm = document.getElementById(temp.dataset.prepend);

                        // Ads Prepend element to page
                        draw.appendChild(document.importNode(elm.content, true));

                    }

                    // Gets Page Design
                    temp = document.importNode(temp.content, true);

                }


                break;
            default:

                // Set to return to the last page uppon Error
                if (template !== "error") {this.lastPage = template;}

                // Check login or last left page
                let elm = document.getElementById(template);

                // Checks to see if element exists
                if (elm !== undefined && elm !== null) {

                    // Expands the Main Drawing container to have custom Designs for the Applications
                    if (isValid && draw.classList.contains('expand') !== true && template !== "error") {draw.classList.add('expand')}


                    // Checks if the Element has a Prepended Element
                    if (elm.dataset.prepend !== null && elm.dataset.prepend !== undefined) {

                        // Gets Element for prepend Element
                        let cmp = document.getElementById(elm.dataset.prepend);

                        // Puts prepend element on page
                        draw.appendChild(document.importNode(cmp.content, true));

                    }

                    // Loads up the main Element node
                    temp = document.importNode(elm.content, true);

                }

            break;
        }

        // Adds Elements to the page
        draw.appendChild(temp);

        // Load Elements for Inerative
        this.loadControllers();

    }

    loadControllers() {
        const controllers = document.querySelectorAll('[data-btn]');
        const forms = document.querySelectorAll("form[data-pass]");
        const tkns = document.querySelectorAll("form[data-oauth] .inline input");
        const errCode = document.querySelector('[data-err-code]');
        const errBtn = document.querySelector('[data-err-return]');

        // Ads page navigation in single page application
        controllers.forEach(controller => {
            controller.addEventListener('click', e => {
                e.preventDefault();
                // Allows Events to load based on what element is clicked
                this.doEvent(controller.dataset.btn);
            });
        });

        // Sets up form handling
        forms.forEach(form => {
            form.addEventListener('submit', e => {
                e.preventDefault();
                // Creates An object with Form Data Handling Class
                let data = new FormData(form);

                // Calls Form Validation Handler
                new Validator(this, form.dataset.pass, data);
            })
        })

        // Token Display functionality
        tkns.forEach(tkn => {
            tkn.addEventListener('paste', e => {
                let paste = (e.clipboardData || window.clipboardData).getData('text');

                if (isNaN(paste)) return;

                for (let i = 0; i < 6; i++) {
                    let elm = document.getElementById(`char${i}`);
                    if (paste[i] == undefined) {
                        elm.value = "";
                        elm.focus();
                        return;
                    }

                    if (paste[i] !== undefined){ elm.value = paste[i];}

                    if (i == 5) {elm.focus();}
                }
            });

            // Token Input keypress listener
            tkn.addEventListener('keydown', e => {
                // Checsk if Ctrl + v is pressed to paste
                if (this.ctrActive && e.keyCode == 86) return;

                // Checks if backspace has been entered and the value is gone
                if (e.keyCode == 8 && tkn.value.length == 0) {
                    // Gets Element Before the value deleted
                    let elm = document.getElementById(`char${parseInt(tkn.name[tkn.name.length -1]) - 1}`);

                    // Checks if Element exists then focuses the Element
                    if (elm !== null) {elm.focus()}

                    return;
                }

                // Allows Backspace to work
                if (e.keyCode == 8) return;

                // Checks if the Value entered is not a number
                if (isNaN(e.key)) {return e.preventDefault()}

                // Sets the Token focused Value to the number submitted
                tkn.value = e.key;
            });

            // Token Input keylift listener
            tkn.addEventListener('keyup', e => {

                // Checks if Key is not a number
                if (isNaN(e.key)) {return e.preventDefault()}

                // Gets Element in the next Input to focus
                let elm = document.getElementById(`char${parseInt(tkn.name[tkn.name.length -1]) + 1}`);

                // Checks if the Element exists to focus
                if (elm !== null) {elm.focus();}

            });
        })

        // Checks if Error has been noticed
        if (errBtn !== null) {
            
            // Sets a Display message for user to understand
            errCode.textContent = errMsg.msg;
            
            // Creates a clicable Event to Return to previous Action
            errBtn.addEventListener('click', e => {
                e.preventDefault();
                // Tells the Application to return to previous Action
                this.doEvent(this.lastPage);
            });
            
            // Submits the error to the Api for debugging and patching
            new Validator(this,'err',{uuid:new Storage().getStorage('user').uuid,code:errMsg.code})

        }
    }

}

new Main;
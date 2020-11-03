import Api from './api.js';
import Cookies from './cookies.js';
import Storage from './storage.js';
import Modal from './modal.js';

export default class Validator {

    // Sets up form Validation taking Main Class as a import
    constructor(main, method, data = null) {
        // Allows To interact with the Main website
        this.main = main;

        // Valid form Methods
        switch(method) {
            case "login":
                this.valLogin(data);
            break;
            case "logout":
                this.valLogout(data);
            break;
            case "resetpassword":
                this.valRePwd(data);
            break;
            case "forgotpassword":
                this.valForPwd(data);
            break;
            case "oauthtkn":
                this.valForOAuth(data);
            break;
            case "signup":
                this.valSignUp(data);
            break;
            case "session":
                return this.valSession();
            break;
            case "createTkn":
                return this.valCreateTkn();
            break;
            case "getTodo":

                return this.getTodo();

            break;
            case "createTodo":

                return this.createTodo(data);

            break;
            case "removeTodo":

                return this.removeTodo(data);

            break;
            case "removeTodoItem":

                return this.removeTodoItem(data);

            break;
            case "addTodoItem":

                return this.addTodoItem(data);

            break;

            case "err":
                // Send Errors to Database to be patched or debugged
                return;
            break;
            default:
                errMsg.msg = "Form Output has not been setup";
                main.drawEvent('error').then(() => {
                    document.querySelector('.draw').classList.remove('expand');
                });;
            break;
        }
        return;
    }



    async getTodo() {

        let c = new Cookies().getCookie('_SSID');
        let s = new Storage().getStorage('user');
        if (c == null || undefined) return false;
        if (s == null) return false;

        const res = await new Api('Get/todo', {
            uuid: s.uuid,
            session_id: c,
            session_token: s.session_token
          })

          if (res.online == false) return null;
          if (this.main.ClientOnline) return null;

          if (res.success) { return res.response}
    }

    async createTodo(name) {

        let c = new Cookies().getCookie('_SSID');
        let s = new Storage().getStorage('user');
        if (c == null || undefined) return false;
        if (s == null) return false;

        const res = await new Api('add/todo', {
            uuid: s.uuid,
            ToDoListTitle: name,
            session_id: c,
            session_token: s.session_token
          })

          if (res.online == false) return null;
          if (this.main.ClientOnline) return null;

          if (res.success) { return res.response.todo_id}
    }

    async removeTodo(name) {

        let c = new Cookies().getCookie('_SSID');
        let s = new Storage().getStorage('user');
        if (c == null || undefined) return false;
        if (s == null) return false;

        const res = await new Api('Remove/todo', {
            uuid: s.uuid,
            todo_id: name,
            session_id: c,
            session_token: s.session_token
          })

          if (res.online == false) return null;
          if (this.main.ClientOnline) return null;

    }
    async removeTodoItem(name) {

        let c = new Cookies().getCookie('_SSID');
        let s = new Storage().getStorage('user');
        if (c == null || undefined) return false;
        if (s == null) return false;

        const res = await new Api('Remove/todoitem', {
            uuid: s.uuid,
            item_id: name,
            session_id: c,
            session_token: s.session_token
          })

          if (res.online == false) return null;
          if (this.main.ClientOnline) return null;

    }

    async addTodoItem(data) {


        let c = new Cookies().getCookie('_SSID');
        let s = new Storage().getStorage('user');
        if (c == null || undefined) return false;
        if (s == null) return false;

        const res = await new Api('add/todoListItem', {
            uuid: s.uuid,
            todolist_id: data.api,
            item_name: data.name,
            item_content: data.active,
            session_id: c,
            session_token: s.session_token
          })

          if (res.online == false) return null;
          if (this.main.ClientOnline) return null;

          if (res.success) { return true}


    }



    async valLogin(data) {
        
        // Gets the dialog Box to respond to the user for visual feedback
        const dialogBox = document.querySelector('.dialog-box');
        dialogBox.textContent = "";

        let checked = true;
        if (data.get('email') == ""){
            dialogBox.textContent = "Email Can not be empty";
            checked = false;
        }

        if (data.get('pwd') == "") {
            let append = (dialogBox.textContent == "") ? '' : 'Email and ';
            dialogBox.textContent = `${append}Password can not be empty`;
            checked = false;
        }

        if (checked) {
            // Api Login Validation
            const res = await new Api('login', {username: data.get('email'), password: data.get('pwd')});

            if (res.online == false) { return dialogBox.textContent = "Database is offline try again later"}

            if (res.success == true && res.online == true && typeof res.response == "object") {
                const msg = res.response;
                // Sets Cookie for login token
                new Cookies().setCookie('_SSID', msg.session_id, '7');
                new Cookies().setCookie('_SSIS', '1', '3');
                // Stores other session data nad user data in localStorage
                new Storage('set', 'user', {username: msg.username, uuid: msg.uuid, session_token: msg.session_token, date: Date.now()})
                // Loads Gallery page for user
                this.main.drawEvent('gallery');
                // Sets draw container to expanded for App use
                document.querySelector('.draw').classList.add('expand');
                return;
            }

            return dialogBox.textContent = res.response;

        } 

    }


    async valLogout(data) {
        new Api('logout', data);
    }


    async valRePwd(data) {

        // Gets the dialog Box to respond to the user for visual feedback
        const dialogBox = document.querySelector('.dialog-box');
        dialogBox.textContent = "";
        
        // Boolean for validation checking
        let checked = true;

        // Float to create a password strength count
        let strong = 0;
        // Array for issues in password security
        let security = [];
        // Array for empty items in the form
        let empty = [];

        if (data.get('token') == "") {
            empty.push('Token');
            dialogBox.textContent = "Token is required to reset Password!";
            checked = false;
        }

        // Checks if password is empty
        if (data.get('pwd') == "") {

            let append = (dialogBox.textContent == "") ? '' : `${empty.join(', ')}, `;

            dialogBox.textContent = `${append}Password is required!`;

            checked = false;
        }


        // Checks for capital letters 
        if (data.get('pwd') == data.get('pwd').toLowerCase()) {
            security.push("Capital Letter");
        } else {
            strong += 0.25;
        }

        // Checks if password is 8 characters long
        if (data.get('pwd').length < 8) {
            security.push('8 Characters');
        } else {
            strong += 0.25; 
        }

        // Checks if Any special Characters exist in the password
        if (data.get('pwd').match(/[*.! @#$%^&(){}\[\]:;<>,.?\/~_+-=|\\]/g) == null) {
            security.push("A Symbol")
        } else {
            strong += 0.25;
        }
        
        // Checks if a number exists in password
        if (data.get('pwd').match(/[0-9]/g) == null) {
            security.push("A Number")
        } else {
            strong += 0.25;
        }

    

        // Checks if password strength is good enough and that if an error exists
        if (strong < 1 && empty.length == 0) {
            dialogBox.textContent = `Password requires ${security.join(', ')}`;
            checked = false;
        }
        
        // Checks if password and confirm password are both the same
        if (data.get('pwd') !== data.get('pwd_con') && strong == 1 && empty.length == 0) {
            dialogBox.textContent = "Passwords must match";
            checked = false;
        }

        if (checked) {

            const res = await new Api('password', {Token: data.get('token'), password: data.get('pwd')});

            if (res.success) return this.main.drawEvent('login');

        }

           
    }


    async valForPwd(data) {
        
        // Gets the dialog Box to respond to the user for visual feedback
        const dialogBox = document.querySelector('.dialog-box');
        dialogBox.textContent = "";

        let checked = true;

        if (data.get('email') == "") {
            dialogBox.textContent = "Email Must be present to reset password!";
            checked = false;
        }

        if (checked) {
            
            const res = await new Api('reset/password', {email: data.get('email')});

            if (res.success) return this.main.drawEvent('chngpwd');

            dialogBox.textContent = "Email is invalid or dose not exist!";


        }

    }

    async valCreateTkn() {
        let c = new Cookies().getCookie('_SSID');
        let s = new Storage().getStorage('user');
        if (c == null) return;
        if (s == null) return;
        const res = await new Api('token', {uuid: s.uuid, sessionId: c, sessionToken: s.session_token});

        if (res.success) {
            new Modal('tknsend');
        }


    }

    async valForOAuth(data) {
        
        // Gets the dialog Box to respond to the user for visual feedback
        const dialogBox = document.querySelector('.dialog-box');
        dialogBox.textContent = "";

        // Sets up the Token for validation
        let token = data.get('char0') + data.get('char1') + data.get('char2') + data.get('char3') + data.get('char4') + data.get('char5');
        // Removes any empty items
        token = token.replace(' ', '');

        let checked = true;
        if (token == "") {
            dialogBox.textContent = "Token Must not be Empty!";
            checked = false;
        }

        if (token.length < 6 ) {
            dialogBox.textContent = "Token must have 6 numbers";
            checked = false;
        }

        if (isNaN(token)) {
            dialogBox.textContent = "Inspect Element, you must have?";
            checked = false;
        }


        if (checked) {

            const res = await new Api('check/Token', {Token: token});

            if (res.online == false) { return dialogBox.textContent = "Database is offline try again later"}

            if (res.success == true && res.online == true && typeof res.response == "object") {
                const msg = res.response;
                // Sets Cookie for login token
                new Cookies().setCookie('_SSID', msg.session_id, '7');

                new Cookies().setCookie('_SSIS', '1', '3');
                // Stores other session data nad user data in localStorage
                new Storage('set', 'user', {username: msg.username, uuid: msg.uuid, session_token: msg["session token"], date: Date.now()})
                // Loads Gallery page for user
                this.main.drawEvent('gallery');
                // Sets draw container to expanded for App use
                document.querySelector('.draw').classList.add('expand');
                return;
            }

            return dialogBox.textContent = "Tokin expired or is invalid!";

        }

    }


    async valSignUp(data) {
        
        // Gets the dialog Box to respond to the user for visual feedback
        const dialogBox = document.querySelector('.dialog-box');
        dialogBox.textContent = "";
        
        // Boolean for validation checking
        let checked = true;

        // Float to create a password strength count
        let strong = 0;
        // Array for issues in password security
        let security = [];
        // Array for empty items in the form
        let empty = [];

        // Checks if username is empty
        if (data.get('username') == "") {
            empty.push('Username');
            dialogBox.textContent = "Username is required!";
            checked = false;
        }

        // Checks if email is empty
        if (data.get('email') == "") {
            empty.push('Email');
            dialogBox.textContent = "Email is required!";
            checked = false;
        }

        // Checks if password is empty
        if (data.get('pwd') == "") {

            let append = (dialogBox.textContent == "") ? '' : `${empty.join(', ')}, `;

            dialogBox.textContent = `${append}Password is required!`;

            checked = false;
        }


        // Checks for capital letters 
        if (data.get('pwd') == data.get('pwd').toLowerCase()) {
            security.push("Capital Letter");
        } else {
            strong += 0.25;
        }

        // Checks if password is 8 characters long
        if (data.get('pwd').length < 8) {
            security.push('8 Characters');
        } else {
            strong += 0.25; 
        }

        // Checks if Any special Characters exist in the password
        if (data.get('pwd').match(/[*.! @#$%^&(){}\[\]:;<>,.?\/~_+-=|\\]/g) == null) {
            security.push("A Symbol")
        } else {
            strong += 0.25;
        }
        
        // Checks if a number exists in password
        if (data.get('pwd').match(/[0-9]/g) == null) {
            security.push("A Number")
        } else {
            strong += 0.25;
        }

   

        // Checks if password strength is good enough and that if an error exists
        if (strong < 1 && empty.length == 0) {
            dialogBox.textContent = `Password requires ${security.join(', ')}`;
            checked = false;
        }
        
        // Checks if password and confirm password are both the same
        if (data.get('pwd') !== data.get('pwd_con') && strong == 1 && empty.length == 0) {
            dialogBox.textContent = "Passwords must match";
            checked = false;
        }
   

        // No errors have occured so it will talk to the api
        if (checked) {
            const res =  await new Api('signup', {username: data.get('username'),email: data.get('email'), password: data.get('pwd').replace(' ', '')});

            if (res.online == false) { return dialogBox.textContent = "Database is offline try agian later"}
            const msg = res.response;
            // if registration was successful then will send to the login page to login user
            if (res.success) return this.main.drawEvent('login');
            dialogBox.textContent = msg;
        }

    }

    async valSession() {

        let sC = new Cookies().getCookie('_SSIS');
        if (sC == null) return this.renewSession();
        // Gets Session Cookie and user data from Local Storage
        let c = new Cookies().getCookie('_SSID');
        let s = new Storage().getStorage('user');
        if (c == null || undefined) return false;
        if (s == null) return false;

        const res = await new Api('session', {session_id: c, session_token: s.session_token, uuid: s.uuid});
        if (res.success == false) return false;
        return true;
    }

    async renewSession() {

        let c = new Cookies().getCookie('_SSID');
        if (c == null || undefined) return false;
        let s = new Storage().getStorage('user');
        const res = await new Api('renew/session', {sessionId: c, sessionToken: s.session_token, uuid: s.uuid });
        if (res.success == false) return false;

        new Cookies().setCookie('_SSID', res.response.session_id, '7');
        new Cookies().setCookie('_SSIS', '1', '3');
        s.session_token = res.response.session_token;

        new Storage('set', 'user', s);

        return true;

    }

}
export default class Storage {
    STORAGE_KEY = 'bitTrey.'
    constructor(type = null, ...args) {
        switch(type) {
            case "set":
                localStorage.setItem(this.STORAGE_KEY + args[0], JSON.stringify(args[1]))
            break;
            case "remove":
                localStorage.removeItem(this.STORAGE_KEY + args[0])
            break;
            case "clear":
                localStorage.clear();
            break;
        }
    }

    getStorage(name) {
        let s = localStorage.getItem(this.STORAGE_KEY + name);
        if (s == null) return null;
        return JSON.parse(s);
    }

}
import Storage from './storage.js';


export default class Api  {
    apiLoc = 'https://api.bittrey.com';
    constructor(path = null, msg = "") {
        if (path !== null) {
            return this.comunicate(path, JSON.stringify(msg));
        }

    }

    async ping() {
        const res = await fetch(this.apiLoc).catch(err => {
            return err;
        });
        return ("status" in res);
    }

    async comunicate(path, msg) {
        let res = {};
        let success = true;

        // Sets A 2 min interval ahead of time
        let pingCheck = (Date.now() + (2 * 60 * 1000));

        // Checks if localStorage of Database Status exists
        const offlineTrack = (new Storage().getStorage('offline')  !== null) ? new Storage().getStorage('offline') : {online: await this.ping(), lastPing: pingCheck};

        // Sets a localStored Data if database is offline to Limit Ping Network Traffic
        if (new Storage().getStorage('offline')  == null) {new Storage('set', 'offline', offlineTrack)}

        // Checks if Database has been check in the past 2 Min
        if (offlineTrack.lastPing < Date.now()) {offlineTrack.online = await this.ping(); offlineTrack.lastPing = pingCheck; new Storage('set', 'offline', offlineTrack)}
        let online = offlineTrack.online;

        // Checks if Database is online
        if (online) {

            // Sends a POST request to the API to get data
            res = await fetch(`${this.apiLoc}/${path}`, {
                method: "POST",
                header: {
                    'Content-Type': 'application/json'
                },
                body: msg
            }).catch(err => {
                // Error Handling
                switch(err.message){
                    // Database went offline
                    case "Faild to fetch":
                        offlineTrack.online = false;
                        new Storage('set', 'offline', offlineTrack);
                    break;
                    default:
                        // Default Error Handling 
                        success = false;
                    break;
                }
                
            })

            // Makes sure if the Api goes Offline protocals set in place
            if (offlineTrack.online == false) {res = {};online = false;}
        }

        // Defines json Output to empty object if response is Invalid
        const json = (typeof res.json == "function") ? await res.json() : {};


        if ("status" in json) {success = json.status}

        if ("results" in json) {return {response: json.results, online: online, success: success} }

        // Returns custom object to comunicate with front end
        return {response: json, online: online, success: success};
    }

}
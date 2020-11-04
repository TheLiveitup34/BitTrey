import Storage from '../storage.js'
import Modal from '../modal.js'
import Validator from '../validator.js';
export default class Loan {
    defaultLoan = {
        loans: [],
        selectedId: null
    };
    constructor(main) {
        this.main = main;
        this.data = this.defaultLoan;
        
        // Main Setup
        this.nav = document.querySelector('[data-loans]');
        this.home = document.querySelector('[data-loan-home]')
        const create = document.querySelector('[data-loan-add]');


        if (new Storage().getStorage('loans') !== null) {
            this.data = new Storage().getStorage('loans');
        }

        this.nav.addEventListener('click', e => {
            if (e.target.tagName.toLowerCase() == 'li') {

                this.data.selectedId = e.target.dataset.loanId;

                this.saveAndRender();


            }
        })
        
        create.addEventListener('submit', e => {
            e.preventDefault();
            this.createLoan();
        })

        this.saveAndRender();

    }


    async createLoan() {
        const form = document.querySelector('[data-loan-add]');
        const data = new FormData(form);

        if (data.get('name') == "" && data.get('ammount') == "") return;
        if (isNaN(data.get('ammount'))) return;
        const api = await new Validator(this.main, 'addLoan', {name: data.get('name'), ammount: data.get('ammount')});
        const temp = {id: Date.now().toString(), api: api, name: data.get('name'), ammount: data.get('ammount'), payments: []};

        this.data.selectedId = temp.id;
        this.data.loans.push(temp);

        document.querySelectorAll('[data-loan-add] input').forEach(input => {input.value = ""});

        this.saveAndRender();

    }


    async saveAndRender() {

        await this.save();
        this.render();

    }

    async addApi() {
        let api = await new Validator(this.main, 'getLoan');
        if (api !== null) {

            api.loan.forEach(loan => {
                const localStorage = this.data.loans.find(loans => loans.api == loan.loan_id);
                if (localStorage == null || localStorage == "null" ) {
                    const temp = {id: loan.loan_id, api: loan.loan_id, name: loan.name, ammount: parseInt(loan.loan_amount), payments: []};
                    this.data.loans.push(temp);
                }

            })

            if (this.data.selectedId !== null) {
                
            const SelectedLoan = this.data.loans.find(loan => loan.id == this.data.selectedId);
            let payments  = api.payments.find(payment => payment.loan_id == this.data.selectedId);

            if (typeof payments == "object") {
                let temp = [];
                temp.push(payments);
                payments = temp;
            }

            if (payments == null || payments == "null") return;

                if (payments !== null || payments !== "null") {
                    payments.forEach(payment =>  {
                        const payments = [];
                        const temp  = {id: payment.payment_id, ammount: payment.payment_amount, date: payment.payment_date};
                        payments.push(temp);
                       if (SelectedLoan.id == this.data.selectedId) {
                        SelectedLoan.payments = payments;
                       }
                    })
                }
            }

        }
    }

    async save() {
        await this.addApi();
        new Storage('set', 'loans', this.data);
    }

    render() {

        this.clearElement(this.nav);
        this.renderLoans();

        if (this.data.selectedId == null) return;

        this.clearElement(this.home);
        this.renderHome();

        
    }

    renderLoans() {

        this.data.loans.forEach(loan => {
            const elm = document.createElement('li');
            elm.classList.add('tooltip');

            const tooltip = document.createElement('span');
            tooltip.innerText = "view the loan";
            tooltip.classList.add('tooltiptext');
            elm.dataset.loanId = loan.id;
            elm.innerText = loan.name;
            elm.appendChild(tooltip)

            if (loan.id == this.data.selectedId) {
                elm.classList.add('active-loan');
            }

            this.nav.appendChild(elm);

        })

    }

    renderHome() {
        const SelectedLoan =  this.data.loans.find(loan => loan.id === this.data.selectedId);
        const template = document.importNode(document.getElementById('loanHome').content, true);
        template.querySelector('[data-loan-name]').innerText = SelectedLoan.name;
        template.querySelector('[data-loan-ammount]').innerText = `$${this.abbreviateNumber(SelectedLoan.ammount)}`;
        const displayRemaining = template.querySelector('[data-loan-remaining]');
        const displayMeter = template.querySelector('[data-loan-meter]');
        const loanPayments =  template.querySelector('[data-loan-prior]');
        let total = 0;
        SelectedLoan.payments.forEach(payment => {
            total = parseInt(payment.ammount) + total;
        });

        let remaining = SelectedLoan.ammount - total;

        if (total == 0) {
            displayRemaining.innerText = "No Payment Made!";
        } else {
            displayRemaining.innerText = `$${this.abbreviateNumber(remaining)} remaing`;
        }

        if (remaining == 0) {
            displayRemaining.innerText = "Successfully paid off!";
        }

        SelectedLoan.payments.forEach(payment => {
            const elm = document.createElement('li');
            elm.dataset.paymentId = payment.id;
            elm.innerText = `$${this.abbreviateNumber(payment.ammount)} paid on ${payment.date}`;
            loanPayments.appendChild(elm);
        });

        template.querySelector('[data-loan-pay]').addEventListener('click', e => {
            e.preventDefault();
            new Modal('loanAdd');
            const form = document.querySelector('[data-loan-payment]');
            form.addEventListener('submit', e=> {
                e.preventDefault();
                const SelectedLoan =  this.data.loans.find(loan => loan.id === this.data.selectedId);
                let data = new FormData(form);
                if (data.get('ammount') == "") return;
                if (isNaN(data.get('ammount'))) return;
                new Validator(this.main, 'addPayment', {api: SelectedLoan.api, ammount: data.get('ammount')})
                if (parseInt(data.get('ammount')) > parseInt(SelectedLoan.ammount)) return;
                let date  = new Date();
                const temp  = {id: Date.now().toString(), ammount: data.get('ammount'), date: `${date.getMonth()}/${date.getDay()}/${date.getFullYear()}`};
                SelectedLoan.payments.push(temp);
                document.querySelector('.modal').remove();
                this.saveAndRender();

            })
        })

        template.querySelector('[data-loan-remove]').addEventListener('click', e => {
            e.preventDefault();
            const api = this.data.loans.find(loan => loan.id == this.data.selectedId).api;
            new Validator(this.main, 'removeLoan', api);
            this.data.loans = this.data.loans.filter(loan => loan.id  !== this.data.selectedId);
            this.data.selectedId = null;
            this.clearElement(this.home);
            this.saveAndRender();
        })
        
        this.home.appendChild(template);
        window.scrollTo(this.home.offsetLeft,this.home.offsetTop);

        setTimeout(() => {

                displayMeter.style = `transform: rotate(${(total / parseInt(SelectedLoan.ammount)) * (180 / 100) * 100}deg)`;

        },400)



    }

    abbreviateNumber(val) {
        // thousands, millions, billions etc.. 
        var s = ["", "k", "m", "b", "t"]; 
        
        // dividing the value by 3. 
        var sNum = Math.floor(("" + val).length / 3); 

        // calculating the precised value. 
        var sVal = parseFloat(( 
        sNum != 0 ? (val / Math.pow(1000, sNum)) : val).toPrecision(2)); 
        
        if (sVal % 1 != 0) { 
            sVal = sVal.toFixed(1); 
        } 

        // appending the letter to precised val. 
        return sVal + s[sNum]; 
    }

    convertToArray(obj) {
        let arr = [];
        obj = Object.entries(obj);
        obj.forEach(([keys,item]) => {
            arr.push(item);
        })
        return arr;
    }


    clearElement(elm) {
        while(elm.firstChild) {
            elm.removeChild(elm.firstChild);
        }
    }

}
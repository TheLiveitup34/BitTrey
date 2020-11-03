export default class Modal {

    constructor(id) {
        const child = document.getElementById(id);
        const insert = document.importNode(child.content, true);
        const modal = document.importNode(document.getElementById('modal').content, true);
        modal.querySelector('.modal-content').appendChild(insert);
    
        document.body.appendChild(modal);
        document.querySelector('.modal').addEventListener('click', e => {
            
            if (child.hasAttribute('data-modal-form')) {

                if (e.target.classList.contains('modal')) {
                    document.querySelector('.modal').remove();
                }

            } else {
                document.querySelector('.modal').remove();
            }

        })
    }

}
export default class DragDrop {
    
    constructor(callBack) {
        this.callBack = callBack;

        this.draggables = document.querySelectorAll('[data-draggable]');
        this.containers = document.querySelectorAll('[data-drag-container]');
       
        
        this.draggables.forEach(dragable => {
            dragable.draggable = true;
            this.dragSetup(dragable);
            

        })

        this.containers.forEach(container => {

            this.containerSetup(container);

        })
        

    }

    containerSetup(elm) {

        elm.addEventListener('dragover', e => {
            e.preventDefault();
            const draggable = document.querySelector('[data-dragging]');
            const afterElm = this.getDragAfterElm(elm, e.clientY);

            
                if (elm.hasAttribute('data-hide-drag')) {
                    draggable.style="display: none;";
                }
                if (afterElm == null) {
                    elm.appendChild(draggable);
                } else {
                    elm.insertBefore(draggable, afterElm);
                }

            if (typeof this.callBack.dragOver == "function") {
                this.callBack.dragOver(e, elm, draggable);
            }
        })

    }

    dragSetup(dragable) {

        dragable.addEventListener('dragstart', e => {
            dragable.dataset.dragging = true;
            dragable.style = "opacity: .5";

            if (typeof this.callBack.dragStart == "function") {
                this.callBack.dragStart(e, dragable);
            }
        })

        dragable.addEventListener('dragend', e => {
            dragable.removeAttribute('data-dragging')
            dragable.removeAttribute('style');

            if (typeof this.callBack.dragEnd == "function") {
                this.callBack.dragEnd(e, dragable);
            }

        })

    }

    getDragAfterElm(container, y) {
        const draggableElms = [...container.querySelectorAll('[data-draggable]:not([drag-dragging])')];
        return draggableElms.reduce((closest, child) => {

            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return {offset: offset, element: child}
            } else {
                return closest
            }

        }, {offset: Number.NEGATIVE_INFINITY}).element
    }

}
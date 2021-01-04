"use-strict";

class AnimatedCard extends HTMLElement {
    static get observedAttributes() {
        return ["seqnumber"];
    }

    constructor() {
        super();

        console.log("animated-card: instantiate");
        this.current = null;
        this.active = false;
        this.state = "playing";
        this.seqNumber = null;
        this.queue = [];
        this.zeroTime = Date.now();
        this.child = null;

        this.attachShadow({mode: 'open'});
        let wrapper = document.createElement('div');
        wrapper.setAttribute("style", "display: block;");
        // only block elements can be animated
        
        this.shadowTop = wrapper;
        this.shadowRoot.append(wrapper);
    }

    addToQueue() {
        console.log("animated-card: addToQueue");
        let attr_time = this.getAttribute("time");
        if (attr_time) {
            let req_time = parseInt(attr_time, 10);
            if (req_time > 0) {
                let client_time = Date.now() - this.zeroTime;
                if (req_time < client_time) {
                    this.zeroTime += 0.2 * (client_time - req_time);
                } else {
                    this.zeroTime += 0.1 * (client_time - req_time);
                }
            }
        };
        let attr_seqNumber = this.getAttribute("seqnumber");
        if (attr_seqNumber) {
            console.log("seqNumber:", attr_seqNumber);
            let seqNumber = parseInt(attr_seqNumber, 10);
            if (seqNumber > 0) {
                if (this.seqNumber !== null && this.seqNumber >= seqNumber) {
                    console.log("animated-card: ignored addition");
                    return;  // ignore update
                };
                this.seqNumber = seqNumber;
            }
        };
        let new_keyframes = [];
        let new_options = {};
        let attr_keyframes = this.getAttribute("keyframes");
        if (attr_keyframes) {
            try {
                new_keyframes = JSON.parse(attr_keyframes);
            } catch (e) {
                console.error(e)
            }
        }

        let attr_options = this.getAttribute("options");
        if (attr_options) {
            try {
                new_options = JSON.parse(attr_options);
            } catch (e) {
                console.error(e)
            }
        }

        if (!this.child.isSameNode(this.firstElementChild)) {
            this.shadowTop.removeChild(this.shadowTop.firstElementChild);
            this.child = this.firstElementChild;
            let copy = this.firstElementChild.cloneNode(true); // deep clone
            this.shadowTop.appendChild(copy);
            this.observeChild();
        }
        
        this.queue.push( { keyframes: new_keyframes,
                           options: new_options
                         } );
        if (!this.active)
            this.nextAnimation();
    }
    
    pause() {
        this.state = "paused";
        if (this.current != null) this.current.pause();
    }

    play() {
        this.state = "playing";
        if (this.current != null)
            this.current.play()
        else {
            if (!this.active)
                this.nextAnimation();
        }
    }

    cancel() {
        this.state = "canceled";
        if (this.current != null)
            this.current.cancel();
        this.queue = [];
    }

    finish() {
        this.state = "playing";
        if (this.current != null)
            this.current.finish();
    }

    connectedCallback() {
        console.log("animated-card: connecting");
        this.child = this.firstElementChild;
        let copy = this.firstElementChild.cloneNode(true); // deep clone
        this.shadowTop.appendChild(copy);
        this.observeChild();
        let attr_time = this.getAttribute("time");
        if (attr_time) {
            let req_time = parseInt(attr_time, 10);
            this.zeroTime = Date.now() - req_time;
        };
        this.addToQueue();
    }

    observeChild() {
        if (this.observer)
            this.observer.disconnect();
        let elemThis = this;
        let observer = new MutationObserver(function() {
            elemThis.shadowTop.removeChild(elemThis.shadowTop.firstElementChild);
            let copy = elemThis.firstElementChild.cloneNode(true); // deep clone
            elemThis.shadowTop.appendChild(copy);
        });
        observer.observe(this.child, {subtree:true, childList:true, attributes:true, characterData:true});
        this.observer = observer;
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        // only called back for seqNumber
        console.log("animated-card: attributeChangedCallback for ", name);
        if (this.isConnected && newValue != oldValue) {
            let elemThis = this;
            // minimal delay so we also observe any other changed attribs
            window.setTimeout(function() {
                elemThis.addToQueue();
            })
        }
    }

    nextAnimation() {
        console.log("animated-card: nextAnimation");
        if (this.queue.length == 0 || this.state != "playing")
            return;
        let next = this.queue.shift();
        let time = Date.now() - this.zeroTime;
        let waitTime = 0;
        if (next.options && next.options.startAt !== undefined && next.options.startAt >= time)
            waitTime = next.options.startAt - time;
        this.active = true;
        let elemThis = this;
        window.setTimeout(function() {
            if (elemThis.state != "playing") {
                if (elemThis.state == "paused")
                    elemThis.queue.unshift(next);
                return;
            }
            if (next.options && next.options.finishAt !== undefined) {
                let time = Date.now() - elemThis.zeroTime;
                let dur = next.options.finishAt - time;
                if (dur < 0) dur = 0;
                console.log("startAt:", next.options.startAt);
                console.log("finishAt:", next.options.finishAt);
                console.log("time:", time);
                console.log("duration:", dur);
                next.options.duration = dur;
            };
            delete(next.options.startAt);
            delete(next.options.finishAt);
            elemThis.current = elemThis.shadowTop.animate(next.keyframes, next.options);
            elemThis.current.onfinish = function() { elemThis.onAnimFinish() };
        }, waitTime);
    }

    onAnimFinish() {
        this.active = false;
        this.nextAnimation()
    }
}

customElements.define("animated-card", AnimatedCard);

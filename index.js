"use-strict";

class AnimatedCard extends HTMLElement {
    constructor() {
        super();

        this.current = null;
        this.active = false;
        this.state = "playing";
        this.seqNumber = null;
        this.queue = [];
        this.zeroTime = Date.now();

        this.attachShadow({mode: 'open'});
        let wrapper = document.createElement('div');
        wrapper.setAttribute("style", "display: block;");
        // only block elements can be animated
        
        this.shadowTop = wrapper;
        this.shadowRoot.append(wrapper);
    }

    static get observedAttributes() {
        return ["keyframes", "options", "seqNumber"];
    }

    addToQueue() {
        console.log("animated-card: addToQueue");
        let attr_seqNumber = this.getAttribute("seqNumber");
        if (attr_seqNumber) {
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

        this.queue.push( { keyframes: new_keyframes,
                           options: new_options
                         } );
        console.log("active=", this.active);
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
        let copy = this.firstElementChild.cloneNode(true); // deep clone
        this.shadowTop.appendChild(copy);
        this.addToQueue();
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
                next.options.duration = dur;
            };
            delete(next.options.startAt);
            delete(next.options.finishAt);
            elemThis.current = elemThis.shadowTop.animate(next.keyframes, next.options);
            elemThis.current.onfinish = function() { elemThis.onAnimFinish() };
        }, waitTime);
    }

    onAnimFinish() {
        console.log("animated-card: finished animation");
        this.active = false;
        this.nextAnimation()
    }
}

customElements.define("animated-card", AnimatedCard);

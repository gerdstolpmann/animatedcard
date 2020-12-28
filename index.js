"use-strict";

/*

INS:
[ { name:"keyframes", type:[{}] },
  { name:"options", type:{} },
  { name:"addToQueue", type:"event" },
  { name:"pause", type:"event" },
  { name:"cancel", type:"event" },
  { name:"play", type:"event" },
  { name:"finish", type:"event" }
]

EVENTS:

*/


class AnimatedCard extends HTMLElement {
    constructor() {
        super();

        this.current = null;
        this.queue = [];

        this.attachShadow({mode: 'open'});
        let something = document.createElement('div');
        let more = document.createElement("div");
        more.id = "mydiv";
        more.setAttribute("style", "width: 10px; height: 10px; background-color: black; position: absolute; display: block;");
        something.append(more);
        
        this.shadowTop = more;
        this.shadowRoot.append(something);
    }

    static get observedAttributes() {
        return ["keyframes", "options"];
    }

    addToQueue() {
        console.log("animated-card: addToQueue");
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
    }
    
    pause() {
        if (this.current != null) this.current.pause();
    }

    play() {
        if (this.current != null) this.current.play();
    }

    cancel() {
        if (this.current != null) this.current.cancel();
    }

    finish() {
        if (this.current != null) this.current.finish();
    }

    connectedCallback() {
        this.addToQueue();
        this.nextAnimation();
    }

    nextAnimation() {
        console.log("animated-card: nextAnimation");
        let next = this.queue.shift();
        if (next) {
            let elemThis = this;
            elemThis.current = elemThis.shadowTop.animate(next.keyframes, next.options);
            elemThis.current.onfinish = function() { elemThis.onAnimFinish() };
        }
    }

    onAnimFinish() {
        this.nextAnimation()
    }
}

customElements.define("animated-card", AnimatedCard);

# animated-card web component for RemixLabs

## Register

```
TAG:
animated-card

MODTYPE:
url

DATA:
https://gerdstolpmann.github.io/animatedcard/index.js

INS:
[ { "name":"keyframes", "type":[{}] },
  { "name":"options", "type":{} },
  { "name":"seqnumber", "type": "number" },
  { "name":"time", "type": "number" },
  { "name":"addToQueue", "type":"event" },
  { "name":"pause", "type":"event" },
  { "name":"cancel", "type":"event" },
  { "name":"play", "type":"event" },
  { "name":"finish", "type":"event" }
]

EVENTS:
[]

FIELD LABEL TEXT:
1 Card
```

## Animate a card

This component is an interface for the
[animate](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate)
function of HTML elements. You can pass `keyframes` and `options`
as described in the standard, e.g.

```
keyframes:
  [ { transform: "translateX(0px)" },
    { transform: "translateX(100px)" }
  ]

options:
  { duration: 1000,
    fill: "forwards"
  }
```

This animation is then applied to the card that is passed in.


## Queuing up animations

While the current animation is playing, it is possible to submit further
animations for the same card by triggering the `addToQueue` event.
These additional animations queue up, and when the first animation
finishes (either naturally or because of a `finish` event), the next
animation in the queue is automatically and seamlessly started.

There is no upper bound for the number of queued elements. However, it
is usually not wise to submit more than one waiting animation.

**Note that there is currently a bug in the runtime:**
When the `addToQueue` event fires, and the other attributes (in particular
`keyframes`) change at around the same time, it is possible that the changes
are not recorded correctly. **Workaround:** Use `seqnumber` instead
in such cases.

## Sequence numbers

In addition to triggering `addToQueue` there is another mechanism to
queue up further animations. You can also set the `seqnumber` input
to a value > 0, and whenever this value is increased, another animation
is added to the queue.

## Controlling the start and finish time exactly

The `options` object interprets two non-standard fields: `options.startAt`
specifies the time when the animation will start playing. `startAt` is
given in milliseconds since the time the web component was instantiated.

The other field is `options.finishAt`. If present it overrides the
`options.duration` field - in other words, the `duration` is derived
from `finishAt`.

## Adjusting time reference

The `time` input can be set to the expected time (in milliseconds since
instantiation).

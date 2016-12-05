module.exports = {
    1: {
        responder: ["lecturer"],
        content: "Waiting for being accepted by lecturer",
        next: [3,2]
    },
    2: {
        responder: [],
        content: "Denied by lecturer"
    },
    3: {
        responder: ["moderator"],
        content: "Waiting for being approved by moderator",
        next: [4]
    },
    4: {
        responder: ["admin"],
        content: "Waiting for being approved by admin",
        next: [5]
    },
    5: {
        responder: ["admin"],
        content: "Waiting for file to be submitted",
        next: [9,6]
    },
    6: {
        responder: ["moderator"],
        content: "Requesting for topic & tutor change",
        next: [1]
    },
    9: {
        responder: ["moderator"],
        content: "Waiting for being assigned a council",
        next: [10]
    },
    10: {
        responder: ["admin"],
        content: "Waiting for the council to be approved",
        next: [11]
    },
    11: {
        responder: ["moderator"],
        content: "Waiting for being protected",
        next: [12]
    },
    12: {
        responder: ["secretary"],
        content: "Waiting for report",
        next: [13]
    },
    13: {
        responder: ["moderator"],
        content: "Waiting for result",
        next: [14]
    },
    14: {
        responder: ["student"],
        content: "Waiting for result to be accepted by protected",
        next: [16, 15],
    },
    15: {
        responder: ["moderator"],
        content: "Requesting for a report change",
        next: [13]
    },
    16: {
        responder: ["moderator"],
        content: "Waiting for hand-copy version to be submitted",
        next: [18, 17]
    },
    17: {
        responder: ["moderator"],
        content: "Waiting for editing explanation",
        next: [18]
    },
    18: {
        responder: ["admin"],
        content: "Waiting for being final approved be admin",
        next: [19]
    },
    19: {
        content: "Completed"
    }
};
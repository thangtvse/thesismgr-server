module.exports = [
    {
        id: 1,
        responder: ["lecturer"],
        content: "Waiting for being accepted by lecturer",
        next: [3, 2]
    },
    {
        id: 2,
        responder: [],
        content: "Denied by lecturer",
        next: []
    },
    {
        id: 3,
        responder: ["moderator"],
        content: "Waiting for being approved by moderator",
        next: [4]
    },
    {
        id: 4,
        responder: ["admin"],
        content: "Waiting for being approved by admin",
        next: [5]
    },
    {
        id: 5,
        responder: ["admin"],
        content: "Waiting for file to be submitted",
        next: [9, 6]
    },
    {
        id: 6,
        responder: ["moderator"],
        content: "Requesting for topic & tutor change",
        next: [1]
    },
    {
        id: 7,
        responder: ["admin"],
        content: "Waiting for being stopped",
        next: [8]
    },
    {
        id: 8,
        responder: [],
        content: "Stopped",
        next: []
    },
    {
        id: 9,
        responder: ["moderator"],
        content: "Waiting for being assigned a council",
        next: [10]
    },
    {
        id: 10,
        responder: ["admin"],
        content: "Waiting for the council to be approved",
        next: [11]
    },
    {
        id: 11,
        responder: ["moderator"],
        content: "Waiting for being protected",
        next: [12]
    },
    {
        id: 12,
        responder: ["secretary"],
        content: "Waiting for report",
        next: [13]
    },
    {
        id: 13,
        responder: ["moderator"],
        content: "Waiting for result",
        next: [14]
    },
    {
        id: 14,
        responder: ["student"],
        content: "Waiting for result to be accepted by protected",
        next: [16, 15],
    },
    {
        id: 15,
        responder: ["moderator"],
        content: "Requesting for a report change",
        next: [13]
    },
    {
        id: 16,
        responder: ["moderator"],
        content: "Waiting for hand-copy version to be submitted",
        next: [18, 17]
    },
    {
        id: 17,
        responder: ["moderator"],
        content: "Waiting for editing explanation",
        next: [18]
    },
    {
        id: 18,
        responder: ["admin"],
        content: "Waiting for being final approved be admin",
        next: [19]
    },
    {
        id: 19,
        content: "Completed",
        responder: [],
        next: []
    }
];
module.exports = [
    {
        id: 1,
        responder: ["lecturer", "lecturer"],
        content: "Chờ giảng viên chấp nhận",
        next: [3, 2],
        buttonTitles: ['Chấp nhận', 'Từ chối']
    },
    {
        id: 2,
        responder: [],
        content: "Bị giảng viên từ chối",
        next: []
    },
    {
        id: 3,
        responder: ["moderator"],
        content: "Chờ khoa duyệt",
        next: [4],
        buttonTitles: ['Duyệt']
    },
    {
        id: 4,
        responder: ["admin"],
        content: "Chờ nhà trường duyệt",
        next: [5],
        buttonTitles: ['Duyệt']
    },
    {
        id: 5,
        responder: ["admin", "student"],
        content: "Chờ hồ sơ bảo vệ",
        next: [9, 6],
        buttonTitles: ['Đã nộp', 'Yêu cầu thay đổi']
    },
    {
        id: 6,
        responder: ["moderator"],
        content: "Đang yêu cầu thay đổi",
        next: [1],
        buttonTitles: ['Duyệt']
    },
    {
        id: 7,
        responder: ["admin"],
        content: "Chờ để bị dừng",
        next: [8],
        buttonTitles: ['Dừng']
    },
    {
        id: 8,
        responder: [],
        content: "Đã dừng",
        next: []
    },
    {
        id: 9,
        responder: ["moderator"],
        content: "Chờ phân công hội đồng phản biện",
        next: [10],
        buttonTitles: ['Xong']
    },
    {
        id: 10,
        responder: ["admin"],
        content: "Chờ hội đồng phản biện được duyệt",
        next: [11],
        buttonTitles: ['Duyệt']
    },
    {
        id: 11,
        responder: ["moderator"],
        content: "Chờ để bảo vệ",
        next: [12],
        buttonTitles: ['Cho bảo vệ']
    },
    {
        id: 12,
        responder: ["secretary"],
        content: "Chờ biên bản bảo vệ",
        next: [13],
        buttonTitles: ['Xong']
    },
    {
        id: 13,
        responder: ["moderator"],
        content: "Chờ khoa thẩm định",
        next: [14],
        buttonTitles: ['Duyệt']
    },
    {
        id: 14,
        responder: ["student", "student"],
        content: "Chờ sinh viên đồng ý",
        next: [16, 15],
        buttonTitles: ['Chấp nhận', 'Yêu cầu thay đổi']
    },
    {
        id: 15,
        responder: ["moderator"],
        content: "Chờ để được điều chỉnh biên bản bảo vệ",
        next: [13],
        buttonTitles: ['Duyệt']
    },
    {
        id: 16,
        responder: ["moderator", "moderator"],
        content: "Chờ nộp quyển",
        next: [18, 17],
        buttonTitles: ['Duyệt', 'Nộp giải trình điều chỉnh']
    },
    {
        id: 17,
        responder: ["moderator"],
        content: "Chờ báo cáo điều chỉnh",
        next: [18],
        buttonTitles: ['Xong']
    },
    {
        id: 18,
        responder: ["admin"],
        content: "Chờ nhà trường thẩm định",
        next: [19],
        buttonTitles: ['Duyệt']
    },
    {
        id: 19,
        content: "Hoàn thành",
        responder: [],
        next: []
    }
];
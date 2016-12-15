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
        responder: ["moderator", 'moderator', 'student'],
        content: "Chờ khoa duyệt",
        next: [4, 7, 6],
        buttonTitles: ['Duyệt', 'Yêu cầu dừng', 'Đề nghị sửa']
    },
    {
        id: 4,
        responder: ["admin", 'moderator', 'student'],
        content: "Chờ nhà trường duyệt",
        next: [5, 7, 6],
        buttonTitles: ['Duyệt', 'Yêu cầu dừng', 'Đề nghị sửa']
    },
    {
        id: 5,
        responder: ["moderator", "student", 'moderator', 'student'],
        content: "Chờ hồ sơ bảo vệ",
        next: [9, 6, 7, 6],
        buttonTitles: ['Đã nộp', 'Yêu cầu thay đổi', 'Yêu cầu dừng', 'Đề nghị sửa']
    },
    {
        id: 6,
        responder: ["moderator", 'moderator'],
        content: "Đang yêu cầu thay đổi",
        next: [1, 7],
        buttonTitles: ['Duyệt', 'Yêu cầu dừng']
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
        responder: ["moderator", 'moderator'],
        content: "Chờ phân công hội đồng phản biện",
        next: [10, 7],
        buttonTitles: ['Phân công hội đồng', 'Yêu cầu dừng']
    },
    {
        id: 10,
        responder: ["admin", 'moderator'],
        content: "Chờ hội đồng phản biện được duyệt",
        next: [11, 7],
        buttonTitles: ['Duyệt', 'Yêu cầu dừng']
    },
    {
        id: 11,
        responder: ["moderator", 'moderator'],
        content: "Chờ để bảo vệ",
        next: [12, 7],
        buttonTitles: ['Cho bảo vệ', 'Yêu cầu dừng']
    },
    {
        id: 12,
        responder: ["secretary", 'moderator'],
        content: "Chờ biên bản bảo vệ",
        next: [13, 7],
        buttonTitles: ['Xuất biên bản bảo vệ', 'Yêu cầu dừng']
    },
    {
        id: 13,
        responder: ["moderator", 'moderator'],
        content: "Chờ khoa thẩm định",
        next: [14],
        buttonTitles: ['Duyệt', 'Yêu cầu dừng']
    },
    {
        id: 14,
        responder: ["student", "student", 'moderator'],
        content: "Chờ sinh viên đồng ý",
        next: [16, 15, 7],
        buttonTitles: ['Chấp nhận', 'Yêu cầu thay đổi', 'Yêu cầu dừng']
    },
    {
        id: 15,
        responder: ["moderator", 'moderator'],
        content: "Chờ để được điều chỉnh biên bản bảo vệ",
        next: [13, 7],
        buttonTitles: ['Duyệt', 'Yêu cầu dừng']
    },
    {
        id: 16,
        responder: ["moderator", "moderator", 'moderator'],
        content: "Chờ nộp quyển",
        next: [18, 17, 7],
        buttonTitles: ['Duyệt', 'Nộp giải trình điều chỉnh', 'Yêu cầu dừng']
    },
    {
        id: 17,
        responder: ["moderator", 'moderator'],
        content: "Chờ báo cáo điều chỉnh",
        next: [18, 7],
        buttonTitles: ['Xong', 'Yêu cầu dừng']
    },
    {
        id: 18,
        responder: ["admin", 'moderator'],
        content: "Chờ nhà trường thẩm định",
        next: [19, 7],
        buttonTitles: ['Duyệt', 'Yêu cầu dừng']
    },
    {
        id: 19,
        content: "Hoàn thành",
        responder: [],
        next: []
    }
];
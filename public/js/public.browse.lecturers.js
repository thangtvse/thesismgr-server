var data = {};
var hash = window.location.hash;
var page = 1;
var type = "lecturer-name";
var numberOfPages = 1;

$(document).ready(function () {

    if (hash && hash.substring(0, 5) == '#page') {
        page = parseInt(hash.substring(6));
    }

    console.log('pages: ' + numberOfPages);

    $('#pagination').pagination({
        items: numberOfPages,
        itemOnPage: 8,
        currentPage: page,
        cssStyle: '',
        prevText: '<span aria-hidden="true">&laquo;</span>',
        nextText: '<span aria-hidden="true">&raquo;</span>',
        onInit: function () {
            // fire first page loading
            getData(" ");
        },
        onPageClick: function (currentPage, evt) {
            // some code
            page = currentPage;
            window.location.hash = "#page-" + page;
            console.log(page);
            if (data[page] == null) {
                var text = $("#search-box").val();
                getData(text);
            } else {
                setData();
            }
        }
    });
});

$("#search-form").submit(function (e) {
    e.preventDefault();

    var text = $("#search-box").val();

    console.log(text);

    if (!text || text == "") {
        return;
    }

    data = {};

    getData(text);

});

$("input[name='search-type']").click(function () {
    type = this.value;
});

var getData = function (text) {

    NProgress.start();

    if (type == "lecturer-name") {
        $.ajax({
            method: 'GET',
            url: '/api/search-lecturer',
            data: {
                full_name: text,
                page: page
            },
            success: function (response) {

                NProgress.done();

                if (response.status == true) {

                    numberOfPages = response.data.numberOfPages;
                    data[page] = response.data.lecturers;
                    $("#pagination").pagination('redraw');
                    setData();

                } else {
                    showError(response.message)
                }
            },
            error: errorHandler
        })
    } else if (type == "topic-name") {

        $.ajax({
            method: 'GET',
            url: '/api/search-topic',
            data: {
                topic_name: text,
                page: page
            },
            success: function (response) {

                NProgress.done();

                if (response.status == true) {

                    numberOfPages = response.data.numberOfPages;
                    data[page] = response.data.topics;
                    $("#pagination").pagination('redraw');
                    setData();
                } else {
                    showError(response.message)
                }
            },
            error: errorHandler
        })
    }
};

var setData = function () {

    $("#list").children().remove();

    if (type == "lecturer-name") {
        data[page].forEach(function (lecturer) {
            if (lecturer.lecturer != null) {
                var fieldsHtml = "";

                lecturer.lecturer.fields.forEach(function (field) {
                    fieldsHtml = fieldsHtml.concat("<p> - " + field.name + "</p>");
                });

                var rank = "";
                if (lecturer.lecturer.rank) {
                    rank = lecturer.lecturer.rank;
                }

                $('#list').append('<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12">' +
                    '<div class="panel panel-primary">' +
                    '<div class="panel-heading">' + lecturer.fullName + '</div>' +
                    '<div class="panel-body">' +
                    '<p><strong>Mã giảng viên: </strong>' + lecturer.officerNumber + '</p>' +
                    '<p><strong>Học hàm/ học vị: </strong>' + rank + '</p>' +
                    '<p><strong>Các lĩnh vực nghiên cứu: </strong>' + fieldsHtml + '</p>' +
                    '</div>' +
                    '<div class="panel-footer">' +
                    '<a href="/lecturers/' + lecturer.officerNumber + '">Xem thông tin</a>' +
                    '</div>' +
                    '</div>' +
                    '</div>'
                )
            }
        })
    } else if (type == "topic-name") {
        data[page].forEach(function (topic) {

            var fieldsHtml = "";

            topic.fields.forEach(function (field) {
                fieldsHtml = fieldsHtml.concat("<p> - " + field.name + "</p>");
            });

            $('#list').append('<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12">' +
                '<div class="panel panel-info">' +
                '<div class="panel-heading">' + topic.title + '</div>' +
                '<div class="panel-body">' +
                '<p><strong>Giảng viên: </strong>' + topic.lecturer.user.fullName + '</p>' +
                '<p><strong>Các lĩnh vực liên quan: </strong>' + fieldsHtml + '</p>' +
                '</div>' +
                '<div class="panel-footer">' +
                '<a href="/lecturers/' + topic.lecturer.user.officerNumber + '">Xem thông tin</a>' +
                '</div>' +
                '</div>' +
                '</div>'
            )

        })
    }
};

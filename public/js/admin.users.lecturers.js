var lecturers = {};
var hash = window.location.hash;
var page = 1;
var numberOfPages = $("#number-of-pages").text();

$(document).ready(function () {

    if (hash && hash.substring(0, 5) == '#page') {
        page = parseInt(hash.substring(6));
    }

    $('#pagination').pagination({
        items: numberOfPages,
        itemOnPage: 8,
        currentPage: page,
        cssStyle: '',
        prevText: '<span aria-hidden="true">&laquo;</span>',
        nextText: '<span aria-hidden="true">&raquo;</span>',
        onInit: function () {
            // fire first page loading
            getData();
        },
        onPageClick: function (currentPage, evt) {
            // some code
            page = currentPage;
            window.location.hash = "#page-" + page;
            console.log(page);
            if (lecturers[page] == null) {
                getData();
            } else {
                setDataToTable();
            }


        }
    });

    $(".unit-search-item.link").click(function (e) {
        var a = $(this);

        // set text for drop-down menu
        $("#category-search-drop-menu-button").html(a.attr("data-name") + " <span class=\"caret\"></span>");
        if (a.attr("data-id") != null) {
            // set value for form

            $(".unit-id").val(a.attr("data-id"));

        } else {
            $(".unit_id").val(null);
        }


        e.preventDefault();
    });

    $(".form-control.category-search.input").keyup(function () {
        var input = $(".form-control.category-search.input");
        var searchText = input.val();

        console.log("keyup with text: " + searchText);

        $(".unit-search-item").each(function (index) {

            var item = $(this);

            if (item.text().toLowerCase().indexOf(searchText.toLowerCase()) >= 0) {
                item.show();
            } else {
                item.hide();
            }
        })
    });
});

var success = function (response) {
    if (response.status == true) {

        console.log("response: " + response);

        lecturers[page] = [];

        response.data.forEach(function (lecturer) {
            lecturers[page].push(lecturer);
        });

        setDataToTable((page - 1) * 10, response.data.length);

    } else {
       showError(response.message)
    }
};

var getData = function () {

    var data = {
        page: page
    };

    if ($("#current-role").text() == "moderator") {
        data.faculty_id = $("#current-facultyID").text();
    }

    $.ajax({
        url: "/admin/users/api/lecturers",
        method: "GET",
        data: data,
        success: success,
        error: errorHandler
    });
};

var setDataToTable = function () {
    $('.table.table-body').children().remove();

    lecturers[page].forEach(function (lecturer) {
        if (lecturer.lecturer != null) {
            var fieldsHtml = "";

            lecturer.lecturer.fields.forEach(function (field, index) {
                fieldsHtml = fieldsHtml.concat(field.name);
                if (index != (lecturer.lecturer.fields.length - 1)) {
                    fieldsHtml = fieldsHtml.concat(', ');
                }
            });

            $('#table-lecturers').append('<tr>' +
                '<td>' + lecturer.officerNumber + '</td>' +
                '<td>' + lecturer.fullName + '</td>' +
                '<td>' + lecturer.email + '</td>' +
                '<td>' + lecturer.unit.name + '</td>' +
                '<td>' + lecturer.faculty.name + '</td>' +
                '<td>' + fieldsHtml + '</td>' +
                '</tr>'
            )
        }
    });
};

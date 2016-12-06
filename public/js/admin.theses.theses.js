/**
 * Created by tranvietthang on 12/4/16.
 */

var theses = {};
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
            if (theses[page] == null) {
                getData();
            } else {
                setDataToTable();
            }


        }
    });
});

var success = function (response) {
    if (response.status == true) {

        console.log(response);

        theses[page] = [];

        response.data.forEach(function (thesis) {
            theses[page].push(thesis);
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
        url: "/admin/theses/api/theses",
        method: "GET",
        data: data,
        success: success,
        error: errorHandler
    });
};

var setDataToTable = function () {
    $('.table.table-body').children().remove();

    theses[page].forEach(function (thesis) {

        $('#table-theses').append('<tr>' +
            '<td>' + thesis.name + '</td>' +
            '<td>' + formatDate(thesis.from) + '</td>' +
            '<td>' + formatDate(thesis.to) + '</td>' +
            '<td>' + thesis.faculty.name + '</td>' +
            '<td>' + '</td>' +
            '<td><a href="#" onclick="notify(event, \'' + thesis.id + '\')">Send Notifications</a></td>' +
            '</tr>'
        )
    });
};
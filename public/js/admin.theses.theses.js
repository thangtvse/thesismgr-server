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

        setDataToTable();

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
    $('#table-theses-body').children().remove();

    if (!theses[page]) {
        return;
    }

    theses[page].forEach(function (thesis) {

        var fieldsHtml = "";

        thesis.fields.forEach(function (field, index) {
            fieldsHtml = fieldsHtml.concat(field.name);
            if (index != (thesis.fields.length - 1)) {
                fieldsHtml = fieldsHtml.concat(', ');
            }
        });

        var dateOfProtectionHtml = "Not set";
        if (thesis.dateOfProtection) {
            dateOfProtectionHtml = formatDate(thesis.dateOfProtection)
        }

        $('#table-theses-body').append('<tr>' +
            '<td>' + thesis.title + '</td>' +
            '<td>' + thesis.student.user.fullName + '</td>' +
            '<td>' + thesis.lecturer.user.fullName + '</td>' +
            '<td>' + thesis.faculty.name + '</td>' +
            '<td>' + fieldsHtml + '</td>' +
            '<td>' + dateOfProtectionHtml + '</td>' +
            '<td>' + thesis.session.name + '</td>' +
            '<td>' + thesis.status.content + '</td>' +
            '<td><a href="/admin/theses/' + thesis.id + '"><button class="btn btn-default">View details</button></a></td>' +
            '</tr>'
        )
    });
};
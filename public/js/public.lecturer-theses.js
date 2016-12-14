/**
 * Created by tranvietthang on 12/4/16.
 */

var theses = {};
var hash = window.location.hash;
var page = 1;
var numberOfPages = $("#number-of-pages").text();
var status = 'all';

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

    $('#status').change(function () {
        status = $('#status').val();
        page = 1;
        theses = {};
        getNumberOfPages();
        getData();
    })
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

var getNumberOfPages = function () {
    var data = {
        status: status
    };


    $.ajax({
        url: "/theses/api/number-of-pages",
        method: "GET",
        data: data,
        success: function (response) {
            if (response.status == true) {

                console.log(response);

                numberOfPages = response.data;
                $("#pagination").pagination('redraw');

                setDataToTable((page - 1) * 10, response.data.length);

            } else {
                showError(response.message)
            }
        },
        error: errorHandler
    });
};

var getData = function () {

    var data = {
        page: page,
        status: status
    };


    $.ajax({
        url: "/theses/api/all",
        method: "GET",
        data: data,
        success: success,
        error: errorHandler
    });
};

var setDataToTable = function () {
    $('.table.table-body').children().remove();

    if (!theses[page]) {
        return;
    }

    theses[page].forEach(function (thesis) {

        $('#table-theses').append('<tr>' +
            '<td>' + thesis.student.user.fullName + '</td>' +
            '<td>' + thesis.student.user.officerNumber + '</td>' +
            '<td>' + thesis.title +
            '<td>' + thesis.faculty.name + '</td>' +
            '<td>' + thesis.status + '</td>' +
            '<td><a href="#" onclick="notify(event, \'' + thesis.id + '\')">Send Notifications</a></td>' +
            '</tr>'
        )
    });
};
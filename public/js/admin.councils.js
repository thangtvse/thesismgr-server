/**
 * Created by tranvietthang on 12/4/16.
 */

var councils = {};
var hash = window.location.hash;
var page = 1;
var numberOfPages = $("#number-of-pages").text();
var xhr;
var timer;

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
            if (councils[page] == null) {
                getData();
            } else {
                setDataToTable();
            }
        }
    });

    $(".officer-number-input").keyup(function (e) {

        e.preventDefault();
        e.stopPropagation();

        var officerNumber = $(this).val();

        $(".officer-number-list").children().remove();

        if (timer) {
            clearTimeout(timer)
        }

        timer = setTimeout(function () {
            if (xhr) {
                xhr.abort();
            }

            if (officerNumber && officerNumber != "") {
                xhr = $.ajax({
                    url: "/admin/users/api/lecturers/search-by-officer-number",
                    method: "GET",
                    data: {
                        officer_number: officerNumber
                    },
                    success: function (response) {

                        if (response.status == true) {

                            console.log(response);

                            response.data.forEach(function (user) {
                                $(".officer-number-list").append('<option value="' + user.officerNumber + '">' + user.fullName + ' - ' + user.officerNumber + '</option>')
                            })

                        } else {
                            showError(response.message);
                        }
                    },
                    error: errorHandler
                })
            }

        }, 500);
    });
});

var success = function (response) {
    if (response.status == true) {

        console.log(response);

        councils[page] = [];

        response.data.forEach(function (council) {
            councils[page].push(council);
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
        url: "/admin/councils/api/all",
        method: "GET",
        data: data,
        success: success,
        error: errorHandler
    });
};

var setDataToTable = function () {
    $('.table.table-body').children().remove();

    if (!councils[page]) {
        return;
    }

    councils[page].forEach(function (council) {

        var membersHtml = "";
        council.members.forEach(function (member, index) {
            membersHtml = membersHtml.concat(member.user.fullName);
            if (index != (council.members.length - 1)) {
                membersHtml = membersHtml.concat(', ');
            }
        });

        $('#table-councils').append('<tr>' +
            '<td>' + council.name + '</td>' +
            '<td>' + council.chairman.user.fullName + '</td>' +
            '<td>' + council.secretary.user.fullName + '</td>' +
            '<td>' + council.reviewer.user.fullName + '</td>' +
            '<td>' + membersHtml + '</td>' +
            '<td>' + council.faculty.name + '</td>' +
            '<td>' + council.session.name + '</td>' +
            '<td></td>' +
            '</tr>'
        )
    });
};

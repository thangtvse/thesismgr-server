/**
 * Created by tranvietthang on 12/4/16.
 */

var sessions = {};
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
            if (sessions[page] == null) {
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

        console.log(response);

        sessions[page] = [];

        response.data.forEach(function (session) {
            sessions[page].push(session);
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
        url: "/admin/theses/api/sessions",
        method: "GET",
        data: data,
        success: success,
        error: errorHandler
    });
};

var setDataToTable = function () {
    $('.table.table-body').children().remove();

    sessions[page].forEach(function (session) {

        $('#table-sessions').append('<tr>' +
            '<td>' + session.name + '</td>' +
            '<td>' + formatDate(session.from) + '</td>' +
            '<td>' + formatDate(session.to) + '</td>' +
            '<td>' + session.faculty.name + '</td>' +
            '<td>' + '</td>' +
            '<td><a href="#" onclick="notify(event, \'' + session.id + '\')">Send Notifications</a></td>' +
            '</tr>'
        )
    });
};

var notify = function (e, sessionID) {
    e.preventDefault();

    bootbox.confirm({
        message: "Send email for all thesis-registrable students about this session?",
        buttons: {
            confirm: {
                label: 'Yes',
                className: 'btn-success'
            },
            cancel: {
                label: 'No',
                className: 'btn-danger'
            }
        },
        callback: function (result) {
            if (result == true) {

                $.ajax({
                    url: "/admin/theses/api/sessions/notify",
                    method: "POST",
                    data: {
                        session_id: sessionID
                    },
                    success: function (response) {
                        if (response.status == true) {

                            bootbox.alert({
                                message: "Send notifications successfully!",
                                size: 'small'
                            });

                        } else {
                            showError(response.message)
                        }
                    },
                    error: errorHandler
                });
            }
        }
    });
};

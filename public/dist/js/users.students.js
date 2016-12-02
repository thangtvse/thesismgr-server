var students = {};
var hash = window.location.hash;
var page = 1;
var numberOfPages = $("#number-of-pages").text();

$(document).ready(function () {

    if (hash && hash.substring(0, 5) == '#page') {
        page = parseInt(hash.substring(6));
    }

    console.log(page);

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
            if (students[page] == null) {
                getData();
            } else {
                setDataToTable();
            }


        }
    });


    configCourseAndProgram();

    $("#faculty_id").change(function () {
        configCourseAndProgram();
    })
});

var configCourseAndProgram = function () {
    var facultyID = $("#faculty_id").val();

    var courseSelected = false;

    $(".course-option-item").each(function (index, element) {
        if ($(this).attr("data-faculty-id") != facultyID) {
            $(this).hide();
            $(this).attr("selected", false);
        } else {
            $(this).show();
            if (courseSelected == false) {
                $(this).attr("selected", true);
                courseSelected = true;
            }
        }
    });

    var programSelected = false;

    $(".program-option-item").each(function (index, element) {
        if ($(this).attr("data-faculty-id") != facultyID) {
            $(this).hide();
            $(this).attr("selected", false);
        } else {
            $(this).show();
            if (programSelected == false) {
                $(this).attr("selected", true);
                programSelected = true;
            }
        }
    })
};

var success = function (response) {
    if (response.status == true) {

        console.log(response);

        students[page] = [];

        response.data.forEach(function (student) {
            students[page].push(student);
        });

        setDataToTable((page - 1) * 10, response.data.length);

    } else {
        $.toast({
            heading: 'Error',
            text: response.message,
            icon: 'error',
        })
    }
};

var error = function (xhr) {
    $.toast({
        heading: 'Error',
        text: "Can't send request",
        icon: 'error',
    })
};

var getData = function () {

    var data = {
        page: page
    };

    if ($("#current-role").text() == "moderator") {
        data.faculty_id = $("#current-facultyID").text();
    }

    $.ajax({
        url: "/users/api/students",
        method: "GET",
        data: data,
        success: success,
        error: error
    });
};

var setDataToTable = function () {
    $('.table.table-body').children().remove();

    students[page].forEach(function (student) {
        if (student.student != null) {

            $('#table-students').append('<tr>' +
                '<td>' + student.officerNumber + '</td>' +
                '<td>' + student.fullName + '</td>' +
                '<td>' + student.email + '</td>' +
                '<td>' + student.faculty.name + '</td>' +
                '<td>' + student.student.course.name + '</td>' +
                '<td>' + student.student.program.name + '</td>' +
                '<td>' + student.student.thesisRegistrable + '</td>' +
                '</tr>'
            )
        }
    });
};

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


    // config course and program for add-new-student modal
    configCourseAndProgram();

    $("#faculty_id").change(function () {
        configCourseAndProgram();
    });

    // config course and program for update modal
    configCourseAndProgramForUpdate();

    $("#update-faculty-id").change(function () {
        configCourseAndProgramForUpdate();
    });

    // submit updated info
    $("#btn-update-submit").click(function (e) {
        e.preventDefault();
        updateInfo();
    })
});

/**
 * Config course and program for add-new-student-modal that fit with faculty
 */
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

/**
 * Config course and program for update modal that fit with faculty
 */
var configCourseAndProgramForUpdate = function () {
    var facultyID = $("#update-faculty-id").val();

    var courseSelected = false;

    $(".update-course-option-item").each(function (index, element) {
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

    $(".update-program-option-item").each(function (index, element) {
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

/**
 * Get data from server
 */
var getData = function () {

    var data = {
        page: page
    };

    if ($("#current-role").text() == "moderator") {
        data.faculty_id = $("#current-facultyID").text();
    }

    $.ajax({
        url: "/admin/users/api/students",
        method: "GET",
        data: data,
        success: function (response) {
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
        },
        error: errorHandler
    });
};

/**
 * Update info for current student
 */
var updateInfo = function () {
    $.ajax({
        url: "/admin/users/api/students/update",
        method: "POST",
        data: {
            officer_number: $("#update-officer-number").val(),
            email: $("#update-email").val(),
            faculty_id: $("#update-faculty-id").val(),
            course_id: $("#update-course-id").val(),
            program_id: $("#update-program-id").val(),
            full_name: $("#update-full-name").val(),
            thesis_registrable: $("#update-thesis-registrble").val() == "true"
        },
        success: function (response) {

            console.log(response.data);

            $("#update-student-modal").modal('hide');

            if (response.status == true) {

                for (var i = 0; i <= students[page].length; i++) {

                    if (students[page][i].id == response.data.id) {
                        // console.log("before");
                        // console.log(students[page]);
                        students[page][i] = response.data;
                        // console.log("after");
                        // console.log(students[page]);
                        break;
                    }
                }
                ;

                console.log(students);

                setDataToTable();

            } else {
                $.toast({
                    heading: 'Error',
                    text: response.message,
                    icon: 'error',
                })
            }
        },
        error: errorHandler
    })
};

/**
 * Set data to table
 */
var setDataToTable = function () {
    $('.table.table-body').children().remove();

    if (!students[page]) {
        return;
    }

    students[page].forEach(function (student) {
        if (student.student != null) {

            var registrable = "NO";
            if (student.student.thesisRegistrable) {
                registrable = "YES"
            }

            $('#table-students').append('<tr>' +
                '<td>' + student.officerNumber + '</td>' +
                '<td>' + student.fullName + '</td>' +
                '<td>' + student.email + '</td>' +
                '<td>' + student.faculty.name + '</td>' +
                '<td>' + student.student.course.name + '</td>' +
                '<td>' + student.student.program.name + '</td>' +
                '<td>' + registrable + '</td>' +
                '<td><a onclick="editStudent(event,\'' + student.id + '\')">Edit</a></td>' +
                '</tr>'
            )
        }
    });
};

/**
 * Open a modal allows us to update student info
 * @param studentID
 */
var editStudent = function (e, studentID) {
    e.preventDefault();

    var student;

    for (var page in students) {
        student = $.grep(students[page], function (e) {
            return e.id == studentID;
        })[0];

        if (student != null) {
            break;
        }
    }

    $("#update-officer-number").val(student.officerNumber);
    $("#update-email").val(student.email);
    $("#update-faculty-id").val(student.faculty.id);
    $("#update-course-id").val(student.student.course.id);
    $("#update-program-id").val(student.student.program.id);
    $("#update-full-name").val(student.fullName);
    $("#update-thesis-registrble").val(student.student.thesisRegistrable ? "true" : "false");
    $("#update-student-modal").modal('show');
};

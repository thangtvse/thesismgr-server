var xhr;
var timer;
var lecturerOfficerNumber;

$(document).ready(function () {

    $('#editor').wysiwyg();

    if ("onwebkitspeechchange" in document.createElement("input")) {
        var editorOffset = $('#editor').offset();

        $('.voiceBtn').css('position', 'absolute').offset({
            top: editorOffset.top,
            left: editorOffset.left + $('#editor').innerWidth() - 35
        });
    } else {
        $('.voiceBtn').hide();
    }

    initToolbarBootstrapBindings();


    $("#lecturer-search-input").keyup(function (e) {

        e.preventDefault();
        e.stopPropagation();

        lecturerOfficerNumber = null;
        var name = $(this).val();

        $("#lecturer-dropdown").children().not('#search-box').remove();

        if (timer) {
            clearTimeout(timer)
        }

        timer = setTimeout(function () {
            if (xhr) {
                xhr.abort();
            }

            if (name && name != "") {
                xhr = $.ajax({
                    url: "/api/search-lecturer-fast",
                    method: "GET",
                    data: {
                        full_name: name
                    },
                    success: function (response) {

                        if (response.status == true) {

                            console.log(response);

                            response.data.forEach(function (user) {
                                $("#lecturer-dropdown").append('<li style=\"display: list-item\"><a onclick=\"setLecturer(\'' + user.officerNumber + '\',\'' + user.fullName + '\')\" style=\"display: block\">' + user.fullName + ' - ' + user.officerNumber + '</a></li>')
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

    $('#new-thesis-form').submit(function (e) {
        e.preventDefault();
        e.stopPropagation();

        var editor = $('#editor');

        if (!editor.html() || editor.html() == "") {
            showError("You must fill in description of the thesis");
            window.scrollTo(0, 0);
            return;
        }

        if (!lecturerOfficerNumber) {
            showError("You must select a tutor");
            window.scrollTo(0, 0);
            return;
        }

        NProgress.start();

        $.ajax({
            type: 'POST',
            url: '/theses/api/new',
            data: {
                title: $('#title').val(),
                session_id: $('#session-id').val(),
                fields: JSON.stringify($("#field-ids").val()),
                tutor_id: lecturerOfficerNumber,
                description: JSON.stringify($('#editor').html())
            },
            success: function (response) {

                NProgress.done();

                if (response.status == true) {
                    window.location.href = '/theses'
                } else {
                    showError(response.message);
                    window.scrollTo(0, 0);
                }
            },
            error: errorHandler
        })
    })

});

function setLecturer(officerNumber, name) {
    $('#lecturer-search-drop-menu-button').text(name);
    lecturerOfficerNumber = officerNumber
}

function initToolbarBootstrapBindings() {
    if ("onwebkitspeechchange" in document.createElement("input")) {
        var editorOffset = $('#editor').offset();

        $('.voiceBtn').css('position', 'absolute').offset({
            top: editorOffset.top,
            left: editorOffset.left + $('#editor').innerWidth() - 35
        });
    } else {
        $('.voiceBtn').hide();
    }
}
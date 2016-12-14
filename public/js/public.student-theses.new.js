var xhr;
var timer;

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

    $('#tutor-id').on('loaded.bs.select', function (e) {
        // do something...
        $("#tutor-form-group > div > div > div > div > input").keyup(function (e) {

            e.preventDefault();
            e.stopPropagation();

            var searchText = $(this).val();
            $("#tutor-id").children().remove();
            $("#tutor-id").append("<option></option>");
            $('.selectpicker').selectpicker('refresh');

            if (timer) {
                clearTimeout(timer)
            }

            timer = setTimeout(function () {
                if (xhr) {
                    xhr.abort();
                }

                if (searchText && searchText != "") {
                    xhr = $.ajax({
                        url: "/api/search-lecturer-fast",
                        method: "GET",
                        data: {
                            full_name: searchText
                        },
                        success: function (response) {

                            if (response.status == true) {

                                response.data.forEach(function (user) {
                                    $("#tutor-id").append('<option value="' + user.officerNumber + '">' + user.fullName + ' - ' + user.officerNumber + '</option>')
                                })

                                $('.selectpicker').selectpicker('refresh');

                            } else {
                                showError(response.message);
                            }
                        },
                        error: errorHandler
                    })
                }

            }, 500);

        })
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

        NProgress.start();

        $.ajax({
            type: 'POST',
            url: '/theses/api/new',
            data: {
                title: $('#title').val(),
                fields: JSON.stringify($("#field-ids").val()),
                tutor_id: $('#tutor-id').val(),
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
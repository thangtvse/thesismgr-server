var configUnitsForFaculty = function () {
    var facultyID = $("#faculty-id").val();
    var facultyItem = $('option[value=' + facultyID + ']');
    var left = facultyItem.attr('data-left');
    var right = facultyItem.attr('data-right');
    var unitSelected = false;

    $(".unit-option-item").each(function (index, element) {

        if ($(this).attr("data-left") >= left && $(this).attr("data-right") <= right) {
            $(this).show();
            if (unitSelected == false) {
                $(this).attr("selected", true);
                unitSelected = true;
            }
        } else {
            $(this).hide();
            $(this).attr("selected", false);
        }
    });
};

$(document).ready(function () {

    // config course and program for add-new-student modal
    configUnitsForFaculty();

    $("#faculty-id").change(function () {
        configUnitsForFaculty();
    });

    // set data for fields drop down
    var fields = JSON.parse($("#current-field-ids").text());
    var fieldIDs = [];
    fields.forEach(function (field) {
        fieldIDs.push(field.id);
    });

    $("#field-ids").val(fieldIDs);
    $('.selectpicker').selectpicker('refresh');

    // on form submit
    $("#info-form").submit(function (e) {
        e.preventDefault();
        e.stopPropagation();

        data = {
            full_name: $("#full-name").val(),
            rank: $("#rank").val(),
            unit: $("#unit-id").val(),
            fields: JSON.stringify($("#field-ids").val()),
            email: $("#email").val()
        };

        $.ajax({
            type: "POST",
            url: "/profile/api/update-profile",
            data: data,
            success: function (response) {
                if (response.status == true) {
                    swal(
                        'Success!',
                        'Your profile has been updated.',
                        'success'
                    )
                } else {
                    showError(response.message);
                }
            },
            error: errorHandler
        })
    });

    $("#btn-add-topic").click(function (e) {
        $('#add-topic-modal').modal('show');
    });

    $("#topic-form").submit(function (e) {

        $('#add-topic-modal').modal('toggle');

        e.preventDefault();
        e.stopPropagation();

        data = {
            topic_title: $("#topic-title").val(),
            topic_description: $("#topic-description").val(),
            fields: JSON.stringify($("#topic-field-ids").val()),
        };

        $.ajax({
            type: "POST",
            url: "/profile/api/add-topic",
            data: data,
            success: function (response) {
                if (response.status == true) {

                    var fieldsHTML = "";

                    $("#topic-field-ids").val().forEach(function (id, index) {
                        fieldsHTML = fieldsHTML.concat($("option[value=" + id + "]").text());
                        if (index != ($("#topic-field-ids").val().length - 1)) {
                            fieldsHTML = fieldsHTML.concat(', ');
                        }
                    });

                    $("#topics").prepend('<div class="panel panel-default">' +
                        '<div class="panel-heading">' +
                        '<h5>' + data.topic_title + '</h5>' +
                        '</div>' +
                        '<div class="panel-body">' +
                        '<p>' + data.topic_description + '</p>' +
                        '</div>' +
                        '<div class="panel-footer">' +
                        fieldsHTML +
                        '</div>' +
                        '</div>')

                } else {
                    showError(response.message);
                }
            },
            error: errorHandler
        })
    });
});
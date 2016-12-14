var xhr;
var timer;
var newModerator;

$(document).ready(function () {

    $("#new-moderator-officer-number").keyup(function (e) {

        e.preventDefault();

        var officerNumber = $("#new-moderator-officer-number").val();

        $("#officer-number-search-list").children().remove();

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
                                $("#officer-number-search-list").append("<option value='" + user.officerNumber + "'>" + user.fullName + " - " + user.faculty.name + "</option>")
                            })

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
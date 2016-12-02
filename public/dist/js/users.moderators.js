var xhr;
var newModerator;

$(document).ready(function () {

    $("#new-moderator-officer-number").keyup(function (e) {

        var officerNumber = $("#new-moderator-officer-number").val();

        $("#officer-number-search-list").children().remove();

        setTimeout(function () {
            if (xhr) {
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

                            response.data.forEach(function (user) {
                                $("#officer-number-search-list").append("<option value='" + user.officerNumber + "'>" + user.fullName + " - " + user.faculty.name + "</option>")
                            })

                        } else {
                            $.toast({
                                heading: 'Error',
                                text: response.message,
                                icon: 'error',
                            })
                        }


                    },
                    error: function (xhr) {

                    }
                })
            }

        }, 500);

    })

});
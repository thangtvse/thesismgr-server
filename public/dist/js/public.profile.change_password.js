function checkStrength(password) {
    //initial strength
    var strength = 0

    //if the password length is less than 6, return message.
    if (password.length < 6) {
        $('#result').removeClass()
        $('#result').addClass('short')
        return 'Too short'
    }

    //length is ok, lets continue.

    //if length is 8 characters or more, increase strength value
    if (password.length > 7) strength += 1

    //if password contains both lower and uppercase characters, increase strength value
    if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) strength += 1

    //if it has numbers and characters, increase strength value
    if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) strength += 1

    //if it has one special character, increase strength value
    if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1

    //if it has two special characters, increase strength value
    if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1

    //now we have calculated strength value, we can return messages

    //if value is less than 2
    if (strength < 2) {
        $('#result').removeClass()
        $('#result').addClass('weak')
        return 'Weak'
    }
    else if (strength == 2) {
        $('#result').removeClass()
        $('#result').addClass('good')
        return 'Good'
    }
    else {
        $('#result').removeClass()
        $('#result').addClass('strong')
        return 'Strong'
    }
}
var check = false;
var match = false;
$(document).ready(function () {
    $('#new-password').keyup(function () {
        var res = checkStrength($('#new-password').val());
        switch (res) {
            case "Too short":
                $('#errNew').css({color: "red"});
                check = false;
                break;
            case "Weak":
                $('#errNew').css({color: "orange"});
                check = true;
                break;
            case "Good":
                $('#errNew').css({color: "#00ff00"});
                check = true;
                break;
            case "Strong":
                $('#errNew').css({color: "green"});
                check = true;
                break;
        }
        $('#errNew').html(res);
    });

    $('#errMatch').css({color: "red"});
    $('#retype-new-password').keyup(function () {
        if ($('#retype-new-password').val() != $('#new-password').val()) {
            $('#errMatch').html("Password not match");
            match = false;
        } else {
            $('#errMatch').html("");
            match = true;
        }
    });

    $("#form").submit(function (e) {
        e.preventDefault();
        NProgress.start();
        if (check && match) {
            $.ajax({
                url: "/profile/api/change-password",
                type: "POST",
                data: {
                    old_password: $("#old-password").val(),
                    new_password: $("#new-password").val()
                },
                success: function (response) {

                    NProgress.done();

                    if (response.status == true) {
                        swal(
                            'Success!',
                            'Your password has been updated.',
                            'success'
                        )
                    } else {
                        showError(response.message)
                    }
                },
                error: errorHandler
            })
        }
    })
});
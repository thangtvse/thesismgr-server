$(function () {
    $('#side-menu').metisMenu();
});

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size

$('.nav-unit-item').click(function (e) {
    window.location = $(this).attr('href');
    e.stopPropagation();
});

$(function () {
    $(window).bind("load resize", function () {
        var topOffset = 50;
        var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });


    var url = window.location.href.split('#')[0];
    // var element = $('ul.nav a').filter(function() {
    //     return this.href == url;
    // }).addClass('active').parent().parent().addClass('in').parent();
    var element = $('ul.nav a').filter(function () {
        return (this.href == url) || ($(this).attr("data-href") == url);
    }).addClass('active').parent();

    $(".navbar-default.sidebar").removeAttr("hidden");

    while (true) {
        if (element.is('li')) {
            element = element.parent().addClass('in').parent();
        } else {
            break;
        }
    }
});


function post(path, params, method) {
    method = method || "post"; // Set method to post by default if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
}

function errorHandler(xhr) {
    console.log(xhr);

    var jsonResponse = xhr.responseJSON;

    console.log(jsonResponse);

    if (jsonResponse && jsonResponse.status == false && jsonResponse.message) {
        showError(jsonResponse.message);
    }
}

function showError(message) {

    var html = "<div class='alert alert-danger alert-dismissable fade in' role='alert' id='error-alert'>" +
        "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>" +
        "<span aria-hidden='true'>&times;</span> " +
        "</button> " +
        "<strong>Error!</strong>" +
        "<p id='error-alert-message' style='white-space:pre-wrap;'>" + message + "</p>" +
        "</div>";


    $(".alert-container").append(html);
}

function formatDate(dateString) {
    var date = new Date(dateString);
    return date.getUTCDate() + "/" + (date.getUTCMonth() + 1) + "/" + date.getUTCFullYear();
}
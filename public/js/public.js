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
    NProgress.done();
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
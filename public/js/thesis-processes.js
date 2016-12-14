jQuery.fn.extend({
    buildThesisProcesses: function (thesisID, status, role, redirectURL) {

        var o = $(this[0]);

        status.responder.forEach(function (responder, index) {

            if (responder == role) {

                if (status.id == 9 && index == 0) {
                    o.append('' +
                        '<button class="btn btn-default" data-index="' + index + '">' + status.buttonTitles[index] + '</button>')
                } else {
                    o.append('' +
                        '<button class="btn btn-default" data-index="' + index + '" onclick="moveThesisToNextStep(\'' + thesisID + '\', \'' + status.id + '\', \'' + index + '\', \'' + redirectURL + '\', \'' + role + '\')">' + status.buttonTitles[index] + '</button>' +
                        '')
                }
            } else if (responder == 'secretary') {
                o.append('' +
                    '<button class="btn btn-default" data-index="' + index + '">' + status.buttonTitles[index] + '</button>')
            }
        })

    }
});

function moveThesisToNextStep(thesisID, statusID, selectionIndex, redirectURL, role) {

    var url;
    if (role == 'lecturer' || role == 'student') {
        url = '/theses/api/move-thesis-to-next-status';
    } else {
        url = '/admin/theses/api/move-thesis-to-next-status';
    }

    console.log(url);

    $.ajax({
        data: {
            thesis_id: thesisID,
            index: selectionIndex
        },
        url: url,
        success: function (response) {

            console.log(response.data);

            if (response.status == true) {
                if (redirectURL != 'undefined' && redirectURL != undefined && redirectURL != null) {
                    console.log('a ' + redirectURL);
                    window.location.href = redirectURL;
                } else {
                    console.log('b');
                    window.location.reload();
                }

            } else {
                showError();
            }
        },

        error: errorHandler
    })

}
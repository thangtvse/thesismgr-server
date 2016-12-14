console.log('hello');

function sendEmailForStudentNeedSubmitFiles() {

    console.log('send');

    $.ajax({
        url: '/admin/tools/send-email-for-students-need-submit-files',
        success: function (response) {
            if (response.status == true) {
                swal(
                    'Success!',
                    'Emails have been sent',
                    'success'
                )
            } else {
                showError(response.message);
            }
        },
        error: errorHandler
    })
}


function exportProtectableStudentList() {
    window.location.href = '/admin/tools/export-protectable-student-list?session_id=' + $("#session-id").val()
}
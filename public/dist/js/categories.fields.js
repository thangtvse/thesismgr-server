$(document).ready(function () {

    $(".field-search-item.link").click(function (e) {
        var a = $(this);

        // set text for drop-down menu
        $("#category-search-drop-menu-button").html(a.attr("data-name") + " <span class=\"caret\"></span>");
        if (a.attr("data-id") != null) {
            // set value for form

            $(".new-field-parent-id").val(a.attr("data-id"));

        } else {
            $(".new-field-parent-id").val(null);
        }

        e.preventDefault();
    });

    $(".form-control.category-search.input").keyup(function () {
        var input = $(".form-control.category-search.input");
        var searchText = input.val();

        console.log("keyup with text: " + searchText);

        $(".field-search-item").each(function (index) {

            var item = $(this);

            if (item.text().toLowerCase().indexOf(searchText.toLowerCase()) >= 0) {
                item.show();
            } else {
                item.hide();
            }
        })
    });

    $(".category-hierarchy.delete").click(function (e) {

        var a = $(this);

        bootbox.confirm({
            title: "Remove field?",
            message: "All of its descendants will also be removed.",
            buttons: {
                cancel: {
                    label: '<i class="fa fa-times"></i> Cancel'
                },
                confirm: {
                    label: '<i class="fa fa-check"></i> Confirm'
                }
            },
            callback: function (result) {
                if(result == true) {
                    window.location.href="/categories/fields/delete?id=" + a.attr("data-id");
                    e.preventDefault();
                }
            }
        });
    })
});
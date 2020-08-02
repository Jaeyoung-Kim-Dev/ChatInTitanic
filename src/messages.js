$(() => {
    $("#send").click(() => {  // send a message
        const message = {
            name: $("#name").html(),
            message: $("#message").val(),
            // date will be added in server.js
        };
        postMessage(message);
        $("#message").val("");  // empty textarea 'message'
    });

    $("#restore").click(() => {  // reset DB
        $.post('/reset')

    });

    $(".dropdown-menu a").click(function () { // When select the person name, the dropdown displays the name. Used regular function (not arrow) to use 'this'
        $(this).parents(".dropdown").find('.btn').html($(this).text());
        $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
    });

    $(document).ready(() => {  // The first name is selected as default.
        $(".dropdown .dropdown-menu a")[0].click();
    });

    getMessages();
})

const addMessages = (message) => {
    const profile = "photo/" + message.name.toLowerCase() + ".jpeg";
    const template = `
            <div class="pic m-1">
                <img src=${profile} class="img-thumbnail rounded-circle" style="height: 80px; width: 80px" alt="profile">
            </div>
            <div class="col m-1">
                <div class="row">
                    <p class="font-weight-bold h5">
                        ${message.name}
                        <span class="text-muted small">${message.date}</span>
                    </p>
                </div>
                <p class="row">${message.message}</p>
                </div><div class="w-100">
            </div>`
    $("#messages").append(template)
}

const getMessages = () => {
    $.get('/messages', (data) => {
        data.forEach(addMessages);
        scrollSmoothToBottom('main');
    })
}

const postMessage = (message) => {
    $.post('/messages', message)
}

const scrollSmoothToBottom = (id) => {  // to scroll smoothly to the bottom of the body
    const div = document.getElementById(id);
    $('#' + id).animate({
        scrollTop: div.scrollHeight - div.clientHeight /*+ $("#footer").height() * 2 */ // todo: fix "$("#footer").height() * 2" later. It doesn't scroll down to the bottom when it loads at the first time
    }, 500);
}
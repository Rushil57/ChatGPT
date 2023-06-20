$(document).ready(function () {
    getAllModels();
})

function getAllModels() {
    $.ajax({
        before: AddLoader(),
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
        url: '/Chat/GetAllModels',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: [],
        success: function (data) {
            if (data.IsValid) {
                var modelIDList = '<option id="0" style="text-align: center;">---Select---</option>';
                for (var i = 0; i < data.data.length; i++) {
                    var selected = data.data[i].toLowerCase() == 'gpt-3.5-turbo' ? 'selected' : '';
                    modelIDList += '<option id="' + data.data[i] + '"' + selected + '>' + data.data[i] + '</option>'
                }
                $('#modelIDList').html(modelIDList);
            }
        },
        error: function (e1, e2, e3) {
        }
    });
}



function searchOnChatGPT() {
    var searchQuery = $('#query').val().trim();
    var instructions = $('#instructions').val().trim();
    var modelID = $('#modelIDList').val();
    var isAlert = false;
    var alertStr = '';
    if (searchQuery == '') {
        alertStr += 'Please enter text for search. \n';
        isAlert = true;
    }
    if (modelID.toLowerCase() == '---select---') {
        alertStr += 'Please select model.';
        isAlert = true;
    }
    if (isAlert) {
        alert(alertStr);
        return;
    }
    AddLoader();
    setTimeout(function () {
        $.ajax({
            url: '/Chat/SearchOnChatGPT',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'POST',
            async: false,
            data: "{query:'" + searchQuery + "',model:'" + modelID + "',instructions:'" + instructions + "'}",
            success: function (data) {
                if (data.IsValid) {
                    $('#result').val(data.data);
                }
                else {
                    $('#result').val('No data found.');
                }
                setTimeout(function () {
                    RemoveLoader();
                }, 500);
            },
            error: function (e1, e2, e3) {
                setTimeout(function () {
                    RemoveLoader();
                }, 500);
            }
        });
    }, 500);
}

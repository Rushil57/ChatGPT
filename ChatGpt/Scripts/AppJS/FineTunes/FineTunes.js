$(document).ready(function () {
    getAllModels();
})

function generateFineTune(isNew) {
    var fileVal = $('#file').val();
    var fileNameLength = fileVal.length;
    var fileExtension = fileVal.substring(fileNameLength - 4, fileNameLength)
    if (fileVal.trim() == '') {
        alert('Please select file.')
        return;
    }
    else if (fileExtension.toLowerCase() != 'json') {
        alert('Please upload json file.');
    }
    else {
        if (isNew) {
            generateFineTuneChatGPT("");
        }
        else {
            generateFineTuneChatGPT($('#modelIDList').val());
        }
    }
}

function generateFineTuneChatGPT(model) {

    var timer = "0:00";
    $('.countdown').attr('hidden', false);
    var interval = setInterval(function () {
        var timer1 = timer.split(':');
        //by parsing integer, I avoid all extra string processing
        var minutes = parseInt(timer1[0], 10);
        var seconds = parseInt(timer1[1], 10);
        ++seconds;
        minutes = (seconds == 60) ? ++minutes : minutes;
        minutes = (minutes < 10) ? '0' + minutes : minutes;
        seconds = (seconds > 59) ? 0 : seconds;
        seconds = (seconds < 10) ? '0' + seconds : seconds;
        $('.countdown').html('Time Elapsed: ' + minutes + ':' + seconds);
        timer = minutes + ':' + seconds;
    }, 1000);

    var fileUpload = $("#file").get(0);
    var files = fileUpload.files;
    var formData = new FormData();

    formData.append("file", files[0]);
    formData.append("model", model);
    $.ajax({
        before: AddLoader(),
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
        type: "POST",
        url: '/FineTunes/GenerateFineTunes',
        data: formData,
        contentType: false,
        processData: false,
        success: function (data) {
            var newData = JSON.parse(data);
            clearInterval(interval);
            $('.countdown').attr('hidden', true);
            if (newData.IsValid) {
                alert("Your file is successfully tuned. Tuned model name is " + newData.data);
                $('#modelIDList').append('<option id="' + newData.data + '">' + newData.data + '</option>')
                $("#file").val('');
                $('#modelIDList ').find(':selected').remove();
            }
            else {
                alert(newData.data);
            }
        },
        error: function (e1, e2, e3) {
        }
    });
}

function searchOnChatGPT() {
    var searchQuery = $('#query').val().trim();
    var modelID = $('#modelIDList').val();
    if (searchQuery == '') {
        alert('Please enter text for search.');
        return;
    }
    else if (modelID.toLowerCase() == '---select---') {
        alert('Please select model.');
        return;
    }
    AddLoader();

    setTimeout(function () {
        $.ajax({
            url: '/FineTunes/SearchOnChatGPT',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            type: 'GET',
            async: false,
            data: { 'query': searchQuery, 'model': modelID },
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



function getAllModels() {
    $.ajax({
        before: AddLoader(),
        complete: function () {
            setTimeout(function () {
                RemoveLoader();
            }, 500);
        },
        url: '/FineTunes/GetAllModels',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        type: 'GET',
        async: false,
        data: [],
        success: function (data) {
            if (data.IsValid) {
                var modelIDList = '<option id="0" style="text-align: center;">---Select---</option>';
                for (var i = 0; i < data.data.length; i++) {
                    modelIDList += '<option id="' + data.data[i] + '">' + data.data[i] + '</option>'
                }
                $('#modelIDList').html(modelIDList);
            }
        },
        error: function (e1, e2, e3) {
        }
    });
}

function deleteModel() {
    var modelID = $('#modelIDList').val();
    if (modelID.toLowerCase() == '---select---') {
        alert('Please select model.');
        return;
    }
    if (confirm('Are you sure you want to delete this model?')) {
        AddLoader();

        setTimeout(function () {
            $.ajax({
                url: '/FineTunes/DeleteModel',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                type: 'GET',
                async: false,
                data: { 'model': modelID },
                success: function (data) {
                    alert(data.data);
                    if (data.IsValid) {
                        $('#modelIDList ').find(':selected').remove();
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
}
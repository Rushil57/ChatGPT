var lastPlusRow = ' <tr><td colspan="2"></td>  <td class="textBox-BackColor" onclick="addNewRow()"> <svg style="cursor: pointer" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16"> <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" /> </svg> </td> </tr>';
var lastDeleteColumn = '<td onclick="removeRow(this)"><svg style =" cursor: pointer " xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"> <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" /> <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" /> </svg></td>';
var jsonFileTblBody = $('#tblJsonFile > tbody');
var jsonFileStr = '';
var btnGJson = $('#btnGJson');
$(".textBox-BackColor").click(function () {
    addNewRow();
});
function addNewRow() {
    jsonFileTblBody.find('tr:last').before('<tr><td><input class="form-control" type="textarea"/></td><td><input class="form-control" type="textarea"/></td>' + lastDeleteColumn + ' </tr>');
    enableDisableJSONBtn();
}

btnGJson.click(function () {
    jsonFileStr = '';
    var tableLength = $('#tblJsonFile > tbody > tr').length;
    var isGenerateJson = false;
    $('#tblJsonFile > tbody > tr').each(function (index) {
        var firstTd = $(this).find('td:eq(0) >  input').val();
        var secondTd = $(this).find('td:eq(1) >  input').val();
        if ((index + 1) == tableLength || firstTd == '' || secondTd == '') {
            return;
        }
        isGenerateJson = true;
        jsonFileStr += '{"prompt":"' + firstTd + '", "completion": "' + secondTd + '"} \n';
    })
    if (isGenerateJson) {
        var blob = new Blob([jsonFileStr], {
            type: 'application/json'
        });
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = "ChatGptFineTune.json";
        link.click();
    }
    else {
        alert('Data missing in prompt or completion.')
    }
});

function removeRow(element) {
    if (confirm('Are you sure you want to delete this prompt?')) {
        $(element).parent().remove();
        enableDisableJSONBtn();
    }
}
function promptModel() {
    $('#fileupload').val('');
    $('#importExcel').modal('show');
}

function hideModel() {
    $('#fileupload').val('');
    $('#importExcel').modal('hide');
}

var ExcelToJSON = function () {
    this.parseExcel = function (file) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, {
                type: 'binary'
            });
            workbook.SheetNames.forEach(function (sheetName) {
                var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                var promptList = JSON.parse(JSON.stringify(XL_row_object));
                var key = Object.keys(promptList[0]);

                if (key[0].toLowerCase() == 'prompt' && key[1].toLowerCase() == 'completion') {
                    var tableDataStr = '';
                    for (i = 0; i < promptList.length; i++) {
                        var columns = Object.values(promptList[i]);
                        console.log(columns[0] + '-> ' + columns[1])
                        tableDataStr += '<tr><td><input class="form-control" value="' + columns[0] + '" type="textarea"/></td><td><input class="form-control" value="' + columns[1] + '" type="textarea"/></td>' + lastDeleteColumn + ' </tr>';
                    }
                    jsonFileTblBody.find('tr:last').before(tableDataStr);
                }
                else {
                    alert('This excel file dose not have only prompt and completion columns.');
                }
            })
            enableDisableJSONBtn();
        };
        reader.onerror = function (ex) {
            console.log(ex);
        };

        reader.readAsBinaryString(file);
        hideModel();

    };
};

function importExcel() {

    var fileUpload = $("#fileupload").get(0);
    var files = fileUpload.files;
    if (files.length == 0) {
        alert('Please select file.');
        return;
    }
    else if (files[0].name.split('.')[1].toLowerCase() != 'xlsx' && files[0].name.split('.')[1] != 'xls' && files[0].name.split('.')[1] != 'csv') {
        alert('This is not excel file.');
        return;
    }
    AddLoader();
    setTimeout(function () {
        jsonFileTblBody.html(lastPlusRow);
        var xl2json = new ExcelToJSON();
        xl2json.parseExcel(files[0]);
        setTimeout(function () {
            RemoveLoader();
        }, 500)
    }, 500);
}

function enableDisableJSONBtn() {
    var tableLength = $('#tblJsonFile > tbody > tr').length;
    if (tableLength > 1) {
        btnGJson.prop('disabled', false)
    }
    else {
        btnGJson.prop('disabled', true)
    }
}
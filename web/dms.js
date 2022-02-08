var login = function() {
    var email = document.getElementById('inputEmail').value;
    var password = document.getElementById('inputPassword').value;
    if (email != "" && password != "") {
        const data = { email: email, password: password };

        fetch('/login', {
                method: 'POST', // or 'PUT'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            }).then(response => response.text())
            .then((response) => {
                if (response == "Success") {
                    window.location.href = "/dms/resources"
                } else {
                    alert(response);
                }
            })
            .catch(err => console.log(err))
    }
    return false;
}

var signup = function() {
    var email = document.getElementById('inputEmail').value;
    var password = document.getElementById('inputPassword').value;
    if (email != "" && password != "") {
        const data = { email: email, password: password };

        fetch('/user', {
                method: 'POST', // or 'PUT'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            }).then(response => response.text())
            .then((response) => {
                if (response.error_code && response.error_code == 143) {
                    alert("Email already exist")
                } else {
                    window.location.href = "/dms/login.html"
                }
            })
            .catch(err => console.log(err))
    }
    return false;
}



var saveFile = function(el) {
    var fileId = el.id;
    var content = document.getElementById('fileContent').innerHTML;
    if (content != "") {
        const data = { content: content };

        fetch('/dms/api/file/' + fileId, {
                method: 'PUT', // or 'PUT'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(data => {
                alert("File saved successfully");
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
}

var newFolder = function() {
    $('#newFolderModal').modal();
}

var newFile = function() {
    $('#newFileModal').modal();
}

var createFolder = function() {
    var folderName = document.getElementById('inputFolderName').value;
    if (folderName != "") {
        var data = {
            name: folderName
        }
        fetch('/dms/api/folder', {
                method: 'POST', // or 'PUT'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => response.text())
            .then(data => {
                console.log('Success:', data);
                window.location.reload();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    } else {
        alert("Please a folder name")
    }
}

var createFile = function() {
    var fileName = document.getElementById('inputFileName').value;
    var content = document.getElementById('content').value;
    if (fileName != "") {
        var data = {
            name: fileName,
            content: content,
            parent_id: window.parent_id
        }
        fetch('/dms/api/file', {
                method: 'POST', // or 'PUT'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                window.location.reload();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    } else {
        alert("Please a file name")
    }
}

var moveFile = function(el) {
    var targetField = document.getElementById('targetFolder');
    targetField.setAttribute('resource_id', el.id);
    fetch('/dms/api/resources', {
            method: 'GET', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            for (var i = 0; i < data.resources.length; i++) {

                if (data.resources[i].resource_type != 2) {
                    var option = document.createElement('option');
                    option.value = data.resources[i].resource_id
                    option.innerText = data.resources[i].resource_name
                    targetField.appendChild(option);
                }

            }
            $('#moveFileModal').modal();

        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

var moveFileToTarget = function(el) {
    var targetField = document.getElementById('targetFolder');
    var data = {
        new_parent_id: parseInt(targetField.value)
    }
    fetch('/dms/api/file/' + targetField.getAttribute('resource_id') + '/move', {
            method: 'PUT', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            window.location.reload();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

var editFile = function() {
    var saveButton = document.getElementById('saveButton');
    saveButton.style.display = "block"
    document.getElementById('fileContent').setAttribute('contenteditable', true);
}
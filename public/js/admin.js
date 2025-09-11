const allUsers = JSON.parse(document.getElementById("allUsersList").value);
const privilegedUsers = JSON.parse(document.getElementById("privilegedUsersList").value);
const allUsersTableBody = document.getElementById("allUsersTableBody");
const privilegedUsersTableBody = document.getElementById("privilegedUsersTableBody");
const directoryLevel1TableBody = document.getElementById("directoryTreeLevel1");
const directoryLevel2TableBody = document.getElementById("directoryTreeLevel2");
const directoryLevel3TableBody = document.getElementById("directoryTreeLevel3");
const searchInputPrivilegedUsers = document.getElementById("searchInputPrivilegedUsers");
const searchInputAllUsers = document.getElementById("searchInputAllUsers");
const addSubjectsToSemester = document.getElementById("addSubjectsToSemester");
const SubjectsTableHeading = document.getElementById("SubjectsTableHeading");
const fileUploadForm = document.getElementById("fileUploadForm");
const facultyUploadForm = document.getElementById("facultyUploadForm");
const scheduleListForDelete = document.getElementById("scheduleListForDelete");
const facultyListForDelete = document.getElementById("facultyListForDelete");

// Event listener for rename button and add Subject button to open modal
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('rename-semsub-btn')) {
        if (event.target.getAttribute("data-semsub-type") == 'sub') {
            document.getElementById('newName').setAttribute('placeholder', 'HMCI-201: Economics for Engineers');
            document.getElementById('subDiv').setAttribute('style', 'display: block;');
        } else {
            document.getElementById('newName').setAttribute('placeholder', '');
            document.getElementById('subType').querySelector('option[value="Theory"]').selected = true;
            document.getElementById('subDiv').setAttribute('style', 'display: none;');
        }
        document.getElementById('directoryToBeModified').value = event.target.getAttribute('data-semsub-id');
        document.getElementById('newName').value = "";
        document.getElementById('schemaManagementFormMethod').value = "PUT";
        document.getElementById('schemaManagementForm').setAttribute('action', "/admin/rename-directory?_method=PUT");
        document.getElementById('schemaManagementForm').setAttribute('onsubmit', "return confirm('Are you sure you want to rename this directory?');");
    }

    else if (event.target.classList.contains('add-subject-btn')) {
        if (event.target.getAttribute("data-semsub-type") == 'sub') {
            document.getElementById('newName').setAttribute('placeholder', 'HMCI-201: Economics for Engineers');
            document.getElementById('subDiv').setAttribute('style', 'display: block;');
        } else {
            document.getElementById('newName').setAttribute('placeholder', '');
            document.getElementById('subType').querySelector('option[value="Theory"]').selected = true;
            document.getElementById('subDiv').setAttribute('style', 'display: none;');
        }
        document.getElementById('directoryToBeModified').value = event.target.getAttribute('data-semsub-id');
        document.getElementById('newName').value = "";
        document.getElementById('schemaManagementFormMethod').value = "POST";
        document.getElementById('schemaManagementForm').setAttribute('action', `/admin/add-subjects?_method=POST`);
        document.getElementById('schemaManagementForm').setAttribute('onsubmit', "return confirm('Are you sure you want to add this subject into the semester?');");
    }
    else if (event.target.classList.contains('delete-directory-btn') || event.target.classList.contains('delete-schedule-btn') || event.target.classList.contains('delete-faculty-btn')) {
        const directoryId = event.target.getAttribute('data-directory-id');
        const form = document.getElementById('deleteDirectoryForm');
        document.getElementById('directoryToBeDeleted').value = directoryId;
        const data = new FormData(form);
        bodyData = {
            _method: data.get('_method'),
            directoryToBeDeleted: data.get('directoryToBeDeleted')
        };
        fetch(form.getAttribute('action'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        })
            .then(response => {
                if (response.ok) {
                    document.getElementById('ShowalertManagementModal').click();
                    document.getElementById("alertModalBody").innerHTML = `<div class="alert alert-success d-flex align-items-center"
            role="alert">
            <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:">
                <use xlink:href="#check-circle-fill" />
            </svg>
            <div>
                Academic Schema Updated Successfully !!!
            </div>
        </div>`;
                    setTimeout(function () {
                        document.getElementById('closeAlertButton').click();
                    }, 4000);
                    if(event.target.classList.contains('delete-directory-btn')){
                    resetSchemaView();
                    fetchShemaAndRender();}
                    else if(event.target.classList.contains('delete-schedule-btn')){
                        resetTimetableOrFacultyView(scheduleListForDelete);
                        fetchTimetableAndRender();
                    }
                    else{
                        resetTimetableOrFacultyView(facultyListForDelete);
                        fetchFacultyAndRender();
                    }
                } else {
                    document.getElementById('ShowalertManagementModal').click();
                    document.getElementById("alertModalBody").innerHTML = `<div class="alert alert-warning d-flex align-items-center"
                role="alert">
                <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:">
                    <use xlink:href="#exclamation-triangle-fill" />
                </svg>
                <div>
                Failed to Delete, Please retry..
                </div>
            </div>`;
                    setTimeout(function () {
                        document.getElementById('closeAlertButton').click();
                    }, 4000);
                    throw new Error('Failed to Delete, Please retry..');
                }
            })
            .catch(error => {
                document.getElementById('ShowalertManagementModal').click();
                document.getElementById("alertModalBody").innerHTML = `<div class="alert alert-warning d-flex align-items-center"
                role="alert">
                <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:">
                    <use xlink:href="#exclamation-triangle-fill" />
                </svg>
                <div>
                ${error}
                </div>
            </div>`;
                setTimeout(function () {
                    document.getElementById('closeAlertButton').click();
                }, 4000);
                console.error('Error:', error);
            });
    }
});

function submitUploadForm() {
    const form = fileUploadForm;
    const formData = new FormData(form);

    document.getElementById('uploadFileModal').click();
    submitForm(form, formData, "schedule");
}

function submitForm(form, formData, type) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', form.getAttribute('action'));

    xhr.onload = function () {
        if (xhr.status === 200) {
            document.getElementById('ShowalertManagementModal').click();
            document.getElementById("alertModalBody").innerHTML = `<div class="alert alert-success d-flex align-items-center"
            role="alert">
            <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:">
                <use xlink:href="#check-circle-fill" />
            </svg>
            <div>
                File Uploaded Successfully !!!
            </div>
        </div>`;
            setTimeout(function () {
                document.getElementById('closeAlertButton').click();
            }, 4000);
            if(type=="schedule"){
                resetTimetableOrFacultyView(scheduleListForDelete);
                fetchTimetableAndRender();
            }
            if(type=="faculty"){
                resetTimetableOrFacultyView(facultyListForDelete);
                fetchFacultyAndRender();
            }
        } else {
            document.getElementById('ShowalertManagementModal').click();
            document.getElementById("alertModalBody").innerHTML = `<div class="alert alert-warning d-flex align-items-center"
                role="alert">
                <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:">
                    <use xlink:href="#exclamation-triangle-fill" />
                </svg>
                <div>
                Upload Failed: ${xhr.statusText}
                </div>
            </div>`;
            setTimeout(function () {
                document.getElementById('closeAlertButton').click();
            }, 4000);
            console.error('Upload failed:', xhr.statusText);
        }
    };

    xhr.onerror = function () {
        document.getElementById('ShowalertManagementModal').click();
        document.getElementById("alertModalBody").innerHTML = `<div class="alert alert-warning d-flex align-items-center"
                role="alert">
                <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:">
                    <use xlink:href="#exclamation-triangle-fill" />
                </svg>
                <div>
                Upload Failed: Network error occurred
                </div>
            </div>`;
        setTimeout(function () {
            document.getElementById('closeAlertButton').click();
        }, 4000);
        console.error('Network error occurred');
    };
    xhr.send(formData);
}

function submitFacultyUploadForm() {
    const form = facultyUploadForm;
    const formData = new FormData(form);

    document.getElementById('uploadFacultyModal').click();
    submitForm(form, formData, "faculty");
};

// Form submission for renaming directory or create new directory
document.getElementById('schemaManagementForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const data = new FormData(this);
    let nameToBeSent = data.get('newName');
    if (data.get('subType') == 'Lab') {
        if (nameToBeSent.slice(-3).toLowerCase() != "lab") {
            nameToBeSent = nameToBeSent + " Lab";
        }
    }
    bodyData = {
        _method: data.get('_method'),
        directoryToBeModified: data.get('directoryToBeModified'),
        newName: nameToBeSent
    };
    fetch(this.getAttribute('action'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
    })
        .then(response => {
            if (response.ok) {
                document.getElementById('ShowalertManagementModal').click();
                document.getElementById("alertModalBody").innerHTML = `<div class="alert alert-success d-flex align-items-center"
            role="alert">
            <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Success:">
                <use xlink:href="#check-circle-fill" />
            </svg>
            <div>
                Academic Schema Updated Successfully !!!
            </div>
        </div>`;
                setTimeout(function () {
                    document.getElementById('closeAlertButton').click();
                }, 4000);
                resetSchemaView();
                fetchShemaAndRender();
            } else {
                console.log(response)
                document.getElementById('ShowalertManagementModal').click();
                document.getElementById("alertModalBody").innerHTML = `<div class="alert alert-warning d-flex align-items-center"
                role="alert">
                <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:">
                    <use xlink:href="#exclamation-triangle-fill" />
                </svg>
                <div>
                Failed to update the academic schema, Please retry..
                </div>
            </div>`;
                setTimeout(function () {
                    document.getElementById('closeAlertButton').click();
                }, 4000);
                throw new Error('Failed to update the academic schema, Please retry..');
            }
        })
        .catch(error => {
            document.getElementById('ShowalertManagementModal').click();
            document.getElementById("alertModalBody").innerHTML = `<div class="alert alert-warning d-flex align-items-center"
                role="alert">
                <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:">
                    <use xlink:href="#exclamation-triangle-fill" />
                </svg>
                <div>
                ${error}
                </div>
            </div>`;
            setTimeout(function () {
                document.getElementById('closeAlertButton').click();
            }, 4000);
            console.error('Error:', error);
        })
        .finally(() => {
            // Close the modal regardless of success or failure
            document.getElementById('schemaManagementModalClose').click();
        }) 
});

function fetchShemaAndRender() {
    fetch('/admin/academic_schema')
        .then(response => response.json())
        .then(data => {
            // Update the DOM with the fetched data
            renderschemaLevel1(data);
        })
        .catch(error => console.error('Error fetching data:', error));
}

function resetSchemaView() {
    directoryLevel1TableBody.innerHTML = `<tr>
    <td>
        <div class="d-flex justify-content-center">
            <div class="spinner-grow text-primary" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </div>
    </td>
    <td>
        <div class="d-flex justify-content-center">
            <div class="spinner-grow text-primary" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </div>
    </td>
    <td>
        <div class="d-flex justify-content-center">
            <div class="spinner-grow text-primary" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </div>
    </td>
</tr>`;
    SubjectsTableHeading.innerHTML = `Manage Subjects`;
    directoryLevel2TableBody.innerHTML = ``;
    addSubjectsToSemester.innerHTML = ``;
}

function resetTimetableOrFacultyView(element) {
    element.innerHTML = `<tr>
    <td>
        <div class="d-flex justify-content-center">
            <div class="spinner-grow text-primary" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </div>
    </td>
    <td>
        <div class="d-flex justify-content-center">
            <div class="spinner-grow text-primary" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </div>
    </td>
</tr>`;
}

function fetchTimetableAndRender() {
    fetch('/admin/fetch-schedule')
        .then(response => response.json())
        .then(data => {
            // Update the DOM with the fetched data
            scheduleListForDelete.innerHTML = "";
            data.forEach(file => {
                const row = document.createElement("tr");
                row.innerHTML = `
            <td>${file.name}</td>
            <td style="text-align: center;">
            <button type="button" class="btn btn-danger delete-schedule-btn" data-directory-id="${file.id}">Delete</button>
            </td>`;
            scheduleListForDelete.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

function fetchFacultyAndRender() {
    fetch('/admin/fetch-faculty')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch faculty data');
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched faculty data:', data);
            // Update the faculty table
            renderFacultyTable(data);
            
            // Also update the delete table
            facultyListForDelete.innerHTML = "";
            data.forEach(file => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${file.properties?.facultyName || file.name}</td>
                    <td style="text-align: center;">
                        <div class="btn-group" role="group" style="gap: 35px;">
                            <button type="button" class="btn btn-primary update-faculty-btn" 
                                data-faculty-id="${file.id}" 
                                data-faculty-name="${file.properties?.facultyName || ''}" 
                                data-faculty-email="${file.properties?.facultyEmail || file.name}" 
                                data-faculty-role="${file.properties?.facultyRole || ''}" 
                                data-faculty-contact="${file.properties?.facultyContact || ''}"
                                data-faculty-profile="${file.properties?.facultyProfile || ''}">
                                Update
                            </button>
                            <button type="button" class="btn btn-danger delete-faculty-btn" 
                                data-directory-id="${file.id}">
                                Delete
                            </button>
                        </div>
                    </td>`;
                facultyListForDelete.appendChild(row);
            });
            
            // Make sure we attach event listeners
            attachUpdateEventListeners();
        })
        .catch(error => {
            console.error('Error fetching faculty data:', error);
            document.getElementById('ShowalertManagementModal').click();
            document.getElementById("alertModalBody").innerHTML = `
                <div class="alert alert-danger d-flex align-items-center" role="alert">
                    <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:">
                        <use xlink:href="#exclamation-triangle-fill" />
                    </svg>
                    <div>
                        Error loading faculty data: ${error.message}
                    </div>
                </div>`;
        });
}

function renderschemaLevel1(academic_schema) {
    directoryLevel1TableBody.innerHTML = "";
    academic_schema.forEach(directory => {
        const row = document.createElement("tr");
        row.style.cursor = "pointer";
        row.addEventListener("click", function () {
            renderschemaLevel2(directory.name, directory.id, directory.children);
        });
        row.innerHTML = `
            <td>${directory.name}</td>
            <td style="text-align: center;">
            <button type="button" class="btn btn-primary rename-semsub-btn" data-bs-toggle="modal" data-bs-target="#schemaManagementModal" data-semsub-type="sem" data-semsub-id="${directory.id}">Rename</button>
            </td>
            <td style="text-align: center;">
            <button type="button" class="btn btn-danger delete-directory-btn" data-directory-id="${directory.id}">Delete</button>
            </td>`;
        directoryLevel1TableBody.appendChild(row);
    });
}

function renderschemaLevel2(semesterName, semesterID, subjects) {
    directoryLevel2TableBody.innerHTML = "";
    SubjectsTableHeading.innerHTML = `Manage Subjects from ${semesterName}`;
    addSubjectsToSemester.innerHTML = `
        <button type="button" class="btn btn-warning add-subject-btn" data-bs-toggle="modal" data-bs-target="#schemaManagementModal" data-semsub-type="sub" data-semsub-id="${semesterID}">Add Subjects</button>
    `;
    subjects.forEach(subject => {
        if (subject.name != 'Previous Year Exams') {
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${subject.name}</td>
            <td style="text-align: center;">
            <button type="button" class="btn btn-primary rename-semsub-btn" data-bs-toggle="modal" data-bs-target="#schemaManagementModal" data-semsub-type="sub" data-semsub-id="${subject.id}">Rename</button>
            </td>
            <td style="text-align: center;">
            <button type="button" class="btn btn-danger delete-directory-btn" data-directory-id="${subject.id}">Delete</button>
            </td>`;
            directoryLevel2TableBody.appendChild(row);
        }
    });
}

function renderPrivilegedUsers(users) {
    privilegedUsersTableBody.innerHTML = "";
    users.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${user.username}</td>
                <td style="text-align: center;">
                    <form action="/admin/remove-privileged-access?_method=PUT" method="POST" onsubmit="return confirm('Are you sure you want to remove privileged access from this user?');">
                    <input type="hidden" name="_method" value="PUT">
                    <input type="hidden" name="userToRemoveAccess" value="${user._id}">
                        <button type="submit" class="btn btn-primary">Revoke Access</button>
                    </form>
                </td>
                <td style="text-align: center;">
                    <form action="/admin/remove-user?_method=DELETE" method="POST" onsubmit="return confirm('Are you sure you want to remove this user?');">
                    <input type="hidden" name="_method" value="DELETE">
                    <input type="hidden" name="userToBeRemoved" value="${user._id}">
                        <button type="submit" class="btn btn-danger">Delete</button>
                    </form>
                </td>`;
        privilegedUsersTableBody.appendChild(row);
    });
}

function renderAllUsers(users) {
    allUsersTableBody.innerHTML = "";
    users.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>${user.username}</td>
                <td style="text-align: center;">
                    <form action="/admin/provide-privileged-access?_method=PUT" method="POST" onsubmit="return confirm('Are you sure you want to provide privileged access to this user?');">
                    <input type="hidden" name="_method" value="PUT">
                    <input type="hidden" name="userToProvideAccess" value="${user._id}">
                    <button type="submit" class="btn btn-primary">Provide Access</button>
                    </form>
                </td>
                <td style="text-align: center;">
                    <form action="/admin/remove-user?_method=DELETE" method="POST" onsubmit="return confirm('Are you sure you want to remove this user?');">
                    <input type="hidden" name="_method" value="DELETE">
                    <input type="hidden" name="userToBeRemoved" value="${user._id}">
                        <button type="submit" class="btn btn-danger">Delete</button>
                    </form>
                </td>`;
        allUsersTableBody.appendChild(row);
    });
}

searchInputPrivilegedUsers.addEventListener("input", function () {
    const searchText = this.value.toLowerCase();
    const filteredUsers = privilegedUsers.filter(user => user.username.toLowerCase().includes(searchText));
    renderPrivilegedUsers(filteredUsers);
});

searchInputAllUsers.addEventListener("input", function () {
    const searchText = this.value.toLowerCase();
    const filteredUsers = allUsers.filter(user => user.username.toLowerCase().includes(searchText));
    renderAllUsers(filteredUsers);
});

function downloadLog() {
	// Create an anchor element
	var link = document.createElement('a');
	link.href = "/admin/download-log";
	link.download = "app.log";
	link.style.display = 'none';
	link.setAttribute("target", "_blank");
	// Append the link to the document body
	document.body.appendChild(link);
	// Trigger the download
	link.click();
	// Clean up
	document.body.removeChild(link);
}

// Initial rendering of the users
renderAllUsers(allUsers);
renderPrivilegedUsers(privilegedUsers);
fetchShemaAndRender();
fetchTimetableAndRender();
fetchFacultyAndRender();

function openUpdateFacultyModal(facultyId, name, email, role, contact, profile) {
    console.log('Opening update modal with faculty data:', { facultyId, name, email, role, contact, profile });
    
    // Make sure the form fields exist before trying to set values
    const idField = document.getElementById('update-faculty-id');
    const nameField = document.getElementById('update-faculty-name');
    const emailField = document.getElementById('update-faculty-email');
    const roleField = document.getElementById('update-faculty-role');
    const contactField = document.getElementById('update-faculty-contact');
    const profileField = document.getElementById('update-faculty-profile');
    
    if (!idField) {
        console.error('update-faculty-id field not found');
        return;
    }
    
    // Set values in the form
    idField.value = facultyId;
    nameField.value = name;
    emailField.value = email;
    roleField.value = role;
    contactField.value = contact;
    profileField.value = profile || '';
    
    // Reset the file input
    const fileInput = document.getElementById('update-faculty-file');
    if (fileInput) {
        fileInput.value = '';
    }
    
    // Show the modal
    const updateModal = new bootstrap.Modal(document.getElementById('updateFacultyModal'));
    updateModal.show();
    
    console.log('Update modal opened successfully');
}

function submitFacultyUpdateForm() {
    const facultyId = document.getElementById('update-faculty-id').value;
    console.log('Starting update for faculty ID:', facultyId);
    
    if (!facultyId) {
        console.error('Faculty ID is missing!');
        showAlert('Error: Faculty ID is missing!', 'danger');
        return;
    }
    
    // Create FormData object manually to ensure all fields are properly included
    const formData = new FormData();
    
    // Log each field as we add it to the form data
    const name = document.getElementById('update-faculty-name').value;
    const email = document.getElementById('update-faculty-email').value;
    const role = document.getElementById('update-faculty-role').value;
    const contact = document.getElementById('update-faculty-contact').value;
    const profile = document.getElementById('update-faculty-profile').value || '';
    
    console.log('Form values:', { name, email, role, contact, profile });
    
    formData.append('facultyName', name);
    formData.append('facultyEmail', email);
    formData.append('facultyRole', role);
    formData.append('facultyContact', contact);
    formData.append('facultyProfile', profile);
    
    // Add file if present
    const fileInput = document.getElementById('update-faculty-file');
    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        console.log('Adding file to form data:', file.name, file.type, file.size);
        formData.append('file', file);
    } else {
        console.log('No file selected for upload');
    }
    
    // Show loading
    showAlert('Updating faculty information...', 'info');
    
    console.log('Sending update request to:', `/admin/update-faculty/${facultyId}`);
    
    // Use fetch API with detailed logging
    fetch(`/admin/update-faculty/${facultyId}`, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            return response.text().then(text => {
                console.error('Error response text:', text);
                try {
                    const errorData = JSON.parse(text);
                    throw new Error(errorData.error || 'Failed to update faculty');
                } catch (e) {
                    throw new Error(text || 'Failed to update faculty');
                }
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Update successful:', data);
        
        // Show success
        showAlert('Faculty updated successfully!', 'success');
        
        // Close the modal
        const updateModal = bootstrap.Modal.getInstance(document.getElementById('updateFacultyModal'));
        if (updateModal) {
            updateModal.hide();
        }
        
        // Refresh the faculty list
        setTimeout(() => {
            fetchFacultyAndRender();
        }, 500);
    })
    .catch(error => {
        console.error('Error updating faculty:', error);
        showAlert(`Error updating faculty: ${error.message || 'Unknown error'}`, 'danger');
    });
}

// Utility function for showing alerts
function showAlert(message, type) {
    document.getElementById('ShowalertManagementModal').click();
    document.getElementById("alertModalBody").innerHTML = `
        <div class="alert alert-${type} d-flex align-items-center" role="alert">
            ${type === 'info' ? 
                `<div class="spinner-grow spinner-grow-sm me-2 text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>` : 
                `<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="${type === 'success' ? 'Success' : 'Warning'}:">
                    <use xlink:href="#${type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'}" />
                </svg>`
            }
            <div>${message}</div>
        </div>`;
}

function renderFacultyTable(facultyData) {
    console.log('Rendering faculty data:', facultyData);
    // Your existing rendering code...
    const tbody = document.querySelector("#facultyTable tbody");
    if (!tbody) {
        console.error('Faculty table body not found!');
        return;
    }
    
    tbody.innerHTML = '';
    
    facultyData.forEach(faculty => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${faculty.thumbnailLink || ''}" alt="${faculty.properties.facultyName}" class="rounded-circle" width="50" height="50">
            </td>
            <td>${faculty.properties.facultyName}</td>
            <td>${faculty.properties.facultyEmail}</td>
            <td>${faculty.properties.facultyRole}</td>
            <td>
                <button class="btn btn-sm btn-primary update-faculty-btn" 
                    data-faculty-id="${faculty.id}"
                    data-faculty-name="${faculty.properties.facultyName}"
                    data-faculty-email="${faculty.properties.facultyEmail}"
                    data-faculty-role="${faculty.properties.facultyRole}"
                    data-faculty-contact="${faculty.properties.facultyContact}"
                    data-faculty-profile="${faculty.properties.facultyProfile || ''}">
                    Update
                </button>
                <button class="btn btn-sm btn-danger delete-faculty-btn" data-faculty-id="${faculty.id}">
                    Delete
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Make sure to attach event listeners after rendering
    attachUpdateEventListeners();
}

function attachUpdateEventListeners() {
    console.log('Attaching update event listeners');
    document.querySelectorAll('.update-faculty-btn').forEach(button => {
        console.log('Found update button:', button);
        // Remove any existing listeners to prevent duplicates
        button.removeEventListener('click', handleUpdateFaculty);
        // Add the click listener
        button.addEventListener('click', handleUpdateFaculty);
    });
    console.log('Update event listeners attached to faculty buttons');
}

function handleUpdateFaculty(event) {
    const button = event.target.closest('.update-faculty-btn');
    if (!button) return;
    
    // Fetch faculty details from data attributes
    const facultyId = button.getAttribute('data-faculty-id');
    const facultyName = button.getAttribute('data-faculty-name');
    const facultyEmail = button.getAttribute('data-faculty-email');
    const facultyRole = button.getAttribute('data-faculty-role');
    const facultyContact = button.getAttribute('data-faculty-contact');
    const facultyProfile = button.getAttribute('data-faculty-profile');

    console.log('Opening update modal with faculty data:', {
        id: facultyId,
        name: facultyName,
        email: facultyEmail,
        role: facultyRole,
        contact: facultyContact,
        profile: facultyProfile
    });

    // Open the modal with the faculty data
    openUpdateFacultyModal(facultyId, facultyName, facultyEmail, facultyRole, facultyContact, facultyProfile);
}

document.addEventListener('submit', function(event) {
    const form = event.target;
    if (form.id === 'updateFacultyForm') {
        event.preventDefault();
        submitFacultyUpdateForm();
    }
});

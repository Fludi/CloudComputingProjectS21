var socket = io();
var user = document.getElementById('user');
var usersBl = document.getElementById('users-block')
var messages = document.getElementById('messages');
var inputForm = document.getElementById('form');
var sendMsg = document.getElementById('sendMsg');
var input = document.getElementById('input');
var register = document.getElementById('changeForm');
var login = document.getElementById('changeFormAgain');
let sendData = document.getElementById('sendData');
let popupbox = document.getElementById("popupbox");
let newPopupbox = document.getElementById("newPopupbox");
let usernameInput = document.getElementById("usernameInput");
let passwordInput = document.getElementById("passwordInput");
let newUsernameInput = document.getElementById("newUsernameInput");
let newPasswordInput = document.getElementById("newPasswordInput");
let fileInput = document.getElementById("fileUpload");
let sendFile = document.getElementById("sfile");
let image = document.getElementById("pictureUpload");

let userMap;
let subUserMap;
let username;
let canChat = false;

//changes the form from login to register
register.addEventListener("click", function (e) {
    e.preventDefault();
    popupbox.style.visibility = "hidden";
    newPopupbox.style.visibility = "visible";
});

//changes the form from register to login
login.addEventListener("click", function (e) {
    e.preventDefault();
    newPopupbox.style.visibility = "hidden";
    popupbox.style.visibility = "visible";
});

//When user logs in, username and password is send to server
popupbox.addEventListener('submit', function(e) {
    e.preventDefault();
    if (usernameInput.value && passwordInput.value) {
        socket.emit('details', {unm: usernameInput.value, pnw: passwordInput.value, new: false});
    }
});

newPopupbox.addEventListener('submit', function(e) {
    e.preventDefault();
    var file = image.files[0];
    if (newUsernameInput.value && newPasswordInput.value && file) {
        var reader = new FileReader();
        //sends the file according to the type of the file
        reader.onload = function () {
            socket.emit('details', {unm: newUsernameInput.value, pnw: newPasswordInput.value, new: true, img: reader.result});
        }

        if (file) {
            reader.readAsDataURL(file);
        }
    } else{
        alert("Please enter username, password and upload a profile picture");
    }
});

//The server sends back if login was successful or not
socket.on("details", function(log) {

    //if login is successful closes the login, allows user to send messages, and sends joining message
    if(log.scs){
        popupbox.style.visibility = "hidden";
        newPopupbox.style.visibility = "hidden";
        usersBl.style.visibility = "visible";
        messages.style.visibility = "visible";
        inputForm.style.visibility = "visible";
        canChat = true;
        username = log.nme;
        socket.emit("join", log.nme.toString())

        //if login is not successful user gets the message
    } else{
        alert(log.msg.toString());
    }
});

//server sends a message for each user who joined or left the chat
socket.on('hello', function(msg) {
    if(canChat) {
        var item = document.createElement('li');
        item.textContent = msg;
        item.style.color = "blue";
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    }
});

//creates an updated list of all online users
socket.on('join', function(online) {
    userMap = new Map(online)
    user.innerHTML = " ";
    for (let person of userMap.values()) {
        var itemCheck = document.createElement('input');
        var itemLabel = document.createElement('label');
        var itemBr = document.createElement('br');
        itemCheck.type = "checkbox";
        itemCheck.id = person.toString();
        itemCheck.value = person.toString();
        itemLabel.for = person.toString()
        itemLabel.textContent = person.toString();
        itemLabel.style.color = "green";
        user.appendChild(itemCheck);
        user.appendChild(itemLabel);
        user.appendChild(itemBr);
    }
});

//extends the form, makes buttons for file upload visible
sendData.addEventListener("click", function (e) {
    e.preventDefault();
    var extension = document.getElementById("multimedia");
    if (extension.style.display === "none") {
        extension.style.display = "block";
    } else {
        extension.style.display = "none";
    }
});

//When user is sending a file
sendFile.addEventListener('click', function(e) {
    e.preventDefault();
    var file = fileInput.files[0];
    var timestamp = new Date();
    var reader = new FileReader();

    //sends the file according to the type of the file
    reader.onload = function () {
        if(file.type.match('image.*')){
            socket.emit("leave", {type: "img", msg: timestamp.getHours() + ':' + timestamp.getMinutes() + ' ' + username + ':', data: reader.result, recip: Array.from(getCheckedUsers())});
        }
        else if(file.type.match('video.*')){
            socket.emit("leave", {type: "vid", msg: timestamp.getHours() + ':' + timestamp.getMinutes() + ' ' + username + ':', data: reader.result, recip: Array.from(getCheckedUsers())});
        }
        else if(file.type.match('audio.*')){
            socket.emit("leave", {type: "aud", msg: timestamp.getHours() + ':' + timestamp.getMinutes() + ' ' + username + ':', data: reader.result, recip: Array.from(getCheckedUsers())});
        }
        else{
            socket.emit("leave", {type: "other", msg: timestamp.getHours() + ':' + timestamp.getMinutes() + ' ' + username + ':', data: reader.result, recip: Array.from(getCheckedUsers())});
        }
    }
    if (file) {
        reader.readAsDataURL(file);
    }
});

//Handling when user gets a multimedia file
socket.on("leave", function(file) {
    if(canChat) {
        var item = document.createElement('li');
        var media;
        item.textContent = file.msg;

        //if multimedia file is type video creates a video tag
        if (file.type == "vid") {
            media = document.createElement('video');
            media.setAttribute('class', 'video-small');
            media.setAttribute('controls', 'controls');
            media.height = "300";
            media.src = file.data;
        }

        //if multimedia file is type image creates an img tag
        else if (file.type == "img") {
            media = document.createElement('img');
            media.height = "300";
            media.src = file.data;
        }

        //if multimedia file is type audio creates an audio tag
        else if (file.type == "aud") {
            media = document.createElement('audio');
            media.setAttribute('controls', 'controls');
            media.src = file.data;
        }

        //if multimedia file is something else creates a link to download the file
        else {
            media = document.createElement('a');
            media.setAttribute('download', 'download');
            media.href = file.data;
            media.textContent = "Dowload File";
            media.style.background = "#f5f5dc"
            media.style.paddingRight = "10px";
            media.style.paddingLeft = "10px";
        }

        media.style.marginLeft = "6px";
        item.append(media);
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    }
});

//checks to whom, the message will be send and stores this information inside a Map
function getCheckedUsers() {
    subUserMap = new Map();
    for (let [id, person] of userMap){
        var nameCheck = document.getElementById(person.toString());
        if (nameCheck.checked){
            subUserMap.set(id, person);
        }
    }
    return subUserMap;
}

//sends the message and Map of selected recipients
sendMsg.addEventListener('click', function(e) {
    e.preventDefault();
    if (input.value) {
        var timestamp = new Date();
        socket.emit('chat message', {msg: timestamp.getHours() + ':' + timestamp.getMinutes() + ' ' + username + ': <' + input.value + '>', recip: Array.from(getCheckedUsers())});
        input.value = '';
    }
});

//displays chat messages from server
socket.on('chat message', function(msg) {
    if(canChat) {
        var item = document.createElement('li');
        item.textContent = msg;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    }
});

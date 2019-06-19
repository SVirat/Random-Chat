'use strict';

(function () {
  let socket = io.connect(`${window.location.hostname}:${window.location.port}`);
  let room_id_of_other_user = ' ';
  let autolinker = new Autolinker({ newWindow: false, stripPrefix: false });

  socket.on('ack', (d) => {
    socket.emit('privateRoom', {
      "room": "private room"
    });
  });

  let message = document.querySelector('#message');
  let sendbtn = document.querySelector('#sendbtn');
  let endbtn = document.querySelector('#endbtn');
  let newbtn = document.querySelector('#newbtn');
  let close = document.querySelector('#close');
  let cancel = document.querySelector('#cancel');

  window.onbeforeunload = function(e) {
    var dialogText = '';
    e.returnValue = dialogText;
    return dialogText;
  };

  socket.on('toast', (data) => {
    toastr.remove();
    document.getElementById("found").innerHTML = "Found stranger!";
    document.getElementById("found").style.fontWeight = "bold";
    document.getElementById("loader-wheel").style.display = "none";

    //transition out "Found stranger" message
    document.getElementById("found").style.opacity = 1;
    document.getElementById("found").style.transition = "opacity 1s";
    document.getElementById("quote").style.opacity = 1;
    document.getElementById("quote").style.transition = "opacity 1s";
    setTimeout(function(){ 
      document.getElementById("quote").style.opacity = 0; 
    }, 1000);
    setTimeout(function(){ 
      document.getElementById("found").style.opacity = 0; 
    }, 1500);
    message.disabled = false;
    message.placeholder = "Hello, stranger!";
    message.focus();
    resetTimer();
  });

  socket.on('wait', (data) => {
    let user = data.user;
    let quote = data.quote;
    let saying = quote.substring(0, quote.lastIndexOf("-")).trim();
    let author = quote.substring(quote.lastIndexOf("-") + 1, quote.length);
    if(saying == "") {
      saying = author;
      author = "Anonymous"
    }
    document.getElementById("username").innerHTML =  user;
    document.getElementById("quote").innerHTML = "&emsp;&emsp;&emsp;&emsp;“" + saying + "”<br>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; - <b>" + author + "</b>";
  });

  message.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      socket.emit('typing', {
        "room": room_id_of_other_user,
        "typingStatus": false
      });
      sendbtn.click();
    }
    else {
      resetTimer();
      socket.emit('typing', {
        "room": room_id_of_other_user,
        "typingStatus": true
      });
    }
  });

  let typeMessageShown = false;
  let stop;
  socket.on('addTyping', (data) => {
    let user = data.user;
    let msgs = document.querySelector("#msgs");
    let typeMessage = document.querySelector('#typing');
    if (socket.id != data.senderId) {
      if (data.typingStatus === true) {
        if (typeMessageShown === false) {
          let template = `<div id="typing"><div class="toast-top-center" id="toast-container"><div class="toast msg_div grey" style="width:230px"><div class="toast-title white-text">${user} is typing...</div></div></div>`;
          msgs.insertAdjacentHTML('beforeend', template);
          typeMessageShown = true;
        }
        else {
          window.clearTimeout(stop);
        }
        typeMessage = document.querySelector('#typing');
        stop = window.setTimeout(function() {
          typeMessage.remove();
          typeMessageShown = false;
        }, 2000);
      }
      else if (typeMessage) {
        typeMessage.remove();
        typeMessageShown = false;
      }
    }
  });

  sendbtn.addEventListener('click', () => {
    if ((message.value.trim()).length !== 0) {
      let encryptedMessage = encode(message.value);
      socket.emit('sendMessage', {
        "room": room_id_of_other_user,
        "encryptedMessage": encryptedMessage
      });
    }
    socket.emit('typing', {
      "room": room_id_of_other_user,
      "typingStatus": false
    });
    message.value = '';
  });

  socket.on('private ack', (data) => {
    room_id_of_other_user = data.roomID;
  });

  socket.on('newMessage', (data) => {
    let decryptedMessage = decode(data.message.encryptedMessage);
    let user = data.user;
    let msgs = document.querySelector("#msgs");
    let template;
    decryptedMessage = autolinker.link(decryptedMessage);
    if (socket.id == data.senderId) {
      template = `<div class="one column row msg"><div class="right floated blue seven wide column msg_div"><b>${user}</b>${decryptedMessage}<span class="times_css">${data.timeStamp}</span></div></div><br>`;
    } else {
      template = `<div class="one column row msg"><div class="left floated teal seven wide column msg_div"><b>${user}</b>${decryptedMessage}<span class="times_css">${data.timeStamp}</span></div></div><br>`;
    }
    msgs.insertAdjacentHTML('beforeend', template);
    let height = msgs.offsetHeight;
    window.scroll(0, height);
  });

  socket.on('alone', (data) => {
    let user = data.user;
    endbtn.classList.add('hide');
    newbtn.classList.remove('hide');
    sendbtn.classList.add('hide');
    message.classList.add('hide');
    homebtn.classList.remove('hide');
    document.getElementById("found").innerHTML = `${user} disconnected.`;
    document.getElementById("found").style.fontWeight = "bold";
    document.getElementById("loader-wheel").style.display = "none";
    document.getElementById("found").style.opacity = 1;
    document.getElementById("found").style.transition = "opacity 1s";
    setTimeout(function(){ 
      document.getElementById("found").style.opacity = 0; 
    }, 5000);
  });

  endbtn.addEventListener('click', () => {
    let confirm = document.querySelector('#confirm');
    confirm.classList.add('visible');
  });

  cancel.addEventListener('click', () => {
    let confirm = document.querySelector('#confirm');
    confirm.classList.remove('visible');
  });

  close.addEventListener('click', () => {
    let confirm = document.querySelector('#confirm');
    message.classList.add('hide');
    sendbtn.classList.add('hide');
    endbtn.classList.add('hide');
    homebtn.classList.remove('hide');
    newbtn.classList.remove('hide');
    confirm.classList.remove('visible');
    socket.disconnect();
  });
  let t;
  let kick = () => {
    message.classList.add('hide');
    sendbtn.classList.add('hide');
    endbtn.classList.add('hide');
    homebtn.classList.remove('hide');
    newbtn.classList.remove('hide');
    socket.disconnect();
  }
  let resetTimer = () => {
      clearTimeout(t);
      t = setTimeout(kick, 5 * 60000);  // time is in milliseconds
  }

})();

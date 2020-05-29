
document.addEventListener('DOMContentLoaded', function() {

  ipc.send('mainWindowLoaded')
  ipc.on('resultSent', function(event, row){

    var list = document.getElementById('notesList')

    for (var i = 0; i < row.length; i++) {

      var entry = document.createElement('li')
      
      entry.setAttribute("id", row[i].noteid)
      entry.appendChild(document.createTextNode(row[i].info))
      list.appendChild(entry)

    }

    var myNodelist = document.getElementsByTagName("li");
    var i;
    for (i = 0; i < myNodelist.length; i++) {
      var span = document.createElement("SPAN");
      var txt = document.createTextNode("\u00D7");
      span.className = "close";
      span.appendChild(txt);
      myNodelist[i].appendChild(span);
      myNodelist[i].className = "list-group-item";
    }

// Click on a close button to hide the current list item
    var close = document.getElementsByClassName("close");
    var i;
    for (i = 0; i < close.length; i++) {
      close[i].onclick = function() {
      var div = this.parentElement;
      div.style.display = "none";
      var noteIdUi = this.parentElement.id;
      console.log(noteIdUi);
      ipc.sendSync('deleteFromDb',noteIdUi);
      

      }

    }

  })


})
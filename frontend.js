
document.querySelector('#saveBtn').addEventListener('click', function(event)
{

  var li = document.createElement("li");
  var text = document.getElementById("textArea").value;
  var t = document.createTextNode(text);
  li.appendChild(t);
  if (!text.length) {
    alert("Empty String added!")
    //return false
  } else {
    document.getElementById("notesList").appendChild(li);
 
  }

  document.getElementById('notesList').innerHTML = '';

  setTimeout(function(){ ipc.send('mainWindowLoaded'); }, 30);

  text.value = '';
  document.getElementById('textArea').value = ''
})







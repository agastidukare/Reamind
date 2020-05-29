const electron = require('electron')
const ipc = electron.ipcRenderer
const clipboard = electron.clipboard
const clipboardy = require('clipboardy')
const submit = document.querySelector('#saveBtn')
const outputtext = document.querySelector('textArea')


ipc.on('ping', function(event, arg)

{
    console.log(arg)
    outputtext.value = clipboardy.readSync()

    submit.click()
})


document.querySelector('#saveBtn').addEventListener('click', function(event)
{
   event.preventDefault();
   let text = document.querySelector('textArea').value
   ipc.send('asynchronous-message',text)
  

})

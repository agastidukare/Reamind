
// Modules to control application life and create native browser window
const electron = require("electron")
const {app, BrowserWindow} = require('electron')
const ipc = electron.ipcMain
const globalShortcut = electron.globalShortcut
const clipboardy = require('clipboardy')
var sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Module to control application life. (this variable should already exist)
const apps = electron.app

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent(apps)) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

let mainWindow

function createWindow (event) {
  // Create the browser window.

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, './AppIcon.icns'),
    webPreferences: {
    nodeIntegration: true //this might cause issues when using require, export or module functions.
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  //mainWindow.webContents.openDevTools()
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

}



ipc.on('asynchronous-message', (event, text) => {


  const dbPath = path.resolve(__dirname, 'notes.db')
  const db = new sqlite3.Database(dbPath)


  //FOR LATER ONLY -- give appropriate names to table and other variables

  db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS lorem (noteid INTEGER PRIMARY KEY, info TEXT)")

    db.run("INSERT INTO lorem (info) VALUES (?)", text)

    db.each("SELECT * FROM lorem", function(err, row) {
        //console.log(row);
    })
  })

  db.close()


})




ipc.on('delete-added-note', function(event, noteIdUi){


  const dbPath = path.resolve(__dirname, 'notes.db')
  const db = new sqlite3.Database(dbPath)

  db.serialize(function() {

     db.all("SELECT * FROM lorem", function(err, row) {

       event.returnValue = row;
       })
       db.run('DELETE FROM lorem WHERE noteid=?', noteIdUi ,function(err){
       if (err) {
       return console.error(err.message);
     }
      //console.log(`Row(s) deleted ${this.changes}`);

     });

   });



  });



ipc.on('save-click', function () {

      const dbPath = path.resolve(__dirname, 'notes.db')
      const db = new sqlite3.Database(dbPath)

      db.serialize(function() {

      db.all("SELECT * FROM lorem", function(err, row) {

        //console.log(row);

         mainWindow.webContents.send('results2', row)

      })

})
    })



//Add Error Handler//

ipc.on('deleteFromDb', (event, noteIdUi) => {

  const dbPath = path.resolve(__dirname, 'notes.db')
  const db = new sqlite3.Database(dbPath)

    db.serialize(function() {

      db.all("SELECT * FROM lorem", function(err, row) {

      event.returnValue = row;

      })

      db.run('DELETE FROM lorem WHERE noteid=?', noteIdUi ,function(err){

        if (err) {

        return console.error(err.message);

        }

        //console.log(`Row(s) deleted ${this.changes}`);

      })

    })

})


app.on('ready', function ()
{

  ipc.on('mainWindowLoaded', function () {

  const dbPath = path.resolve(__dirname, 'notes.db')
  const db = new sqlite3.Database(dbPath)

      db.serialize(function() {

        db.all("SELECT * FROM lorem ORDER BY noteid DESC", function(err, row) {

          console.log(row);
          mainWindow.webContents.send('resultSent', row)

        })

      })
  })


  var homewindow = createWindow('Home', 'Welcome', '/Users/tarikhaiga/Desktop/copaste')

  var register_word = globalShortcut.register('ctrl+l', function()
  {

    let word = clipboardy.readSync()
    mainWindow.webContents.send('ping', word)

  })

})



// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

function handleSquirrelEvent(application) {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {
                detached: true
            });
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            application.quit();
            return true;
    }
};



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const DbConnectionConfig = require('./db.configurator');

const ServerCli = function  (appName, options) {

  const cliPrefix = appName ? `${appName}> ` : 'cli-command> ';
  const dbConnConfig = new DbConnectionConfig();

  const cliInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const nextQuestion = () =>{
    this.run();
  }

  const handleCommandAgainstDb = (cmd) => {
    dbConnConfig.handleCommand(cmd);
  };

  const handleCommand = (cmd) => {
    if(cmd.indexOf('db') !== -1){
      handleCommandAgainstDb(cmd);
    }
    else {
    switch (cmd) {
      case 'help':
        console.log('db config -src <dbName>\t : set datatabase name');
        console.log('db config -server <serverName || serverIPAddr>\t : set datatabase server');
        break;
    
      default:
        break;
    }
    }

    nextQuestion();  
  }

  this.run = function(){
    cliInterface.question(`${cliPrefix}`,(cmd) => {
      if(cmd === 'exit'){
        console.log('cli exited...');
        cliInterface.close();
      }
      else{
        //cliInterface.close();
        handleCommand(cmd);
      }
    });
  } 
}

module.exports = ServerCli;

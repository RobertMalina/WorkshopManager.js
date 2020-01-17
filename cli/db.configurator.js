
function DbConfigurator () {

  let connectionSettings = null;

  const reloadConnectionSettings = () => {
    connectionSettings = require('../server.config');
  };

  const changeConnectionSettings = (
    /*{target: string, value: string }*/ options, 
    /*(optional) -dev || -test*/ dbDestinationFlag) => {
    switch (options.target) {
      case 'dbname':
        if(dbDestinationFlag === '-test') {
            process.env.DEV_DB_NAME___NEW = options.value;
            console.log(`process.env.DEV_DB_NAME___NEW set to ${process.env.DEV_DB_NAME___NEW}`);       
        }
        else { //apply changes to development db connection settings
            process.env.DEV_DB_NAME___NEW = options.value;
            console.log(`process.env.DEV_DB_NAME___NEW set to ${process.env.DEV_DB_NAME___NEW}`); 
        }      
        reloadConnectionSettings();       
        break;
      case 'servername':
        process.env.DEV_SQLSERVER_IP_ADDR___NEW = options.value;
        reloadConnectionSettings();
        console.log(`process.env.DEV_DB_NAME___NEW set to ${process.env.DEV_SQLSERVER_IP_ADDR___NEW}`);   
        break;
      default:
        break;
    }
  }
  const inspectConnectionSettings = (/*string: -dev || -test*/ dbType) => {
    switch (dbType) {
      case '-dev':
        reloadConnectionSettings();
        console.log(connectionSettings.dbDynamic("-dev"));  
        break;          
      case '-test':
        reloadConnectionSettings();
        console.log(connectionSettings.dbDynamic("-test"));
        break;                 
      default:
        console.error('Wrong db destination name - should be -dev OR -test...');
        break;
    }
  }

  //public
  this.getCommands = () => {
    return [
      "db config [ dbname || serverName || userPswd || userName ] <value> [(optional) -test || -dev ] \t-> change db connection settings",
      "db config inspect [ -test || -dev ] \t-> display database connection settings (display for development db or test db)"
    ];
  }

  //public
  this.handleCommand = (cmd) => {
    const args = cmd.split(' ');

    let operation = args[1];
    if(operation === 'config') {
      if(args.indexOf('config') !== -1 && args.length < 4){
        console.error('db config command requires at least 4 arguments');
        return; 
      }
      else{
        let confTarget = args[2];
        let configSrc,
          settings;

        switch (confTarget) {
          case 'dbname':
          case 'servername':
            changeConnectionSettings({ target:args[2], value: args[3] }, args[4]);    
            break;
          case 'inspect':
            inspectConnectionSettings(args[3]);               
            break;                         
          default:
            console.warn(`Unrecognized command against db: ${cmd}...`);          
            break;
        }
      }
    }
  }
}

module.exports = DbConfigurator;
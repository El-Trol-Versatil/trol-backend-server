const SERVER_CONFIG = {

  /*** SERVER, MONGODB, PYTHON ***/
  SERVER_ADDRESS: 'localhost',
  SERVER_PORT: 3000,
  MONGODB_URL: 'mongodb://localhost:27017/etv',
  JWT_SECRET:'the-versatile-trol',
  TOKEN_EXPIRE_TIME: 1296000, // 86400 seconds equivalent to 24 hours
  MONGODB_OPTIONS: {
    socketTimeoutMS: 30000,
    keepAlive: true,
    reconnectTries: 30,
    useNewUrlParser: true,
    useCreateIndex: true
  },
  PYTHON_PATH: String.raw`C:\Users\SergioC\AppData\Local\Programs\Python\Python37\python`,
  PYTHON_SCRIPTS_PATH: String.raw`D:/Proyectos/etv-tfg/ETV-models-and-bots/ETV`,
  WORKING_DIRECTORY: String.raw`D:/Proyectos/etv-tfg/ETV-models-and-bots/ETV`,
};

//'mongodb://admin:password@localhost:27017,localhost:27022/etv'

module.exports = SERVER_CONFIG;

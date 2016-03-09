// *************************************************************************
//                           Body Parser urlEncoded
// *************************************************************************
logger.info("Setting bodyParser URL");
module.exports = bodyParser.urlencoded({limit : '50mb', extended: true});

// *************************************************************************
//                            Cookie Parser
// *************************************************************************
logger.info("Setting cookieParser");
module.exports = cookieParser(CONFIG.sessionSecret);

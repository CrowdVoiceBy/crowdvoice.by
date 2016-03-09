var config = {
  appName : 'CV.by',
  environment : process.env.NODE_ENV || 'development',
  routesBlackList : [
    /^\/(search|discover|post|switchPerson|person|people|signup|login|logout|user|organization|entity|dist|session|page|root|admin|voice|dev|embed|twitter)(es|s|$|\/)/,
    /^(search|discover|post|switchPerson|person|people|signup|login|logout|user|organization|entity|dist|session|page|root|admin|voice|dev|anonymous|embed|twitter)(es|s|$|\/)/
  ],
  logFile : './log/all.log',
  database : {
    logQueries : true,

    development : {
      client : 'postgresql',
      connection : {
        database : 'crowdvoice.by',
        user : 'your_user',
        password : ''
      },
      pool : {
        min : 2,
        max : 10
      },
      migrations : {
        tableName : 'knex_migrations'
      },
      seeds : {
        directory : './seeds/dev'
      }
    }
  },
  port : process.env.PORT || 3000,
  enableLithium : false,
  enableHashids : true, // https://github.com/hashids/
  enablePassport : true,
  sessionKey : 'session',
  sessionSecret : 'EDIT ME ctYArFqrrXy4snywpApkTcfootxsz9Ko',
  enableRedis : true,
  siteUrl : {
    production: '',
    development : 'http://localhost:3000'
  }

  // Service keys
  // YOU NEED TO FILL THE FOLLOWING WITH YOUR OWN!!

  twitter : {
    consumer_key : '',
    consumer_secret : '',
    access_token : '',
    access_token_secret : ''
  },

  mandrill : {
    key : '',
    sendEmails : true
  },

  s3 : {
    accessKeyId : '',
    secretAccessKey : ''
  },

  youtube : {
    key : ''
  },
}

module.exports = config;

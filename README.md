# CrowdVoice.by

## Install instructions for OS X

These instructions are to install a development (not live) version of CrowdVoice app.

### Database

``` sh
# Run the following commands
brew install postgres
postgres -D /usr/local/var/postgres
createdb "crowdvoice.by" # Your DB name of preference
```

### Session storage

``` sh
# Run the following commands
brew install redis
redis-server /usr/local/etc/redis.conf
```

### Knex

``` sh
# Run the following commands
npm i -g knex
knex init
```

Open `knexfile.js` and edit it with the following example (adjust for your own setup):

``` javascript
development: {
  client: 'postgresql',

  connection: {
    database: 'crowdvoice.by', // Your DB name of preference
    user: 'your_user',
    password: ''
  },

  pool: {
    min: 2,
    max: 10
  },

  migrations: {
    tableName: 'knex_migrations'
  }
},
```

``` sh
# Run the following commands
knex migrate:latest
```

### Config

- Copy `config/config-example.js` to `config/config.js` (`cp config/config-example.js config/config.js`)
- Edit `config.js`
  - Update `database` for your own setup, most likely the same as your `knexfile.js`

### Image processing

``` sh
# Run the following commands
brew install Caskroom/cask/xquartz
brew install homebrew/science/vips --with-webp --with-graphicsmagick
```

Additionally you can check the `sharp` module's readme for more information on the dependencies.

### Video processing

``` sh
# Run the following commands
brew install x264 theora
brew install ffmpeg --with-theora --with-x264
```

## Generate mock data

``` sh
node bin/data_generator.js POSTS
```

Replace `POSTS` with whatever amount of posts you want per voice, 10 by default.  This is a time consuming operation so if you don't need posts it is recommended to not generate any posts (`0`).

## Run the app

```sh
npm i
npm i -g webpack
webpack -d
npm start
```

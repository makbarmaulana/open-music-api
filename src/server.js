require('dotenv').config();

const Hapi = require('@hapi/hapi');

const ClientError = require('./exceptions/ClientError');

const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/song');

const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  /**
 * * Register Plugin
 */
  const songsService = new SongsService();
  const albumsService = new AlbumsService();
  const usersService = new UsersService();

  await server.register([
    {
      plugin: albums,
      options: {
        service: {
          albumsService,
          songsService,
        },
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
  ]);

  /**
  * * Error Handling
  */
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      // Client ERROR!
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // Continue processing if the error is not from the server
      if (!response.isServer) {
        return h.continue;
      }

      // Server ERROR!
      const newResponse = h.response({
        status: 'error',
        message: 'An internal server error occurred.',
      });
      newResponse.code(500);
      return newResponse;
    }

    // Continue processing if the response is not an error
    return h.continue;
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();

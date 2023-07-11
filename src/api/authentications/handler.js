const autoBind = require('auto-bind');

class AuthenticationsHandler {
  constructor(service, validator, tokenManager) {
    const { usersService, authenticationsService } = service;

    this._usersService = usersService;
    this._authenticationsService = authenticationsService;
    this._validator = validator;
    this._tokenManager = tokenManager;

    autoBind(this);
  }

  async postAuthenticationHandler(request, h) {
    this._validator.validatePostAuthenticationPayload(request.payload);

    const { username, password } = request.payload;
    const id = await this._usersService.verifyUserCredential(username, password);
    const accessToken = this._tokenManager.generateAccessToken({ id });
    const refreshToken = this._tokenManager.generateRefreshToken({ id });

    await this._authenticationsService.addRefreshToken(refreshToken);

    const response = h
      .response({
        status: 'success',
        message: 'Authentication added successfully',
        data: {
          accessToken,
          refreshToken,
        },
      })
      .code(201);

    return response;
  }

  async putAuthenticationHandler(request) {
    this._validator.validatePutAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = this._tokenManager.generateAccessToken({ id });

    return {
      status: 'success',
      message: 'Access Token updated successfully',
      data: { accessToken },
    };
  }

  async deleteAuthenticationHandler(request) {
    this._validator.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyRefreshToken(refreshToken);
    await this._authenticationsService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token removed successfully',
    };
  }
}

module.exports = AuthenticationsHandler;

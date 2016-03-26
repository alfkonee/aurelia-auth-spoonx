'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthService = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _dec, _class;

var _aureliaDependencyInjection = require('aurelia-dependency-injection');

var _authentication = require('./authentication');

var _baseConfig = require('./baseConfig');

var _oAuth = require('./oAuth1');

var _oAuth2 = require('./oAuth2');

var _authUtils = require('./authUtils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuthService = exports.AuthService = (_dec = (0, _aureliaDependencyInjection.inject)(_authentication.Authentication, _oAuth.OAuth1, _oAuth2.OAuth2, _baseConfig.BaseConfig), _dec(_class = function () {
  function AuthService(auth, oAuth1, oAuth2, config) {
    _classCallCheck(this, AuthService);

    this.isRefreshing = false;
    this.auth = auth;
    this.oAuth1 = oAuth1;
    this.oAuth2 = oAuth2;
    this.config = config.current;
    this.client = this.config.client;
  }

  AuthService.prototype.getMe = function getMe(criteria) {
    if (typeof criteria === 'string' || typeof criteria === 'number') {
      criteria = { id: criteria };
    }
<<<<<<< HEAD
  }, {
    key: 'updateMe',
    value: function updateMe(body, criteria) {
      if (typeof criteria === 'string' || typeof criteria === 'number') {
        criteria = { id: criteria };
      }
      return this.client.update(this.auth.getProfileUrl(), criteria, body);
    }
  }, {
    key: 'isAuthenticated',
    value: function isAuthenticated() {
      var isExpired = this.auth.isTokenExpired();
      if (isExpired && this.config.autoUpdateToken) {
        if (this.isRefreshing) {
          return true;
        }
        this.updateToken();
      }
      return this.auth.isAuthenticated();
    }
  }, {
    key: 'isTokenExpired',
    value: function isTokenExpired() {
      return this.auth.isTokenExpired();
    }
  }, {
    key: 'getTokenPayload',
    value: function getTokenPayload() {
      return this.auth.getPayload();
=======
    return this.client.find(this.auth.getProfileUrl(), criteria);
  };

  AuthService.prototype.updateMe = function updateMe(body, criteria) {
    if (typeof criteria === 'string' || typeof criteria === 'number') {
      criteria = { id: criteria };
    }
    return this.client.update(this.auth.getProfileUrl(), criteria, body);
  };

  AuthService.prototype.isAuthenticated = function isAuthenticated() {
    return this.auth.isAuthenticated();
  };

  AuthService.prototype.getTokenPayload = function getTokenPayload() {
    return this.auth.getPayload();
  };

  AuthService.prototype.signup = function signup(displayName, email, password) {
    var _this = this;

    var signupUrl = this.auth.getSignupUrl();
    var content = void 0;
    if (_typeof(arguments[0]) === 'object') {
      content = arguments[0];
    } else {
      content = {
        'displayName': displayName,
        'email': email,
        'password': password
      };
>>>>>>> pr/1
    }
    return this.client.post(signupUrl, content).then(function (response) {
      if (_this.config.loginOnSignup) {
        _this.auth.setTokenFromResponse(response);
      } else if (_this.config.signupRedirect) {
        window.location.href = _this.config.signupRedirect;
      }

      return response;
    });
  };

  AuthService.prototype.login = function login(email, password) {
    var _this2 = this;

    var loginUrl = this.auth.getLoginUrl();
    var content = void 0;
    if (typeof arguments[1] !== 'string') {
      content = arguments[0];
    } else {
      content = {
        'email': email,
        'password': password
      };
    }
<<<<<<< HEAD
  }, {
    key: 'login',
    value: function login(email, password) {
      var _this2 = this;

      var loginUrl = this.auth.getLoginUrl();
      var config = this.config;
      var clientId = this.config.clientId;
      var content = {};
      var options = {};
      var data = [];
      if (typeof arguments[1] !== 'string') {
        content = arguments[0];
      } else {
        content = clientId ? {
          'email': email,
          'password': password,
          'client_id': clientId
        } : {
          'email': email,
          'password': password
        };
      }

      if (this.config.postContentType === 'json') {
        content = JSON.stringify(content);
      } else if (this.config.postContentType === 'form') {
        for (var key in content) {
          data.push(key + '=' + content[key]);
        }
        content = data.join('&');
        options = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        };
      }

      return this.client.post(loginUrl, content, options).then(function (response) {
        _this2.auth.setTokenFromResponse(response);
        if (config.useRefreshToken) {
          _this2.auth.setRefreshTokenFromResponse(response);
        }
        return response;
      });
    }
  }, {
    key: 'logout',
    value: function logout(redirectUri) {
      return this.auth.logout(redirectUri);
    }
  }, {
    key: 'updateToken',
    value: function updateToken() {
      var _this3 = this;

      this.isRefreshing = true;
      var loginUrl = this.auth.getLoginUrl();
      var refreshToken = this.auth.getRefreshToken();
      var clientId = this.config.clientId;
      var content = {};
      var data = [];
      var options = {};
      if (refreshToken) {
        content = clientId ? {
          'grant_type': 'refresh_token',
          'refresh_token': refreshToken,
          'client_id': clientId
        } : {
          'grant_type': 'refresh_token',
          'refresh_token': refreshToken
        };
        if (this.config.postContentType === 'json') {
          content = JSON.stringify(content);
        } else if (this.config.postContentType === 'form') {
          for (var key in content) {
            data.push(key + '=' + content[key]);
          }
          content = data.join('&');
          options = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          };
        }
        return this.client.post(loginUrl, content, options).then(function (response) {
          _this3.auth.setRefreshToken(response);
          _this3.auth.setToken(response);
          _this3.isRefreshing = false;
          return response;
        })['catch'](function () {
          _this3.auth.removeToken();
          _this3.auth.removeRefreshToken();
          _this3.isRefreshing = false;
          return null;
        });
      }
    }
  }, {
    key: 'authenticate',
    value: function authenticate(name, redirect, userData) {
      var _this4 = this;

      var provider = this.oAuth2;
      if (this.config.providers[name].type === '1.0') {
        provider = this.oAuth1;
      }

      return provider.open(this.config.providers[name], userData || {}).then(function (response) {
        _this4.auth.setTokenFromResponse(response, redirect);
        return response;
      });
=======

    return this.client.post(loginUrl, content).then(function (response) {
      _this2.auth.setTokenFromResponse(response);

      return response;
    });
  };

  AuthService.prototype.logout = function logout(redirectUri) {
    return this.auth.logout(redirectUri);
  };

  AuthService.prototype.authenticate = function authenticate(name, redirect, userData) {
    var _this3 = this;

    var provider = this.oAuth2;
    if (this.config.providers[name].type === '1.0') {
      provider = this.oAuth1;
>>>>>>> pr/1
    }

    return provider.open(this.config.providers[name], userData || {}).then(function (response) {
      _this3.auth.setTokenFromResponse(response, redirect);
      return response;
    });
  };

  AuthService.prototype.unlink = function unlink(provider) {
    var unlinkUrl = this.config.baseUrl ? _authUtils.authUtils.joinUrl(this.config.baseUrl, this.config.unlinkUrl) : this.config.unlinkUrl;

    if (this.config.unlinkMethod === 'get') {
      return this.client.find(unlinkUrl + provider);
    } else if (this.config.unlinkMethod === 'post') {
      return this.client.post(unlinkUrl, provider);
    }
  };

  return AuthService;
}()) || _class);

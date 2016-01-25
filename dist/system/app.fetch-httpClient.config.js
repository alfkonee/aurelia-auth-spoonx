System.register(['aurelia-fetch-client', './authService', './baseConfig', 'aurelia-framework', './storage', 'spoonx/aurelia-api'], function (_export) {
  'use strict';

  var HttpClient, AuthService, BaseConfig, inject, Storage, Config, Rest, FetchConfig;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  return {
    setters: [function (_aureliaFetchClient) {
      HttpClient = _aureliaFetchClient.HttpClient;
    }, function (_authService) {
      AuthService = _authService.AuthService;
    }, function (_baseConfig) {
      BaseConfig = _baseConfig.BaseConfig;
    }, function (_aureliaFramework) {
      inject = _aureliaFramework.inject;
    }, function (_storage) {
      Storage = _storage.Storage;
    }, function (_spoonxAureliaApi) {
      Config = _spoonxAureliaApi.Config;
      Rest = _spoonxAureliaApi.Rest;
    }],
    execute: function () {
      FetchConfig = (function () {
        function FetchConfig(httpClient, clientConfig, authService, storage, config) {
          _classCallCheck(this, _FetchConfig);

          this.httpClient = httpClient;
          this.clientConfig = clientConfig;
          this.auth = authService;
          this.storage = storage;
          this.config = config.current;
        }

        _createClass(FetchConfig, [{
          key: 'configure',
          value: function configure(client) {
            var _this = this;

            if (Array.isArray(client)) {
              var _ret = (function () {
                var configuredClients = [];
                client.forEach(function (toConfigure) {
                  configuredClients.push(_this.configure(toConfigure));
                });

                return {
                  v: configuredClients
                };
              })();

              if (typeof _ret === 'object') return _ret.v;
            }

            if (typeof client === 'string') {
              client = this.clientConfig.getEndpoint(client).client;
            } else if (client instanceof Rest) {
              client = client.client;
            } else if (!(client instanceof HttpClient)) {
              client = this.httpClient;
            }

            client.configure(function (httpConfig) {
              httpConfig.withBaseUrl(client.baseUrl).withInterceptor(_this.interceptor);
            });

            return client;
          }
        }, {
          key: 'interceptor',
          get: function get() {
            var auth = this.auth;
            var config = this.config;
            var storage = this.storage;

            return {
              request: function request(_request) {
                if (!auth.isAuthenticated() || !config.httpInterceptor) {
                  return _request;
                }

                var tokenName = config.tokenPrefix ? config.tokenPrefix + '_' + config.tokenName : config.tokenName;
                var token = storage.get(tokenName);

                if (config.authHeader && config.authToken) {
                  token = config.authToken + ' ' + token;
                }

                _request.headers.append(config.authHeader, token);

                return _request;
              },
              response: function response(_response) {
                if (_response.ok) {
                  return _response;
                }
                if (_response.status == 401) {
                  if (auth.isTokenExpired() && config.httpInterceptor) {
                    var refreshTokenName = config.refreshTokenPrefix ? config.refreshTokenPrefix + '_' + config.refreshTokenName : config.refreshTokenName;
                    if (storage.get(refreshTokenName)) {
                      auth.updateToken();
                    }
                  }
                }
                return _response;
              }
            };
          }
        }]);

        var _FetchConfig = FetchConfig;
        FetchConfig = inject(HttpClient, Config, AuthService, Storage, BaseConfig)(FetchConfig) || FetchConfig;
        return FetchConfig;
      })();

      _export('FetchConfig', FetchConfig);
    }
  };
});
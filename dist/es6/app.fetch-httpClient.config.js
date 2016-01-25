import {HttpClient} from 'aurelia-fetch-client';
import {AuthService} from './authService';
import {BaseConfig} from './baseConfig';
import {inject} from 'aurelia-framework';
import {Storage} from './storage';
import {Config, Rest} from 'spoonx/aurelia-api';

@inject(HttpClient, Config, AuthService, Storage, BaseConfig)
export class FetchConfig {
  /**
   * Construct the FetchConfig
   *
   * @param {HttpClient} httpClient
   * @param {Config} clientConfig
   * @param {Authentication} authService
   * @param {Storage} storage
   * @param {BaseConfig} config
   */
  constructor(httpClient, clientConfig, authService, storage, config) {
    this.httpClient   = httpClient;
    this.clientConfig = clientConfig;
    this.auth         = authService;
    this.storage      = storage;
    this.config       = config.current;
  }

  /**
   * Interceptor for HttpClient
   *
   * @return {{request: Function}}
   */
  get interceptor() {
    let auth    = this.auth;
    let config  = this.config;
    let storage = this.storage;

    return {
      request(request) {
        if (!auth.isAuthenticated() || !config.httpInterceptor) {
          return request;
        }

        let tokenName = config.tokenPrefix ? `${config.tokenPrefix}_${config.tokenName}` : config.tokenName;
        let token     = storage.get(tokenName);

        if (config.authHeader && config.authToken) {
          token = `${config.authToken} ${token}`;
        }

        request.headers.append(config.authHeader, token);

        return request;
      },
      response(response) {
        if (response.ok) {
          return response;
        }
        if (response.status === 401) {
          if (auth.isTokenExpired() && config.httpInterceptor) {
            let refreshTokenName = config.refreshTokenPrefix ? `${config.refreshTokenPrefix}_${config.refreshTokenName}` : config.refreshTokenName;
            if (storage.get(refreshTokenName)) {
              auth.updateToken();
            }
            //TODO: Reissue Request when aurelia-fetch implements it
          }
        }
        return response;
      }
    };
  }

  /**
   * @param {HttpClient|Rest[]} client
   *
   * @return {HttpClient[]}
   */
  configure(client) {
    if (Array.isArray(client)) {
      let configuredClients = [];
      client.forEach(toConfigure => {
        configuredClients.push(this.configure(toConfigure));
      });

      return configuredClients;
    }

    if (typeof client === 'string') {
      client = this.clientConfig.getEndpoint(client).client;
    } else if (client instanceof Rest) {
      client = client.client;
    } else if (!(client instanceof HttpClient)) {
      client = this.httpClient;
    }

    client.configure(httpConfig => {
      httpConfig.withBaseUrl(client.baseUrl).withInterceptor(this.interceptor);
    });

    return client;
  }
}

import {HttpClient} from 'aurelia-fetch-client';
import {AuthService} from './authService';
import {BaseConfig} from './baseConfig';
import {inject} from 'aurelia-dependency-injection';
import {Config, Rest} from 'spoonx/aurelia-api';

@inject(HttpClient, Config, AuthService, Storage, BaseConfig)
export class FetchConfig {
  /**
   * Construct the FetchConfig
   *
   * @param {HttpClient} httpClient
   * @param {Config} clientConfig
   * @param {Authentication} authService
   * @param {BaseConfig} config
   */
  constructor(httpClient, clientConfig, authentication, config) {
    this.httpClient   = httpClient;
    this.clientConfig = clientConfig;
    this.auth         = authentication;
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

    return {
      request(request) {
        if (!auth.isAuthenticated() || !config.httpInterceptor) {
          return request;
        }

        let token = auth.getToken();

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

    client.interceptors.push(this.interceptor);

    return client;
  }
}

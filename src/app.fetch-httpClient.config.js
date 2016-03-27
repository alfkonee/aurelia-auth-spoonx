import {HttpClient} from 'aurelia-fetch-client';
import {AuthService} from './authService';
import {Storage} from './storage';
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
  constructor(httpClient, clientConfig, authentication, storage, config) {
    this.httpClient   = httpClient;
    this.clientConfig = clientConfig;
    this.auth         = authentication;
    this.config       = config.current;
    this.storage      = storage;
  }

  get tokenName() {
    return this.config.tokenPrefix ? `${this.config.tokenPrefix}_${this.config.tokenName}` : this.config.tokenName;
  }

  /**
   * Interceptor for HttpClient
   *
   * @return {{request: Function}}
   */
  get interceptor() {
    let auth    = this.auth;
    let config  = this.config;
    let client = this.httpClient;
    let storage = this.storage;
    that = this;

    return {
      request(request) {
        if (!auth.isAuthenticated() || !config.httpInterceptor) {
          return request;
        }
        let token = storage.get(that.tokenName);

        if (config.authHeader && config.authToken) {
          token = `${config.authToken} ${token}`;
        }

        request.headers.append(config.authHeader, token);

        return request;
      },
      response(response, request) {
        return new Promise(
          (resolve, reject) => {
            if (response.ok) {
              resolve(response);
            }
            if (response.status === 401) {
              if (auth.isTokenExpired() && config.httpInterceptor) {
                let refreshTokenName: string = config.refreshTokenPrefix ? `${config.refreshTokenPrefix}_${config.refreshTokenName}` : config.refreshTokenName;
                if (storage.get(refreshTokenName)) {
                  auth.updateToken()
                    .then(
                    () => {
                      let token = storage.get(that.tokenName);
                      if (config.authHeader && config.authToken) {
                        token = `${config.authToken} ${token}`;
                      }
                      request.headers.append('Authorization', token);
                      client.fetch(request)
                        .then(resp => {
                          resolve(resp);
                        });
                    }
                    ).catch(err => {
                      reject(err);
                    });
                } else {
                  resolve(response);
                }
              }
            }
          }
        );
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

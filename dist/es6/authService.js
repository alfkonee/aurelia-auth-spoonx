import {inject} from 'aurelia-framework';
import {Authentication} from './authentication';
import {BaseConfig} from './baseConfig';
import {OAuth1} from './oAuth1';
import {OAuth2} from './oAuth2';
import authUtils from './authUtils';

@inject(Authentication, OAuth1, OAuth2, BaseConfig)
export class AuthService {
  static IS_UPDATING_TOKEN = false;
  constructor(auth, oAuth1, oAuth2, config) {
    this.auth = auth;
    this.oAuth1 = oAuth1;
    this.oAuth2 = oAuth2;
    this.config = config.current;
    this.client = this.config.client;
  }

  getMe(criteria) {
    if (typeof criteria === 'string' || typeof criteria === 'number') {
      criteria = { id: criteria };
    }
    return this.client.find(this.auth.getProfileUrl(), criteria);
  }

  updateMe(body, criteria) {
    if (typeof criteria === 'string' || typeof criteria === 'number') {
      criteria = { id: criteria };
    }
    return this.client.update(this.auth.getProfileUrl(), criteria, body);
  }

  isAuthenticated() {
    let isExpired = this.auth.isTokenExpired();
    if (isExpired && this.config.autoUpdateToken) {
      if (AuthService.IS_UPDATING_TOKEN) {
        return true;
      } else {
        this.updateToken();
      }
    }

    return this.auth.isAuthenticated();
  }

  isTokenExpired() {
    return this.auth.isTokenExpired();
  }

  getTokenPayload() {
    return this.auth.getPayload();
  }

  signup(displayName, email, password) {
    let signupUrl = this.auth.getSignupUrl();
    let content;
    if (typeof arguments[0] === 'object') {
      content = arguments[0];
    } else {
      content = {
        'displayName': displayName,
        'email': email,
        'password': password
      };
    }
    return this.client.post(signupUrl, content)
      .then(response => {
        if (this.config.loginOnSignup) {
          this.auth.setTokenFromResponse(response);
        } else if (this.config.signupRedirect) {
          window.location.href = this.config.signupRedirect;
        }

        return response;
      });
  }

  login(email, password) {
    let loginUrl = this.auth.getLoginUrl();
    let config = this.config;
    var content, options;
    if (typeof arguments[1] !== 'string') {
      content = arguments[0];
    } else {
      content = {
        'email': email,
        'password': password
      };
    }

    if (this.config.postContentType === 'json') {
      content = JSON.stringify(content);
    } else if (this.config.postContentType === 'form') {
      var data = [];
      for (var key in content) {
        data.push(key + "=" + content[key]);
      }
      content = data.join('&');
      options = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };
    }

    return this.client.post(loginUrl, content, options)
      .then(response => {
        this.auth.setTokenFromResponse(response);
        if (config.useRefreshToken) {
          this.auth.setRefreshTokenFromResponse(response);
        }
        return response;
      });
  }
  
  logout(redirectUri) {
    return this.auth.logout(redirectUri);
  }

  updateToken() {
    AuthService.IS_UPDATING_TOKEN = true;
    let loginUrl = this.auth.getLoginUrl();
    let refreshToken = this.auth.getRefreshToken();
    let clientId = this.config.clientId;
    if (refreshToken) {
      var content = clientId ? {
          'grant_type': 'refresh_token',
          'refresh_token': refreshToken,
          'client_id':clientId
        }:{
          'grant_type': 'refresh_token',
          'refresh_token': refreshToken,
        }, options;
        
    if (this.config.postContentType === 'json') {
      content = JSON.stringify(content);
    } else if (this.config.postContentType === 'form') {
      var data = [];
      for (var key in content) {
        data.push(key + "=" + content[key]);
      }
      content = data.join('&');
      options = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };
    }
      return this.client.post(loginUrl,content, options)
          .then(response => {
            this.auth.setRefreshToken(response);
            this.auth.setToken(response);
            AuthService.IS_UPDATING_TOKEN = false;
            return response;
          }).catch(() => {
            this.auth.removeToken();
            this.auth.removeRefreshToken();
            AuthService.IS_UPDATING_TOKEN = false;
            return null;
          });
    }
  }
  authenticate(name, redirect, userData) {
    let provider = this.oAuth2;
    if (this.config.providers[name].type === '1.0') {
      provider = this.oAuth1;
    }

    return provider.open(this.config.providers[name], userData || {})
      .then(response => {
        this.auth.setTokenFromResponse(response, redirect);
        return response;
      });
  }

  unlink(provider) {
    let unlinkUrl = this.config.baseUrl ? authUtils.joinUrl(this.config.baseUrl, this.config.unlinkUrl) : this.config.unlinkUrl;

    if (this.config.unlinkMethod === 'get') {
      return this.client.find(unlinkUrl + provider);
    } else if (this.config.unlinkMethod === 'post') {
      return this.client.post(unlinkUrl, provider);
    }
  }
}

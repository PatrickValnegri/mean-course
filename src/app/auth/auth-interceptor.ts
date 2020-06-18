import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';

@Injectable() //we need this notation to inject object in this class
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = this.authService.getToken();
    const authRequest = req.clone({ //avoid side effects
      headers: req.headers.set('Authorization', "Bearer " + authToken) //adding token to request
    });
    return next.handle(authRequest);
  }
}

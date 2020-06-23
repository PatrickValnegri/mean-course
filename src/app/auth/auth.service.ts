import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AuthData } from './auth-data.model';

@Injectable({providedIn: 'root'})
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private authStatusListener = new Subject<boolean>();
  private tokenTimer: any; //NodeJS.Timer;
  private userId: string;

  constructor  (private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getIsAuth(){
    return this.isAuthenticated;
  }

  getUserId(){
    return this.userId;
  }

  //SIGNUP method
  createUser(email: string, password: string) {
    const authData: AuthData = {
      email: email,
      password: password
    }
    this.http.post('http://localhost:3000/api/user/signup', authData)
      .subscribe(response => {
        console.log(response);
        this.router.navigate(['/']);
      }, error => { //error handler
        this.authStatusListener.next(false);
      });
  }

  //LOGIN method
  login(email: string, password: string) {
    const authData: AuthData = {
      email: email,
      password: password
    }
    this.http.post<{message: string, token: string, expiresIn: number, userId: string}>(
      'http://localhost:3000/api/user/login', authData
      )
      .subscribe(response => {
        const token = response.token;
        this.token = token;
        if(token) {
          console.log(response.message);

          //token expiration + timer
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);

          this.userId = response.userId;
          this.authStatusListener.next(true); //notifiy about the authentication
          this.isAuthenticated = true;

          //save token and expiration date
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          this.saveAuthData(token, expirationDate, this.userId);

          this.router.navigate(['/']);
        }
      }, error => { //error handler
        this.authStatusListener.next(false);
      });
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    const now = new Date();

    if (!authInformation) {
      return;
    }

    //check if expired
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();

    if(expiresIn > 0) { //token not expired yet
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000); //ms to s
      this.authStatusListener.next(true);
    }
  }

  //logout
  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.userId = null;
    this.authStatusListener.next(false); //notifiy logout

    this.clearAuthData();
    clearTimeout(this.tokenTimer); //reset timer if logout manually

    this.router.navigate(['/']);
  }

  //set expirationdate timer
  private setAuthTimer(duration: number) { //duration is in second
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000); //s * 1000 = ms
  }

  //save token and expiration date after refresh in localstorate
  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  //delete info in localstorate
  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  //retrive data from localstorage
  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');

    if (!token || !expirationDate) {
      return;
    }

    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    }
  }
}

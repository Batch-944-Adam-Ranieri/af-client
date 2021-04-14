import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from 'src/app/models/user';
import jwt_decode from 'jwt-decode';
import { Observable, of } from 'rxjs';

export interface JwtDTO {
  data?: string;
}
export interface DecodedJwtDTO {
  id?: number;
  email?: string;
  role?: string;
  status?: string;
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url: string = 'http://34.123.74.34:80/';
  decodedJwtDTO?: DecodedJwtDTO;
  jwt?: string;

  constructor(private httpClient: HttpClient) {}

  /*
    register user
    get pending users
    approve/deny pending users
    get jwt for user
    verify jwt
  */

  async registerUser(user: User) {
    const returnedUser: User = await this.httpClient
      .post<User>(this.url + 'register', user)
      .toPromise();
    return returnedUser;
  }

  async signInUser(user: User) {
    const jwt: { data: string } = await this.httpClient
      .post<{ data: string }>(this.url + 'login', user)
      .toPromise();
    return jwt.data;
  }

  setPassword(password: string) {
    const options = {
      headers: {
        Authorization: this.jwt!,
      },
    };
    const body = {
      email: this.decodedJwtDTO?.email,
      userId: this.decodedJwtDTO?.id,
      password: password,
    };
    return this.httpClient.patch<{ data: string }>(
      this.url + 'password?id=' + this.jwt,
      body,
      options
    );
  }

  getAllPendingUsers(): Observable<User[]> {
    return this.httpClient.get<User[]>(`${this.url}resolve`, {
      headers: { Authorization: this.jwt! },
    });
  }

  resolveUser(user: User): Observable<User> {
    return this.httpClient.patch(`${this.url}resolve/${user.userId}`, user, {
      headers: { Authorization: this.jwt! },
    });
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('Authorization') != null;
  }

  // check the role of current user to be admin
  isAdminAuthorized(): boolean {
    this.getCurrentUserInfo();
    return this.isLoggedIn() && this.decodedJwtDTO!.role == 'admin';
  }

  isTrainerAuthorized(): boolean {
    this.getCurrentUserInfo();
    return this.isLoggedIn() && this.decodedJwtDTO!.role == 'trainer';
  }

  getCurrentUserInfo() {
    let value = localStorage.getItem('Authorization');
    if (value != null) {
      this.jwt = value;
      try {
        this.decodedJwtDTO = jwt_decode(value);
      } catch (e) {
        this.decodedJwtDTO = undefined;
      }
    }
  }

  getJWT(): string | undefined {
    this.getCurrentUserInfo();
    return this.jwt;
  }
}

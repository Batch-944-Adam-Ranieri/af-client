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
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url: string = 'http://34.123.74.34:80/';
  decodedJwtDTO?: DecodedJwtDTO;
  jwt?: string;


  pendingUsers: User[] = [
    {
      userId: 1,
      email: 'user1@g.com',
      password: '',
      status: 'PENDING',
      role: 'trainer',
    },
    {
      userId: 2,
      email: 'user2@g.com',
      password: '',
      status: 'PENDING',
      role: 'trainer',
    },
    {
      userId: 3,
      email: 'user3@g.com',
      password: '',
      status: 'PENDING',
      role: 'trainer',
    },
    {
      userId: 4,
      email: 'user4@g.com',
      password: '',
      status: 'PENDING',
      role: 'trainer',
    },
    {
      userId: 5,
      email: 'user5@g.com',
      password: '',
      status: 'PENDING',
      role: 'trainer',
    },
    {
      userId: 6,
      email: 'user6@g.com',
      password: '',
      status: 'PENDING',
      role: 'trainer',
    },
    {
      userId: 7,
      email: 'user7@g.com',
      password: '',
      status: 'PENDING',
      role: 'trainer',
    },
    {
      userId: 8,
      email: 'user8@g.com',
      password: '',
      status: 'PENDING',
      role: 'trainer',
    },
  ];

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
        Authorization: this.jwt!
      }
    }
    const body = {
      email:this.decodedJwtDTO?.email,
      userId:this.decodedJwtDTO?.id,
      password:password
    }
    return this.httpClient
      .patch<{data: string}>(this.url+"password?id="+this.jwt, body, options);
  }

  getAllPendingUsers(): Observable<User[]> {
    return this.httpClient.get<User[]>(`${this.url}resolve`, {
      headers: {
        Authorization: this.jwt!
      }
    });
    //return of(this.pendingUsers);
    // return this.httpClient.get<User[]>(this.url + 'resovle');
  }

  resolveUser(user: User): Observable<User> {
    return this.httpClient.patch(`${this.url}resolve/${user.userId}`, user, {
      headers: {
        Authorization: this.jwt!
      }
    });
    return of(user);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('Authorization') != null;
  }

  // check the role of current user to be admin
  isAdminAuthorized(): boolean {
    return true;
    this.getCurrentUserInfo();
    return this.isLoggedIn() && this.decodedJwtDTO!.role == 'admin';
  }

  isTrainerAuthorized(): boolean {
    return true;
    this.getCurrentUserInfo();
    return this.isLoggedIn() && this.decodedJwtDTO!.role == 'trainer';
  }

  getCurrentUserInfo() {
    let value = localStorage.getItem('Authorization');
    console.log("jwt", value);
    if (value != null) {
      this.jwt = value;
      try {
        this.decodedJwtDTO = jwt_decode(value);
      } catch (e) {
        this.decodedJwtDTO = undefined;
      }
    }
    console.log('current user', this.decodedJwtDTO);
  }

  getJWT(): string | undefined {
    this.getCurrentUserInfo();
    return this.jwt;
  }

}

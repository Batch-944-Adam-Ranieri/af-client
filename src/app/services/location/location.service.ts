import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
//import { delay } from 'rxjs/operators';
import { Location } from 'src/app/models/location';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class LocationService {


  currentLocation?: Location = {};
  baseUrl = 'http://104.154.225.237:80';
  options = {
    headers: {
      Authorization: this.authService.jwt!
    }
  }

  constructor(private authService: AuthService, private httpClient: HttpClient) {}

  getAllLocation(): Observable<Location[]> {
    //return of(this.locations).pipe(delay(1500));
    return this.httpClient.get<Location[]>(`${this.baseUrl}/locations`, this.options);
  }

  deleteLocation(localtion: Location): Observable<boolean> {
    // return of(false).pipe(delay(1500));
    return this.httpClient.delete<boolean>(`${this.baseUrl}/locations/${localtion.locationId}`, this.options);

  }

  createLocation(location: Location): Observable<Location> {
    // this.locations.push(location);
    // return of(location).pipe(delay(1500));
    return this.httpClient.post<Location>(`${this.baseUrl}/locations`, location, this.options);

  }

  updateLocation(location: Location): Observable<Location> {
    // return of(location).pipe(delay(1500));
    return this.httpClient.put<Location>(`${this.baseUrl}/locations/${location.locationId}`, location, this.options);

  }

}

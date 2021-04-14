import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { Building } from 'src/app/models/building';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class BuildingService {

  baseUrl = 'http://104.154.225.237:80';
  currentBuilding?: Building = {};
  options = {
    headers: {
      Authorization: this.authService.jwt!
    }
  }

  constructor(private authService: AuthService, private httpClient: HttpClient) {}


  getBuildingsByLocationId(locationId: number): Observable<Building[]> {
    return this.httpClient.get<Building[]>(`${this.baseUrl}/locations/${locationId}/buildings`, this.options);
  }

  createBuilding(building: Building): Observable<Building> {
    return this.httpClient.post<Building>(`${this.baseUrl}/locations/${building.locationId}/buildings`,building, this.options);
  }

  updateBuilding(building: Building): Observable<Building> {
    return this.httpClient.put<Building>(`${this.baseUrl}/locations/${building.locationId}/buildings/${building.buildingId}`,building, this.options);
  }

  deleteBuildingById(building: Building): Observable<boolean> {
    return this.httpClient.delete<boolean>(`${this.baseUrl}/locations/${building.locationId}/buildings/${building.buildingId}`, this.options);
  }

}

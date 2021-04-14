import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Reservation } from '../../models/reservation';
import { Room } from '../../models/room';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  BASE_URL: string = 'http://23.251.149.85:80';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
  ) {}

  options = {
    headers: {
      Authorization: this.authService.jwt!
    }
  }

  // Create
  createReservation(
    reservation: Reservation
  ): Observable<Reservation> {
    let body =  // formatting reservation with fields the backend expects
    {
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      roomId: reservation.roomId,
      title: reservation.title
    }
    
    return this.http
      .post<Reservation>(
        `${this.BASE_URL}/reservations`,body,
        this.options
      );
  }

  // Read
  getReservationsByRoom(room: Room, future: boolean): Observable<Reservation[]> {
    let forward = "";
    if(future) {
      forward = `&start=${Math.floor((+ new Date()) / 1000)}`;
    }
    return this.http
      .get<Reservation[]>(
        `${this.BASE_URL}/reservations?roomId=${room.roomId}`+forward,this.options
      );
  }

  getReservationByReserver(future: boolean): Observable<Reservation[]> {
    let forward = "";
    if(future) {
      forward = `&start=${Math.floor((+ new Date()) / 1000)}`;
    }
    return this.http
      .get<Reservation[]>(
        `${this.BASE_URL}/reservations?reserver=${this.authService.decodedJwtDTO?.email}`+forward,this.options
      );
  }

  // Update
  updateReservation(
    reservation: Reservation
  ): Observable<Reservation> {
    const body =  // formatting reservation with fields the backend expects
    {
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      title: reservation.title
    }
    return this.http
      .patch<Reservation>(
        `${this.BASE_URL}/reservations/${reservation.reservationId}`,
        body,
        this.options
      );
  }

  // Cancel
  cancelReservation(
    reservation: Reservation
  ): Observable<Reservation> {
    return this.http
      .patch<Reservation>(
        `${this.BASE_URL}/reservations/${reservation.reservationId}?action=cancel`,
        {},
        this.options
      );
  }
}

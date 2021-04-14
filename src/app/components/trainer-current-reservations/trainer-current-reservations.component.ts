import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { Building } from 'src/app/models/building';
import { Location } from 'src/app/models/location';
import { Reservation } from 'src/app/models/reservation';
import { Room } from 'src/app/models/room';
import { AppConfirmService } from 'src/app/services/app-confirm/app-confirm.service';
import { BuildingService } from 'src/app/services/building/building.service';
import { LocationService } from 'src/app/services/location/location.service';
import { ReservationService } from 'src/app/services/reservation/reservation.service';
import { RoomService } from 'src/app/services/room/room.service';

export interface resObject{
  reservation:Reservation;
  location:Location;
  building:Building;
  room:Room;
}

@Component({
  selector: 'app-trainer-current-reservations',
  templateUrl: './trainer-current-reservations.component.html',
  styleUrls: ['./trainer-current-reservations.component.sass'],
})
export class TrainerCurrentReservationsComponent implements OnInit {
  cells: number = 1;
  currentReservation!: resObject;
  reservationIndex = 0;
  reservations: resObject[] = [];
  locations?: Location[];
  buildings?: Building[];
  rooms?: Room[];

  constructor(
    private conformService: AppConfirmService,
    private toastr: ToastrService,
    private reservationService: ReservationService,
    private roomService: RoomService,
    private buildingService: BuildingService,
    private locationService: LocationService
  ) {}

  // This retroactively finds the location, building, and room from the roomId of the reservation
  // Currently the only way to do this is to get all of the data and check through each location, building, and room to find a match
  getLocationDetails(currentRes:Reservation):Observable<resObject>{
    //Flag to escape loops of http requests once we find the location/building/room correlating to the reservation
    let flag:boolean = false;
    let obj: resObject = {reservation: currentRes,building: {}, room:{}, location: {}}; 
    this.locationService.getAllLocation().subscribe(
      (resultLocations)=>{
        this.locations = resultLocations;
        for(let l of this.locations!){
          if(flag){
            break;
          }
          this.locationService.currentLocation = l;
          this.buildingService.getBuildingsByLocationId(l.locationId!).subscribe(
            (resultBuildings)=>{
              this.buildings = resultBuildings;
              for(let b of this.buildings!){
                if(flag){
                  break;
                }
                this.roomService.getRoomByBuilding(b).subscribe(
                  (resultRooms)=>{
                    this.rooms = resultRooms;
                    for(let r of this.rooms!){
                      if(r.roomId === currentRes.roomId){
                        obj.room = r;
                        obj.building = b;
                        obj.location = l;
                        flag = true;
                        break;
                      }
                    }
                  }
                )
              }
            }
          )
        }
      }
    )
    return of(obj);
  }

  ngOnInit(): void {
    this.reservationService.getReservationByReserver(true).subscribe(
      (res) => {

        for(let r of res){
          this.getLocationDetails(r).subscribe(
            (loc)=>{
              this.reservations.push(loc);
            }
          );
        }
        
        this.currentReservation = this.reservations[this.reservationIndex];    
      },
      (error: any) => {
        this.toastr.error(error);
        console.log(error);
      }
    );
  }

  previousReservation() {
    if (this.reservationIndex > 0) {
      this.reservationIndex--;
    } else {
      this.reservationIndex = this.reservations.length - 1;
    }
    this.currentReservation = this.reservations[this.reservationIndex];
  }

  nextReservation() {
    if (this.reservationIndex < this.reservations.length - 1) {
      this.reservationIndex++;
    } else {
      this.reservationIndex = 0;
    }
    this.currentReservation = this.reservations[this.reservationIndex];
  }

  deleteReservation() {
    //TODO make http request to delete the current reservation
    this.conformService.confirm().subscribe((confirm) => {
      if (confirm) {
        this.reservationService.cancelReservation(this.currentReservation.reservation).subscribe(
          (result)=>{
            this.toastr.success('Cancelled reservation');
            //This is just for an immediate DOM update.  It should already be like this in the DB
            this.currentReservation.reservation.status = 'cancelled';
            this.ngOnInit();
          },
          (error)=>{
            this.toastr.error('Failed to cancel reservation');
          }
        );
      }
    });
  }
}

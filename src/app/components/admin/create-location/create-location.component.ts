import { Component, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { ToastrService } from 'ngx-toastr';
import { Building } from 'src/app/models/building';
import { Location } from 'src/app/models/location';
import { BuildingService } from 'src/app/services/building/building.service';
import { LocationService } from 'src/app/services/location/location.service';
import { InspectBuildingComponent } from '../inspect-building/inspect-building.component';
import { InspectLocationComponent } from '../inspect-location/inspect-location.component';
import { InspectRoomComponent } from '../inspect-room/inspect-room.component';

@Component({
  selector: 'app-create-location',
  templateUrl: './create-location.component.html',
  styleUrls: ['./create-location.component.sass'],
})
export class CreateLocationComponent implements OnInit {

  @ViewChild(InspectLocationComponent) locationChild!: InspectLocationComponent;
  @ViewChild(InspectBuildingComponent) buildingChild!: InspectBuildingComponent;
  @ViewChild(InspectRoomComponent) roomChild!: InspectRoomComponent;
  @ViewChild('stepper') stepper!: MatStepper;

  currentLocation?: Location;
  currentBuilding?: Building;
  completeLocationSelect: boolean = false;
  completeBuildingSelect: boolean = false;
  

  constructor(
    private locationService: LocationService,
    private buildingService: BuildingService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getCurrentLocation();
  }

  getCurrentLocation() {
    this.currentLocation = this.locationService.currentLocation;
    this.completeLocationSelect = !!this.currentLocation?.locationId;
  }

  getCurrentBuilding() {
    this.currentBuilding = this.buildingService.currentBuilding;
    this.completeBuildingSelect = !!this.currentBuilding?.buildingId;
  }

  resetCurrentInfo() {
    this.buildingService.currentBuilding = {};
  }


  gotoRoomStep() {
    if (this.currentBuilding?.locationId) {
      this.roomChild.ngOnInit();
    } else {
      this.toastr.warning('Please choose a building to proceed');
    }
  }

  gotoBuildingStep() {
    // complete the current step
    if (this.currentLocation?.locationId) {
      this.completeLocationSelect = true;
    } else {
      this.toastr.warning('Please choose a location to proceed');
    }
  }

  stepperOnChange(event: any) {
    if(event.selectedIndex == 0) {
      this.resetCurrentInfo();
      this.locationChild.resetChooseLocation();
      this.buildingChild.unChooseBuilding();
    } else if(event.selectedIndex == 1) {
      this.buildingChild.createTable();
    } 
    else if(event.selectedIndex == 2) {
      this.roomChild.createTable();
    }
    this.getCurrentLocation();
    this.getCurrentBuilding();
  }
}

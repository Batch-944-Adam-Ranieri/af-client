import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Building } from 'src/app/models/building';
import { BuildingService } from 'src/app/services/building/building.service';
import { LocationService } from 'src/app/services/location/location.service';
import { RoomService } from 'src/app/services/room/room.service';
interface BuildingWithRoomCount {
  buildingId?: number;
  address?: string;
  roomCount?: number;
}
@Component({
  selector: 'app-building-table',
  templateUrl: './building-table.component.html',
  styleUrls: ['./building-table.component.sass']
})
export class BuildingTableComponent implements OnInit, AfterViewInit {
  
    selectedLocation?: Location;
    @Input() locationData?: string;
    selectedBuilding?: Building;
    buildingData?: Building;

    displayedColumns: string[] = [
      'buildingId',
      'address',
      'roomCount'
    ];
    dataSource!: MatTableDataSource<Building>;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(
      private locationService: LocationService,
      private buildingService: BuildingService,
      public dialog: MatDialog,
      private roomService: RoomService
    ) {}
  
    ngOnInit(): void {
      this.createTable();
    }
    
    ngAfterViewInit(): void {
      if (this.dataSource) {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    }
  
    createTable(): void {
      if (!this.locationService.currentLocation?.locationId) {
        return;
      }
      this.buildingService
        .getBuildingsByLocationId(
          this.locationService.currentLocation?.locationId!
        )
        .subscribe((res) => {
          let arr: BuildingWithRoomCount[] = res;
        
          arr.forEach( building => {
            this.roomService.getRoomByBuilding(building).subscribe( res => 
              building.roomCount =  res.length )
            })
          this.dataSource = new MatTableDataSource(arr);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
    }
  
    applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
  
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  
  
    chooseBuilding(building: Building) {
      this.selectedBuilding = building;
      this.buildingService.currentBuilding = building;
    }
  

  

}

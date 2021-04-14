import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Room } from 'src/app/models/room';
import { BuildingService } from 'src/app/services/building/building.service';
import { LocationService } from 'src/app/services/location/location.service';
import { RoomService } from 'src/app/services/room/room.service';

@Component({
  selector: 'app-room-table',
  templateUrl: './room-table.component.html',
  styleUrls: ['./room-table.component.sass']
})
export class RoomTableComponent implements OnInit {

  roomData?: Room;
  
  selectedRoom?: Room;

  displayedColumns: string[] = [
    'roomId',
    'name',
    'type',
    'capacity'
  ];
  dataSource!: MatTableDataSource<Room>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @Input() buildingData?: string;
  @Input() locationData?: string;

  constructor(
    private locationService: LocationService,
    private roomService: RoomService,
    private buildingService: BuildingService
  ) {}

  ngOnInit(): void {
    this.createTable();
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  createTable(): void {
    if (!this.buildingService.currentBuilding?.buildingId) {
      return;
    }
    this.roomService
      .getRoomByBuilding(this.buildingService.currentBuilding!)
      .subscribe((res) => {
        this.dataSource = new MatTableDataSource(res);
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  chooseRoom(room: Room) {
    this.selectedRoom = room;
    this.roomService.currentRoom = room;
  }

}

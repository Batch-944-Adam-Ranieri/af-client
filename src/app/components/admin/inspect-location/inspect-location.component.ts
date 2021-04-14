import {
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Location } from 'src/app/models/location';
import { AppConfirmService } from 'src/app/services/app-confirm/app-confirm.service';
import { BuildingService } from 'src/app/services/building/building.service';
import { LocationService } from 'src/app/services/location/location.service';
import { AddLocationComponent } from '../add-location/add-location.component';

@Component({
  selector: 'app-inspect-location',
  templateUrl: './inspect-location.component.html',
  styleUrls: ['./inspect-location.component.sass'],
})
export class InspectLocationComponent implements OnInit {
  locationId?: number;
  name?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  locationData?: Location;
  selectedLocation?: Location;
  resLocation?: Location[];

  displayedColumns: string[] = [
    'name',
    'state',
    'city',
    'zipCode',
    'actions',
  ];
  dataSource!: MatTableDataSource<Location>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private locationService: LocationService,
    public dialog: MatDialog,
    private confirmService: AppConfirmService,
    private toastr: ToastrService,
    private buildingService: BuildingService,
  ) {}

  ngOnInit(): void {
    this.createTable();
  }

  createTable(): void {
    this.locationService.getAllLocation().subscribe(
      (res) => {
        this.resLocation = res;
        this.setTableData(res);
      },
      (error) => {
        this.toastr.error(error?.error?.message || error?.error?.error);
      }
    );
  }

  setTableData(data: Location[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editLocation(loc: Location) {
    this.locationData = loc;
    this.openDialog('Edit location');
  }

  deleteLocation(location: Location) {
    this.confirmService
      .confirm({ message: `Delete ${location.name}`, title: 'Delete location' })
      .subscribe((confirm) => {
        if (confirm) {
          this.locationService.deleteLocation(location).subscribe(
            (res) => {
              this.resLocation = this.resLocation!.filter( loc => loc.locationId !== location.locationId);
              this.setTableData(this.resLocation!);
              this.toastr.success('Deleted location');
            },
            (error) => {
              this.toastr.error(error?.error?.message || error?.error?.error);
            }
          );
        }
      });
  }

  chooseLocation(loc: Location) {
    this.selectedLocation = loc;
    this.locationService.currentLocation = loc;
    this.buildingService.currentBuilding = {};
  }

  resetChooseLocation() {
    this.buildingService.currentBuilding = {};
  }

  addLocation() {
    this.locationData = { locationId: 0 };
    this.openDialog('Add location');
  }

  openDialog(title: string) {
    const dialogRef = this.dialog.open(AddLocationComponent, {
      data: { ...this.locationData, title },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.locationId == 0) {
        this.locationService.createLocation(result).subscribe(
          (res) => {
            this.resLocation?.push(res);
            this.setTableData(this.resLocation!);
            this.toastr.success('Created new location');
          },
          (error) => {
            this.toastr.error(error?.error?.message || error?.error?.error);
          }
        );
      } else if (result?.locationId) {
        this.locationService.updateLocation(result).subscribe(
          (res) => {
            this.resLocation = this.resLocation!.map( loc => loc.locationId == res.locationId ? res : loc);
            this.setTableData(this.resLocation!);
            this.toastr.success('Updated location');
          },
          (error) => {
            this.toastr.error(error?.error?.message || error?.error?.error);
          }
        );
      }
    });
  }
}

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Location } from 'src/app/models/location';
import { AppConfirmService } from 'src/app/services/app-confirm/app-confirm.service';
import { LocationService } from 'src/app/services/location/location.service';
import { AddLocationComponent } from '../add-location/add-location.component';

@Component({
  selector: 'app-inspect-location',
  templateUrl: './inspect-location.component.html',
  styleUrls: ['./inspect-location.component.sass'],
})
export class InspectLocationComponent implements OnInit, AfterViewInit {
  locationId?: number;
  name?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  locationData?: Location;
  selectedLocation?: Location;

  displayedColumns: string[] = [
    'locationId',
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
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.createTable();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  createTable(): void {
    this.locationService.getAllLocation().subscribe((res) => {
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

  editLocation(loc: Location) {
    this.locationData = loc;
    this.openDialog('Edit location');
  }

  deleteLocation(location: Location) {
    this.confirmService
      .confirm({ message: `Delete ${location.name}`, title: 'Delete location' })
      .subscribe((confirm) => {
        if (confirm) {
          console.log('Delete ', location);
          this.locationService.deleteLocation(location).subscribe(
            (res) => {
              this.toastr.success('Deleted location', 'success', {
                timeOut: 3000,
              });
            },
            (error) => {
              this.toastr.error(
                error?.error?.message || error?.error?.error,
                'error',
                {
                  timeOut: 3000,
                }
              );
            }
          );
        }
      });
  }

  chooseLocation(loc: Location) {
    console.log('Select location: ', loc);
    this.selectedLocation = loc;
    this.locationService.currentLocation = loc;
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
            this.toastr.success('Created new location', 'success', {
              timeOut: 3000,
            });
          },
          (error) => {
            this.toastr.error(
              error?.error?.message || error?.error?.error,
              'error',
              {
                timeOut: 3000,
              }
            );
          }
        );
      } else if (result?.locationId) {
        this.locationService.updateLocation(result).subscribe(
          (res) => {
            this.toastr.success('Updated location', 'success', {
              timeOut: 3000,
            });
          },
          (error) => {
            this.toastr.error(
              error?.error?.message || error?.error?.error,
              'error',
              {
                timeOut: 3000,
              }
            );
          }
        );
      }
      console.log('dialog return', result);
    });
  }
}

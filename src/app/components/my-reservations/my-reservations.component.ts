import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Reservation } from 'src/app/models/reservation';
import { ReservationService } from 'src/app/services/reservation/reservation.service';

@Component({
  selector: 'app-my-reservations',
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.sass'],
})
export class MyReservationsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['title', 'startTime', 'endTime', 'roomId', 'status'];
  dataSource!: MatTableDataSource<Reservation>;

  constructor(
    private reservationService: ReservationService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.reservationService.getReservationByReserver(false).subscribe(
      (res) => {
        this.setTableData(res);
      },
      (error) => {
        this.toastr.error('Failed to load reservation data');
      }
    );
  }

  setTableData(data: Reservation[]) {
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
}

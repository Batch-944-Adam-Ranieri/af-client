import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/models/user';
import { AppConfirmService } from 'src/app/services/app-confirm/app-confirm.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-admin-resolve',
  templateUrl: './admin-resolve.component.html',
  styleUrls: ['./admin-resolve.component.sass'],
})
export class AdminResolveComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['userId', 'email', 'status', 'role', 'action'];
  userRole = [
    { value: 'trainer', viewValue: 'trainer' },
    { value: 'admin', viewValue: 'admin' },
  ];

  dataSource!: MatTableDataSource<User>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private confirmService: AppConfirmService
  ) {}

  ngOnInit(): void {
    this.setTable();
  }

  setTable() {
    this.authService.getAllPendingUsers().subscribe(
      (res) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (error) => {
        this.toastr.error('Failed to get pending users');
      }
    );
  }

  ngAfterViewInit() {
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

  approveAction(user: User) {
    this.confirmService.confirm().subscribe((confirm) => {
      if (confirm) {
        user.status = 'approved';
        this.authService.resolveUser(user).subscribe(
          (res) => {
            this.toastr.success('Approve success');
            this.setTable();
          },
          (error) => {
            this.toastr.error(error?.error?.message || error?.error?.error);
          }
        );
      }
    });
  }

  denyAction(user: User) {
    this.confirmService.confirm().subscribe((confirm) => {
      if (confirm) {
        user.status = 'denied';
        this.authService.resolveUser(user).subscribe(
          (res) => {
            this.toastr.success('Denied a user');
            this.setTable();
          },
          (error) => {
            this.toastr.error(error?.error?.message || error?.error?.error);
          }
        );
      }
    });
  }
}

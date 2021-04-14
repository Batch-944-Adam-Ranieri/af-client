import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  addDays,
  isSameDay,
  isSameMonth,
  addMinutes,
  endOfWeek,
} from 'date-fns';
import { Subject, fromEvent } from 'rxjs';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import { WeekViewHourSegment } from 'calendar-utils';
import { DomSanitizer } from '@angular/platform-browser';
import { ReservationService } from 'src/app/services/reservation/reservation.service';
import { Room } from 'src/app/models/room';
import { Reservation } from 'src/app/models/reservation';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditReservationComponent } from '../edit-reservation/edit-reservation.component';
import { AppConfirmService } from 'src/app/services/app-confirm/app-confirm.service';
import { ToastrService } from 'ngx-toastr';
import { finalize, takeUntil } from 'rxjs/operators';
import { DisplayReservationComponent } from '../display-reservation/display-reservation.component';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
  gray: {
    primary: 'gray',
    secondary: 'lightgray',
  },
};

function floorToNearest(amount: number, precision: number) {
  return Math.floor(amount / precision) * precision;
}

function ceilToNearest(amount: number, precision: number) {
  return Math.ceil(amount / precision) * precision;
}

@Component({
  selector: 'app-calendar-ks',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar-ks.component.html',
  styleUrls: ['./calendar-ks.component.sass'],
})
export class CalendarKsComponent implements OnInit {
  @Input() roomData?: Room;

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  refresh: Subject<any> = new Subject();
  events: CalendarEvent[] = [];
  cancelledEvents: CalendarEvent[] = [];
  activeDayIsOpen: boolean = true;
  showCancelled: boolean = false;

  currentDate?: Date;

  constructor(
    private dialog: MatDialog,
    private reservationService: ReservationService,
    private confirmService: AppConfirmService,
    private sanitizer: DomSanitizer,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.populateEvents();
    this.currentDate = this.viewDate;
    console.log(this.currentDate);
    this.refresh.next();
  }

  actions: CalendarEventAction[] | any[] = [
    {
      label: this.sanitizer.bypassSecurityTrustHtml(
        `<mat-icon class="material-icons"
           style="font-size: 1.4em; text-align: center; vertical-align: middle; line-height: 1em;
                  padding-bottom: 3px; padding-left: 2px;">
             edit
         </mat-icon>`
      ),
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.openDialog('Edit', event);
      },
    },
    {
      label: this.sanitizer.bypassSecurityTrustHtml(
        `<mat-icon class="material-icons"
           style="font-size: 1.4em; text-align: center; vertical-align: middle; line-height: 1em;
                  padding-bottom: 3px;">
             delete
         </mat-icon>`
      ),
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.confirmDelete(event);
      },
    },
  ];

  confirmDelete(event: any) {
    const message: string = `Are you sure you want to cancel event with id ${event.reservationId}?`;
    this.confirmService
      .confirm({ title: 'Confirm Cancel', message })
      .subscribe((confirm) => {
        if (confirm) {
          this.handleEvent('Cancel', event);
          this.refresh.next();
        }
      });
  }

  // Populates Events on calendar based on what room you selected
  populateEvents() {

    this.currentDate = new Date(this.viewDate);

    let tempStartDate = new Date(this.currentDate);
    tempStartDate.setDate(0);
    tempStartDate.setHours(0,0,0,0);
    
    let start:number = tempStartDate.getTime()/1000;

    tempStartDate.setMonth(tempStartDate.getMonth() == 11 ? 0 : tempStartDate.getMonth() + 1)
    let end:number = tempStartDate.getTime()/1000;
    
    this.cancelledEvents = [];
    this.reservationService
      .getReservationsByRoom(this.roomData!, start, end)
      .pipe(
        finalize(() => {
          this.cdr.detectChanges();
        })
      )
      .subscribe(
        (res) => {
          console.log(res);
          this.events = res.map((r) => {
            let actions = undefined;
            let color = colors.gray;
            let draggable = false;
            let resizable = false;
            if (r.reserver === this.authService.decodedJwtDTO?.email) {
              if (r.status === 'cancelled') {
                color = colors.red;
              } else {
                color = colors.blue;
                actions = this.actions;
                draggable = true;
                resizable = true;
              }
            }

            let start = new Date(r.startTime! * 1000);
            let end = new Date(r.endTime! * 1000);
            let event = {
              start,
              end,
              title: `${r.title}: ${start.toLocaleString()} - ${end.toLocaleString()}`,
              actions,
              resizable: {
                beforeStart: resizable,
                afterEnd: resizable,
              },
              draggable,
              color,
              id: r.reservationId,
              reservationTitle: r.title,
              reserver: r.reserver,
              roomId: r.roomId,
              status: r.status,
            };
            if (event.status === 'cancelled') {
              if (!this.cancelledEvents.find((e) => e.id === event.id)) {
                this.cancelledEvents = [...this.cancelledEvents, event];
              }
            }
            return event;
          });
          if(!this.showCancelled){
            this.filterCancelled();
          }
        },
        (error) => {
          console.log(error);
          this.toastr.error('Failed to load reservations');
        }
      );
  }
  

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }

    if (events.length > 0) {
      return;
    }
    // Try to suggest a workable time range.
    const now = new Date();
    let start = new Date(date);
    let end;
    if (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDay() === now.getDay()
    ) {
      if (now.getHours() < 8) {
        start.setHours(8);
      } else if (now.getHours() < 13) {
        start.setHours(13);
      } else {
        start.setHours(now.getHours() + 1);
      }
    } else if (date < now) {
      // Skip if date clicked is in the past.
      return;
    } else {
      start.setHours(8, 0, 0, 0);
    }

    end = new Date(start);
    end.setHours(start.getHours() + 4);
    const eventData = { id: 0, start, end, title: '' };
    this.openDialog('Add', eventData);
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });

    const oldStart = event.start;
    const oldEnd = event.end;

    event.start = newStart;
    event.end = newEnd;

    this.openDialog('Edit', event, {
      cancelCB: () => {
        this.events = this.events.map((e) => {
          if (e.id === event.id) {
            return {
              ...event,
              start: oldStart,
              end: oldEnd,
            };
          }
          return e;
        });
        this.refresh.next();
      },
    });
  }

  openDialog(
    action: string,
    event: CalendarEvent,
    callbacks?: { cancelCB?: any; cb?: any }
  ): void {
    let dialogRef: MatDialogRef<any>;
    if (action !== 'Clicked') {
      dialogRef = this.dialog.open(EditReservationComponent, {
        data: { ...event, action },
      });
    } else {
      dialogRef = this.dialog.open(DisplayReservationComponent, {
        data: { ...event, action },
      });
    }
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.handleEvent(action, result, callbacks);
        this.refresh.next();
      } else {
        callbacks?.cancelCB && callbacks.cancelCB();
      }
    });
  }

  // Run some time related validation checks.
  validateTime(action: string, event: CalendarEvent): boolean {
    let errTitle: string = '';
    if (this.hasTimeConflict(event)) {
      errTitle = 'Time Conflict';
    } else if (!this.isValidTimeRange(event)) {
      errTitle = 'Bad Time Range';
    }
    if (!errTitle) {
      return true;
    }
    this.toastr.error(
      `Failed to ${action.toLowerCase()} reservation`,
      errTitle
    );
    return false;
  }

  handleEvent(action: string, event: any, cb?: any): void {
    if (action === 'Edit') {
      // Validation checks.
      if (!this.validateTime(action, event)) {
        cb?.cancelCB && cb?.cancelCB();
        return;
      }
      const updatedReservation: Reservation = this.eventToReservation(event);
      this.reservationService
        .updateReservation(updatedReservation)
        .pipe(
          finalize(() => {
            cb?.cb && cb?.cb();
            this.cdr.detectChanges();
          })
        )
        .subscribe(
          (result) => {
            const { reserver, start, end } = event;
            event.title = `${result.title}: ${start.toLocaleString()} - ${end.toLocaleString()}`;
            this.events = this.events.map((e) => {
              if (e.id === event.id) {
                return event;
              }
              return e;
            });
            this.toastr.success('Reservation updated');
          },
          (error) => {
            let message = 'Failed to update reservation.';
            let title = '';
            if (error.status === 404) {
              this.toastr.error(message, 'Resource Not Found');
              this.router.navigateByUrl('/not-found');
              return;
            }
            if (error.status === 409) {
              title = 'Time Conflict';
            }
            this.toastr.error(message, title);
          }
        );
    } else if (action === 'Add') {
      // Validation checks.
      if (!this.validateTime(action, event)) {
        cb?.cancelCB && cb?.cancelCB();
        return;
      }
      // Should get reserver name from current user
      event.reserver = '';
      event.roomId = this.roomData!.roomId;
      this.reservationService
        .createReservation(this.eventToReservation(event))
        .pipe(
          finalize(() => {
            cb?.cb && cb?.cb();
            this.cdr.detectChanges();
          })
        )
        .subscribe(
          (result) => {
            if (result) {
              const { reserver, start, end } = event;
              event.id = result.reservationId;
              event.title = `${result.title}: ${start.toLocaleString()} - ${end.toLocaleString()}`;
              event.actions = this.actions;
              event.color = colors.blue;
              event.status = 'reserved';
              event.draggable = true;
              event.resizable = { beforeStart: true, afterEnd: true };
              if (!this.events.find((e) => e.id === event.id)) {
                this.events = [...this.events, event];
              }
            }
            this.toastr.success('Reservation added');
          },
          (error) => {
            let message = 'Failed to create reservation.';
            let title = '';
            if (error.status === 404) {
              this.toastr.error(message, 'Resource Not Found');
              this.router.navigateByUrl('/not-found');
              return;
            }
            if (error.status === 409) {
              title = 'Time conflict';
            }
            this.toastr.error(message, title);
          }
        );
    } else if (action === 'Cancel') {
      this.reservationService
        .cancelReservation(this.eventToReservation(event))
        .pipe(
          finalize(() => {
            cb?.cb && cb?.cb();
            this.cdr.detectChanges();
          })
        )
        .subscribe(
          (result) => {
            event.status = 'cancelled';
            event.color = colors.red;
            event.actions = undefined;
            event.draggable = false;
            event.resizable = { beforeStart: false, afterEnd: false };
            this.events = this.events.map((e) => {
              if (e.id === event.id) {
                return event;
              }
              return e;
            });
            if (!this.cancelledEvents.find((e) => e.id === event.id)) {
              this.cancelledEvents = [...this.cancelledEvents, event];
            }
            this.filterCancelled();
            this.toastr.warning('Reservation cancelled');
          },
          (error) => {
            let message = 'Failed to cancel reservation.';
            if (error.status === 404) {
              this.toastr.error(message, 'Resource Not Found');
              this.router.navigateByUrl('/not-found');
              return;
            }
            this.toastr.error(message);
          }
        );
    }
  }

  eventToReservation(event: any): any {
    console.log(event.reservationTitle)
    return {
      reservationId: Number(event.id),
      reserver: event.reserver,
      startTime: event.start.getTime() / 1000,
      endTime: event.end.getTime() / 1000,
      roomId: event.roomId,
      status: event.status,
      title: event.reservationTitle? event.reservationTitle : event.title
    };
  }

  addEvent(): void {
    // Set new event to start at the next hour mark with a 4-hour block.
    const start = new Date();
    start.setHours(start.getHours() + 1, 0, 0, 0);
    const end: Date = new Date(start);
    end.setHours(end.getHours() + 4);
    const eventData = { id: 0, start, end, title: '' };
    this.openDialog('Add', eventData);
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  checkCurrentDate(){
    if(this.viewDate.getMonth() !== this.currentDate?.getMonth()){
      this.populateEvents();
    }
  }

  closeOpenMonthViewDay() {
    this.checkCurrentDate();
    this.activeDayIsOpen = false;
  }

  toggleCancelled(): void {
    this.showCancelled = !this.showCancelled;
    this.filterCancelled();
  }

  filterCancelled(): void {
    if (!this.showCancelled) {
      this.events = this.events.filter((e: any) => {
        return e.status !== 'cancelled';
      });
    } else {
      this.cancelledEvents.forEach((cancelledEvent) => {
        if (!this.events.find((e) => e.id === cancelledEvent.id)) {
          this.events = [...this.events, cancelledEvent];
        }
      });
    }
    this.refresh.next();
  }

  // Best effort check for time overlap.
  // Otherwise depend on backend to return 409 status.
  hasTimeConflict(event: CalendarEvent): boolean {
    return (
      this.events.find((e: any) => {
        return (
          e.id !== event.id &&
          e.status !== 'cancelled' &&
          ((event.start >= e.start && event.start <= e.end) || // new event starts in existing
            (event.end! >= e.start && event.end! <= e.end) || // new event ends in existing
            (e.start > event.start && e.end < event.end!)) // existing within new
        );
      }) !== undefined
    );
  }

  isValidTimeRange(event: CalendarEvent): boolean {
    if (event.end! < event.start) {
      return false;
    }
    const now = new Date();
    return event.start >= now;
  }

  dragToCreateActive = false;
  weekStartsOn: 0 = 0;

  startDragToCreate(
    segment: WeekViewHourSegment,
    mouseDownEvent: MouseEvent,
    segmentElement: HTMLElement
  ) {
    const dragToSelectEvent: CalendarEvent = {
      id: 0,
      title: 'New event',
      start: segment.date,
      meta: {
        tmpEvent: true,
      },
    };
    this.events = [...this.events, dragToSelectEvent];
    const segmentPosition = segmentElement.getBoundingClientRect();
    this.dragToCreateActive = true;
    const endOfView = endOfWeek(this.viewDate, {
      weekStartsOn: this.weekStartsOn,
    });

    fromEvent(document, 'mousemove')
      .pipe(
        finalize(() => {
          // Create the event data to save.
          const eventData: CalendarEvent = {
            id: 0,
            start: dragToSelectEvent.start,
            end: dragToSelectEvent.end,
            title: 'Drag on date',
          };
          // Callback to run after the openDialog completes.
          // We want to remove the placeholder dragged event in every case.
          const cb = () => {
            this.events = this.events.filter(
              (e) => e.id !== dragToSelectEvent.id
            );
            this.refresh.next();
          };
          // Open the confirm dialog modal.
          this.openDialog('Add', eventData, { cancelCB: cb, cb });

          delete dragToSelectEvent.meta.tmpEvent;
          this.dragToCreateActive = false;
          this.refresh.next();
        }),
        takeUntil(fromEvent(document, 'mouseup'))
      )
      .subscribe((mouseMoveEvent: MouseEvent | any) => {
        const minutesDiff = ceilToNearest(
          mouseMoveEvent.clientY - segmentPosition.top,
          30
        );

        const daysDiff =
          floorToNearest(
            mouseMoveEvent.clientX - segmentPosition.left,
            segmentPosition.width
          ) / segmentPosition.width;

        const newEnd = addDays(addMinutes(segment.date, minutesDiff), daysDiff);
        if (newEnd > segment.date && newEnd < endOfView) {
          dragToSelectEvent.end = newEnd;
        }
        this.refresh.next();
      });
  }
}

import { Component, Input, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { WpServiceService } from 'src/app/services/wp-service.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UtilityService } from 'src/app/services/utility.service';
import { DeleteHolidayComponent } from 'src/app/holiday/delete-holiday/delete-holiday.component';
import { MatTab } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImagePreviewModalPageComponent } from 'src/app/common/image-preview-modal-page/image-preview-modal-page.component';
import { MatDrawer } from '@angular/material/sidenav';
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarView } from 'angular-calendar';
import {Subject} from 'rxjs';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours } from 'date-fns';
import {CalendarLeaveModalComponent} from 'src/app/dashboard/calendar-leave-modal/calendar-leave-modal.component';
import { EventColor } from 'calendar-utils';
import * as moment from 'moment';

const colors: Record<string, EventColor> = {
  red: {
    primary: '#dc4e42',
    secondary: '#FAE3E3',
  },
  yellow: {
    primary: '#f3a112',
    secondary: '#D1E8FF',
  },
  green: {
    primary: '#64c595',
    secondary: '#FDF1BA',
  },
};
@Component({
  selector: 'app-holiday-list',
  templateUrl: './holiday-list.component.html',
  styleUrls: ['./holiday-list.component.scss']
})
export class HolidayListComponent implements OnInit {
  displayedColumns: string[] = ['sr no', 'name', 'start_date', 'end_date', 'description', 'action'];
  empLeave = [];
  holidayList = new MatTableDataSource<any>([]);
  users = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input('reject') reject: any;
  singleLeaveId: any;
  leaveStatus: any;
  pageSizeOptions: number[] = [25, 50, 100];
  userLeaveStatus: any = 2;
  leaveList: any;
  userLeave: any = [];
  userList: any = [];
  searchInput: any;
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent<{ incrementsBadgeTotal: boolean }>[] = [];
  activeDayIsOpen: boolean = false;
  refresh = new Subject<void>();
  modalData: any;
  selectedHoliday: any;
  @ViewChild('drawer1') drawer: MatDrawer;
  loading: boolean = true;

  constructor(
    private _wpService: WpServiceService,
    public _utilityService: UtilityService,
  ) {

    // this._wpService.employeeLeaves().subscribe((res) => {

    //   this.empLeave = JSON.parse(res);
    //   //this.userLeave = this.empLeave
    //   this.userLeave = this.empLeave.filter((leave: any) => {
    //     return leave.status === 2
    //   });

    //   this.users = new MatTableDataSource<any>(this.empLeave);
    //   this.users.paginator = this.paginator;
    //   this.users.sort = this.sort;
    //   console.log('result is', this.users.filteredData);
    //   this.users.filteredData.forEach((res) => {
    //     localStorage.setItem('id', res.user_id)
    //     this.leaveStatus = res.status;
    //   })
    //   this.leaveList = [...new Set(this.users.filteredData.map((item: any) => item.status))];
    //   this.userList = [...this.users.filteredData];
    // });
    this.getHolidaylist();
  }

  ngOnInit(): void { }

  closeDrawer() {
    this.drawer.close();
  }
  openDrawer(data?: any){
    this.selectedHoliday = data;
    this.drawer.open();
  }

  getHolidaylist() {
    this.loading = true;
    this._wpService.getHolidays().subscribe((res) => {
      let holiday = JSON.parse(res);
      this.holidayList = new MatTableDataSource<any>(holiday);
      console.log("this.holidayList :: ", holiday, this.holidayList);
      this.setEvents(holiday);
      this.holidayList.paginator = this.paginator;
      this.holidayList.sort = this.sort;
      this.holidayList.filteredData.forEach((res) => {
        localStorage.setItem('holiday_id', res.id)
      })
      this.loading = false;
    }, err => {
      console.log(err + "holiiiii");
    })
  }

  setEvents(holidayList: any) {
    this.events = [];
    holidayList.forEach((holiday: any) => {
      let obj = {
        start: new Date(holiday.start_date),
        end: new Date(holiday.end_date),
        title: `<b>${holiday.name}</b>
                <br>
                ${holiday.start_date === holiday.end_date ?
                  moment(holiday.start_date).format('DD-MM-YYYY') :
                  moment(holiday.start_date).format('DD-MM-YYYY') + ' to '+ moment(holiday.end_date).format('DD-MM-YYYY')}
                <br>
                ${holiday.description}
                `,
        color: colors['green'],
        meta: {
          incrementsBadgeTotal: true,
        },
        holidayData: holiday
      }
      this.events.push(obj);
    })
    this.refresh.next();
  }

  isExpansionDetailRow = (i: number, row: Object) =>
    row.hasOwnProperty('expandedDetail');
  expandedElement: null;

  applyFilter() {
    if (typeof this.userLeaveStatus === 'string' && this.userLeaveStatus != '') {
      this.userLeaveStatus = Number(this.userLeaveStatus);
    }

    if (this.searchInput && this.userLeaveStatus) {
      this.userLeave = this.empLeave.filter((leave: any) => {
        if (leave.employee_name) return leave.employee_name.toLowerCase().includes(this.searchInput.toLowerCase()) && leave.status === this.userLeaveStatus
      });
    } else if (this.searchInput && !this.userLeaveStatus) {
      this.userLeave = this.empLeave.filter((leave: any) => {
        console.log('event && !this.userleavestatus called ', this.searchInput, this.userLeaveStatus, ' --- ', leave.employee_name)
        if (leave.employee_name) return leave.employee_name.toLowerCase().includes(this.searchInput.toLowerCase())
      });
    } else if (!this.searchInput && this.userLeaveStatus) {
      this.userLeave = this.empLeave.filter((leave: any) => {
        // console.log('!event && this.userleavestatus called ',this.searchInput, this.userLeaveStatus)
        return leave.status === this.userLeaveStatus
      });
    } else {
      // console.log('else called', this.userLeaveStatus, this.searchInput)
      this.userLeave = this.empLeave
    }

    // this.users.filter = filterValue.trim().toLowerCase();
    // console.log('filter data ', filteredData)

    // if (this.users.paginator) {
    //   this.users.paginator.firstPage();
    // }
  }

  onChange(view?: any) {
    console.log('designation value ', this.userLeaveStatus)
    if (this.userLeaveStatus) {
      this.userLeave = this.userList.filter((user: any) => {
        return user.status === this.userLeaveStatus
      })
    }
    else {
      this.userLeave = this.userList
    }
  }

  deleteHoliday(holidayData: any) {
    console.log("USer removed", holidayData);
    this._utilityService.commonDialogBoxOpen(DeleteHolidayComponent).afterClosed().subscribe(confirm => {
      console.log("USER CONFIRM OR NOT", confirm);
      if (confirm == undefined) return
      else if (confirm == 'yes') {

        (this._wpService.removeHoliday(holidayData.id)).subscribe((res: any) => {
          this.getHolidaylist();
          this.closeDrawer();
          console.log('result for delete holiday is', res)
        })
      } else {
        console.log("THIS IS FOR NO OPTION");
      }
    })

  }

  imageAttachment(link: any) {
    const imgStr: string = Object.values(link).toString();

    return imgStr;
  }

  isPdf(file: string) {
    const extension = file.substr((file.lastIndexOf('.') + 1));

    return /(pdf)$/ig.test(extension)
  }
  opePdf(pdfUrl: string) {
    window.open(pdfUrl)
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    console.log('date is ', date, 'event is', events)
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
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    console.log('event Times changed---', event, newStart, newEnd)
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
  }
}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

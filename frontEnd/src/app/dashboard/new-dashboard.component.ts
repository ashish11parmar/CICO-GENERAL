import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { WpServiceService } from '../services/wp-service.service';
import { MatDrawer } from '@angular/material/sidenav';
import { map, Subject } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarMonthViewDay, CalendarView } from 'angular-calendar';
import { EventColor } from 'calendar-utils';
import { DatePipe } from '@angular/common';
import { isSameDay, isSameMonth } from 'date-fns';
import { FormControl, FormGroup } from '@angular/forms';
import { generateDataSet, locationChartDataSet, option, plugins } from '../_models/staticList';
import * as L from 'leaflet';


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
  selector: 'app-new-dashboard',
  templateUrl: './new-dashboard.component.html',
  styleUrls: ['./new-dashboard.component.scss'],
  providers: [DatePipe]
})
export class NewDashboardComponent implements OnInit {
  @ViewChild('dashboardDrawer') dashboardHistoryDrawer: MatDrawer;
  @ViewChild('leaveDetailDrawer') leaveDetailDrawer: MatDrawer;
  map: any;
  userList: any;
  dailyLogsRef: any;
  presentCount = 0;
  absentCount = 0;
  lateCount = 0;
  totalEmployee = 0;
  presentData: any[] = [];
  absentData: any[] = [];
  view: CalendarView = CalendarView.Month;
  isPresentFilter: boolean = false;
  isLateFilter: boolean = false;
  isLateCount: boolean = false;
  isLeaveCount: boolean = false;
  activeDayIsOpen: boolean = false;
  isOvertimeLogLoaded: boolean = false;
  isGenderRatio: boolean = false;
  employeeLocation = false;
  employeeData = false;
  genderData = false;
  regularizeData = false;
  leaveData = false;
  isEmployeetype: boolean = false;
  noData = false;
  isAttendance = false;
  isMapChartLoading = true;
  locationData: any;
  employmentTypes: any;
  genderList: any;
  presentChartData: any;
  lateCountChartData: any;
  regularizeChartData: any;
  leaveCountChartData: any;
  genderChartData: any;
  employeChartData: any;
  locationChartData: any;
  avgChartData: any;
  leaveDetails: any;
  logs: any;
  events: CalendarEvent<{ incrementsBadgeTotal: boolean }>[] = [];
  mapLocationData: any = [];
  holidayEventList: any[] = [];
  regulariseList: any[] = [];
  viewDate: Date = new Date();
  leaveCount = 0;
  selectDate = new Date(moment().toDate());
  refresh = new Subject<void>();
  payload = {
    "pageSize": 25,
    "pageIndex": 0
  };
  timeZone = moment.tz.guess();
  currenDate = moment().utc().format('YYYY-MM-DD');
  range = new FormGroup({
    start: new FormControl(moment().startOf('month').format('YYYY-MM-DD')),
    end: new FormControl(moment().format('YYYY-MM-DD')),
  });

  constructor(
    private _snackBar: MatSnackBar,
    private _wpService: WpServiceService,
    public _cd: ChangeDetectorRef,
    private datepipe: DatePipe,
  ) { }

  // /*********************** || GENERAL VERSIONS CODE START HERE || ***********************/

  async ngOnInit() {
    this.getRegularizeCount();
    this.getAttendance(this.currenDate, 'all', this.payload);
    try {
      this.userList = await this.getUserlist();
    } catch (error) {
      this._snackBar.open('Something went wrong!', 'OK', { duration: 2000 });
    }
  }

  ngOnDestroy() {
    this.dailyLogsRef?.unsubscribe();
  }


  async ngAfterViewInit() {

    this._cd.detectChanges();
    /** @note last 7 days leave count. */
    this.getEmployeeLeaves(moment().subtract(7, 'd').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'), null, true); /** @note Leaves of last 7 days. */
    this.getGenderRatio();
    this.getEmployeeTypeCount();
    this.getLocationsCount();
    this.getHolidaylist();
    let date = this.getDates(null, null, this.view);
    if (date) this.getEmployeeLeaves(date.start_date, date.end_date, 'calendar'); /** @note current month */
  }


  // UTILITY FUNCTIONS

  numSequence(n: number): Array<number> {
    return Array(n);
  }

  opentDashboardHistoryDrawer(filterType: string) {
    if (filterType === 'present') {
      this.isPresentFilter = true;
      this.isLateFilter = false;
    } else if (filterType === 'lateClockIn') {
      this.isLateFilter = true;
      this.isPresentFilter = false;
    }
    else if (filterType === 'regulariseList') {

    }
    this.dashboardHistoryDrawer.open();
  }


  closeDrawer() {
    this.isPresentFilter = false;
    this.isLateFilter = false;
    this.dashboardHistoryDrawer.close();
    this.leaveDetailDrawer.close();
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
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: any): void {
    /** @note if event if for leave then open modal. */
    if (event.leaveData) {
      this.leaveDetails = event.leaveData;
      this.leaveDetails['title'] = event.title;
      this.leaveDetailDrawer.open();
      this._cd.detectChanges();
    }
  }

  filterList(filterType: string) {
    switch (filterType) {
      case 'present':
        return this.presentData
      case 'absent':
        return this.absentData
      default:
        return
    }
  }

  /**
   * @Note Employee location map render.
   */
  initializeMap() {
    if (!this.map) {
      this.map = L.map('map').setView([22.2587, 71.1924], 8);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    }
  }
  // This function will get the present employee clock in lat and lng 
  addEmployeeMarker(present: any) {
    for (let i = 0; i < present.length; i++) {
      // Check if the employee has workLogs
      if (present[i].workLogs && present[i].workLogs.length > 0) {
        let lat = parseFloat(present[i].workLogs[0].lat);
        let lng = parseFloat(present[i].workLogs[0].lng);

        /**@note  Add a small offset based on the index to avoid overlapping markers*/
        let latitude = lat + i * 0.0001;
        let longitude = lng + i * 0.0001;

        let employeeMarker = L.marker([latitude, longitude]);
        let customIcon = L.icon({
          iconUrl: '../assets/icon/orange_marker.png',
          iconSize: [32, 32]
        });
        // Display popup in present user marker.
        let employeeDetails = `
        <div style="display: flex; justify-content: center; flex-direction: column; align-items:center;">
            <img src="${present[i].workLogs[0].attendance_url}" alt="Employee Image" style="width: 60%; border-radius: 50%; height: 50px;">
            <p>${present[i].display_name}</p>
        </div>`;
        employeeMarker.setIcon(customIcon);
        employeeMarker.bindPopup(employeeDetails);
        employeeMarker.addTo(this.map);
      }
    }
  }

  getPastDates(numDays: number) {
    const pastDates = [];
    const today = new Date(); // Get the current date

    for (let i = 0; i < numDays; i++) {
      const pastDate = new Date(today); // Create a new date object for each iteration
      pastDate.setDate(today.getDate() - i - 1); // Subtract the number of days

      pastDates.push(pastDate.toDateString()); // Add the formatted date to the array
    }
    return pastDates.reverse();
  }

  /** @note handle (Approve/Reject) leaves */
  handleLeave(event: any) {
    // this.updateCalendarEvent(event.data, event.event);
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
  }

  onChange(view: any) {
    console.log('viewDate ', view, this.viewDate);
    let date;
    switch (view) {
      case 'week':
        date = this.getDates(this.datepipe.transform(this.viewDate, 'w'), new Date(this.viewDate).getFullYear(), view)
        if (date) this.getEmployeeLeaves(date.start_date, date.end_date, 'calendar');
        console.log('start_date ', date);
        break;
      case 'month':
        date = this.getDates(null, null, view);
        console.log('month moment() ', this.viewDate, date);
        if (date) this.getEmployeeLeaves(date.start_date, date.end_date, 'calendar');
        break;
      case 'day':
        this.getEmployeeLeaves(moment(this.viewDate).format('YYYY-MM-DD'), moment(this.viewDate).format('YYYY-MM-DD'), 'calendar');
        break
    }
  }



  setEvents(leaveList: any, type?: any) {
    console.log("CHECKING holiday list : ", this.holidayEventList);
    /** @note To avoid duplicate values appedning in the calendar events. */
    if (this.events && this.events.length) this.events = [];

    /** @note Adding default Holidays list in the Calendar events. */
    this.events = [...this.holidayEventList];
    let leaveCount = this.leaveCount;
    let dateExist = false;
    this.leaveCount = 0;
    leaveList.forEach((leave: any) => {
      if (type) {
        let obj = {
          // start: subDays(startOfDay(new Date(leave.start_date)), 0),
          start: new Date(leave.start_date),
          // end: addDays(startOfDay(new Date(leave.end_date)), 0),
          end: new Date(leave.end_date),
          title: leave.employee_name + "'s Leave",
          color: ((leave.status === 1) ? colors['green'] : (leave.status === 3) ? colors['red'] : colors['yellow']),
          meta: {
            incrementsBadgeTotal: true,
          },
          leaveData: leave
        }
        this.events.push(obj);
        if (moment(moment(this.selectDate).format('YYYY-MM-DD')).isBetween(leave.start_date, leave.end_date, undefined, '[]')) dateExist = true;
        if (leave.status !== 3 && moment(moment(this.selectDate).format('YYYY-MM-DD')).isBetween(leave.start_date, leave.end_date, undefined, '[]')) {
          console.log('set events leave count ')
          this.leaveCount += 1;
        }
      } else {
        console.log('leave.status ', leave.status, typeof leave.status)
        if (leave.status !== 3) this.leaveCount += 1;
      }
    })
    if (!dateExist && type) this.leaveCount = leaveCount;
    this.refresh.next();
    this.isLeaveCount = true;
    this._cd.detectChanges();
  }

  getDates(w: any, y: any, view: any) {
    switch (view) {
      case 'week':
        let simple = new Date(y, 0, 1 + (w - 1) * 7);
        let dow = simple.getDay();
        let ISOweekStart = simple;
        if (dow <= 4)
          ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else
          ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        let date = moment(ISOweekStart).format('YYYY-MM-DD');

        console.log('ISOweekStart ', ISOweekStart, ISOweekStart.getDate())
        console.log('date.setDate(date.getDate() + 1) ')
        return { start_date: moment(moment(date).subtract(1, 'days')).format('YYYY-MM-DD'), end_date: moment(moment(date).add(5, 'days')).format('YYYY-MM-DD') };
      case 'month':
        let firstDay = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
        let lastDay = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0);
        return { start_date: moment(firstDay).format('YYYY-MM-DD'), end_date: moment(lastDay).format('YYYY-MM-DD') };
      default:
        return;
    }
    // return {start_date: date.setDate(date.getDate() + 1), end_date: date.setDate(date.getDate() + 7)};
  }

  getRegularizeCount() {
    /*** @note this startDate and endDate used for getting startDate of month till endDate(e.g currentDate)  */
    let startDate = `${moment(this.range.value.start).format(
      'YYYY-MM-DD'
    )}T00:00:00`;
    let endDate = `${moment(this.range.value.end).format(
      'YYYY-MM-DD'
    )}T23:59:00`;
    console.log("dateRange: ", startDate, endDate);
    this._wpService.getRegularizeData(startDate, endDate, this.payload).subscribe((data: any) => {
      let _data = data.body;
      if (_data.length === 0) {
        this.regularizeData = true;
      }
      _data.filter((element: any) => {
        if (element['regularization-status'][0] == 3) {
          this.regulariseList.push(element);
        }
      })
      this.isOvertimeLogLoaded = true;
      const last7Days = this.getLast7Days();
      const counts = this.getCounts(_data, last7Days);
      /** @note Regularize payload */
      this._cd.detectChanges();
      this.regularizeChartData = {
        chartType: 'RegularizeChart',
        dataSet: generateDataSet(counts),
        labels: this.getPastDates(7),
        options: {
          plugins: plugins[0],
          scales: option[0]
        },
        chartName: 'bar'
      }
    }, error => {
      this.isOvertimeLogLoaded = true;
    })
  }

  getCounts(data: any[], dates: string[]): number[] {
    const counts = Array(dates.length).fill(0);
    data.forEach(item => {
      const date = this.formatDate(new Date(item.date));
      const index = dates.indexOf(date);
      if (index !== -1) {
        counts[index]++;
      }
    });
    return counts;
  }
  getLast7Days(): string[] {
    const result = [];
    for (let i = 7; i > 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      result.push(this.formatDate(date));
    }
    return result;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Getting holiday from api and display in calendar.
  setHolidayEvent(holidayList: any) {
    holidayList.forEach((holiday: any) => {
      let obj = {
        start: new Date(holiday.start_date),
        end: new Date(holiday.end_date),
        title: `${holiday.name}<br>${holiday.start_date === holiday.end_date ?
          holiday.start_date : moment(holiday.start_date).format('dd-MM-YYYY') + ' to ' + moment(holiday.end_date).format('dd-MM-YYYY')}<br>${holiday.description}`,
        color: colors['yellow'],
        meta: {
          incrementsBadgeTotal: true,
        },
        holidayData: holiday
      }
      this.holidayEventList.push(obj);
      this.events.push(obj);
    })
    this.refresh.next();
  }


  /** *** API calls start *** */

  // Getting Attendance data from WP.
  getAttendance(date: any, status: any, payload: any) {
    this._wpService.getAttendanceList(status, date, payload).subscribe((res: any) => {
      this.initializeMap();
      this.totalEmployee = res.body.length;
      for (let i = 0; i < res.body.length; i++) {
        if (res.body[i].workLogs.length === 0) {
          this.absentData.push(res.body[i]);
          this.absentCount++;
        } else {
          this.presentData.push(res.body[i]);
          this.presentCount++;
          this.addEmployeeMarker(this.presentData);
        }
      }
    }, (error: any) => {
      console.log("ERORR::", error);
    })
  }

  //  Get employees from wordpress
  getUserlist() {
    this.isMapChartLoading = true;
    let userList: any
    return new Promise((resolve, reject) => {
      this._wpService.getEmployeeList().subscribe((res: any) => {
        userList = res.sort((a: any, b: any) => {
          return a.full_name.localeCompare(b.full_name);
        });
        resolve(userList);
      }, error => {
        reject(error);
      })
    });
  }

  // gender ratio funtion.
  getGenderRatio() {
    this._wpService.getGenderRatio().subscribe(res => {
      this.isGenderRatio = true;
      this._cd.detectChanges();
      this.genderList = res;
      if (this.genderList.length === 0) {
        this.genderData = true;
      }
      /**@note gender chart payload start here. */
      const labels: Array<string> = [];
      const data: Array<number> = [];
      this.genderList.filter((elem: any) => {
        if (elem.gender.toLowerCase() != 'total') {
          labels.push(elem.gender);
          data.push(elem.count);
        }
      })
      /**@note gender chart payload.. */
      this._cd.detectChanges();
      this.genderChartData = {
        dataSet: locationChartDataSet(data),
        labels: labels,
        options: {
          plugins: plugins[0],
          scales: option[0]
        },
        chartData: this.genderList,
        chartName: 'pie'
      }
    }, erorr => { this.genderData = true; })
  }


  // Getting leave from WP.
  getEmployeeLeaves(start_date: any, end_date: any, type?: any, weekLeaves?: any) {
    console.log("start_date :: ", start_date);
    console.log("end_date :: ", end_date);
    this._wpService.employeeLeaves1(start_date, end_date).subscribe((res: HttpResponse<any>) => {
      let leaveList = []
      leaveList = JSON.parse(res.body);
      console.log('leaveList', leaveList)
      if (leaveList.length === 0) { this.leaveData = true; }
      if (!weekLeaves) { /** @fixme need to render calendar events. (Users leaves + Holidays) */
        if (leaveList && leaveList.length) {
          this.setEvents(leaveList, type);
        } else this.leaveCount = 0;
      } else {
        let leaveData: any = [];
        let now = moment(start_date).clone();
        while (now.isSameOrBefore(moment(end_date))) {
          let count = 0;
          leaveList.forEach((leave: any) => {
            if (leave.status !== 3 && moment(now.format('YYYY-MM-DD')).isBetween(leave.start_date, leave.end_date, undefined, '[]')) count += 1;
          })
          leaveData.push(count);
          now = now.add(1, 'days');
        }
        this.isLeaveCount = true;
        this._cd.detectChanges();
        /**@note leave chart payload start here. */
        this.leaveCountChartData = {
          dataSet: generateDataSet(leaveData),
          labels: this.getPastDates(7),
          options: {
            borderJoinStyle: 'miter', // "round", "bevel", and "miter"
            borderWidth: '15',
            fill: {
              below: 'rgb(0, 0, 255)'
            },
            plugins: plugins[0],
            scales: option[0],
          },
          chartData: leaveData,
          chartName: 'line'
        }
      }
    })
  }

  // Get employee type wise like full time, partt time, etc.
  getEmployeeTypeCount() {
    this._wpService.getEmployeeTypeCount().subscribe((res: any) => {
      this.isEmployeetype = true;
      this.employmentTypes = res;
      let sum = 0;
      let dataset: any = [];
      let count = 0.2;
      for (const key in this.employmentTypes) {
        count += 0.1;
        dataset.push({
          label: key,
          data: [res[key]],
          backgroundColor: [`rgba(255, 255, 255, ${count.toFixed(1)})`],
          borderColor: ['rgba(255, 255, 255, 0.5)'],
          borderWidth: 1,
          borderCapStyle: 'round',
          borderJoinStyle: 'round',
          fill: {
            target: 'origin',
          }
        });
        sum += Number(this.employmentTypes[key]) /**@note if employee count is 0(ZERO) then display no data image. */
      }
      if (sum === 0) { this.employeeData = true; }
      const labels: Array<string> = ['', '', ''];
      this._cd.detectChanges();
      this.employeChartData = { /**@note Employee type chart payload. */
        labels: labels,
        dataSet: dataset,
        options: {
          indexAxis: 'y',
          layout: {
            padding: {
              bottom: -40
            },
          },
          plugins: plugins[0],
          scales: option[0]
        },
        chartData: dataset,
        chartName: 'bar'
      }
    }, error => { this.employeeData = true; })
  }

  // Get location of company and employee.
  getLocationsCount() {
    this._wpService.getlocations().subscribe((res: any) => {
      this.locationData = res;
      if (res.length === 0) { this.employeeLocation = true; }
      let locationData: any = [];
      let labels: any = [];
      for (const [key, value] of Object.entries(res)) {
        locationData.push(value);
        labels.push(key);
      }
      this._cd.detectChanges();
      /** @note Location payload start here. */
      this.locationChartData = {
        dataSet: locationChartDataSet(locationData),
        labels: labels,
        options: {
          plugins: plugins[0],
          scales: option[0],
          borderAlign: 'center',
          borderDashOffset: 5.5
        },
        chartData: locationData,
        chartName: 'pie'
      }
    }, error => { this.employeeLocation = true; })
  }


  //  Get Holiday list and set evets in the Dashboard calendar.

  getHolidaylist() {
    this._wpService.getHolidays().subscribe((res) => {
      let holiday = JSON.parse(res);
      console.log("DASHBOARD holiday : ", holiday);
      this.setHolidayEvent(holiday)
    }, err => {
      console.log("Error while getting holiday list : ", err);
    })
  }

}

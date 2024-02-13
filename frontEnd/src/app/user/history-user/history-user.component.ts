import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { LogsService } from '../../services/logs.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as moment from 'moment';
import { map } from 'rxjs';
import { IndexedDbService } from 'src/app/services/indexed-db.service';
import { WpServiceService } from 'src/app/services/wp-service.service';

@Component({
  selector: 'history-user',
  templateUrl: './history-user.component.html',
  styleUrls: ['./history-user.component.scss']
})
export class HistoryUserComponent implements OnInit, OnChanges {
  @Input('data') data: any;
  @Input('user') selectedUser: any;
  range = new FormGroup({
    start: new FormControl(moment().utc().startOf('month').format()),
    end: new FormControl(moment().utc().format()),
  });
  start_date = new Date(moment(this.range.value.start).utc().format())
  end_date = new Date(moment(this.range.value.end).utc().format())
  start = moment.utc(this.start_date).toDate();
  end = moment.utc(this.end_date).toDate();
  startDate = moment(this.start).format('YYYY-MM-DD')
  endDate = moment(this.end).format('YYYY-MM-DD')
  dateRange = {
    startDate: this.startDate,
    endDate: this.endDate
  }
  totalDays = 1;
  displayedColumns: string[] = ['date', 'clockIn', 'clockOut', 'breakStart', 'breakStop', 'workDuration', 'breakDuraion', 'status']

  userLogs: any = []
  displayLogs: any = []
  averageTime: any
  avarageBreakTime: any
  totalworkduartion: any;
  isLoading: boolean = true
  dateLogs: any = []
  responseLength = 1;
  setOfDates = new Set()
  currentMonth = moment().format("MM")
  currentYear = moment().format("YYYY")
  dateStart: any = "01/" + this.currentMonth + "/" + this.currentYear
  dateEnd: any = moment().format('DD/MM/YYYY')

  pageSizeOptions = [25, 50, 75, 100]
  payload = {
    "pageSize": this.pageSizeOptions[0],
    "pageIndex": 0
  }
  maxDate = new Date();
  dailyLogsRef: any;
  logServiceRef: any;
  oldDate: string = ''; /** @note to store first log date of user from indexed-db */
  constructor(private _wpService: WpServiceService) { }

  ngOnInit() {
    this.getSingleUserList(this.data.id, this.dateRange, this.payload)

  }

  ngOnChanges(): void {

  }

  ngOnDestroy() {
  }



  // UTILITY
  /**
   * 
   * @param logs Getting logs from WP and  calculates the avg time.
   */
  getAverageHours(logs: any) {
    let totalWorkSeconds = 0;
    let totalBreakSeconds = 0;
    let logsWithWorkData = 0;
    let tottalWorkDuration = 0;

    for (let i = 0; i < logs.length; i++) {
      if (logs[i].workLogs.length > 0) {
        totalWorkSeconds += this.getTotalSeconds(logs[i].workData.workDuration);
        totalBreakSeconds += this.getTotalSeconds(logs[i].workData.breakDuration);
        tottalWorkDuration += this.getTotalSeconds(logs[i].workData.totalDuration)
        logsWithWorkData++;
      }
    }
    if (logsWithWorkData > 0) {
      this.averageTime = this.formatAvgTime(totalWorkSeconds / logsWithWorkData);
      this.avarageBreakTime = this.formatAvgTime(totalBreakSeconds / logsWithWorkData);
      this.totalworkduartion = this.formatAvgTime(tottalWorkDuration)

    } else {
      console.log("No work data found");
    }
  }

  /**
   * 
   * @param total In this they getting total work time and break time.
   * @returns  Total work time and break time in seconds
   */
  formatAvgTime(total: any) {
    let avgFormate = this.convertSecToTime(total);
    return avgFormate.split(':')[0] + ':' + avgFormate.split(':')[1];
  }

  /**
   * 
   * @param time in this they get total work time and break time in seconds
   * @returns After getting second get convert total second 
   */
  getTotalSeconds(time: any) {
    const [hh, mm, ss] = time.split(':');
    const totalSeconds = +hh * 60 * 60 + +mm * 60 + +ss;
    return totalSeconds;
  }

  /**
   * 
   * @param t convert total sec into time.
   * @returns 
   */
  convertSecToTime(t: any) {
    let hours = Math.floor(t / 3600);
    let hh = hours < 10 ? '0' + hours.toString() : hours.toString();
    let min = Math.floor((t % 3600) / 60);
    let mm = min < 10 ? '0' + min.toString() : min.toString();
    let sec = (t % 3600) % 60;
    let ss = sec < 10 ? '0' + sec.toString() : sec.toString();
    let ans = hh + ':' + mm + ':' + ss;
    return ans;
  }


  /** @note if both range start and end are selected then call API. */
  dateRangeChange() {
    if (this.range.value && this.range.value.end) {
      let start_date = new Date(moment(this.range.value.start).utc().format())
      let end_date = new Date(moment(this.range.value.end).utc().format())
      let start = moment.utc(start_date).toDate();
      let end = moment.utc(end_date).toDate();
      let startDate = moment(start).format('YYYY-MM-DD')
      let endDate = moment(end).format('YYYY-MM-DD')
      let dateRange = {
        startDate,
        endDate
      }
      this.getSingleUserList(this.data.id, dateRange, this.payload)
    }
  }

  onPaginate(event: any) {
    // let payload = {
    //   "pageSize": event.pageSize,
    //   "pageIndex": event.pageIndex
    // }
    // let start_date = new Date(moment(this.range.value.start).utc().format())
    // let end_date = new Date(moment(this.range.value.end).utc().format())
    // let start = moment.utc(start_date).toDate();
    // let end = moment.utc(end_date).toDate();
    // let startDate = moment(start).format('YYYY-MM-DD')
    // let endDate = moment(end).format('YYYY-MM-DD')
    // let dateRange = {
    //   startDate,
    //   endDate
    // }
    // this.getSingleUserList('all', dateRange, payload)
  }

  /** *** API calls start *** */

  // /*********************** || GENERAL VERSIONS CODE START HERE || ***********************/

  /**
  * 
  * @param status C=Getting data using status wise in using status params. 
  * @param date   This params take date for the logs.
  * @param payload payload take pageSize and pageIndex in Api.
  */
  getSingleUserList(userId: any, dateRange: any, payload: any) { /**@note This function will get the logs from present and past date. */
    this.isLoading = true;
    this._wpService.getSingleUserList(userId, dateRange).subscribe((data: any) => {
      this.isLoading = false;
      for (let i in data) {
        this.displayLogs.push(data[i]);
      }
      this.getAverageHours(this.displayLogs);
    }, (error: any) => {
      this.displayLogs = []
      this.isLoading = false;
    })
  }
}
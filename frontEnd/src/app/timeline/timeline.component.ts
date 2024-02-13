import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { DialogOverviewExampleDialog } from '../common/log/log.component';
import { LogsService } from '../services/logs.service';
import { UtilityService } from '../services/utility.service';

@Component({
  selector: 'timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {
  @Input('logs') userLogs: any;
  selectDate = new Date(moment().toDate());
  finalLogs: any;
  userName: any = [];
  finalArray: any = [];
  start = false;
  count = 0;
  clockIn: any;
  breakStart: any;
  breakStop: any;
  clockStop: any;
  data: any = []


  constructor(
    public dialog: MatDialog,
    public _utilityService: UtilityService,
    private _logsService: LogsService,

  ) { }

  ngOnInit(): void {
    console.log('userlogs', this.userLogs)
    let currDate = moment(this.selectDate).format('DD/MM/YYYY');
      let logs: any[] = [];
      this._logsService.getLogsFromSheets(null, currDate).subscribe(async (res) => {
        const entries = res.split(',')
        const chunkSize = 8;
        let diffEntry: any[] = [];
        for (let i = 0; i < entries.length; i += chunkSize) {
          const chunk = entries.slice(i, i + chunkSize);
          diffEntry.push(chunk)
        }
        const dataForUniq = JSON.parse(JSON.stringify(diffEntry))
        console.log('dataForUniq', diffEntry)
        const uniq = await this._logsService.getUniwData(dataForUniq);
        console.log('uniquniq', uniq)
        let uniqSingleEntry: any[] = [];
        uniq.forEach((ent: any) => {
          uniqSingleEntry.push(ent[0]);
        })
        console.log('sheet res', uniqSingleEntry, diffEntry);
        this.finalLogs = this._logsService.getFinalLogs(uniqSingleEntry, diffEntry);
        console.log('finalLogs', this.finalLogs);
        // logs = finalLogs.filter((x) => {
        //   x.unixTime = moment(
        //     x.date.concat('|').concat(x.time),
        //     'DD/MM/YYYY|hh:mm:ss'
        //   ).unix();
        //   return x;
        // }).sort((a, b) => {
        //   return a.unixTime - b.unixTime;
        // });
        // console.log('PREVIOUS DATE LOGS', logs);
        this.userLogs.forEach((x:any) => {
          this.finalLogs.forEach((y:any) => {
            if(x.email === y.email){
              if(y.type === 'clock' && y.action === 'start'){
                this.clockIn = 'Clock In: ' + y.time
              }
              if(y.type === 'break' && y.action === 'start'){
                this.breakStart = 'Start Break:' + y.time
              }
              if(y.type === 'break' && y.action === 'stop'){
                this.breakStop = 'Stop Break:' + y.time
              }
              if(y.type === 'clock' && y.action === 'stop'){
                this.clockStop = 'Clock Out:' + y.time
              }
              
              // this.data.push(this.clockIn, this.breakStart, this.breakStop, this.clockStop)
              this.userName.push(x.name, this.clockIn, this.breakStart, this.breakStop, this.clockStop)
            }
          })
        })
        for(let i=0; i<=this.userName.length; i++){
          for(let j=0; j<=this.finalArray.length; j++){
            if(this.userName[i] == this.finalArray[j]){
              this.start = true;
            }
          }
          this.count++;
          if (this.count == 1 && this.start == false) {
            this.finalArray.push(this.userName[i])
          }
          this.start = false;
          this.count = 0;
        }
        console.log('userName', this.finalArray)
      })
  }

  openDialog(type: string, data: any): void {
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '600px',
      data: {
        type,
        data
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  getLocation(latLong: any) {
    return this._utilityService.calcCrow(latLong.lat, latLong.lng);
  }

}

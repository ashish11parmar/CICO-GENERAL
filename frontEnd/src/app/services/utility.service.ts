import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { LogsService } from './logs.service';
import { WpServiceService } from './wp-service.service';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  LOCATIONS: any = [];

  constructor(
    private _snackBar: MatSnackBarModule,
    private _logsService: LogsService,
    private dialog: MatDialog,
    private _wpService: WpServiceService
  ) { }

  commonDialogBoxOpen(
    someComponent: any,
    data?: any,
    width?: any,
    height?: any,
    maxWidth?: any,
    maxHeight?: any
  ) {
    console.log('data value----->', data, width, height, maxWidth, maxHeight);
    if (!data && width && height && maxWidth && maxHeight) {
      console.log('data width height maxWidth maxHeight');
      return this.dialog.open(someComponent, {
        data,
        width: width,
        height: height,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
      });
    } else if (data && width && height) {
      console.log('data width height');
      return this.dialog.open(someComponent, {
        data,
        width: width,
        height: height,
      });
    } else if (data && width) {
      console.log('data width !');
      return this.dialog.open(someComponent, { data, width: width });
    } else if (data) {
      console.log('data !');
      return this.dialog.open(someComponent, { data, width: width });
    } else {
      console.log('data else');
      return this.dialog.open(someComponent);
    }
  }

  closeDialog(dialogRef: any, data?: any) {
    console.log('DATA', data);

    if (data) {
      return dialogRef.close(data);
    } else {
      return dialogRef.close();
    }
  }

  calcCrow(lat: any, long: any) {
    let currentLocation = undefined;
    this.LOCATIONS.forEach((x: any) => {
      // let R = x.radius; // km
      let R = 6371; // km
      let dLat = this.toRad(x.lat - lat);
      let dLon = this.toRad(x.long - long);
      let lat3 = this.toRad(lat);
      let lat4 = this.toRad(x.lat);
      let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2) *
        Math.cos(lat3) *
        Math.cos(lat4);
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      let d = R * c; // calculate the distance
      if (d > 0 && d < x.radius) {
        currentLocation = x.location;
        console.log("LOCATION::", x);

      }
    });
    return currentLocation ? currentLocation : 'Away';
  }



  toRad(value: any) {
    return (value * Math.PI) / 180;
  }

  timeConversion(time: any) {
    const timeString = time;
    const timeParts = timeString.split(":");
    const hours = parseFloat(timeParts[0]);
    const minutes = parseFloat(timeParts[1]);
    const seconds = parseFloat(timeParts[2]);
    const decimalHours = hours + (minutes / 60) + (seconds / 3600);
    console.log(decimalHours);
    return decimalHours;
  }

  downloadFile(data: any, filename: any) {
    return new Promise((resolve, reject) => {
      let csvData = this.convertToCSV(data, ['date', 'clockIn', 'clockOut', 'breakStart', 'breakStop', 'workDuration', 'breakDuraion', 'status']);
      console.log('csvData ', csvData)
      let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
      const payrollCsvData = this.convertToPayrolCSV(data, ['date', 'workDuration']);
      const payrollCsvBlob = new Blob(['\ufeff' + payrollCsvData], { type: 'text/csv;charset=utf-8;' });
      const file = new File([payrollCsvBlob], `${filename}.csv`);
      console.log('datadatadata', data)
      console.log('payrollCsvData ', payrollCsvData)
      const reqData = {
        month: data[0].date.split('/').reverse()[1],
        year: data[0].date.split('/').reverse()[0],
        action: 'process_cico_sheet'
      }

      this._wpService.generatePayroll(reqData, file).subscribe(res => {
        console.log('payroll res structure', res)
        resolve(res);
      }, err => {
        console.log('payroll res error', err)
        reject(err)
      })
    })
  }
  convertToCSV(objArray: any, headerList: any) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = 'S.No,';
    for (let index in headerList) {
      row += headerList[index] + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = (i + 1) + '';
      for (let index in headerList) {
        let head = headerList[index];
        line += ',' + array[i][head];
      }
      str += line + '\r\n';
    }
    return str;
  }
  convertToPayrolCSV(objArray: any, headerList: any) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    // let row = 'S.No,';
    // for (let index in headerList) {
    //   row += headerList[index] + ',';
    // }
    // row = row.slice(0, -1);
    // str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let index in headerList) {
        let head = headerList[index];
        console.log('array[i][head] ', i, head, index, array[i][head])
        if (head == 'workDuration') line += ',' + (this.timeConversion(array[i][head])).toFixed(1);
        else line += moment(array[i][head], 'DD/MM/YYYY').format('DD-MM-YYYY');
      }
      str += line + '\r\n';
    }
    return str;
  }
}

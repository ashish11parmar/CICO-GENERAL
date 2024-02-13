import { Injectable, NgModule } from '@angular/core';
import {
  AngularFirestore,
} from '@angular/fire/compat/firestore';
// import { collection, query, where } from 'firebase/firestore';
import { observable, Observable, Subject } from 'rxjs';
import { flatMap, map, mergeMap, take } from 'rxjs/operators';
import { Logs } from 'src/app/model/data-model.model';
import * as moment from 'moment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { config } from '../config';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root',
})
export class LogsService {
  public logs = new Subject<any>();
  public dateLogs = new Subject<any>();
  public emailLogs = new Subject<any>();


  constructor(private afs: AngularFirestore, private http: HttpClient, private database: AngularFireDatabase) {
    // this.afs.collection('Logs', ref => ref.where('date', '==', '06/09/2022')).snapshotChanges(['added']).subscribe(async (data) => {
    //   let logData: any = []
    //   data.filter((element: any) => {
    //     logData.push(element.payload.doc.data())
    //     return
    //   })
    //   console.log("DATA OF LOGS COLLECTION", logData);
    //   let finalData = await logData.filter((x: any) => {
    //     x.unixTime = moment((x.date).concat("|").concat(x.time), 'DD/MM/YYYY|hh:mm:ss').unix();
    //     return x
    //   }).sort((a: any, b: any) => { return a.unixTime - b.unixTime })
    //   this.logs.next(finalData)
    // })
  }

  getLogChanges(): Observable<any> {
    return this.logs.asObservable();
  }
  getDateLogChanges(): Observable<any> {
    return this.dateLogs.asObservable();
  }

  getEmailLogChanges(): Observable<any> {
    return this.emailLogs.asObservable();
  }

  setTime(logs: Logs): Observable<any> {
    return new Observable<any>((observer) => {
      console.log('in setTime ' + logs);
      this.afs.collection(`Logs`).add(logs);
      observer.next();
    });
  }

  //retrieves filtered data from firestore database and returns observable
  getLogs(date: any): Observable<any> {
    return new Observable<any>((observer) => {
      console.log("inside getLogs(), outside valueChanges()")
      this.afs
        .collection('Logs', (ref) => ref.where('date', '==', date))
        .valueChanges()
        .subscribe((data: any) => {
          console.log("inside database call, logs service in date")
          console.log('dT in swervice', data);

          let finalData = data.filter((x: any) => {
            x.unixTime = moment((x.date).concat("|").concat(x.time), 'DD/MM/YYYY|hh:mm:ss').unix();
            return x
          }).sort((a: any, b: any) => { return a.unixTime - b.unixTime })
          // this.logs.next(finalData)
          this.dateLogs.next(finalData);
          observer.next(finalData);
          observer.complete();
        });
    });
  }

  getLogsFromSheets(user?: any, date?: any, dateRange?: any) {
    let query = 'select A,B,C,D,E,F,G,H';
    // if (date) query += ` where B CONTAINS date '"&TEXT(DATEVALUE("${date}"),"yyyy-mm-dd")&"'`;
    if (date) query += ` where B CONTAINS date '"&TEXT(DATEVALUE("${moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD')}"),"yyyy-mm-dd")&"'`;
    // if (date) query += ` where B CONTAINS date '${moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD')}'`;
    if (dateRange) {
      // let endDate = moment(dateRange.end).add(1, 'd');
      query += ` WHERE (B >= date '"&TEXT(DATEVALUE("${moment(dateRange.start, 'DD/MM/YYYY').format('YYYY-MM-DD')}"),"yyyy-mm-dd")&"' and B <= date '"&TEXT(DATEVALUE("${moment(dateRange.end, 'DD/MM/YYYY').format('YYYY-MM-DD')}"),"yyyy-mm-dd")&"') limit 2000`;
    }
    if ((date && user) || (dateRange && user)) query += ` AND A like '${user}'`;
    if (date == null && dateRange == null && user) query += ` where A like '${user}'`;
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this.http.post(config.logsAppScriptAPI,
      {
        sheet: config.masterAttendanceSheet,
        subsheet: 'testLog',
        query,
        // unique: 'false'
      },
      { headers, responseType: 'text' }
    )
  }

  /**
   * @param dateRange to get Sheets logs response as Array of Objects.
   * @returns Logs list as array of Object.
   */
  getJSONLogs(dateRange: any, email?: string) {
    let query: string = '';
    if (email) { query = `query=select A,B,C,D,E,F,G,H,I where A like '${email}' AND B > date '"%26TEXT(DATEVALUE("${moment(dateRange.start, 'DD/MM/YYYY').format('YYYY-MM-DD')}"),"yyyy-mm-dd")%26"' and B < date '"%26TEXT(DATEVALUE("${moment(dateRange.end, 'DD/MM/YYYY').format('YYYY-MM-DD')}"),"yyyy-mm-dd")%26"'` }
    else { query = `query=select A,B,C,D,E,F,G,H,I where B > date '"%26TEXT(DATEVALUE("${moment(dateRange.start, 'DD/MM/YYYY').format('YYYY-MM-DD')}"),"yyyy-mm-dd")%26"' and B < date '"%26TEXT(DATEVALUE("${moment(dateRange.end, 'DD/MM/YYYY').format('YYYY-MM-DD')}"),"yyyy-mm-dd")%26"'`; }
    let sheet = `sheet=${config.masterAttendanceSheet}`;
    let subsheet = `subsheet=testLog`;
    let URL = `${config.getJSONResponse}?${sheet}&${subsheet}&${query}`
    console.log("URL :: ", URL);
    return this.http.get(URL);
  }

  getRegularizeLogsFromSheets(dateRange: any) {
    // console.log(dateRange)
    let query = `select A,B,C,D,E,F,G,H where A like '${dateRange.email}' AND (B >= date '"&TEXT(DATEVALUE("${moment(dateRange.start, 'DD/MM/YYYY').format("YYYY-MM-DD")}"),"yyyy-mm-dd")&"' and B <= date '"&TEXT(DATEVALUE("${moment(dateRange.end, 'DD/MM/YYYY').format("YYYY-MM-DD")}"),"yyyy-mm-dd")&"')`
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this.http.post(
      config.logsAppScriptAPI,
      {
        sheet: config.masterAttendanceSheet,
        subsheet: 'testLog',
        query,
        unique: 'false'
      },
      { headers, responseType: 'text' }
    )
  }

  getLogsFromFirebase(userId?: any) {
    if (userId) return this.database.list(`Logs/${userId}`);
    else return this.database.list('Logs');
  }
  

  removeLogsFromFirebase(userId: any) {
    return this.database.list(`Logs/${userId}`).remove();
  }

  async addLogs(userId: any, logObj: any) {
    // const logId = this.database.list(`Logs/${userId}`).push(logObj).key;
    this.database.list(`Logs`).snapshotChanges().pipe(take(1))
      .subscribe((list: any) => {
        list.forEach((element: any) => {
          this.database.list(`Logs/${element.key}`, ref => ref.orderByChild('email').equalTo(logObj.email)).snapshotChanges().pipe(take(1)).subscribe((res) => {
            if (res && res.length) {
              console.log('result on email check ', res, element.key)
              let logId = this.database.list(`Logs/${element.key}`).push(logObj).key;
              return logId;
            } else return
          })
        });
      });
    // return logId;
  }

  addToSheets(logs: any) {
    const log = {
      name: logs.email,
      // name: 'bhushan@raoinformationtechnology.com',
      timestamp: `${logs.date} ${logs.time}`,
      type: logs.type,
      action: logs.action,
      lat: "",
      lng: "",
      file: null
    };
    const headers = new HttpHeaders().set('Content-Type', 'text/plain;');
    let sheet;

    // -------------admin side clock out entry should in daily sheet which was in master sheet by mistake, this resolve here-----------------

    let date_formated = moment(logs.date, 'DD/MM/YYYY', true).format("YYYY-MM-DD");

    console.log('date formated...', logs.date, date_formated, moment(date_formated).isSame(moment().format('YYYY-MM-DD')))

    if (logs.date && (moment(logs.date).isSame(moment().format('DD/MM/YYYY')) || moment(moment(logs.date).format('DD/MM/YYYY')).isSame(moment().format('DD/MM/YYYY')) || moment(date_formated).isSame(moment().format('YYYY-MM-DD')))) sheet = config.dailyLogsSheet; else sheet = '17msvVsLoNeEHLPwR_ONFYxoOEebtYvdw6MYgYW81dZc'

    return this.http.post(
      config.logsAppScriptAPI,
      {
        sheet: sheet,
        subsheet: 'testLog',
        log
      },
      { headers, responseType: 'text' }
    );
  }

  getLocation() {
    let query = 'select A,B,C,D';
    let sheet = config.dailyLogsSheet;
    let subsheet = 'location';
    return this.http.get(`${config.getUrl}?sheet=${sheet}&subsheet=${subsheet}&query=${query}`);
  }

  updateUserStatus(userId: string, status: boolean) {
    console.log({ userId, status })
    const userRef = this.afs.collection(`Users`).doc(userId);
    userRef.update({
      status
    }).then(update => {
      console.log(update)
    }).catch(err => {
      console.log(err);
    })
  }

  updateUserBreakStatus(userId: string, status: boolean) {
    console.log({ userId, status })
    const userRef = this.afs.collection(`Users`).doc(userId);
    userRef.update({
      isBreak: status
    }).then(update => {
      console.log(update)
    }).catch(err => {
      console.log(err);
    })
  }

  getUserStatus() {
    return this.afs.collection('Users').stateChanges()
  }

  getUniwData(item: any) {
    console.log('item get unique data ', item)
    const res = item.reduce((a: any[], c: any[]) => {
      if (!a.find((v: any[]) => v[0] === c[0])) {
        a.push(c);
      }
      return a;
    }, []);

    return res;
  }

  getFinalLogs(uniqSingleEntry: any[], diffEntry: any[]) {
    let logs: any[] = [];
    let finalLogs: any[] = [];
    uniqSingleEntry.forEach(user => {
      logs = [];
      diffEntry.forEach(entry => {
        // console.log('calculated Date', moment(new Date(entry[1])).format('DD/MM/YYYY'))
        if (user == entry[0] && user !== '#N/A') {
          logs.push({
            "date": moment(new Date(entry[1])).format('DD/MM/YYYY'),
            "type": entry[2],
            "email": entry[0],
            "action": entry[3],
            "time": `${String(new Date(entry[1]).getHours()).length == 1 ? '0' + new Date(entry[1]).getHours() : new Date(entry[1]).getHours()}:${String(new Date(entry[1]).getMinutes()).length == 1 ? '0' + new Date(entry[1]).getMinutes() : new Date(entry[1]).getMinutes()}:${String(new Date(entry[1]).getSeconds()).length == 1 ? '0' + new Date(entry[1]).getSeconds() : new Date(entry[1]).getSeconds()}`,
            "unixTime": new Date(entry[1]).getTime(),
            "location": {
              "lat": entry[4] && entry[4].length ? Number(entry[4]) : null,
              "lng": entry[5] && entry[5].length ? Number(entry[5]) : null
            },
            "image": entry[6] && entry[6].length ? entry[6] : null,
            "uuid": entry[7], /** @note inorder to handle Regularization request of user. */
            "regularize": entry[8]
          })
        }
      })
      finalLogs.push(...logs);
    })
    return finalLogs
  }

  getAllLogs(email: any): Observable<any> {
    return new Observable<any>((observer) => {
      this.afs
        .collection('Logs', (ref) => ref.where('email', '==', email))
        .get()
        .subscribe((data) => {
          console.log("inside database call, logs service in gmail")
          console.log('inside getAllLogs (for email specific)', data);
          let userLogs: any = []
          data.forEach((doc) => {
            userLogs.push(doc.data())
            console.log("data of .get()", doc.data())
          })
          let finalData = userLogs.filter((x: any) => {
            x.unixTime = moment((x.date).concat("|").concat(x.time), 'DD/MM/YYYY|hh:mm:ss').unix();
            return x
          }).sort((a: any, b: any) => { return a.unixTime - b.unixTime })
          console.log("val of userLogs inside getAllLogs service", userLogs)
          this.emailLogs.next(finalData)
          observer.next(finalData);
          observer.complete();
        });
    });
  }

  async calculateLogs(logsData: any, users: any, currDate?: any, isDashboardHistory = false) {
    let logsArray: any = [];
    let logsArrayPresent: any = [];
    let latePresentLogs: any = [];
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let logs: any = await this.filterLogs(logsData);
    console.log('ALL LOGS TO BE DISPLAY ', users)
    await users.forEach(async (x: any) => {  
      let obj: any = {
        'clockDisable': (!currDate || currDate == moment().format('DD/MM/YYYY')) ? false : true
      };
      let log = logs.filter((y: any) => y.email === x.user_email); // user_email wordpress else email if sheet
      if (log && log.length) {

        // console.log("SINGLE USER WITH THEIR DATA", x.user_email, log)

        // obj['clockDisable'] = (log.length && log[0].date == moment().format('DD/MM/YYYY'))? false : true
        presentCount = presentCount + 1;
        let clockIn = log.filter(
          (x: any) => x.type === 'clock' && x.action === 'start'
        );
        console.log("clockIn : ", clockIn, x);
        obj['clockIn'] = clockIn && clockIn.length ? clockIn[0].time : '-';
        // if((new Date(`${clockIn[0].date} ${clockIn[0].time}`)) > (new Date(`${clockIn[0].date} ${config.clockStartTime}`))) {
        //   lateCount += 1;
        //   obj['isLateClockIn'] = true;
        // }
        if (moment(`${clockIn[0].date} ${clockIn[0].time}`, 'DD/MM/YYYY HH:mm:ss').isAfter(moment(`${clockIn[0].date} ${config.clockStartTime}`, 'DD/MM/YYYY HH:mm:ss'))) {
          lateCount += 1;
          obj['isLateClockIn'] = true;
        }
        let clockOut = log.filter(
          (x: any) => x.type === 'clock' && x.action === 'stop'
        );
        obj['clockOut'] =
          (clockIn && clockIn.length) === (clockOut && clockOut.length)
            ? clockOut[clockOut.length - 1].time
            : '-';
        let breakStart = log.filter((x: any) => x.type === 'break' && x.action === 'start');
        let breakStop = log.filter(
          (x: any) => x.type === 'break' && x.action === 'stop'
        );
        if (
          (breakStart && breakStart.length != 0) ||
          (breakStop && breakStop.length != 0)
        ) {
          obj['breakStart'] =
            breakStart && breakStart.length
              ? breakStart[breakStart.length - 1].time
              : '-';
          obj['breakStop'] =
            (breakStart && breakStart.length) ===
              (breakStop && breakStop.length)
              ? breakStop[breakStop.length - 1].time
              : '-';
        }
        let totalworkTime = await this.calculateofLogs(
          clockIn,
          clockOut,
          'clock'
        );
        let breakTime = await this.calculateofLogs(
          breakStart,
          breakStop,
          'break'
        );
        if (breakTime != '00:00:00') {
          totalworkTime = this.splitTime(totalworkTime, breakTime, '-');
        }
        obj['workDuration'] = totalworkTime;
        obj['breakDuraion'] = breakTime;
        // obj['name'] = x.userName;
        obj['name'] = x.full_name ? x.full_name : x.userName;
        obj['type'] = x.type ? x.type : 'permanent';
        obj['regularize'] = x.regularize ? x.regularize : '-';
        obj['status'] = 'Present';
        obj['isClock'] =
          (clockIn && clockIn.length) === (clockOut && clockOut.length)
            ? false
            : true;
        obj['isBreak'] =
          (breakStart && breakStart.length) === (breakStop && breakStop.length)
            ? false
            : true;
        obj['email'] = x.user_email ? x.user_email : x.email;
        obj['isDisable'] =
          (clockIn && clockIn.length) === (clockOut && clockOut.length)
            ? true
            : false;
        obj['userId'] = x.user_id ? x.user_id : x.id;
        obj['worklogsList'] = isDashboardHistory ? this.getTimelineObj(log) : await this.getAllworklogs([...clockIn, ...breakStop], [...clockOut, ...breakStart], log);
        // logsArray.push(obj);
        // obj['breaklogsList'] = await this.getAllworklogs(breakStart, breakStop, null);
        logsArrayPresent.push(obj)

        /** @note If log is late clock-in. */
        if (obj['isLateClockIn']) latePresentLogs.push(obj);
      } else {
        obj['clockIn'] = '-';
        obj['clockOut'] = '-';
        obj['breakStart'] = '-';
        obj['breakStop'] = '-';
        obj['workDuration'] = '-';
        obj['breakDuraion'] = '-';
        obj['regularize'] = '-';
        obj['name'] = x.full_name ? x.full_name : x.userName;
        obj['status'] = 'Absent';
        obj['email'] = x.user_email ? x.user_email : x.email;
        obj['date'] = '24/08/2022';
        obj['isDisable'] = true;
        obj['userId'] = x.user_id ? x.user_id : x.id;
        obj['worklogsList'] = [];
        obj['breaklogsList'] = [];
        obj['type'] = x.type ? x.type : 'permanent';
        // obj['clockDisable'] = false;
        absentCount = absentCount + 1;
        logsArray.push(obj);
      }
    });
    console.log('logsArraylogsArray', JSON.parse(JSON.stringify(logsArray)))
    return {
      logsArray: logsArray,
      logPresent: logsArrayPresent,
      present: presentCount,
      absentCount: absentCount,
      lateCount: lateCount,
      latePresentLogs: latePresentLogs /** @note Late clock-in logs. */
    };
  }

  filterLogs(log: any) {
    // console.log("THIS IS THE FINAL LOGS LIST DATA", log)
    const logsLength = log.length;
    let finalList: any = [];
    for (let i = 0; i < logsLength; i++) {

      const element = finalList.find((x: any) => {
        if (x && x.email === log[i].email && x.type === log[i].type && x.time === log[i].time) return x
      })
      // console.log("THIS IS THE FINAL LOGS LIST DATA", element)
      if (element === undefined) finalList.push(log[i])

      // switch (true) {
      //   case (log[i]['type'] === 'clock' && log[i]['action'] === 'start'):
      //     const element: any = finalList.find((x: any) => {if (x && x.time === log[i].time) return x});
      //     console.log("THIS IS THE SINGLE ELEMENT FIND", element)
      //     if (element === undefined) {
      //       finalList.push(element);
      //     }
      //     break;
      //   case (log[i]['type'] === 'break' && log[i]['action'] === 'start'):
      //     const element1: any = finalList.find((x: any) => {if (x && x.time === log[i].time) return x});
      //     // console.log("THIS IS THE SINGLE ELEMENT FIND", element1)
      //     if (element1 === undefined) {
      //       finalList.push(element1);
      //     }
      //     break;
      //   case (log[i]['type'] === 'break' && log[i]['action'] === 'stop'):
      //     const element2: any = finalList.find((x: any) => {if (x && x.time === log[i].time) return x});
      //     // console.log("THIS IS THE SINGLE ELEMENT FIND", element2)
      //     if (element2 === undefined) {
      //       finalList.push(element2);
      //     }
      //     break;
      //   case (log[i]['type'] === 'clock' && log[i]['action'] === 'stop'):
      //     const element3: any = finalList.find((x: any) => {if (x && x.time === log[i].time) return x});
      //     // console.log("THIS IS THE SINGLE ELEMENT FIND", element)
      //     if (element3 === undefined) {
      //       finalList.push(element3);
      //     }
      //     break;
      // }
    }
    return finalList
  }


  async calculateLogsofUser(datesLogs: any) {
    let logsArray: any = [];
    let totalWorkingHours: any = '00:00:00';
    let totalBreakHours: any = '00:00:00';
    datesLogs.filter(async (x: any) => {
      let obj: any = {};
      let log = x.logs;
      console.log("THIS IS THE MAIN LOGS LIST", x.logs);

      if (log && log.length) {
        let clockIn = log.filter(
          (x: any) => x.type === 'clock' && x.action === 'start'
        );
        // console.log('hvgvmvhsmvdbashdvasdb', clockIn)
        obj['clockIn'] = clockIn && clockIn.length ? clockIn[0].time : '-';
        let clockOut = log.filter(
          (x: any) => x.type === 'clock' && x.action === 'stop'
        );
        console.log('hvgvmvhsmvdbashdvasdb', clockOut)
        obj['clockOut'] =
          (clockIn && clockIn.length) === (clockOut && clockOut.length)
            ? clockOut[clockOut.length - 1].time
            : '-';
        let breakStart = log.filter(
          (x: any) => x.type === 'break' && x.action === 'start'
        );
        let breakStop = log.filter(
          (x: any) => x.type === 'break' && x.action === 'stop'
        );
        if (
          (breakStart && breakStart.length != 0) ||
          (breakStop && breakStop.length != 0)
        ) {
          obj['breakStart'] =
            breakStart && breakStart.length
              ? breakStart[breakStart.length - 1].time
              : '-';
          obj['breakStop'] =
            (breakStart && breakStart.length) ===
              (breakStop && breakStop.length)
              ? breakStop[breakStop.length - 1].time
              : '-';
        } else {
          obj['breakStart'] = '-';
          obj['breakStop'] = '-';
        }
        let totalworkTime = await this.calculateofLogs(
          clockIn,
          clockOut,
          'clock'
        );
        let breakTime = await this.calculateofLogs(
          breakStart,
          breakStop,
          'break'
        );
        if (breakTime != '00:00:00') {
          totalworkTime = this.splitTime(totalworkTime, breakTime, '-');
        }
        console.log('totalWorkingHourstotalWorkingHours', totalWorkingHours, totalworkTime, log[0].date, clockIn, clockOut, breakStart, breakStop);
        totalWorkingHours = this.splitTime(
          totalWorkingHours,
          totalworkTime,
          '+'
        );
        let regularize = log[0].regularize;
        totalBreakHours = this.splitTime(totalBreakHours, breakTime, '+');
        obj['totalHours'] = totalWorkingHours;
        obj['totalBreakHours'] = totalBreakHours;
        obj['workDuration'] = totalworkTime;
        obj['breakDuraion'] = breakTime;
        obj['date'] = x.date;
        obj['regularize'] = regularize ? regularize : "-";
        obj['status'] = 'Present';
        obj['isClock'] =
          (clockIn && clockIn.length) === (clockOut && clockOut.length)
            ? false
            : true;
        obj['isBreak'] =
          (breakStart && breakStart.length) === (breakStop && breakStop.length)
            ? false
            : true;
        obj['isDisable'] =
          (clockIn && clockIn.length) === (clockOut && clockOut.length)
            ? true
            : false;
        // obj['worklogsList'] = clockIn.length || clockOut.length ? await this.getAllworklogs([...clockIn, ...breakStop], [...clockOut, ...breakStart], log) : [];
        obj['worklogsList'] = clockIn.length || clockOut.length ? await this.getTimelineObj(log) : [];
        // obj['breaklogsList'] = breakStart.length && breakStop.length ? await this.getAllworklogs(breakStart, breakStop, log) : [];
      }
      logsArray.push(obj);
    });
    // console.log("FINAL OUTOUT OF LOGS", totalWorkingHours);
    return await logsArray;
  }

  getTimelineObj(log: any) {
    let finalList = [];
    const logsLength = log.length;
    for (let i = 0; i < logsLength; i++) {
      switch (true) {
        case (log[i]['type'] === 'clock' && log[i]['action'] === 'start'):
          const element = finalList.find((x: any) => x.time === log[i].time && x.title === 'Clocked in');
          if (element === undefined) {
            finalList.push({
              time: log[i].time,
              align: 'left',
              title: 'Clocked in',
              icon: 'arrow_forward',
              key: 'clock-in',
              url: (log[i].image || log[i].url) ? (log[i].image && !log[i].image.includes('base64') ? `https://drive.google.com/thumbnail?id=${log[i].image.split('/')[5]}` : log[i].image && log[i].image.includes('base64') ? log[i].image : log[i].url) : null,
              location: log[i].location
            });
          }
          break;
        case (log[i]['type'] === 'break' && log[i]['action'] === 'start'):
          const element1 = finalList.find((x: any) => x.time === log[i].time && x.title === 'Break start');
          // console.log("THIS IS THE SINGLE ELEMENT FIND", element)
          if (element1 === undefined) {
            finalList.push({
              time: log[i].time,
              align: 'left',
              title: 'Break start',
              icon: 'fastfood',
              key: 'break-start',
              url: (log[i].image || log[i].url) ? (log[i].image && !log[i].image.includes('base64') ? `https://drive.google.com/thumbnail?id=${log[i].image.split('/')[5]}` : log[i].image && log[i].image.includes('base64') ? log[i].image : log[i].url) : null,
              location: log[i].location
            });
          }
          break;
        case (log[i]['type'] === 'break' && log[i]['action'] === 'stop'):
          const element2 = finalList.find((x: any) => x.time === log[i].time && x.title === 'Break end');
          // console.log("THIS IS THE SINGLE ELEMENT FIND", element)
          if (element2 === undefined) {
            finalList.push({
              time: log[i].time,
              align: 'left',
              title: 'Break end',
              icon: 'restore',
              key: 'break-stop',
              url: (log[i].image || log[i].url) ? (log[i].image && !log[i].image.includes('base64') ? `https://drive.google.com/thumbnail?id=${log[i].image.split('/')[5]}` : log[i].image && log[i].image.includes('base64') ? log[i].image : log[i].url) : null,
              location: log[i].location
            });
          }
          break;
        case (log[i]['type'] === 'clock' && log[i]['action'] === 'stop'):
          const element3 = finalList.find((x: any) => x.time === log[i].time && x.title === 'Clocked out');
          // console.log("THIS IS THE SINGLE ELEMENT FIND", element)
          if (element3 === undefined) {
            finalList.push({
              time: log[i].time,
              align: 'left',
              title: 'Clocked out',
              icon: 'arrow_downward',
              key: 'clock-out',
              url: (log[i].image || log[i].url) ? (log[i].image && !log[i].image.includes('base64') ? `https://drive.google.com/thumbnail?id=${log[i].image.split('/')[5]}` : log[i].image && log[i].image.includes('base64') ? log[i].image : log[i].url) : null,
              location: log[i].location
            });
          }
          break;
      }
    }
    return finalList;
  }

  getBrakeTime(clockIn: any, clockOut: any, workDuration: any) {
    let startTime = moment(`${clockIn.time}`, "HH:mm:ss");
    let endTime = moment(`${clockOut.time}`, "HH:mm:ss");
    const totalhrs = moment.utc(endTime.diff(startTime)).format("HH");
    const totalmin = moment.utc(endTime.diff(startTime)).format("mm");
    const totalsec = moment.utc(endTime.diff(startTime)).format("ss");
    const totalDuration = [totalhrs, totalmin, totalsec].join(':');
    startTime = moment(`${workDuration}`, "HH:mm:ss");
    endTime = moment(`${totalDuration}`, "HH:mm:ss");
    const breakhrs = moment.utc(endTime.diff(startTime)).format("HH");
    const breakmin = moment.utc(endTime.diff(startTime)).format("mm");
    const breaksec = moment.utc(endTime.diff(startTime)).format("ss");
    const breakDuration = [breakhrs, breakmin, breaksec].join(':');
    return breakDuration.includes('Invalid') ? '-' : breakDuration;
  }

  calculateofLogs(inList: any, outList: any, type: string) {
    let date = new Date();
    let currentTime = date.toLocaleTimeString();
    let newTime = moment().format('HH:mm:ss');
    if (inList && inList.length && outList && !outList.length) {
      let calculateTime = this.timeGap(inList[0].time, newTime);
      return calculateTime;
    } else {
      let totalTime = '00:00:00';
      for (let i = 0; i < inList.length; i++) {
        let diffTime = this.timeGap(
          inList[i].time,
          outList[i] && outList[i].time ? outList[i].time : newTime
        );
        totalTime = this.splitTime(totalTime, diffTime, '+');
      }
      return totalTime;
    }
  }

  getAllworklogs(clockIn: any, clockOut: any, log: any) {
    let finalList = [];
    // let obj = {
    //   clockIn: clockIn[i].time,
    //   clockOut: clockOut[i] != undefined ? clockOut[i].time : '-',
    // };
    // finalList.push(obj);
    clockIn = clockIn.sort((a: any, b: any) => a.time.localeCompare(b.time));
    clockOut = clockOut.sort((a: any, b: any) => a.time.localeCompare(b.time));

    console.table('Clock IN', clockIn)
    console.table('Clock Out', clockOut)

    for (let i = 0; i < clockIn.length; i++) {
      console.log('CLOCK OUT DATA', clockOut[i]);
      let obj: any = {}
      if (i == 0) {
        obj = {
          clockIn: {
            time: clockIn[i].time,
            location: log && log[i] && log[i].location && log[i].location.lat ? log[i].location : null,
            // image: log && log[i] && log[i].image ? `https://drive.google.com/thumbnail?id=${log[i].image.split('/')[5]}` : null
            image: log && log[i] && (log[i].image || log[i].url) ? (log[i].image && !log[i].image.includes('base64') ? `https://drive.google.com/thumbnail?id=${log[i].image.split('/')[5]}` : log[i].image && log[i].image.includes('base64') ? log[i].image : log[i].url) : null
          },
          clockOut: {
            time: clockOut[i] != undefined ? clockOut[i].time : '-',
            location: log && log[i + 1] && log[i + 1].location && log[i + 1].location.lat ? log[i + 1].location : null
          },
        };
      } else {
        obj = {
          clockIn: {
            time: clockIn[i].time,
            location: log && log[i + i] && log[i + i].location && log[i + i].location.lat ? log[i + i].location : null,
            // image: log && log[i + i] && log[i + i].image ? `"https://drive.google.com/thumbnail?id=${log[i + i].image.split('/')[5]}` : null
            image: log && log[i + 1] && (log[i + 1].image || log[i + 1].url) ? (log[i + 1].image && !log[i + 1].image.includes('base64') ? `https://drive.google.com/thumbnail?id=${log[i + 1].image.split('/')[5]}` : log[i + 1].image && log[i + 1].image.includes('base64') ? log[i + 1].image : log[i + 1].url) : null
          },
          clockOut: {
            time: clockOut[i] != undefined ? clockOut[i].time : '-',
            location: log && log[i + i + 1] && log[i + i + 1].location && log[i + i + 1].location.lat ? log[i + i + 1].location : null
          },
        };
      }
      // if (log && log[i] && log[i].location && log[i].location.lat) obj['location'] = log[i].location;
      // if (log && log[i] && log[i].image) obj['image'] = log[i].image;
      finalList.push(obj);
    }
    return finalList;
  }

  splitTime(totalTime: any, diffTime: any, math: any) {
    let finalresult;
    let totalSeconds = this.getTotalSeconds(totalTime);

    let breakSeconds = this.getTotalSeconds(diffTime);
    if (math === '+') {
      finalresult = this.convertSecToTime(totalSeconds + breakSeconds);
    } else {
      if (totalSeconds > breakSeconds) {
        finalresult = this.convertSecToTime(totalSeconds - breakSeconds)
      } else {
        finalresult = this.convertSecToTime(breakSeconds - totalSeconds)
      }
    }
    // console.log("THIS IS TOTAL TIME", totalTime, diffTime, finalresult);
    return finalresult;
  }

  getTotalSeconds(time: any) {
    const hms = time;
    const [hh, mm, ss] = hms.split(':');
    const totalSeconds = +hh * 60 * 60 + +mm * 60 + +ss;
    return totalSeconds;
  }

  getTimeInSeconds(str: any) {
    let curr_time = [];

    curr_time = str.split(':');
    for (let i = 0; i < curr_time.length; i++) {
      curr_time[i] = parseInt(curr_time[i]);
    }

    let t = curr_time[0] * 60 * 60 + curr_time[1] * 60 + curr_time[2];

    return t;
  }

  // Function to convert seconds back to hh::mm:ss
  // format
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

  // Function to find the time gap
  timeGap(st: any, et: any) {

    let t1 = this.getTimeInSeconds(st);
    let t2 = this.getTimeInSeconds(et);

    let time_diff = t1 - t2 < 0 ? t2 - t1 : t1 - t2;

    return this.convertSecToTime(time_diff);
  }

  //functions to calculate few things
  calcDuration(start: string, end: string) {
    console.log('WHAT IS START AND END', start, end);

    // start time and end time
    let startTime = moment(start, 'hh:mm:ss');
    let endTime = moment(end, 'hh:mm:ss');
    // calculate total duration
    let duration = moment.duration(endTime.diff(startTime)).asSeconds();
    console.log(duration);
    let hours = Math.floor(duration / 3600);
    let minutes = Math.floor((duration / 60) % 60);
    let seconds = Math.floor(duration % 60);

    console.log('calc duration', hours, minutes, seconds);

    // let ret = hours+" : "+minutes+" : "+seconds+" ";
    return [hours, minutes, seconds];
  }

  /**
   * @param regularizationPaylod to update users logs.
   * @returns
   */
  regularizeReq(regularizationPaylod: any) {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain');
    regularizationPaylod['masterSheet'] = config.masterAttendanceSheet
    return this.http.post(config.regularizationScriptUrl,
      regularizationPaylod,
      { headers }
    )
  }

  /**
   * @note inorder to get latest logs from particuler date
   * @param startDate 
   * @returns 
   */
  getLatestLogsFromSheet(startDate: string) {
    let query = `select A,B,C,D,E,F,G,H WHERE B > date '"&TEXT(DATEVALUE("${moment(startDate, 'DD/MM/YYYY').format('YYYY-MM-DD')}"),"yyyy-mm-dd")&"' limit 2000`
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this.http.post(config.logsAppScriptAPI,
      {
        sheet: config.masterAttendanceSheet,
        subsheet: 'testLog',
        query,
      },
      { headers, responseType: 'text' }
    )
  }
}

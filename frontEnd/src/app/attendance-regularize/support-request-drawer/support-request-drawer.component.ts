import { Component, EventEmitter, Input, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { LogsService } from 'src/app/services/logs.service';
import { config } from 'src/app/config';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegularizeConfirmModalComponent } from 'src/app/common/regularize-confirm-modal/regularize-confirm-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { WpServiceService } from '../../services/wp-service.service';
import { da } from 'date-fns/locale';
import { IndexedDbService } from 'src/app/services/indexed-db.service';

@Component({
  selector: 'app-support-request-drawer',
  templateUrl: './support-request-drawer.component.html',
  styleUrls: ['./support-request-drawer.component.scss']
})
export class SupportRequestDrawerComponent implements OnInit {
  @Input('requestDetail') requestDetail: any;
  @Output() requestComplete: EventEmitter<any> = new EventEmitter<any>();

  public regularizeconfig: FormGroup;
  isLoading: boolean;
  regularizationObj: any = {}; /** @note final regularization object */
  data: any;
  supportData: any;
  userEmail: string = "";
  userDetails: any;
  startDate: string = '';
  endDate: string = '';
  dialogRef: any;
  deleteLog: string[] = []
  regularizeRequestData: any
  btnstate: boolean = false;
  logValid = true
  selectedIndex: number = -1
  isEditIndex: number = -1

  constructor(
    private _logService: LogsService,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private _wpService: WpServiceService,
    private _indexDB: IndexedDbService,
  ) { }

  ngOnInit(): void {
    /** @note status wise button display */
    // let configStatus = this.regularizeRequestData.status;
    // if(configStatus === "Pending") {
    //   this.btnstate = true;
    // }
  }





  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['requestDetail'].currentValue) {
      console.log(changes['requestDetail'].currentValue);
      this.regularizeRequestData = changes['requestDetail'].currentValue
      const date1 = changes['requestDetail'].currentValue.date;
      const date2 = changes['requestDetail'].currentValue.date;
      this.userDetails = changes['requestDetail'].currentValue
      this.userEmail = changes['requestDetail'].currentValue.email;
      this.startDate = moment(date1).format("DD/MM/YYYY")
      this.endDate = moment(date2).add(1, 'd').format("DD/MM/YYYY") /** @note date increase by 1 day */
      this.getRegularizeLogsFromSheets(this.startDate, this.endDate, this.userEmail);
      console.log("REGULARIZE REQUEST CHANGES", this.regularizeRequestData , this.regularizeRequestData.content.rendered)
    }
  }


  // FORM CONTROL

  createConfigFormGroup(data: any) {
    return new FormGroup({
      action: new FormControl(data.action),
      date: new FormControl(data.date),
      email: new FormControl(data.email),
      image: new FormControl(data.image),
      lat: new FormControl(data.location.lat),
      lng: new FormControl(data.location.lng),
      time: new FormControl(data.time),
      type: new FormControl(data.type),
      uuid: new FormControl(data.uuid),
    })
    console.log("this.regularizeconfig : ", this.regularizeconfig);
  }


  get regularizationFormGroup() {
    return (this.regularizeconfig.get('regularization') as FormArray);
  }

  // UTILITY



  /** @note initialization the form */
  initializeFormGroup() {
    this.regularizeconfig = this.fb.group({
      regularization: this.fb.array([]),
      time: ['', [Validators.required, Validators.pattern("^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$")]]
    });
    /**
     * @note Adding Dynamic formGroup.
     */
    for (let i = 0; i < this.data.length; i++) {
      (this.regularizeconfig.get('regularization') as FormArray).push(this.createConfigFormGroup(this.data[i]));
      /** @note by default all the reminders are disabled. */
      let regularizationFormLength = this.regularizeconfig.get('regularization') as FormArray
      (this.regularizeconfig.get('regularization') as FormArray).controls[regularizationFormLength.length - 1].disable();
      console.log("this.regularizeconfig : ", this.regularizeconfig);
    }
  }

  async formatLogs(diffEntry: any) {
    const dataForUniq = JSON.parse(JSON.stringify(diffEntry))
    const uniq = await this._logService.getUniwData(dataForUniq);
    let uniqSingleEntry: any[] = [];
    uniq.forEach((ent: any) => {
      uniqSingleEntry.push(ent[0]);
    })
    const finalLogs = this._logService.getFinalLogs(uniqSingleEntry, diffEntry);
    console.log('f', finalLogs);
    this.data = finalLogs;
    this.initializeFormGroup();
  }
  /**@note update function start here*/
  updateFormGroup(i: any) {
    let configures = this.regularizeconfig.get('regularization') as FormArray;
    if (this.regularizeRequestData.status === "Pending") {
      if (configures.controls[i].status === "DISABLED") {
        configures.controls[i].enable();
        this.isEditIndex = i
      } else {
        configures.controls[i].disable();
        this.isEditIndex = -1
      }
    } else {
      configures.controls[i].disable();
    }
    const configureLength = configures.controls.length
    for (let j = 0; j < configureLength; j++)   if (j !== i) configures.controls[j].disable()
  }

  /**@note delete function start here*/
  deleteFormGroup(i: any) {
    let configObj = (this.regularizeconfig.get('regularization') as FormArray);
    let deletedUuid = (this.regularizeconfig.get('regularization') as FormArray).controls[i].value.uuid;
    if (this.regularizeRequestData.status === 'Pending') {
      this.deleteLog.push(deletedUuid);
      configObj.removeAt(i);
    } else {
      console.log("delete is not supported");

    }

  }

  /**@note Set defaulttime store data in object */
  async generateDefaultPayload() {
    try {
      let formGroupLength = (this.regularizeconfig.get('regularization') as FormArray).length;
      let deleteUuidList = [];
      for (let i = 0; i < formGroupLength; i++) {
        let configObj = (this.regularizeconfig.get('regularization') as FormArray).controls[i];
        deleteUuidList.push(configObj.value.uuid);
      }
      this.regularizationObj['removeLogs'] = deleteUuidList;
      this.regularizationObj['updatedLogs'] = await this.generateDefaultLogsData();
      console.log('formGroup uuid array :, ', this.regularizationObj);
      this.regularizeRequst();
    } catch (err) {
      console.log("Erro while sending regularization data : ", err);
    }
  }
  generateDefaultLogsData() {
    let newLogsArray = [];
    for (let i = 0; i < config.regularizationShiftTime.length; i++) {
      let obj = {
        name: this.userEmail,
        timestamp: `${this.startDate} ${config.regularizationShiftTime[i]}`,
        type: config.regularizationShiftStatus[i].split('-')[0],
        action: config.regularizationShiftStatus[i].split('-')[1],
        lat: config.defaultLocation[0],
        lng: config.defaultLocation[1],
        url: i === 0 ? this.data[0].image : "",
      }
      newLogsArray.push(obj);
    }
    return Promise.all(newLogsArray);
  }

  /**@note Set defaulttime in regularize... */
  setDefaultRegularizationTime() {
    this.generateDefaultPayload();
    // let userID: any = [];
    // this._indexDB.getDataByEmailAndDateRange(this.userEmail).then(async (data: any) => {
    //   let userDate = moment(this.userDetails.date).format('DD/MM/YYYY');
    //   for (let i = 0; i < data.length; i++) {
    //     const element = data[i].date;
    //     if (userDate === element) {
    //       userID.push(data[i].uuid);
    //       let ans = await this._indexDB.deleteRegularizeOldData(userID);
    //     }
    //   }
    //   let startDate = moment(this.userDetails.date).format("DD/MM/YYYY")
    //   let endDate = moment(this.userDetails.date).add(1, 'd').format("DD/MM/YYYY")
    //   console.log("date and email", startDate, endDate, this.userEmail);
    //   this.getRegularizeLogsFromSheets(startDate, endDate, this.userEmail);
    // })
  }

  /**@note Save data in regularize... */
  setRegularizeSave() {
    console.log("setRegularizeSave : ", this.regularizeconfig);
    this.generateNewLogsObject(this.regularizeconfig.getRawValue()['regularization']);
  }

  generateNewLogsObject(formValue: any) {
    let newLogs = [];
    for (var i = 0; i < formValue.length; i++) {
      let log = formValue[i];
      console.log("SINGLE LOG DATA", log)
      /** @note Delete UUID with remaining regularization logs. */
      this.deleteLog.push(log.uuid);
      let obj = {
        name: this.userEmail,
        timestamp: `${log.date} ${log.time}`,
        type: log.type,
        action: log.action,
        lat: log && log.lat ? log.lat : "",
        lng: log && log.lng ? log.lng : "",
        url: log && log.image ? log.image : "",
      }
      newLogs.push(obj);
    }
    this.regularizationObj['removeLogs'] = this.deleteLog;
    this.regularizationObj['updatedLogs'] = newLogs;
    console.log("THIS IS FINAL OBJ", this.regularizationObj)
    this.regularizeRequst(true);
  }

  rejectRegularizeRequest() {
    this.dialog.open(RegularizeConfirmModalComponent, {
      data: {
        headerTitle: 'Reject regularization request',
        headerIcon: 'alarm_on',
        regularizeContetnt: 'Are you sure you want to reject timelogs?'
      }
    }).afterClosed().subscribe((result: any) => {
      console.log("THIS IS THE RESULT AFTER UPDATE", result)
      if (result) {
        this.updateRegularizeRequest('rejected')
      }
    })

  }


  /**@note user can not add char in date input field */
  numberOnly(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 58)) {
      return false;
    }
    return true;
  }

  validateLogs(event: any, index: number) {
    let regex = new RegExp(/^([0-9][0-9]):[0-5][0-9]:[0-5][0-9]$/g)
    this.logValid = regex.test(event.target.value);
    if (!this.logValid) {
      this.selectedIndex = index
    } else {
      this.selectedIndex = -1
    }
  }

  // API CALL
  getRegularizeLogsFromSheets(startdate: any, enddate: any, email: any) {
    let daterange = {
      start: startdate,
      end: enddate,
      email: email
    }
    /** @note Start skeleton loading. */
    this.isLoading = true;
    this._logService.getRegularizeLogsFromSheets(daterange).subscribe((data) => {
      this.isLoading = false; /** @note Stop skeleton loading. */
      const entries = data.split(',')
      console.log("entries : ", entries);
      const chunkSize = 8;
      let diffEntry: any[] = [];
      for (let i = 0; i < entries.length; i += chunkSize) {
        const chunk = entries.slice(i, i + chunkSize);
        diffEntry.push(chunk)
      }
      console.log("diffentry", diffEntry);
      this.formatLogs(diffEntry);
    }, error => {
      this.isLoading = false; /** @note Stop skeleton loading. */
      console.log("Error while getting sheets data : ", error);
    })
  }
  /**
   * @note AppScript API call.
   * @param isNewLogs is for changing Alert box header and conect dynamically for regularize logs.
   * (Default logs, new logs)
   */
  regularizeRequst(isNewLogs: boolean = false) {
    this.dialog.open(RegularizeConfirmModalComponent, {
      data: {
        headerTitle: isNewLogs ? 'Set new regularization logs' : "Set defualt shift time",
        headerIcon: 'alarm_on',
        regularizeContetnt: isNewLogs ? 'Are you sure you want to add new timelogs?' : 'Are you sure you want to set a default time?'
      }
    }).afterClosed().subscribe(result => { /**@note confirmation dialog is start */
      if (result) {
        /** @fixme need to Update reqularization status in WP POST `${this.wpPostID}` */
        this.isLoading = true;
        console.log("FINAL OBJ", this.regularizationObj)
        this._logService.regularizeReq(this.regularizationObj).subscribe(regularizationRes => { /** @note set default time and action  */
          this._snackBar.open('Default reqularization time set!', 'ok', {
            duration: 3000
          });
          this.updateRegularizeRequest('approved');
          console.log("regularizationRes : ", regularizationRes);
        }, error => {
          this.isLoading = false;
          this._snackBar.open(error.message || 'Something went wrong!', 'ok', {
            duration: 3000
          });
        })
      }
    })
  }

  updateRegularizeRequest(status: any) {
    let obj = {
      logId: this.regularizeRequestData.id,
      "terms": {
        "regularization-status": [status]
      }
    }
    this._wpService.updateRegularizeStatus(obj).subscribe((data: any) => {
      console.log("STATUS UPDATED", data)

      /** @note update lates regularized logs to Indexed-db */
      this.updateIndexedDbLogs();
      this.requestComplete.emit(data);
      this.isLoading = false;
    }, error => {
      console.error("error while updating status to WP")
    })

  }

  /**
   * This function Remove old user logs from Indexed-db
   * and will store latest regularised logs to Indexed-db
   */
  updateIndexedDbLogs() {
    let userID: any = [];
    this._indexDB.getDataByEmailAndDateRange(this.userEmail).then(async (data: any) => {
      let userDate = moment(this.userDetails.date).format('DD/MM/YYYY');
      for (let i = 0; i < data.length; i++) {
        const element = data[i].date;
        if (userDate === element) {
          userID.push(data[i].uuid);
          let ans = await this._indexDB.deleteRegularizeOldData(userID);
        }
      }
    })

    /** Add logs to indexed-db */
    let dateRange = {
      start: moment(this.userDetails.date).format("DD/MM/YYYY"),
      end: moment(this.userDetails.date).add(1, 'd').format("DD/MM/YYYY")
    }
    this._logService.getJSONLogs(dateRange, this.userEmail).subscribe(async (jsonLogs: any) => {
      let mappedLogs = jsonLogs.map((log: any) => {
        let obj = {
          "date": moment(log.timestamp).format('DD/MM/YYYY'),
          "time": `${String(new Date(log.timestamp).getHours()).length == 1 ? '0' + new Date(log.timestamp).getHours() : new Date(log.timestamp).getHours()}:${String(new Date(log.timestamp).getMinutes()).length == 1 ? '0' + new Date(log.timestamp).getMinutes() : new Date(log.timestamp).getMinutes()}:${String(new Date(log.timestamp).getSeconds()).length == 1 ? '0' + new Date(log.timestamp).getSeconds() : new Date(log.timestamp).getSeconds()}`,
          "type": log.type,
          "email": log.name,
          "action": log.action,
          "unixTime": new Date(log['timestamp']).getTime(),
          "location": {
            lat: log.lat,
            lng: log.lng,
          },
          "image": log.url && log.url.length ? log.url : null,
          "uuid": log.uuid /** @note inorder to handle Regularization request of user. */
        };

        return obj;
      });
      console.log("CHECKING new data : ", mappedLogs);
      this.addLogsToIndexedDb(mappedLogs); /** @note adding latest sheets logs to indexed db. */
    });
  }
  /** 
 * Addding last regularize logs to Indexed-db
 */
  addLogsToIndexedDb(logs: any) {
    console.log("THIS IS THE LOGS OF ALL USERS", logs)
    this._indexDB.addLogsToIndexedDb(logs).then(res => {
      /** @note last 7 day attendance average + last 28 days logs. */
      // this.getIndexedDbData();
      console.log("res : ", res);
    }, error => {
      console.error("addLogsToIndexedDb error : ", error);
    })
  }



}

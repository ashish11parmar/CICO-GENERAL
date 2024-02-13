import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as uuid from 'uuid';
import * as moment from 'moment'
import { config } from '../config';
import { ReminderService } from '../services/reminder.service';
import { UtilityService } from '../services/utility.service';
import { ReminderConfirmModalComponent } from '../common/reminder-confirm-modal/reminder-confirm-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
@Component({
  selector: 'app-reminder-configure',
  templateUrl: './reminder-configure.component.html',
  styleUrls: ['./reminder-configure.component.scss']
})
export class ReminderConfigureComponent implements OnInit {

  public reminderConfig: FormGroup;
  isSubmitted: boolean = false;
  reminderTitleOptions = config.reminderTitleOptions;
  reminderMessageOptions = config.remidnerMesageOptions;
  // filteredTitleOption: Observable<string[]>;
  filteredTitleOption: any[];
  filteredMessageOption: any[];
  reminderConfigList: any;
  isLoading: boolean = false;
  private valueChangesSubscriber: Subscription | undefined;
  constructor(
    private formBuilder: FormBuilder,
    private _reminderConfigService: ReminderService,
    private _utilityService: UtilityService,
    private _snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.reminderConfig = this.formBuilder.group({
      configurations: this.formBuilder.array([])
    });
    this._reminderConfigService.getReminderConfig().subscribe((configRes: any) => {
      this.isLoading = false;
      if (configRes && configRes.length) {
        for (let i = 0; i < configRes.length; i++) {
          /** @note render all the reminders which is not deleted by Admin */
          if (configRes[i].reminder_time && configRes[i].reminder_time.length) {
            (this.reminderConfig.get('configurations') as FormArray).push(this.createConfigFormGroup(configRes[i]));

            /** @note by default all the reminders are disabled. */
            let reminderFormLength = this.reminderConfig.get('configurations') as FormArray
            (this.reminderConfig.get('configurations') as FormArray).controls[reminderFormLength.length - 1].disable();
          }
        }
      } else { /** @note if no shift reminders set.  */
        this.addConfigFormGroup();
      }
    });
    this.valueChangesSubscriber = this.reminderConfig.get('configurations')?.valueChanges.subscribe(config => {
      const _config = (this.reminderConfig.get('configurations') as FormArray).controls;
      const control = (this.reminderConfig.get('configurations') as FormArray);
      for (let i in _config) {

        /** @note reminder Title values changes */
        control.at(+i).get('reminder_title')?.valueChanges.subscribe(value => {
          this.filteredTitleOption = this.filterTitleOptions(value || "");
        });

        /** @note reminder Message values changes */
        control.at(+i).get('reminder_message')?.valueChanges.subscribe(value => {
          this.filteredMessageOption = this.filterMessageOptions(value || "");
        });
      }
    });
  }

  ngOnDestroy() {
    this.valueChangesSubscriber?.unsubscribe();
  }

  /**
   * @param value to be filter while Adding/updating Reminder title.
   * @returns 
   */
  private filterTitleOptions(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.reminderTitleOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  /**
   * @param value to be filter whie Adding/Updating Reminder Message.
   * @returns 
   */
  private filterMessageOptions(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.reminderMessageOptions.filter(option => option.toLowerCase().includes(filterValue));
  }

  get userFormGroups() {
    return (this.reminderConfig.get('configurations') as FormArray);
  }

  createConfigFormGroup(config?: any) {
    return new FormGroup({
      'reminder_title': new FormControl(config && config.reminder_title ? config.reminder_title : '', Validators.required),
      'reminder_time': new FormControl(config && config.reminder_time ? moment(config.reminder_time).format("HH:mm") : '', Validators.required),
      'reminder_message': new FormControl(config && config.reminder_message ? config.reminder_message : '', Validators.required),
      'created_at': new FormControl(config && config.created_at ? moment(config.created_at).format("MM/DD/YYYY HH:mm:ss") : moment().format("MM/DD/YYYY HH:mm:ss"), Validators.required),
      'id': new FormControl(config && config.id ? config.id : uuid.v4()),
      'isReminderNew': new FormControl(config && config.id ? false : true)
    });
  }

  /**
   * @param ith reminder to be delete.
   * 
   * This function will remove particular reminder.
   */
  removeOrClearValue(i: number) {
    let configures = this.reminderConfig.get('configurations') as FormArray;
    if (configures.length > 1) {
      this._utilityService.commonDialogBoxOpen(ReminderConfirmModalComponent, {
        header: 'Delete reminder',
        headerIcon: 'delete_forever',
        message: 'Are you sure you want to delete the reminder?'
      }).afterClosed().subscribe(confirm => {
        if (confirm) {
          let reminder = (this.reminderConfig.get('configurations') as FormArray).controls[i].value;
          /** @note if reminder is not new then update it to Sheet and then remove it from FormGroup */
          if (!reminder.isReminderNew) {
            this.isLoading = true;
            let remidnerObj = {
              id: reminder.id,
              reminder_title: '',
              reminder_time: '',
              reminder_message: '',
              created_at: reminder.created_at,
              update_at: moment().format("MM/DD/YYYY HH:mm:ss")
            }
            console.log("remidnerObj ::: ", remidnerObj);
            this._reminderConfigService.updateReminder(remidnerObj, true).subscribe(updatedReminder => {
              this.isLoading = false;
              (this.reminderConfig.get('configurations') as FormArray).controls[i].disable();
              this._snackBar.open('Reminder deleted successfully!', 'ok', {
                duration: 3000
              });
              configures.removeAt(i);
            }, error => {
              this.isLoading = false;
              (this.reminderConfig.get('configurations') as FormArray).controls[i].disable();
              /** @fixme inorder to handle CORS error */
              this._snackBar.open('Reminder deleted successfully!', 'ok', {
                duration: 3000
              });
  
              configures.removeAt(i);
  
              /** @fixme need to handle error after resolving CORS error. */
              // this._snackBar.open('Something went wrong!', 'ok', {
              //   duration: 3000
              // });
            })
          } else {
            configures.removeAt(i);
          }
        } else { /** @note directly remove it from FormGroup no need to update to Sheet. */
          this.isLoading = false;
        }
      });
    }
  }

  /** @note this funcion will enable/disable  particular formGroup inorder to update reminder */
  enableFormGroup(i: number) {
    let configures = this.reminderConfig.get('configurations') as FormArray;
    if (configures.controls[i].status === "DISABLED") {
      configures.controls[i].enable();
    } else {
      configures.controls[i].disable();
    }
  }
  
  /** @note Create new formGroup inorder to add new Remidner */
  addConfigFormGroup() {
    let configures = this.reminderConfig.get('configurations') as FormArray;
    configures.push(this.createConfigFormGroup());
  }

  /** 
   * This function will add new reminders to sheet.
   * @Depricated
   */
  submitConfigForm() {
    this.isSubmitted = true;
    console.log("this.reminderConfig.status :: ", this.reminderConfig);
    if (this.reminderConfig.status === "VALID") {
      this._utilityService.commonDialogBoxOpen(ReminderConfirmModalComponent, {
        header: 'Add reminders',
        headerIcon: 'add_circle_outline',
        message: 'Are you sure you want to add the reminder?'
      }).afterClosed().subscribe(confirm => {
        if (confirm) {
          let reminderConfigList = this.reminderConfig.value.configurations;
          console.log("reminderConfigList :: ", reminderConfigList);
          for (let i = 0; i < reminderConfigList.length; i++) {
            let reminder = reminderConfigList[i];
            if (reminder.isReminderNew) {
              this.isLoading = true;
              delete reminder.isReminderNew
              reminder.created_at = moment().format("MM/DD/YYYY HH:mm:ss");
              reminder.update_at = moment().format("MM/DD/YYYY HH:mm:ss");
              
              this._reminderConfigService.updateReminder(reminder, false).subscribe(updatedReminder => {
                this.isLoading = false;
                reminder.isReminderNew = false;
                this._snackBar.open('Reminder added successfully!', 'ok', {
                  duration: 3000
                });
                this.resetReminderForm();
              }, error => {
                this.isLoading = false;
                reminder.isReminderNew = false;
                /** @fixme inorder to handle CORS error */
                this._snackBar.open('Reminder added successfully!', 'ok', {
                  duration: 3000
                });
                this.resetReminderForm();
                /** @fixme need to handle error after resolving CORS error. */
                // this._snackBar.open('Something went wrong!', 'ok', {
                //   duration: 3000
                // });
              })
            }
          }
        }
      })
    }
  }

  /** @note Add particular reminder */
  addNewReminder(i: number) {
    /** @note if reminder form-group is valid then Add reminder to Sheet. */
    if ((this.reminderConfig.get('configurations') as FormArray).controls[i].status === 'VALID') {
      this._utilityService.commonDialogBoxOpen(ReminderConfirmModalComponent, {
        header: 'Add reminders',
        headerIcon: 'add_circle_outline',
        message: 'Are you sure you want to add the reminder?'
      }).afterClosed().subscribe(confirm => {
        console.log("confirm :: ", confirm)
        if (confirm) {
          let reminder = (this.reminderConfig.get('configurations') as FormArray).controls[i].value;
          this.isLoading = true;
          delete reminder.isReminderNew
          reminder.created_at = moment().format("MM/DD/YYYY HH:mm:ss");
          reminder.update_at = moment().format("MM/DD/YYYY HH:mm:ss");
          this._reminderConfigService.updateReminder(reminder, false).subscribe(updatedReminder => {
            this.isLoading = false;
            reminder.isReminderNew = false;
            this._snackBar.open('Reminder added successfully!', 'ok', {
              duration: 3000
            });
            this.resetReminderForm();
          }, error => {
            this.isLoading = false;
            reminder.isReminderNew = false;
            /** @fixme inorder to handle CORS error */
            this._snackBar.open('Reminder added successfully!', 'ok', {
              duration: 3000
            });
            this.resetReminderForm();
            /** @fixme need to handle error after resolving CORS error. */
            // this._snackBar.open('Something went wrong!', 'ok', {
            //   duration: 3000
            // });
          })
        }
      });
    } else { /** @note show Required error messages. */
      this.isSubmitted = true;
    }
  }

  /**
   * This function will update FormGroup to disable and update the 'isReminderNew' key to 'false'.
   */
  resetReminderForm() {
    let controls = (this.reminderConfig.get("configurations") as FormArray).controls;
    for (let i = 0; i < controls.length; i++) {
      controls[i].get('isReminderNew')?.patchValue(false);
      controls[i].disable();
    }
  }

  /**
   * @param ith remidne to be updated.
   * This function will update reminder.
   */
  updateReminder(i: number) {
    this._utilityService.commonDialogBoxOpen(ReminderConfirmModalComponent, {
      header: 'Update reminder',
      headerIcon: 'update',
      message: 'Are you sure you want to update the reminder?'
    }).afterClosed().subscribe(confirm => {
      if (confirm) {
        this.isLoading = true;
        let reminder = (this.reminderConfig.get('configurations') as FormArray).controls[i].value;
        delete reminder['isReminderNew'];
        reminder['update_at'] = moment().format("MM/DD/YYYY HH:mm:ss");
        this._reminderConfigService.updateReminder(reminder, true).subscribe(updatedReminder => {
          (this.reminderConfig.get('configurations') as FormArray).controls[i].disable();
          this.isLoading = false;
          this._snackBar.open('Reminder updated successfully!', 'ok', {
            duration: 3000
          });
        }, error => {
          this.isLoading = false;
          (this.reminderConfig.get('configurations') as FormArray).controls[i].disable();
          /** @fixme inorder to handle CORS error */
          this._snackBar.open('Reminder updated successfully!', 'ok', {
            duration: 3000
          });

          /** @fixme need to handle error after resolving CORS error. */
          // this._snackBar.open('Something went wrong!', 'ok', {
          //   duration: 3000
          // });
        })
      } else {
        this.isLoading = false;
      }
    })
  }
}

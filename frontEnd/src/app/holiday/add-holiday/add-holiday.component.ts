import { Component, Input, OnChanges, OnInit, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { WpServiceService } from 'src/app/services/wp-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-add-holiday',
  templateUrl: './add-holiday.component.html',
  styleUrls: ['./add-holiday.component.scss']
})
export class AddHolidayComponent implements OnInit, OnChanges {

  public newUser: FormGroup;
  isLoading = false;
  modelTitle: string;
  holidayId: any;
  dateValid = false;
  @Input('holiday') data: any;
  @Output() holidayChange = new EventEmitter<any>();
  @Output() deleteHoliday = new EventEmitter<any>();
  constructor(
    private _wpService: WpServiceService,
    private _snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    this.data = changes['data'].currentValue;
    if(this.data) {
      this.createForm(this.data);
      this.modelTitle = 'Edit Holiday';
    } else {
      this.createForm();
      this.modelTitle = 'Add Holiday';
    }
  }

  createForm(data?: any) {
    if (data) this.holidayId = data.id;
    this.newUser = new FormGroup({
      name: new FormControl(
        data && data.name ? data.name : '',
        Validators.required
      ),
      description: new FormControl(
        data && data.description ? data.description : '',
        Validators.required
      ),
      start_date: new FormControl(
        data && data.start_date ? data.start_date : '',
        Validators.required
      ),
      end_date: new FormControl(
        data && data.end_date ? data.end_date : '',
        Validators.required
      ),
    });
  }

  addHoliday() {
    this.isLoading = true;
    if (this.data) {
      /** @note update employee data from wordpress */
      this._wpService.updateHolidayData(this.newUser.value, this.holidayId)
        .then((res) => {
          this.isLoading = false;
          this.holidayChange.emit(true);
          this._snackBar.open('Holiday updated successfully', 'ok', { duration: 3000 });
        })
    } else {
      /** @note add holiday */
      this._wpService.addNewHolidayToWp(this.newUser.value).subscribe((res) => {
        this.newUser.reset();
        this._snackBar.open('Holiday added successfully', 'ok', { duration: 3000 });
        this.holidayChange.emit(true);
        this.isLoading = false;
      }, (err: any) => {
        console.log('error is', err.message)
        this.isLoading = false;
      });
    }
  }

  validateLogs(event:any){
    let regex = new RegExp(/^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/g)
    let matches = regex.test(event.target.value);
    console.log("validate", event.target.value);
    console.log("validate", matches);
    if (matches) {
      this.dateValid = false;
    } else {
      this.dateValid = true;
    }
  }

  onDelete() {
    this.deleteHoliday.emit(true);
  }
}

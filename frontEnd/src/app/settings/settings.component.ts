import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import 'moment-timezone';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  companySettingsForm: FormGroup;
  latitude: any = 22.3039;
  longitude: any = 70.8022;
  selectedIndex: number = 0
  timeZones: string[] = this.getTimeZones();
  selectedTimeZone: string;

  constructor(
    private formBuilder: FormBuilder,
    public _cd: ChangeDetectorRef,
  ) { }

  ngOnInit() { this.createForm(); }


  // UTILITY

  createForm() { /**@note created form group for company setting. */
    this.companySettingsForm = new FormGroup({
      companyName: new FormControl('', Validators.required),
      autoClockOutTime: new FormControl('', Validators.required),
      shiftStartTime: new FormControl('', Validators.required),
      shiftStopTime: new FormControl('', Validators.required),
      multipleLocation: this.formBuilder.array(this.multipleLocation([]))
    });
  }

  // If location are not added then they show the RAO location.
  multipleLocation(locations: any[]) {
    console.log("Location data", locations);
    if (locations && locations.length) {
      let locationArray: any = []
      locations.forEach(async (singleLocation: any) => {
        await locationArray.push(new FormGroup({
          title: new FormControl((singleLocation && singleLocation.title) ? singleLocation.title : ''),
          latitude: new FormControl((singleLocation && singleLocation.latitude) ? singleLocation.latitude : 22.3039),
          longitude: new FormControl((singleLocation && singleLocation.longitude) ? singleLocation.longitude : 70.8022),
          radius: new FormControl((singleLocation && singleLocation.radius) ? singleLocation.radius : ''),
          timezone: new FormControl('')

        }))
      })
      return locationArray;
    } else { /**@note if locations length is 0 they show this lat long in map. */
      return [this.formBuilder.group({
        title: new FormControl(''),
        latitude: new FormControl(22.3039),
        longitude: new FormControl(70.8022),
        radius: new FormControl(''),
        timezone: new FormControl('')
      })]
    }

  }

  // Getting location data array from form array 
  get locationDetails() { return <FormArray>this.companySettingsForm.get('multipleLocation'); }


  // Remove multiple Location for user
  deleteLocation(index: any) {
    const control = this.locationDetails
    control.removeAt(index)
  }


  // Add multiple Location for user
  addLocation() {
    const control = this.locationDetails
    control.push(this.formBuilder.group({
      title: new FormControl(''),
      latitude: new FormControl(22.3039),
      longitude: new FormControl(70.8022),
      radius: new FormControl(''),
      timezone: new FormControl('')
    }))
    this.selectedIndex = this.locationDetails.length - 1
    this.latitude = control.controls[this.selectedIndex].value.latitude
    this.longitude = control.controls[this.selectedIndex].value.longitude
    this._cd.detectChanges()
  }

  // This function change the marker of map using lat and long.
  setStep(index: any, location: any) {
    this.selectedIndex = index
    let element = (this.companySettingsForm.get('multipleLocation') as FormArray).at(index).value;
    if (element !== undefined) {
      this.latitude = element.latitude
      this.longitude = element.longitude
    }
  }

  // Grtting timezon from momet and display on option.
  getTimeZones(): string[] {
    return moment.tz.names();
  }

  // This funvtion get the location using event of marker in map.
  markerDragEnd(event: any) {
    this.latitude = event.latLng.lat();
    this.longitude = event.latLng.lng();
    this.locationDetails.controls[this.selectedIndex].patchValue({
      latitude: this.latitude,
      longitude: this.longitude
    })
  }

  // API CALL

  sendcompanyData() {
    console.log("Send company data::", this.companySettingsForm.value);
  }
}

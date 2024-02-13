import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoDataComponent } from '../common/no-data/no-data.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { NgxMatTimelineModule } from "ngx-mat-timeline";
import { CalendarLeaveModalComponent } from '../dashboard/calendar-leave-modal/calendar-leave-modal.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RejectLeaveModalComponent } from '../hrms/reject-leave-modal/reject-leave-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { UtilityService } from '../services/utility.service';
import { LeaveAttatchmentPreviewModalComponent } from '../common/leave-attatchment-preview-modal/leave-attatchment-preview-modal.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';

import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { TimezoneConverterDirective } from '../common/timezone-converter.directive';
import { TimezoneConverterPipe } from '../common/timezone-converter.pipe';
@NgModule({
  declarations: [
    // NoDataComponent,
    CalendarLeaveModalComponent,
    RejectLeaveModalComponent,
    LeaveAttatchmentPreviewModalComponent,
    TimezoneConverterPipe
  ],
  imports: [
    CommonModule,
    MatSidenavModule,
    NgxMatTimelineModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatChipsModule,
    MatSnackBarModule,
    MatRippleModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    // NoDataComponent,
    MatSidenavModule,
    MatListModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    NgxMatTimelineModule,
    CalendarLeaveModalComponent,
    RejectLeaveModalComponent,
    LeaveAttatchmentPreviewModalComponent,
    MatRippleModule,
    TimezoneConverterPipe
    // TimezoneConverterDirective
  ],
  providers: [UtilityService]
})
export class SharedModule { }

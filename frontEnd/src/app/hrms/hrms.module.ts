import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveListComponent } from './leave-list/leave-list.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RejectLeaveModalComponent } from './reject-leave-modal/reject-leave-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MatExpansionModule } from '@angular/material/expansion';
import { SharedModule } from '../shared/shared.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AvatarModule } from 'ngx-avatar';
import { HolidayListComponent } from './holiday-list/holiday-list.component';
import { ApplyLeaveComponent } from './leave-list/apply-leave/apply-leave.component';
import { AddHolidayComponent } from '../holiday/add-holiday/add-holiday.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CalendarLeaveModalComponent } from '../dashboard/calendar-leave-modal/calendar-leave-modal.component';

@NgModule({
  declarations: [
    LeaveListComponent,
    // RejectLeaveModalComponent,
    HolidayListComponent,
    ApplyLeaveComponent,
    AddHolidayComponent,
    // CalendarLeaveModalComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    MatExpansionModule,
    SharedModule,
    AvatarModule,
    MatTabsModule,
    MatSnackBarModule,
    NgxSkeletonLoaderModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class HrmsModule {}

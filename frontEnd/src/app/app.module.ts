import {
  CUSTOM_ELEMENTS_SCHEMA,
  forwardRef,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule, routingcomponents } from './app-routing.module';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  DialogOverviewExampleDialog,
  LogComponent,
} from './common/log/log.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { LoginComponent } from './login/login.component';
import { SideNavComponent } from './common/side-nav/side-nav.component';

import { MatInputModule } from '@angular/material/input';
// import { MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
// import { AddUserComponent } from './user/add-user/add-user.component'
// import { UserListComponent } from './user/user-list/user-list.component';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
// import { NoDataComponent } from './common/no-data/no-data.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { AddUserComponent } from './user/add-user/add-user.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSortModule } from '@angular/material/sort';

import { MatChipsModule } from '@angular/material/chips';
import { DeleteConfirmModalComponent } from './common/delete-confirm-modal/delete-confirm-modal.component';
import { UserModule } from './user/user.module';
import { CommonModule, DatePipe } from '@angular/common';
import { LoaderComponent } from './common/loader/loader.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AgmCoreModule } from '@agm/core';
import { TimelineComponent } from './timeline/timeline.component';
import { HrmsModule } from './hrms/hrms.module';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarLeaveModalComponent } from './dashboard/calendar-leave-modal/calendar-leave-modal.component';
import { AvatarModule } from 'ngx-avatar';
// import { AddHolidayComponent } from './holiday/add-holiday/add-holiday.component';
import { DeleteHolidayComponent } from './holiday/delete-holiday/delete-holiday.component';

// import { ApplyLeaveComponent } from './hrms/leave-list/apply-leave/apply-leave.component';
import { MatBadgeModule } from '@angular/material/badge';
import { ReminderConfigureComponent } from './reminder-configure/reminder-configure.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReminderConfirmModalComponent } from './common/reminder-confirm-modal/reminder-confirm-modal.component';
import { MatMenuModule } from '@angular/material/menu';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { DashboardHistoryComponent } from './dashboard/dashboard-history/dashboard-history.component';
import { UserListComponent } from './user/user-list/user-list.component';
import { SharedModule } from './shared/shared.module';
import { LeaveAttatchmentPreviewModalComponent } from './common/leave-attatchment-preview-modal/leave-attatchment-preview-modal.component';
import { SupportRequestDrawerComponent } from './attendance-regularize/support-request-drawer/support-request-drawer.component';
import { AttendanceRegularizeComponent } from './attendance-regularize/attendance-regularize.component';
import { RegularizeConfirmModalComponent } from './common/regularize-confirm-modal/regularize-confirm-modal.component';
import { NoDataComponent } from './common/no-data/no-data.component';
import { NewDashboardComponent } from './dashboard/new-dashboard.component';
// import { LeaveListComponent } from './hrms/leave-list/leave-list.component';
import { BreadcrumbModule } from 'angular-crumbs';
import { UserDetailModalComponent } from './common/user-detail-modal/user-detail-modal.component';
import { DashboardChartComponent } from './common/dashboard-chart/dashboard-chart.component';
import { GeneralDashboardComponent } from './dashboard/general-dashboard/general-dashboard.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordDialogComponent } from './common/forgot-password-dialog/forgot-password-dialog.component';
import { SettingsComponent } from './settings/settings.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { IntercepInterceptor } from './interceptor/intercep.interceptor';
import { TimezoneConverterPipe } from './common/timezone-converter.pipe';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    // AddUserComponent,
    // UserListComponent,
    LoginComponent,
    SideNavComponent,
    // ApplyLeaveComponent,
    // NoDataComponent,
    DeleteConfirmModalComponent,
    DialogOverviewExampleDialog,
    TimelineComponent,
    // CalendarLeaveModalComponent,
    // AddHolidayComponent,
    DeleteHolidayComponent,
    ReminderConfigureComponent,
    ReminderConfirmModalComponent,
    DashboardHistoryComponent,
    AttendanceRegularizeComponent,
    SupportRequestDrawerComponent,
    RegularizeConfirmModalComponent,
    NoDataComponent,
    NewDashboardComponent,
    UserDetailModalComponent,
    DashboardChartComponent,
    GeneralDashboardComponent,
    SignupComponent,
    ForgotPasswordDialogComponent,
    SettingsComponent,
    // UserProfileUpdateComponent,
    // LeaveAttatchmentPreviewModalComponent,
    // LoaderComponent,
    // LogComponent,
  ],
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatTooltipModule,
    // MatChipsModule,
    MatIconModule,
    MatInputModule,
    MatTabsModule,
    // MatTableDataSource,
    HttpClientModule,
    MatCardModule,
    MatSidenavModule,
    MatButtonModule,
    MatDialogModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    NgxSkeletonLoaderModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatTableModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDividerModule,
    MatAutocompleteModule,
    UserModule,
    HrmsModule,
    SharedModule,
    AvatarModule,
    MatBadgeModule,
    MatMenuModule,
    BreadcrumbModule,
    MatSortModule,
    MatExpansionModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBqZIsEd4NDAUxl3Dg9AOC2v2vWUIxl3v8',
    }),
  ],
  exports: [
    // CalendarLeaveModalComponent
    // LogComponent
    // LoaderComponent
    NoDataComponent,
  ],
  providers: [
    MatDatepickerModule,
    {
      provide: HTTP_INTERCEPTORS, useClass: IntercepInterceptor, multi: true
    },
    {
      provide: MatDialogRef,
      useValue: {},
    },
    {
      provide: MAT_DIALOG_DATA,
      useValue: {},
    },
    DatePipe
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule { }

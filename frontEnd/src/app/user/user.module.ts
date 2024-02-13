import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UserRoutingModule } from './user-routing.module';
import { UserListComponent } from './user-list/user-list.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { AddUserComponent } from './add-user/add-user.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import {
  DialogOverviewExampleDialog1,
  SingleUserComponent,
} from './single-user/single-user.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';

import { LogComponent } from '../common/log/log.component';
import { LoaderComponent } from '../common/loader/loader.component';

// import { NoDataComponent } from '../common/no-data/no-data.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { SharedModule } from '../shared/shared.module';
// import { HrmsModule } from '../hrms/hrms.module';
import { AvatarModule } from 'ngx-avatar';
import { NgxMatTimelineModule } from 'ngx-mat-timeline';
import { AgmCoreModule } from '@agm/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HistoryUserComponent } from './history-user/history-user.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { UserProfileUpdateComponent } from './user-profile-update/user-profile-update.component';

@NgModule({
  declarations: [
    UserListComponent,
    AddUserComponent,
    SingleUserComponent,
    LogComponent,
    // NoDataComponent,
    LoaderComponent,
    DialogOverviewExampleDialog1,
    HistoryUserComponent,
    UserProfileUpdateComponent,
  ],
  imports: [
    FontAwesomeModule,
    MatChipsModule,
    MatBadgeModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    CommonModule,
    UserRoutingModule,
    MatTableModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatSelectModule,
    MatTabsModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    // HrmsModule
    SharedModule,
    AvatarModule,
    NgxMatTimelineModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBqZIsEd4NDAUxl3Dg9AOC2v2vWUIxl3v8',
    }),
    NgxSkeletonLoaderModule,
  ],
  exports: [
    LogComponent,
    LoaderComponent,
    // NoDataComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UserModule {}

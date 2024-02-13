import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard, LoginGuard } from './auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LeaveListComponent } from './hrms/leave-list/leave-list.component';
import { LoginComponent } from './login/login.component';
import { ReminderConfigureComponent } from './reminder-configure/reminder-configure.component';
import { HolidayListComponent } from './hrms/holiday-list/holiday-list.component';
import { AttendanceRegularizeComponent } from './attendance-regularize/attendance-regularize.component';
import { NewDashboardComponent } from './dashboard/new-dashboard.component';
import { UserProfileUpdateComponent } from './user/user-profile-update/user-profile-update.component';
import { SignupComponent } from './signup/signup.component';
import { SettingsComponent } from './settings/settings.component';

//This is my case
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
    data: { breadcrumb: 'Home' },
    // children: [
    //   { path: 'dashboard', component: DashboardComponent },
    //   { path: 'leaves', component: LeaveListComponent },
    //   { path: 'holidays', component: HolidayListComponent },
    // ],
  },

  {
    path: 'login',
    canActivate: [LoginGuard],
    component: LoginComponent,
  },
  // {
  //   path: 'dashboard',
  //   component: DashboardComponent,
  //   canActivate: [AuthGuard],
  // },
  /** @note New Dashboard component with Indexed-DB */
  {
    path: 'dashboard',
    component: NewDashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'hrms/leaves',
    component: LeaveListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'hrms/holidays',
    component: HolidayListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'users',
    canActivate: [AuthGuard],
    loadChildren: () => import('./user/user.module').then((m) => m.UserModule),
    // component: SideNavComponent
  },
  {
    path: 'reminder-configure',
    canActivate: [AuthGuard],
    component: ReminderConfigureComponent,
  },
  {
    path: 'attendance-regularize',
    canActivate: [AuthGuard],
    component: AttendanceRegularizeComponent,
  },
  {
    path: 'User-Profile-Update',
    canActivate: [AuthGuard],
    component: UserProfileUpdateComponent,
  },
  {
    path: 'sign-up',
    component: SignupComponent
  },
  {
    path: 'setting',
    canActivate: [AuthGuard],
    component: SettingsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
export const routingcomponents = [];

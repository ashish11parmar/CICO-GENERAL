import { AfterViewInit, Component, Input, OnChanges, Inject, SimpleChanges, ViewChild, ChangeDetectorRef, OnInit, EventEmitter, Output, ElementRef } from '@angular/core';
import { LogsService } from '../../services/logs.service';
import * as moment from 'moment';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilityService } from 'src/app/services/utility.service';
import * as L from 'leaflet';

@Component({
  selector: 'log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ],
})
export class LogComponent implements AfterViewInit, OnChanges, OnInit {
  @Input() displayedColumns: string[];
  @Input('logs') userLogs: any;
  @Input('responseLength') length: any;
  @Input() from: string;
  @Input() filter: string;
  @Input('noData') noDataMsg: string;
  @Input() isExport: boolean = false;
  @Input('loading') isLoading: boolean = false;
  @Output() onPaginate = new EventEmitter<any>();
  // @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  // @ViewChild('myPaginator') paginator: MatPaginator;
  formatedLogs: any;
  toggleView: boolean = false;
  toggleValue: boolean = false;
  dataSource: any;
  pageSizeOptions: number[] = [25, 50, 75, 100];
  timeline: any = [];
  timeZone = moment.tz.guess();
  processing: boolean = false;
  _loader: boolean = true;

  constructor(
    public _logService: LogsService,
    public _utilityService: UtilityService,
    public _cd: ChangeDetectorRef,
    private router: Router,
    public dialog: MatDialog,
  ) {
    this.dataSource = new MatTableDataSource<any>(this.formatedLogs);
  }

  ngOnInit(): void { }


  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('expandedDetail');
  expandedElement: null;


  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  ngOnChanges(changes: SimpleChanges): void {
    this.formatedLogs = [];
    if (this.userLogs && !this.userLogs.length) {
      this.dataSource.filteredData = []
      this.dataSource = [];
    } else {
      this.dataSource = new MatTableDataSource(this.userLogs);
      this.dataSource.paginator = this.paginator
      this.dataSource.sort = this.sort;
    }
    if (changes['isLoading'] && (changes['isLoading'].currentValue === false || changes['isLoading'].currentValue === true)) {
      this._loader = changes['isLoading'].currentValue;
    }
    this.formatedLogs = this.userLogs;
    this._cd.detectChanges()
  }

  singleUser(user: any) {
    this.router.navigate(['/users/view/' + user.userId], { queryParams: { email: user.email } });
  }

  openDialog(type: string, data: any, latLong?: any): void {
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '600px',
      data: {
        type,
        data,
        latLong
      },
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  getLocation(lat: any, lng: any) {
    return this._utilityService.calcCrow(lat, lng);
  }

  // PageSize and PageIndex will change dynamic using this function.
  onPaginateChange(event: any) {
    this.onPaginate.emit(event);
  }


}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: './meta-data-dialog.html',
  styleUrls: ['./log.component.scss'],
})
export class DialogOverviewExampleDialog implements OnInit, AfterViewInit {
  dailogData: any;
  id: any = localStorage.getItem('singleUserId');
  map: any;

  @ViewChild('mapContainer', { static: false }) mapContainer: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log('data in dialog', data);
    if (data.type === 'image' && !(data.data).includes('base64') && !data.data.includes('thumbnail')) {
      this.dailogData = data;
    } else {
      this.dailogData = data;
    }
  }

  ngOnInit() {
    // Any initialization code you want to run before the view is initialized
  }

  ngAfterViewInit() {
    if (!this.map) {
      this.initializeMap(this.dailogData);
    }
  }

  /**
   * @Note Employee location map render.
   */
  initializeMap(present: any) {

    if (this.mapContainer && this.mapContainer.nativeElement && present.type === 'location') {
      this.map = L.map(this.mapContainer.nativeElement).setView([present.data, present.latLong], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
      this.addEmployeeMarker(present);
    }
  }

  addEmployeeMarker(present: any) {
    let employeeMarker = L.marker([present.data, present.latLong]);

    let customIcon = L.icon({
      iconUrl: '../assets/icon/orange_marker.png',
      iconSize: [32, 32]
    });
    employeeMarker.setIcon(customIcon);
    employeeMarker.addTo(this.map);
  }

  onNoClick(): void {
    this.dailogData = {};
    this.dialogRef.close();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
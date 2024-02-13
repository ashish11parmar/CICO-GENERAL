import { Component, OnInit ,Inject} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-holiday',
  templateUrl: './delete-holiday.component.html',
  styleUrls: ['./delete-holiday.component.scss']
})
export class DeleteHolidayComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DeleteHolidayComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
  }

  confirmjob(value: any) {
    console.log("VALUE", value);
    this.dialogRef.close(value)
  }
}

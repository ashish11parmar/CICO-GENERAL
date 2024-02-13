import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-regularize-confirm-modal',
  templateUrl: './regularize-confirm-modal.component.html',
  styleUrls: ['./regularize-confirm-modal.component.scss']
})
export class RegularizeConfirmModalComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<RegularizeConfirmModalComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
  }

  confirmReminder(value: boolean) {
    this.dialogRef.close(value)
  }

}

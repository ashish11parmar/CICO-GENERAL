import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

@Component({
  selector: 'app-image-preview-modal-page',
  templateUrl: './image-preview-modal-page.component.html',
  styleUrls: ['./image-preview-modal-page.component.scss']
})
export class ImagePreviewModalPageComponent implements OnInit {
  strImage : string;
  constructor(    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
    this.strImage = this.data.strImage;
  }

  ngOnInit(): void {
   this.strImage = this.data.strImage;
  }
  dismiss() {
    this.dialog.closeAll();
  }

}

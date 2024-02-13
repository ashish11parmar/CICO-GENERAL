import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagePreviewModalPageComponent } from './image-preview-modal-page.component';

describe('ImagePreviewModalPageComponent', () => {
  let component: ImagePreviewModalPageComponent;
  let fixture: ComponentFixture<ImagePreviewModalPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImagePreviewModalPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImagePreviewModalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

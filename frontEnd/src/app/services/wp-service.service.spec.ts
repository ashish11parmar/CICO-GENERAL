import { TestBed } from '@angular/core/testing';

import { WpServiceService } from './wp-service.service';

describe('WpServiceService', () => {
  let service: WpServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WpServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

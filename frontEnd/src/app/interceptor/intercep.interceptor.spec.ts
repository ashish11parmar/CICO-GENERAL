import { TestBed } from '@angular/core/testing';

import { IntercepInterceptor } from './intercep.interceptor';

describe('IntercepInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      IntercepInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: IntercepInterceptor = TestBed.inject(IntercepInterceptor);
    expect(interceptor).toBeTruthy();
  });
});

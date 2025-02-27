
import {TestBed} from '@angular/core/testing';
import {TacheSuiviService} from './tacheSuivi.service';


describe('TacheSuiviService', () => {
  let service: TacheSuiviService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TacheSuiviService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

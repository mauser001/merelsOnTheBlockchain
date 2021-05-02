import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallationTutorialComponent } from './installation-tutorial.component';

describe('InstallationTutorialComponent', () => {
  let component: InstallationTutorialComponent;
  let fixture: ComponentFixture<InstallationTutorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstallationTutorialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstallationTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

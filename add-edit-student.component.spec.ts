import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditStudentComponent } from './add-edit-student.component';

describe('AddEditStudentComponent', () => {
  let component: AddEditStudentComponent;
  let fixture: ComponentFixture<AddEditStudentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEditStudentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

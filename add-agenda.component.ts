import { Component, OnInit } from '@angular/core';
import { StudentService } from "../../student/student.service";
import { Student } from "../../../../model/student/student";
import { Agenda } from "../../../../model/agenda/agenda";
import { Event } from "../../../../model/agenda/event";
import { InstructorService } from "../../instructor/instructor.service";
import {AgendaService} from "../agenda.service";
import { Employee } from "../../../../model/employee/employee";
import { HttpErrorMsgService } from "../../../../core/services/http-error-msg.service";
import { HttpErrorResponse } from "@angular/common/http";
import {
FormGroup,
FormBuilder,
Validators,
FormControl
} from "@angular/forms";
import { NgxSpinnerService } from "ngx-spinner";
import * as _ from "lodash";

import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-add-agenda',
  templateUrl: './add-agenda.component.html',
  styleUrls: ['./add-agenda.component.css']
})
export class AddAgendaComponent implements OnInit {
  studentArr: Student[];
  instructorArr: Employee[];
 agendaForm: FormGroup;
  private formSubmitAttempt = true;
 agendaObj: Event;
displayMsg: string;

  constructor(private studentService: StudentService,
  private httpErrorService: HttpErrorMsgService,
  private instructorService: InstructorService,
  private agendaService: AgendaService,
  private spinner: NgxSpinnerService,
  private formBuilder: FormBuilder) { }

  ngOnInit() {
      this.buildForm();
      this.studentService.getStudentDetails().subscribe(
      (response: Student[]) => {
        if (response.length > 0) {
          this.studentArr = response;
        } else {
          this.displayMsg = environment.emptyResponseMsg;
        }
      },
      (err: HttpErrorResponse) => {
          this.displayMsg = this.httpErrorService.getErrorMsg(err.status);

      }
    );

    this.instructorService.getInstructors().subscribe(
      (response: Employee[]) => {
        if (response.length > 0) {
          this.instructorArr = response;
        } else {
          this.displayMsg = environment.emptyResponseMsg;
        }
      },
      (err: HttpErrorResponse) => {
          this.displayMsg = this.httpErrorService.getErrorMsg(err.status);

      }
    );
  }

  buildForm(data?: any) {
    this.agendaForm = this.formBuilder.group({
      id: [{ value: 0, disabled: true }],
      type: [null, Validators.required],
      startDate: [null, [Validators.required]],
      endDate: [null],
      instructorId: [null, [Validators.required]],
      studentId: [null, [Validators.required]],
      venue: [null],
      description: [null]
    });
  }

  isFieldValid(field: string) {
    return (
      (!this.agendaForm.get(field).valid &&
        this.agendaForm.get(field).touched) ||
      (this.agendaForm.get(field).untouched && this.formSubmitAttempt)
    );
  }

  displayFieldCss(field: string) {
    return {
      "has-error": this.isFieldValid(field),
      "has-feedback": this.isFieldValid(field)
    };
  }

  onSubmit() {
    this.formSubmitAttempt = true;
    if (this.agendaForm.valid) {
      this.spinner.show();
      this.agendaObj = this.agendaForm.value;
      this.agendaService.createEvent(this.agendaObj).subscribe(
        res => {
          this.spinner.hide();
        },
        err => {
          this.spinner.hide();
        }
      );
      this.resetForm();
    }
  }

  resetForm() {
    this.agendaForm.reset();
    this.formSubmitAttempt = false;
  }

  ngOnDestroy(): void {
    this.agendaService.resetAgendaObj();
    this.resetForm();
  }

}

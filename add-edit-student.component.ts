import { Component, OnInit, OnDestroy } from "@angular/core";
import {
FormBuilder,
Validators,
FormGroup,
FormControl
} from "@angular/forms";
import { StudentService } from "../student.service";
import { Student } from "../../../../model/student/student";
import { Employee } from "../../../../model/employee/employee";
import { Package } from "../../../../model/package/package";
import { InstructorService } from "../../instructor/instructor.service";
import {PackageService} from "../../package/package.service";
import { Router } from '@angular/router';

import { NgxSpinnerService } from "ngx-spinner";
import * as _ from "lodash";
import { HttpErrorMsgService } from "../../../../core/services/http-error-msg.service";
import { HttpErrorResponse } from "@angular/common/http";


import { environment } from "../../../../../environments/environment";

@Component({
  selector: "app-add-edit-student",
  templateUrl: "./add-edit-student.component.html",
  styleUrls: ["./add-edit-student.component.css"]
})
export class AddEditStudentComponent implements OnInit, OnDestroy {
  private formSubmitAttempt: boolean;
  public isEdit: boolean = false;
  private existingStudentObj: Student;
  studentObj: Student;
  studentForm: FormGroup;
  instructorArr: Employee[];
  packageArr: Package[]
  displayMsg:string;
  constructor(
    private formBuilder: FormBuilder,
    private studentService: StudentService,
    private spinner: NgxSpinnerService,
    private instructorService : InstructorService,
    private packageService: PackageService,
    private httpErrorService: HttpErrorMsgService,
    private router: Router
  ) {}

  ngOnInit() {
    this.buildForm();

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

    this.packageService.getPackages().subscribe(
      (response: Package[]) => {
        if (response.length > 0) {
          this.packageArr = response;
        } else {
          this.displayMsg = environment.emptyResponseMsg;
        }
      },
      (err: HttpErrorResponse) => {
          this.displayMsg = this.httpErrorService.getErrorMsg(err.status);

      }
    );

    if (this.studentService.getSelectedStudentObj() != null) {
      this.isEdit = true;
      this.existingStudentObj = this.studentService.getSelectedStudentObj();

      this.studentForm.setValue({
        id: this.existingStudentObj.id,
        name: this.existingStudentObj.name,
        email: this.existingStudentObj.email,
        phone: this.existingStudentObj.phone,
        packageName: this.existingStudentObj.packageName,
        packageId: this.existingStudentObj.packageId,
        referredBy: "",
        address : {
            street:this.existingStudentObj.address.street,
            postalCode:this.existingStudentObj.address.postalCode,
            city:this.existingStudentObj.address.city,
            houseNumber:this.existingStudentObj.address.houseNumber
        },
        instructorId:this.existingStudentObj.instructor?this.existingStudentObj.instructor.id:"",
        price: null,
        preferredDate: [null],
        bankDetails: this.formBuilder.group({
        bankName: [null],
        iban: [null]
      }),
      status: [null]

      });
     // this.studentForm.setValue(this.studentService.getSelectedStudentObj());
      //TBD :- mark all controls as touched by iterating
    }
  }

  buildForm(data?: any) {
    this.studentForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      name: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      phone: [
        null,
        [
          Validators.required,
          Validators.pattern("^[0-9]*$"),
          Validators.minLength(8)
        ]
      ],
      packageName: [null],
      packageId: [null],
      referredBy: [null],
      price: [null],
      address: this.formBuilder.group({
        street: [null, Validators.required],
        postalCode: [null, Validators.required],
        city: [null, Validators.required],
        houseNumber: [
          null,
          [Validators.required, Validators.pattern("^[0-9]*$")]
        ]
      }),
      instructorId: [null],
      preferredDate: [null],
      bankDetails: this.formBuilder.group({
        bankName: [null],
        iban: [null]
      }),
      status: [null]
    });
  }

  isFieldValid(field: string) {
    return (
      (!this.studentForm.get(field).valid &&
        this.studentForm.get(field).touched) ||
      (this.studentForm.get(field).untouched && this.formSubmitAttempt)
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
    if (this.studentForm.valid) {
      this.spinner.show();
      this.studentObj = this.studentForm.value;
      this.studentService.postStudentDetails(this.studentObj).subscribe(
        res => {
          this.spinner.hide();
        },
        err => {
          this.spinner.hide();
        }
      );
      this.resetForm();
      this.router.navigate(["/admin/student-list"]);
    }
  }

  onEdit() {
    this.formSubmitAttempt = true;
    if (this.studentForm.valid) {
      this.spinner.show();
      this.studentObj = this.studentForm.value;
      this.studentObj.id = this.existingStudentObj.id;
      if (_.isEqual(this.studentObj, this.existingStudentObj)) {
        console.log("Objects are same.");
        this.spinner.hide();
      } else {
        this.studentService.putStudentDetails(this.studentObj).subscribe(
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
  }

  resetForm() {
    this.studentForm.reset();
    this.formSubmitAttempt = false;
  }

  ngOnDestroy(): void {
    this.studentService.resetSelectedStudentObj();
    this.resetForm();
  }
}

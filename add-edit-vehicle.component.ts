import { Component, OnInit, OnDestroy } from "@angular/core";
import { Vehicle } from "../../../../model/vehicle/vehicle";
import {VehicleCategory} from "../../../../model/vehicle/category";
import {
  FormGroup,
  FormBuilder,
  Validators
} from "../../../../../../node_modules/@angular/forms";
import { VehicleService } from "../vehicle.service";
import { NgxSpinnerService } from "../../../../../../node_modules/ngx-spinner";
import * as _ from "lodash";
import { HttpErrorResponse } from "@angular/common/http";
import { HttpErrorMsgService } from "../../../../core/services/http-error-msg.service";
import { Router } from '@angular/router';

@Component({
  selector: "app-add-edit-vehicle",
  templateUrl: "./add-edit-vehicle.component.html",
  styleUrls: ["./add-edit-vehicle.component.css"]
})
export class AddEditVehicleComponent implements OnInit, OnDestroy {
  private formSubmitAttempt: boolean;
  public isEdit: boolean = false;
  private existingVehicleObj: Vehicle;
  vehicleCategory: any;
  vehicleObj: Vehicle;
  vehicleForm: FormGroup;
  displayMsg: string;

  constructor(
    private formBuilder: FormBuilder,
    private vehicleService: VehicleService,
    private spinner: NgxSpinnerService,
    private httpErrorService: HttpErrorMsgService,
    private router : Router
  ) {}

  ngOnInit() {
    this.buildForm();

    this.vehicleService.getVehicleCategories().subscribe(
      (response: VehicleCategory[]) => {
         this.vehicleCategory = response;
      },
      (err: HttpErrorResponse) => {
          this.displayMsg = this.httpErrorService.getErrorMsg(err.status);


      }
    );

    if (this.vehicleService.getSelectedVehicleObj() != null) {
      this.isEdit = true;
      this.existingVehicleObj = this.vehicleService.getSelectedVehicleObj();
      this.vehicleForm.setValue({
      id: this.existingVehicleObj.id,
      numberPlate:this.existingVehicleObj.numberPlate,
      categoryType :this.existingVehicleObj.categoryType,
      lastInspectionDate:this.existingVehicleObj.lastInspectionDate,
      kms:this.existingVehicleObj.kms
      });
      //TBD :- mark all controls as touched by iterating
    }



  }

  buildForm(data?: any) {
    this.vehicleForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      numberPlate: [null, [Validators.required]],
      categoryType: [null, [Validators.required]],
      lastInspectionDate: [null],
      kms: [null]
    });
  }

  isFieldValid(field: string) {
    return (
      (!this.vehicleForm.get(field).valid &&
        this.vehicleForm.get(field).touched) ||
      (this.vehicleForm.get(field).untouched && this.formSubmitAttempt)
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
    if (this.vehicleForm.valid) {
      this.spinner.show();
      this.vehicleObj = this.vehicleForm.value;
      this.vehicleService.postVehicleDetails(this.vehicleObj).subscribe(
        res => {
          this.spinner.hide();
        },
        err => {
          this.spinner.hide();
        }
      );
      this.resetForm();
      this.router.navigate(["/admin/vehicle-list"]);
    }
  }

  onEdit() {
    this.formSubmitAttempt = true;
    if (this.vehicleForm.valid) {
      this.spinner.show();
      this.vehicleObj = this.vehicleForm.value;
      this.vehicleObj.id = this.existingVehicleObj.id;
      if (_.isEqual(this.vehicleObj, this.existingVehicleObj)) {
        console.log("Objects are same.");
        this.spinner.hide();
      } else {
        this.vehicleService.putVehicleDetails(this.vehicleObj).subscribe(
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
    this.vehicleForm.reset();
    this.formSubmitAttempt = false;
  }

  ngOnDestroy(): void {
    this.vehicleService.resetSelectedVehicleObj();
    this.resetForm();
  }
}

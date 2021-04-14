import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

export interface LocationDialogData {
  locationId?: number;
  name?: string;
  state?: string;
  city?: string;
  zipcode?: string;
  title?: String;
}
@Component({
  selector: 'app-add-location',
  templateUrl: './add-location.component.html',
  styleUrls: ['./add-location.component.sass'],
})
export class AddLocationComponent implements OnInit {
  addLocationForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddLocationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LocationDialogData,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    const name = new FormControl(this.data.name, Validators.required);
    const state = new FormControl(this.data.state, Validators.required);
    const city = new FormControl(this.data.city, Validators.required);
    const zipCode = new FormControl(this.data.zipcode, Validators.required);

    this.addLocationForm = this.fb.group({
      name,
      state,
      city,
      zipCode,
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  submitForm() {
    if (this.readFormData()) {
      delete this.data.title;
      this.dialogRef.close(this.data);
    } else {
      this.toastr.warning('Invalid input');
    }
  }

  readFormData(): boolean {
    const valid = this.addLocationForm.valid;
    const name = this.addLocationForm.value.name;
    const state = this.addLocationForm.value.state;
    const city = this.addLocationForm.value.city;
    const zipcode = this.addLocationForm.value.zipCode;
    this.data = { ...this.data, name, state, city, zipcode };
    return valid;
  }
}

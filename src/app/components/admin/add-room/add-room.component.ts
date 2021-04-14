import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { RoomType } from 'src/app/models/room';
import { AddBuildingComponent } from '../add-building/add-building.component';

export interface RoomDialogData {
  roomId?: number;
  name?: string;
  type?: string;
  capacity?: number;
  buildingId?: number;
  title?: String;
}

@Component({
  selector: 'app-add-room',
  templateUrl: './add-room.component.html',
  styleUrls: ['./add-room.component.sass']
})
export class AddRoomComponent implements OnInit {

  selectedValue?: RoomType;
  addRoomForm!: FormGroup;

  roomTypes = [
    { value: 'MEETING', viewValue: 'MEETING' },
    { value: 'REMOTE', viewValue: 'REMOTE'},
    { value: 'VIRTUAL', viewValue: 'VIRTUAL'}

  ]

  constructor(
    public dialogRef: MatDialogRef<AddBuildingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RoomDialogData,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    const name = new FormControl(this.data.name, Validators.required);
    const type = new FormControl(this.data.type, Validators.required);
    const capacity = new FormControl(this.data.capacity, Validators.required);

    this.addRoomForm = this.fb.group({
      name, capacity, type
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
    const valid = this.addRoomForm.valid;
    const name = this.addRoomForm.value.name;
    const type = this.addRoomForm.value.type;
    const capacity = this.addRoomForm.value.capacity;

    this.data = { ...this.data, name, type, capacity };
    return valid;
  }


}

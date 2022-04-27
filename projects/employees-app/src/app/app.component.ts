import { HttpErrorResponse } from '@angular/common/http';
import { Employee } from './model/app.model';
import { EmployeeService } from './service/employee.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [],
})
export class AppComponent implements OnInit {
  employees: Employee[];
  employeeForm: FormGroup;
  keyword: string;

  constructor(private service: EmployeeService, private builder: FormBuilder) {
    this.employeeForm = this.builder.group({
      id: 0,
      name: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      jobTitle: ['', [Validators.required]],
      imageUrl: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.getEmployees();
  }

  public getEmployees(): void {
    this.service.getEmployees().subscribe({
      next: (resp: Employee[]) => {
        this.employees = resp;
      },
      error: (error: HttpErrorResponse) => {
        alert(error.message);
      },
    });
  }

  // Trigger Modal
  public editEmployee(employee: Employee) {
    if (employee !== null) {
      this.employeeForm.patchValue(employee);
    } else {
      this.employeeForm.reset();
    }
    this.onOpenEmployeeModal();
  }

  // Actual Edit
  public saveEmployee() {
    if (!this.employeeForm.value.id) {
      // New
      this.service.addEmployee(this.employeeForm.value).subscribe({
        next: (resp: Employee) => {
          console.log(resp);
          this.getEmployees();
        },
        error: (error: HttpErrorResponse) => {
          alert(error.message);
        },
      });
    } else {
      // edit
      this.service.updateEmployee(this.employeeForm.value).subscribe({
        next: (resp: Employee) => {
          console.log(resp);
          this.getEmployees();
        },
        error: (error: HttpErrorResponse) => {
          alert(error.message);
        },
      });
    }
    this.getEmployees();
    this.onCloseEmployeeModal();
  }

  // Trigger Modal
  public confirmDeleteEmployee(employee: Employee) {
    this.onOpenConfirmModal();

    if (employee !== null) {
      this.employeeForm.patchValue(employee);
    }
  }

  // Actual Delete
  public deleteEmployee() {
    this.service.deleteEmployee(this.employeeForm.value.id).subscribe({
      next: (resp: void) => {
        this.getEmployees();
      },
      error: (error: HttpErrorResponse) => {
        alert(error.message);
      },
    });
    this.onCloseConfirmModal();
  }

  public searchEmployee(value: string) {
    const results: Employee[] = [];

    this.employees.forEach((e) => {
      if (
        e.name.toLowerCase().indexOf(value.toLowerCase()) !== -1 ||
        e.phone.toLowerCase().indexOf(value.toLowerCase()) !== -1 ||
        e.email.toLowerCase().indexOf(value.toLowerCase()) !== -1 ||
        e.jobTitle.toLowerCase().indexOf(value.toLowerCase()) !== -1
      ) {
        results.push(e);
      }
    });

    this.employees = results;

    if (results.length === 0 || !value) {
      this.getEmployees();
    }
  }

  public onOpenEmployeeModal() {
    $('#editEmployee').css('display', 'block');
  }

  public onCloseEmployeeModal() {
    $('#editEmployee').css('display', 'none');
  }

  public onOpenConfirmModal() {
    $('#confirmModal').css('display', 'block');
  }

  public onCloseConfirmModal() {
    $('#confirmModal').css('display', 'none');
  }
}

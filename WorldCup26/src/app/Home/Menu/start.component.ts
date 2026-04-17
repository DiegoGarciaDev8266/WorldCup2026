import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {

  isExpanded = false;

  subMenu = {
    config: false,
    pred: false
  };

  constructor(
    private router: Router,
    private toastr: ToastrService) {
  }


  ngOnInit(): void {


  }



  Salir() {
    this.router.navigate(['/']);


  }
  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  toggleSub(menu: string) {
    this.subMenu[menu as keyof typeof this.subMenu] =
      !this.subMenu[menu as keyof typeof this.subMenu];
      
  }
}

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


  ngOnInit() {

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

    // Si algún submenú está abierto, expande el sidebar
    const hayAlgoAbierto = Object.values(this.subMenu).some(v => v === true);
    if (hayAlgoAbierto) {
      this.isExpanded = true;
    }
  }
}

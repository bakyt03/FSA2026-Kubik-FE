import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionContainer } from '../../shared/component/section-container/section-container';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  imports: [RouterLink, SectionContainer, TranslatePipe],
  templateUrl: './home.html',
})
export class Home {}

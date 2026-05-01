import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-page-not-found',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './page-not-found.html',
})
export class PageNotFound {}

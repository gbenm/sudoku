import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BoardComponent} from './board/board.component';
import {CellComponent} from './cell/cell.component';
import {NavigationComponent} from './navigation/navigation.component';
import {LayoutModule} from '@angular/cdk/layout';
import {
  MatToolbarModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatTableModule,
  MatGridListModule, MatCardModule, MatBadgeModule
} from '@angular/material';
import {NumberButtonbarComponent} from './number-buttonbar/number-buttonbar.component';
import {HintButtonbarComponent} from './hint-buttonbar/hint-buttonbar.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    CellComponent,
    NavigationComponent,
    NumberButtonbarComponent,
    HintButtonbarComponent
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule, LayoutModule, MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule,
    MatListModule, MatTableModule, MatGridListModule, MatCardModule, MatBadgeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}

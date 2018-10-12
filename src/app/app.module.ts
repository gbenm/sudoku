import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BoardComponent} from './board/board.component';
import {CellComponent} from './cell/cell.component';
import {NavigationComponent} from './navigation/navigation.component';
import {LayoutModule} from '@angular/cdk/layout';
import {
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatGridListModule,
  MatIconModule,
  MatListModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatTableModule,
  MatToolbarModule
} from '@angular/material';
import {GameComponent} from './game/game.component';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    CellComponent,
    NavigationComponent,
    GameComponent
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule, LayoutModule, MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule,
    MatListModule, MatTableModule, MatGridListModule, MatCardModule, MatBadgeModule, MatSlideToggleModule, FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}

import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {BoardComponent} from './board/board.component';
import {CellComponent} from './cell/cell.component';
import {LayoutModule} from '@angular/cdk/layout';
import {
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatGridListModule,
  MatIconModule,
  MatListModule,
  MatRadioModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatTableModule,
  MatToolbarModule,
  MatTooltipModule,
  MatProgressSpinnerModule
} from '@angular/material';
import {GameComponent} from './game/game.component';
import {FormsModule} from '@angular/forms';
import {GameCompletedDialogComponent} from './game-completed-dialog/game-completed-dialog.component';
import {HomeComponent} from './home/home.component';
import {AppRoutingModule} from './app-routing.module';
import {SettingsComponent} from './settings/settings.component';
import {OverlayModule} from '@angular/cdk/overlay';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    CellComponent,
    GameComponent,
    GameCompletedDialogComponent,
    HomeComponent,
    SettingsComponent
  ],
  entryComponents: [
    GameCompletedDialogComponent
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule, LayoutModule, MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule,
    MatListModule, MatTableModule, MatGridListModule, MatCardModule, MatBadgeModule, MatSlideToggleModule, FormsModule, MatSnackBarModule,
    MatDialogModule, MatTooltipModule, OverlayModule, MatRadioModule, MatProgressSpinnerModule, AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}

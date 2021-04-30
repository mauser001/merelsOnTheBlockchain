import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TableComponent } from './components/table/table.component';
import { OpenGamesPipe } from './pipes/open-games.pipe';
import { PieceComponent } from './components/piece/piece.component';
import { BoardBackgroundDirective } from './directives/board-background.directive';

@NgModule({
  declarations: [
    AppComponent,
    TableComponent,
    OpenGamesPipe,
    PieceComponent,
    BoardBackgroundDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

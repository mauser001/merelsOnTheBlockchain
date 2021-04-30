import { ElementRef } from '@angular/core';
import { BoardBackgroundDirective } from './board-background.directive';

export class MockElementRef extends ElementRef {    nativeElement = {}; }

describe('BoardBackgroundDirective', () => {
  it('should create an instance', () => {
    const directive = new BoardBackgroundDirective(new MockElementRef({}));
    expect(directive).toBeTruthy();
  });
});

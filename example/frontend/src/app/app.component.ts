import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActorSubclass } from '@dfinity/agent';
import { environment } from '../environments/enviornment';
import { _SERVICE } from '../../../declarations/example_backend.did';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `<h1>Angular Internet Computer example!</h1>`,
})
export class AppComponent implements OnInit {
  constructor(
    @Inject(environment.BACKEND_CANISTER_ID)
    private readonly backendActor: ActorSubclass<_SERVICE>,
  ) {}

  public ngOnInit(): void {
    this.backendActor.say_hello().then(greeting => {
      console.log(greeting);
    });
  }
}

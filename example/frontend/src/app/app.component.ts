import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, map } from 'rxjs';
import { IcAuthService } from '@hadronous/ic-angular';
import { BackendActorService } from './backend-actor.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <h1>IC Angular example!</h1>

    <pre>Is authenticated: {{ isAuthenticated$ | async }}</pre>

    <pre>Identity: {{ principal$ | async }}</pre>

    @if (isAuthenticated$ | async) {
      <button (click)="onLogoutButtonClicked()">Logout</button>
    } @else {
      <button (click)="onLoginButtonClicked()">Login</button>
    }
  `,
})
export class AppComponent implements OnInit {
  public readonly isAuthenticated$: Observable<boolean>;
  public readonly principal$: Observable<string | null>;

  private readonly backendActor = inject(BackendActorService);
  private readonly authService = inject(IcAuthService);

  constructor() {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.principal$ = this.authService.identity$.pipe(
      map(identity => identity?.getPrincipal().toText() ?? null),
    );
  }

  public ngOnInit(): void {
    this.backendActor.say_hello().then(greeting => {
      console.log(greeting);
    });
  }

  public async onLoginButtonClicked(): Promise<void> {
    await this.authService.login();
  }

  public async onLogoutButtonClicked(): Promise<void> {
    await this.authService.logout();
  }
}

// temporary fix until @dfinity/agent-js replaces the legacy CBOR parser
import getGlobalThis from 'globalthis/polyfill';
(window as any).global = getGlobalThis();

import { bootstrapApplication } from '@angular/platform-browser';
import { APP_CONFIG } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, APP_CONFIG).catch(err => console.error(err));

import { Component } from '@angular/core';
import { SupportedBiometricType } from '@ionic-enterprise/identity-vault';
import { Platform } from '@ionic/angular';
import { VaultService } from './vault.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private readonly vaultService: VaultService, private readonly platform: Platform) {
    this.appInit();
  }


async appInit(){
  
}
  
}



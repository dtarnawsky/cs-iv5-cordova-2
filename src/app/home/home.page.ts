import { Component, OnInit } from '@angular/core';
import { Device, VaultType } from '@ionic-enterprise/identity-vault';
import { Platform } from '@ionic/angular';
import { VaultService } from '../vault.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(private vaultService: VaultService, private platform: Platform) { }

  async ngOnInit() {
    await this.platform.ready();
    console.log('home page after platform ready');
    await this.vaultService.setUpVaults();
    
  }


  async clearVault(){
    await this.vaultService.biometricsVault.clear();
  }

  async setUpNewVault(){
    await this.vaultService.setUpBiometricsVault();
  }

  async lockUnlock() {
    console.log('inside vault lockUnlock');
    await this.vaultService.lockVault();
    await this.vaultService.unlockVault();
    console.log('vault lock status after lock ==== ' + JSON.stringify(this.vaultService.biometricsVault.isLocked()));
  }

  async lockUnlockInTryCatch() {
    console.log('inside vault lockUnlockInTryCatch');
    try {
      await this.vaultService.lockVault();
      await this.vaultService.unlockVault();
      console.log('vault lock status after lockUnlockInTryCatch ==== ' + JSON.stringify(this.vaultService.biometricsVault.config));
    } catch (error) {
      alert('error lockUnlock ===== ' + JSON.stringify(error));
      console.error(error);
    }
  }


  async lock() {
    console.log('inside vault lock');
    try {
      await this.vaultService.setValue('blar', 'stuff');
      await this.vaultService.lockVault();
    } catch (error) {
      alert('error lock ===== ' + JSON.stringify(error));
      console.error(error);
    }
  }

  async unlock() {
    console.log('inside vault unlock');
    try {
      await this.vaultService.unlockVault();
      await this.vaultService.setValue('blar', 'stuff');
      await this.vaultService.setValue('key1','value1');
      console.log('value from  unlock ==== ' + await this.vaultService.getValue('key1'));
    
    } catch (error) {
      alert('error unlock ===== ' + JSON.stringify(error));
      console.error(error);
    }
  }
  

  async getValue(){
    await this.vaultService.setUpDeviceState();
    alert('biometrics lockeds out == ' + this.vaultService.deviceState.isLockedOutOfBiometrics);
    if(this.vaultService.deviceState.isLockedOutOfBiometrics){
      alert('my check');

    }
    if(await Device.isLockedOutOfBiometrics()){
      alert('wait for sometime as you are locked out');

    }else{
      console.log('value from  getValue ==== ' + await this.vaultService.getValue('key1'));
      alert('value from  getValue ==== ' + await this.vaultService.getValue('key1'));
    }
    
  }

  async setValue(){
    await this.vaultService.unlockVault();
    await this.vaultService.setValue("key1","value1");
    console.log('value from  setValue ==== ' + await this.vaultService.getValue('key1'));
  }

}

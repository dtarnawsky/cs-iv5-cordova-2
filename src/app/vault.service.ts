import { Injectable, NgZone } from "@angular/core";
import { Platform } from "@ionic/angular";
import {
  Vault,
  Device,
  DeviceSecurityType,
  VaultType,
  BrowserVault,
  IdentityVaultConfig,
  SupportedBiometricType,
  BiometricSecurityStrength,
} from "@ionic-enterprise/identity-vault";
import { Storage } from '@ionic/storage';

export interface DeviceState {
  hardWareType: "fingerprint" | "face" | "none";
  //device level biometrics enabled
  isBiometricsEnabledOnDevice: boolean;
  //does app have access to use biometrics
  isBiometricAccessEnabledForTheApp: boolean;
  //is biometrics vault set up
  isBiometricsVaultSetup: boolean;
  isLockedOutOfBiometrics:boolean;
}

@Injectable({ providedIn: "root" })
export class VaultService {
  public deviceState: DeviceState = {
    hardWareType: "none",
    isBiometricsEnabledOnDevice: false,
    isBiometricAccessEnabledForTheApp: false,
    isBiometricsVaultSetup: false,
    isLockedOutOfBiometrics: false
  };

  secureStorageVault: Vault | BrowserVault;
  biometricsVault: Vault | BrowserVault;
  config: IdentityVaultConfig;
  areBiometricsEnabled = "";
  constructor(
    private ngZone: NgZone,
    private readonly platform: Platform,
    private readonly storageService: Storage,
    
  ) {}

  async setUpVaults() {
    await this.platform.ready();
    await this.setUpSupportedHardwareTypes();
    await this.setUpDeviceState();
    await this.setUpSecureStorageVault();
    if(this.deviceState.hardWareType !== "none" && this.deviceState.isBiometricAccessEnabledForTheApp &&
    this.deviceState.isBiometricsEnabledOnDevice){
      await this.setUpBiometricsVault();
      this.deviceState.isBiometricsVaultSetup = true;
    }
    
  }

  async setUpSecureStorageVault(){
    const secureStorageVaultConfig = {
      key: 'io.cv5.test' + '.securestorage',
      type: VaultType.SecureStorage,
      deviceSecurityType: DeviceSecurityType.None,
      shouldClearVaultAfterTooManyFailedAttempts: false,
      unlockVaultOnLoad: false,
    };
    this.secureStorageVault = this.platform.is("cordova")
      ? new Vault(secureStorageVaultConfig)
      : new BrowserVault(secureStorageVaultConfig);
      alert('vault exists setUpSecureStorageVault ==== ' + await this.secureStorageVault.doesVaultExist());
    //await this.checkForVaultReset();
    
    this.setUpSecureStorageVaultCallbacks();
    
  }

  async setUpBiometricsVault(){
    const biometricsVaultConfig = {
      key: 'io.cv5.test' + '.biometrics',
      type: VaultType.DeviceSecurity,
      deviceSecurityType: DeviceSecurityType.Biometrics,
      lockAfterBackgrounded: 6,
      shouldClearVaultAfterTooManyFailedAttempts: false,
      customPasscodeInvalidUnlockAttempts: 1,
      unlockVaultOnLoad: false,
    };
    this.biometricsVault = this.platform.is("cordova")
      ? new Vault(biometricsVaultConfig)
      : new BrowserVault(biometricsVaultConfig);

    //this try catch is required to know if the user modified permissions from device settings
    try {
      await this.biometricsVault.doesVaultExist();
      alert('vault exists setUpBiometricsVault ==== ' + await this.biometricsVault.doesVaultExist());
    } catch (error) {
      alert('error while checking setUpBiometricsVault.doesVaultExist '+ JSON.stringify(error));
      await this.secureStorageVault.clear();
      await this.setUpSecureStorageVault();
    }
    
    this.setUpBiometricsVaultCallbacks();
  }

  async resetVaultConfigOnError() {
    alert('clearing biometrics vault');
    await this.biometricsVault.clear();
    await this.setUpBiometricsVault();
  }

  

  async setUpDeviceState() {
    this.deviceState.isBiometricsEnabledOnDevice = this.platform.is("cordova")
      ? await Device.isBiometricsEnabled()
      : false;
    this.deviceState.isBiometricAccessEnabledForTheApp = this.platform.is(
      "cordova"
    )
      ? await Device.isBiometricsSupported()
      : false;
    this.deviceState.isLockedOutOfBiometrics = await Device.isLockedOutOfBiometrics();
  }

  async setUpSupportedHardwareTypes() {
    const hardWareTypes = await Device.getAvailableHardware();
    const biometricStrengthLevel = await Device.getBiometricStrengthLevel();
    const isBiometricsEnabled = await Device.isBiometricsEnabled();
    if (isBiometricsEnabled) {
      if (hardWareTypes.indexOf(SupportedBiometricType.Fingerprint) !== -1) {
        this.deviceState.hardWareType = SupportedBiometricType.Fingerprint;
      } else if (
        hardWareTypes.indexOf(SupportedBiometricType.Face) !== -1 &&
        biometricStrengthLevel === BiometricSecurityStrength.Strong
      ) {
        this.deviceState.hardWareType = SupportedBiometricType.Face;
      } else {
        this.deviceState.hardWareType = "none";
      }
    }
  }

  setUpSecureStorageVaultCallbacks() {
    this.secureStorageVault.onError(async (error) => {
      alert('error in secure storage vault onError == ' + JSON.stringify(error));
    });
  }

  setUpBiometricsVaultCallbacks() {
    

    this.biometricsVault.onError(async (error) => {
      alert('error in biometricsVault vault onError == ' + JSON.stringify(error));
      this.deviceState.isLockedOutOfBiometrics = await Device.isLockedOutOfBiometrics();
      
    });
  }

  async lockVault() {
    await this.biometricsVault.lock();
  }

  async unlockVault() {
    await this.biometricsVault.unlock();
  }

  async setValue(key: string, value: string) {
    await this.biometricsVault.setValue(key, value);
  }

  async getValue(key: string) {
    return await this.biometricsVault.getValue(key);
  }

  setPrivacyScreen(enabled: boolean) {
    Device.setHideScreenOnBackground(enabled);
  }

  
}

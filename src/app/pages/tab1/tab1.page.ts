import { Component } from '@angular/core';
import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  swiperOpts = {
    allowSlidePrev: false,
    allowSlideNext: false
  }

  constructor(private barcodeScanner: BarcodeScanner) {}

  ionViewDidEnter(){
    console.log('DidEnter');
    
  }

  ionViewDidLeave(){
    console.log('DidLeave');
    
  }

  ionViewWillEnter(){
    console.log('WillEnter');
    this.scan();
  }

  ionViewWillLeave(){
    console.log('WillLeave');
    
  }

  scan(){
    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
     }).catch(err => {
         console.log('Error', err);
     });
  }

}

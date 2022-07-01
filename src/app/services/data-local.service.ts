import { Injectable } from '@angular/core';
import { Registro } from '../models/registro.model';
import { Storage } from '@ionic/storage-angular';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { File as ionFile } from '@awesome-cordova-plugins/file/ngx';
import { EmailComposer } from '@awesome-cordova-plugins/email-composer/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  guardados: Registro[] = [];
  private _storage: Storage | null = null;

  constructor(private storage: Storage, private navCtrl: NavController, private iab: InAppBrowser, private file : ionFile, private emailComposer: EmailComposer) {
    this.init();
  }

  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    await this.storage.create()
    .then(async resp => { await this.cargarStorage(); });
  }

  async cargarStorage(){
    this.guardados = await this.storage.get('registros') || [];
  }

  async guardarRegistro(format: string, text: string){

    await this.cargarStorage();

    const nuevoRegistro = new Registro (format, text);
    this.guardados.unshift(nuevoRegistro);

    console.log(this.guardados);
    this.storage.set('registros', this.guardados);

    this.abrirRegistro(nuevoRegistro);
  }

  abrirRegistro( registro: Registro){
    this.navCtrl.navigateForward('/tabs/tab2');
    switch(registro.type){
      case 'http':
        this.iab.create(registro.text,'_system');
        break;

      case 'geo':
        console.log(registro.text);
        const geo = registro.text.split(':')[1].split('?')[0];
        this.navCtrl.navigateForward(`/tabs/tab2/mapa/${geo}`);
        break;
    }
  }

  enviarCorreo(){
    console.log("evniar correo");
    const arrTemp = [];
    const titulos = 'Tipo, Formato, Creado en, Texto\n';
    arrTemp.push(titulos);
    this.guardados.forEach(registro => {
      const linea = `${registro.type},${registro.format},${registro.created},${registro.text.replace(',',' ').split('?')[0]}\n`;
      arrTemp.push(linea);
    });

    this.crearArchivoFisico(arrTemp.join(''));
  }

  crearArchivoFisico(text: string){
    this.file.checkFile(this.file.dataDirectory,'registros.csv').then(existe => {
      console.log('Existe archivo?',existe);
      return this.escribirEnArchivo(text);
    }).catch(err => {
      return this.file.createFile(this.file.dataDirectory, 'registros.csv', false).then(creado => this.escribirEnArchivo(text)).catch(err2 => {console.log('No se pudo crear el archivo', err2)});
    })
  }

  async escribirEnArchivo(text: string){
    await this.file.writeExistingFile(this.file.dataDirectory, 'registros.csv', text);
    console.log('Archivo Creado ...');
    console.log(this.file.dataDirectory + 'registros.csv');
    const archivo = `${this.file.dataDirectory}/registros.csv`;
    const email = {
      to: '',
      attachments: [
        archivo
      ],
      subject: 'Backup Scans',
      body: 'Backup de Scans - <strong>ScanApp</strong>',
      isHtml: true
    }
    this.emailComposer.open(email);
  }
}

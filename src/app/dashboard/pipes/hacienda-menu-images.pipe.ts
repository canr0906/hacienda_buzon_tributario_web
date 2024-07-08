import { Pipe, PipeTransform } from '@angular/core';
import { PortalMenu } from '@dashboard/interfaces/portal-menu.interfaz';
import { DataConceptsStruct } from '../../shared/interfaces/concepts-response-struct.interface';

@Pipe({
  name: 'haciendaMenuImages',
  standalone: true
})
export class HaciendaMenuImagesPipe implements PipeTransform {

  transform(item:DataConceptsStruct): string {//, resolution:string): string {
    let path = 'assets/images/haciendamenu/';
    //if(resolution == 'Small' || resolution == 'XSmall')
    //  path += '256x256/'
    if (!item.titulo) {
      return `${path}no-image.png`;
    }
    //return `${path}${item.titulo.slice(0,-5).replace(/ /g, "").replace(/\./g,"").toLowerCase()}.png`;
    return `${path}${item.titulo.replace(/ /g, "").replace(/\./g,"").toLowerCase()}.png`;
  }

}

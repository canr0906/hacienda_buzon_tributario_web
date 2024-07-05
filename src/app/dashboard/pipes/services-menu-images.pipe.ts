import { Pipe, PipeTransform } from '@angular/core';
import { PortalMenu } from '@dashboard/interfaces/portal-menu.interfaz';

@Pipe({
  name: 'servicesMenuImages',
  standalone: true
})
export class ServicesMenuImagesPipe implements PipeTransform {

  transform(item:PortalMenu): string {//, resolution:string): string {
    let path = 'assets/images/servicemenu/';
    //if(resolution == 'Small' || resolution == 'XSmall')
    //  path += '256x256/'
    if (!item.iconName) {
      return `${path}no-image.png`;
    }
    //return `${path}${item.titulo.slice(0,-5).replace(/ /g, "").replace(/\./g,"").toLowerCase()}.png`;
    return `${path}${item.iconName}.png`;
  }

}

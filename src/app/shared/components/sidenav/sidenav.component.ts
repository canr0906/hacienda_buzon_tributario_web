import { Component, signal } from '@angular/core';

import { CommonModule } from '@angular/common';

import {LoadSpinnerComponent} from '@shared/components/load-spinner/load-spinner.component';

import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import { DataConceptsStruct } from '@dashboard/interfaces/concepts-response-struct.interface';
import { UserStruct } from '@auth/interfaces/user-struct.interface';

export interface IdPadre {
  padreId: number
}

@Component({
  selector: 'hacienda-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    LoadSpinnerComponent,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatCardModule
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent {
  /* NOTA: EN LOS MENUS ANIDADOS CONTROLA EL BOTON DE BACK */
  public showBack = signal<boolean>(false);
  /* MANEJO DE ARREGLO DE CONCEPTOS A MOSTRAR */
  public conceptsArr = signal<DataConceptsStruct[]>([]);

  /* MANEJO DE LA ESTRUCTURA DE RESPONSE DE USUARIO LOGEADO */
  private roles: UserStruct = JSON.parse(localStorage.getItem('user')!);

  activeIdParent(padreId: number, idConcepto: number, id: number) {
    let x: IdPadre[] = JSON.parse(localStorage.getItem('idParent_admin')!);
    if (x) {
      x.push({ 'padreId': padreId });//x.forEach(() => x.push({ 'padreId': padreId }))
      localStorage.setItem('idParent_admin', JSON.stringify(x));
    } else {
      localStorage.setItem('idParent_admin', JSON.stringify([{ padreId: padreId }]));
    }
    return;
  }

  backMenu() {
    /*if (localStorage.getItem('idParent_admin')) {
      localStorage.removeItem('contribuyente_admin');
      let idParent: IdPadre[] = JSON.parse(localStorage.getItem('idParent_admin')!);
      if (idParent.length > 1) {
        const idControl = idParent[idParent.length - 2].padreId;
        idParent.pop();
        if (idParent.length === 1) {
          localStorage.removeItem('idParent_admin');
          this.showBack.set(false);
        }
        localStorage.setItem('idParent_admin', JSON.stringify(idParent));
        this.conceptsArr.set([]);
        if (idParent[idParent.length - 1].padreId === 0) {
          this.recursiveReq(this.roles.roles, 0, 0);
          return
        }
        this.buidMenuAsync('', idParent[idParent.length - 1].padreId, 0);//this.buidMenuAsync([], idParent[idParent.length - 1].padreId, false);
        return;
      }
      return;
    }*/
    return;
  }

  async buidMenuAsync(roles: string, idConcept: number, flag: number, flagChildControl?: number) {
    /*await this.generalService.requestConcepts(roles, idConcept, flag)
      .then(request => request.json())
      .then((resp: Conceptos) => {
        if (resp.success == true) {
          if (resp.data.length > 0) {
            resp.data.map((concepts, k) => {
              if (concepts.gestora === 0) {
                if (concepts.url !== null)
                  return;
                this.controlAddItem.set(concepts.pk,0);
                this.buidMenuAsync(this.roles.roles, concepts.pk, 0, 1)
                  .then(respB => {
                    if (this.controlAddItem.get(concepts.pk) == 1) {
                      this.conceptsArr.update(() => [...this.conceptsArr(), concepts]);
                    }
                  });

              } else {
                if (this.roles.roles.includes(concepts.rol.toString())) {
                  if (flagChildControl !== 1) {
                    this.conceptsArr.update(() => [...this.conceptsArr(), concepts]);
                  }
                  this.controlAddItem.set(idConcept,1);
                }
              }
            });
          } else {
            return;
          }
        } else {
          return;
        }
      })
      .catch(error => console.log('ERRRROOOOOOO: ' + error));*/
  }

  actionList(pk: number, idConcepto: number, rol: number, gestora: number, idFath: number) {
    /*let conceptSelect = this.conceptsArr().filter(concepto => concepto.pk == pk);
    const roles = JSON.parse(localStorage.getItem('user')!);

    if (gestora === 0) {
      this.activeIdParent(pk, idConcepto, pk);
      this.conceptsArr.set([]);
      if (idFath === 0)
        this.buidMenuAsync('', pk, 0, 0);//this.buidMenuAsync([], pk, false)
      else
        this.buidMenuAsync(this.roles.roles, pk, 0, 0);
      if (JSON.parse(localStorage.getItem('idParent_admin')!).length > 1)
        this.showBack.set(true);
      return;
    }

    if (this.conceptsArr().filter(resp => resp.idConcepto === idConcepto && resp.combinable == 1).length == 0) {
      (localStorage.getItem('contribuyente_admin')) ? localStorage.removeItem('contribuyente_admin') : '';
    }

    this.dellLocalStore();

    localStorage.setItem('gestora_admin', String(gestora));
    localStorage.setItem('route_origen_admin', String(this.conceptsArr().filter(concepto => concepto.pk == pk)[0].url));

    this.isLoading.set(false);
    this.buildTitle(this.conceptsArr().filter(concepto => concepto.pk == pk)[0].titulo);

    if (idConcepto > 0 || gestora > 0) {
      this.changSidenav.toggle();
    }

    if (conceptSelect[0].formulario > 1) {
      if (conceptSelect[0].formulario === 10 || conceptSelect[0].formulario === 1 || conceptSelect[0].formulario === 17) {
        this.router.navigate(['/dashboard/' + String(this.conceptsArr().filter(concepto => concepto.pk == pk)[0].url), idConcepto, conceptSelect[0].formulario]);
        return;
      }
      this.router.navigate(['/dashboard/' + String(this.conceptsArr().filter(concepto => concepto.pk == pk)[0].url)]);
      return;
    }
    this.router.navigate(['/dashboard/' + String(this.conceptsArr().filter(concepto => concepto.pk == pk)[0].url), idConcepto, conceptSelect[0].formulario]);*/
  }
}

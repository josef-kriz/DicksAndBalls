import {
  Injectable,
  Injector,
  ComponentFactoryResolver,
  EmbeddedViewRef,
  ApplicationRef,
} from '@angular/core'

@Injectable()
export class DomService {

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
  ) {
  }

  appendComponentToBody(component: any, timeout = 5000) {
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(component)
      .create(this.injector)

    this.appRef.attachView(componentRef.hostView)

    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement

    document.body.appendChild(domElem)

    setTimeout(() => {
      this.appRef.detachView(componentRef.hostView)
      componentRef.destroy()
    }, timeout)
  }
}

# HaciendaBuzonTributarioWeb

1.- Validacion del formulario de Login
2.- Manejo de loading en los distintos componentes
3.- En taxpayer-datacontact checar que cuando se valida el tipo sale un error
4.- En taxpayer-recurrentcontrib checar la validacion de los campos
2108/2024
5.- Ajustar los metodos de mensajes de los modulos taxpayer y checar los demas modulos
6.- generar el modulo de edicion de datos de usuarios
7.- Falta integrar el generar las notificaciones en automatico, es decir cuando haba login invocar metodo de generacion de mensajes 

hbtw_user
hbtw_token
hbtw_general -> contendra todos los datos que usaran los modulos
      localStorage.removeItem('hbtw_contribuyente_only');
      localStorage.removeItem('hbtw_vehicle_data_adicional');
      localStorage.removeItem('hbtw_datos_cobro');
      localStorage.removeItem('hbtw_repetir_concepto');
      localStorage.removeItem('hbtw_cachestore');

      hbtw_idParent?: StorageDataParentStruct[];
      hbtw_gestora?: string;
      hbtw_route_origen?: string;
      hbtw_concept?: string;
      hbtw_vehicle_data?: VehicleDataRequestStruct;
      hbtw_contribuyente?: VehicleDataResponseStruct;
      hbtw_datos_poliza?: PolizaDataResponse;

      hbtw_contribuyente_only?: string;
      hbtw_vehicle_data_adicional?: string;
      hbtw_datos_cobro?: string;


    {
        
        
        26/07/2024
        https://miposicionamientoweb.es/como-instalar-wordpress-local/
        https://kinsta.com/es/blog/wordpress-iframe/
        https://stackoverflow.com/questions/54224299/wordpress-plugin-for-angular-application
        https://www.freecodecamp.org/espanol/news/como-crear-una-aplicacion-web-moderna-usando-wordpress-y-react/
        https://dev.to/stephenwhitmore/take-your-wordpress-site-farther-with-angular-3o6p

        https://puntotech.github.io/rxjs-docu/operators/creation/from


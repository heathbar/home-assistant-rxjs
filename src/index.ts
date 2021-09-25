import { BehaviorSubject, Observable } from 'rxjs';
import { getAuth, createConnection, subscribeEntities, HassEntity, AuthData, Connection, subscribeConfig, HassConfig, HassEntities, subscribeServices, HassServices } from 'home-assistant-js-websocket';
import { distinctUntilKeyChanged, filter, pluck } from 'rxjs/operators';

const DEFAULT_OPTIONS = {
  autoConnect: true,
  tokenKey: 'hass-token'
};

export class HomeAssistant {

  private connection: Connection | undefined;
  private options: any;

  public config$ = new BehaviorSubject<HassConfig | {}>({});
  public entities$ = new BehaviorSubject<{ [key: string]: HassEntity }>({});
  public services$ = new BehaviorSubject<HassServices>({});

  constructor(private host: string, opts = {}) {
    this.options = { ...DEFAULT_OPTIONS, opts };

    if (this.options.autoConnect) {
      this.connect();
    }
  }

  async connect() {
    let auth;
    try {
      const config = {
        hassUrl: this.host,
        saveTokens: this.saveTokens.bind(this),
        loadTokens: this.loadTokens.bind(this)
      };
      auth = await getAuth(config);
    } catch (err) {
      alert(`Unknown error ${err}`);
      return;
    }

    this.connection = await createConnection({ auth });

    subscribeConfig(this.connection, config => this.config$.next(config));
    subscribeEntities(this.connection, entities => this.entities$.next(entities));
    subscribeServices(this.connection, services => this.services$.next(services));
  }

  private saveTokens(tokens: AuthData | null) {
    sessionStorage.setItem(this.options.tokenKey, JSON.stringify(tokens));
  }

  private loadTokens(): Promise<AuthData | null | undefined> {
    return new Promise((resolve, reject) => {
      try {
        resolve(JSON.parse(sessionStorage.getItem(this.options.tokenKey) as string));
      } catch (err) {
        reject();
      }
    });

  }
}

export function selectEntity(entityId: string) {
  return <T extends HassEntities>(source: Observable<T>) => {
    return source.pipe(
      pluck(entityId),
      filter(entity => !!entity),
      distinctUntilKeyChanged('last_updated')
    );
  };
}

export function selectEntityState(entityId: string) {
  return <T extends HassEntities>(source: Observable<T>) => {
    return source.pipe(
      selectEntity(entityId),
      pluck('state')
    );
  };
}

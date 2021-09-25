# home-assistant-rxjs
A simple service that exposes Home Assistant events as an RxJs stream (with TypeScript support).

## Usage

### Subscribe to all entities

```TypeScript
const hass = new HomeAssistant('http://192.168.0.101:8123');

hass.entities$.subscribe(entities => console.log(entities));
hass.config$.subscribe(entities => console.log(entities));
hass.services$.subscribe(entities => console.log(entities));
```

The library also includes the following operators

###  selectEntity

Filters out all events except for the specified entity

```TypeScript
hass.entities$.pipe(
    selectEntity('sensor.temperature')
).subscribe(temperatureEntity => console.log(temperatureEntity));

// Emits HassEntity instances 

{
    attributes: { 
        device_class: "temperature"
        friendly_name: "Outdoor Temperature"
        icon: "mdi:thermometer"
        unit_of_measurement: "°F"
    },
    context: { ... },
    entity_id: 'sensor.temperature',
    last_changed: "2021-09-25T05:18:10.850272+00:00"
    last_updated: "2021-09-25T05:18:10.850272+00:00",
    state: '47.4'
}

```

###  selectEntityState

Filters out all events except for the specified entity and emit only the current state of the given entity

```TypeScript
hass.entities$.pipe(
    selectEntityState('sensor.temperature')
).subscribe(temperatureState => console.log(temperatureState));

// Emits strings

'47.4'
```

### Additional Information

This library was designed with the browser in mind, although it would not be much work to make it work in node. 

This library relies on the official [home-assistant-js-websocket](https://github.com/home-assistant/home-assistant-js-websocket) library to provide OAuth authorization to your Home Assistant instance.

On first launch, the library will forward the browser to the specified Home Assistant host to initiate an OAuth session. On success, the library will store the auth token it receives in sessionStorage.

#### autoConnect

By default, the library will initiate a connection when you create a new `HomeAssistant` instance. This can be disabled as follows

```TypeScript
const hass = new HomeAssistant('http://192.168.0.101:8123', { autoConnect: false });

// and later...

await hass.connect()
```

#### tokenKey

By default, the library will store its auth token in session storage under the key `hass-token`. This can be changed as follows

```TypeScript
const hass = new HomeAssistant('http://192.168.0.101:8123', { tokenKey: 'some-other-key' });
```

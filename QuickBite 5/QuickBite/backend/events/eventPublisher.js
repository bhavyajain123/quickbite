const EventEmitter= require("events");
const eventBus= new EventEmitter();
eventBus.getMaxListeners(50);

function publishEvent(eventName, payload={}){
    if(typeof eventName!=="string"|| !eventName.trim()){
        throw new Error("valid event name is req");
    }
    if(!payload|| typeof payload!== "object"|| Array.isArray(payload)){
        throw new Error("event payload should be object");
    }
    console.log("publishing event:", eventName);
    eventBus.emit(eventName, payload);
}
function subscribeToEvent(eventName, handler){
    if(typeof handler!=="function"){
        throw new Error("event handler must be function");
    }
    eventBus.on(eventName, handler);
    return()=> eventBus.off(eventName, handler);
}
module.exports={publishEvent, subscribeToEvent};
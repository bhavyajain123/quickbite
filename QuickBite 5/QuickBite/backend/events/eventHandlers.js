const{subscribeToEvent}= require("./eventPublisher");
const{order_events}=require("./orderEvents");
const{payment_events}=require("./paymentEvents");

let registered= false;
let unsubscribeHandlers=[];
function registerEventHandlers(){
    if(registered){
        return;
    }
    unsubscribeHandlers=[subscribeToEvent(order_events.created, (event)=>{
        console.log("order created event recieved:", event);
    }),
    subscribeToEvent(order_events.status_updated,(event)=>{
        console.log("order status updated event recieved:",event);
    }),
    subscribeToEvent(order_events.cancelled,(event)=>{
        console.log("order cancelled event recieved:",event);
    }),
    subscribeToEvent(payment_events.successful,(event)=>{
        console.log("payment successful recieved:", event);
    } ),
        subscribeToEvent(payment_events.failed,(event)=>{
        console.log("payment faield  recieved:", event);
    }),
         subscribeToEvent(payment_events.refund_completed,(event)=>{
        console.log("refund completed event recieved:", event);
    }),

];
registered = true;
console.log("quickbite event handlers registered");
}
function unregisterEventHandlers(){
    unsubscribeHandlers.forEach((unsubscribe)=>unsubscribe());
    unsubscribeHandlers=[];
    registered=false;
}

module.exports={registerEventHandlers,unregisterEventHandlers};
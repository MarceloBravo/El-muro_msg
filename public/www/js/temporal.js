messaging.setBackgroundMessageHandler(payload=>{
    console.log('Received background message',payload);

    var mensaje = JSON.parse(payload);

    const notificationTitle = mensaje.title;
    const notificationOptions = {
        body: mensaje.body,
        icon: '/img/firebase.png',
    }

    return self.registration.showNotification(notificationTitle, notificationOptions)
});

if(enableForegroundNotification){
    const { title, ...options } = JSON.parse(payload.data.notification);
    navigator.serviceWorker.getRegistration().then(registration =>{
        //registration[0].
    })
}
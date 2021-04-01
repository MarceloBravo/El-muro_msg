
document.addEventListener('deviceready', onDeviceReady, false);
$('#btn-registrar').on('click',registrar);
$('#btn-login').on('click',login);
$('#btn-logout').on('click',logout);

const database = firebase.database().ref('muro');
const messaging = firebase.messaging();
let data = {};
var user = null
let totMensajes = 0;
let totalLikes = 0;


messaging.requestPermision().then(() => {
	console.log('Ok');
	return messaging.getToken();
}).then(token =>{
	console.log(token);
}).catch(error => {
	console.log(error);
});

messaging.onMessage(payload => {
	console.log('Mensaje recibido: ', payload);
});

messaging.oneTokenRefresh(()=>{
	messaging.getToken().then(newToken => {
		console.log('New Token: ',newToken);
	}).catch(error => {
		console.log(error);
	});
});



setInterval(function(){ detectarCambios(); }, 3000);

function onDeviceReady() {
	database.on('value', (snapshot) => {
		data = snapshot.val();
		totMensajes = data.length;
	  });
}

function detectarCambios(){
	let likes = data.likes ? data.tot_likes.likes : 0;
	
	if(Object.keys(data).length !== totMensajes || totalLikes !== likes){
		listarMensajes();
		totMensajes = Object.keys(data).length;
		totalLikes = likes;
	}
}


//Registrar un nuevo usuario 
  async function registrar(){
	$('#lbl_msg_alert').text('');
    const name = $('#user_name').val();
    const email = $('#user_email').val();
    const password = $('#user_pass').val();
    const password_confirm = $('#confirm_user_pass').val();
    
    if(!validaDatosRegister(name, email, password, password_confirm)){
		return;
	}
    
    // creamos el nuevo usuario
    await firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((user) => {
        let usuario = firebase.auth().currentUser; 		
        usuario.updateProfile({
        displayName: name,
        }).then(function() {
			
            $('#div-login').css('display','none');
			$('#div-chat').css('display','block');
            
            setUser(usuario);  
			
			listarMensajes();
        }).catch(function(error) {
			$('#lbl_msg_alert').text(error.message)
        });
        
    })
    .catch((error) => {
		$('#lbl_msg_alert').text('Ocurrió un error al intentar registrar el usuario: ' + error.message);
    });
  }

  function validaDatosRegister(name, email, password, password_confirm){
	  let msg = '';
	//comprobamos que el nombre no esté en blanco
    if(name === '' && msg === '')msg  = 'El nombre él obligatorio.'; 

    //Comprobamos que el correo electrónico sea válido
    if (ValidaEmail(email) == false  && msg === '') msg = 'Ingrese un correo válido.';
      	
    // comprobamos que ambas contraseñas coincidan
    if ((password === '' || password !== password_confirm)  && msg === '') msg = 'Contraseñas deben coincidir.';

	$('#lbl_msg_alert').text(msg);
	return msg === '';
  }

  
  function ValidaEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
    }


	//Identificación de usuario
  function login()
  {
	$('#lbl_msg_alert').text('');
    const email = $('#user_email_login').val();
    const password = $('#user_pass_login').val();
    if (ValidaEmail(email) == false)
    {
		$('#lbl_msg_alert').text('Ingrese un correo válido.');
      	$('#user_email_login').focus();
      	return false;
    }
    if(password === ''){
		$('#lbl_msg_alert').text('Debe ingresar su contraseña.');
      	return false;
    }
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(user => {
      let usuario = firebase.auth().currentUser;
	  	$('#div-login').css('display','none');
		$('#div-chat').css('display','block');
      
		$('#user_email_login').val('');
    	$('#user_pass_login').val('');

		setUser(usuario);

		listarMensajes();

    })
    .catch(function(error) {  // Handle Errors here.      
		$('#lbl_msg_alert').text("Error: " + error.code + ". " + error.message);
      	$('#alert-danger').css('display','block');
    });

	
  }


  function logout(){
      try{
        firebase.auth().signOut();

        $('#div-login').css('display','block');
		$('#div-chat').css('display','none');
        
        setUser(null);
      }catch(error){
        $('#lbl-info-danger').text(error.message);
        $('#alert-danger').css('display','block');
      }
  }

  function setUser(usuario){
	  user = usuario;
    $('#h-user_name').html(user ? user.displayName : '');
  }


  $('#btn-send_post').on("click",() => {
	let mensaje = $('#txt-new_post').val();
	let fecha = new Date();
	$('#muro_mensajes').append(`
		<li class="send-by-me">
			<div class="item_post">
				<label class="lbl-info">${user.displayName}<span>dice...</span> <span class="sp-hora-info">${fecha.toLocaleDateString()}</span></label> 
				<label class="lbl-messagge">${mensaje}</label>
			</div>
			<button class="btn btn-danger" onClick="borrar('${fecha.toLocaleDateString()}')">
			
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
				<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
				<path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
			</svg>

			</button>
			<div class="likes-info">
				<label class="lbl-like-title">Likes: </label>
				<label class="lbl-circle-likes">0</label>
			</div>								
		</li>
	`);
	$('#txt-new_post').val('');
	var chatBox;
	chatBox = document.querySelector('#muro_mensajes');
	chatBox.scrollTop = chatBox.scrollHeight;
	grabarMensaje(user, mensaje);
	
  });


  function borrar(id)
  {
	database.child(id).remove().then(res => {
		listarMensajes();
		alert('El mensaje ha sido borrado');
	}).catch(error => {
		console.log(error);
		alert('Ocurrió un error al intentar borrar el mensaje');
	});
  }

  //Actualiza un mensaje sumando un like al campo like del registro
  function like(id, uid, cantLikes, mensaje, nombre){
	  
	firebase.database().ref('muro/' + id).set({
		mensaje: mensaje,
		uid: uid,
		usuario: nombre,
		likes: cantLikes+1,
		comentario: '',
	}).catch(error => {
		console.log(error)
	});
	  
	  totalLikes+=1
	firebase.database().ref('muro/tot_likes').set({
		likes: totalLikes
	}).catch(error => {
		console.log(error)
	});
  }



  function grabarMensaje(usuario, mensaje){
	  let fecha = new Date();
	  
	  firebase.database().ref('muro/' + fecha.toLocaleString()).set({
		mensaje: mensaje.split("'").join('´').split('"').join('´´').split("`").join('´'),
		uid: usuario.uid,
		usuario: usuario.displayName,
		likes: 0,
		comentario: '',
	  }).catch(error => {
		  console.log(error)
	  });

	  firebase.database().ref('muro/tot_likes').set({
		likes: totalLikes
	  }).catch(error => {
		  console.log(error)
	  });
  }



  function listarMensajes(){
	  if(user){
	  	let lstMensajes = '';
	  
		Object.keys(data).map(id => {
			
			if(id !== 'tot_likes'){
			
				lstMensajes += `
					<li class="${data[id].uid === user.uid ? 'send-by-me' : 'another-user'}">
						<div class="item_post">
							<label class="${data[id].uid === user.uid ? 'lbl-my-info' : 'lbl-another-info'} lbl-info">${data[id].usuario} <span>dice...</span><span class="sp-hora-info">${id}</span></label> 
							<label class="lbl-messagge">${data[id].mensaje}</label>
						</div>
						
						${data[id].uid !== user.uid ? `
							<button class="button btn_like" onclick="like('${id}','${data[id].uid}',${data[id].likes ? data[id].likes : 0}, '${data[id].mensaje}','${data[id].usuario}')">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
									<path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
								</svg>
								Likes 
								<label class="lbl-circle-likes">${data[id].likes ? data[id].likes : 0 }</label>
							</button>
						` : `
							<button class="btn btn-danger" onClick="borrar('${id}')">
							
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
							<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
							<path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
							</svg>
							
							</button>
							<div class="likes-info">
								<label class="lbl-like-title">Likes: </label>
								<label class="lbl-circle-likes">${data[id].likes ? data[id].likes : 0 }</label>
							</div>
						`
						}
					</li>`;

			}

		});
		$('#muro_mensajes').html(lstMensajes);
		var chatBox;
		chatBox = document.querySelector('#muro_mensajes');
		chatBox.scrollTop = chatBox.scrollHeight;
	}
  }


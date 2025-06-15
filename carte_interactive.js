// Création d'une carte dans la balise div "map",
// et position de la vue sur un point donné et un niveau de zoom
var map = L.map('map').setView([45.75, 4.85], 12);

// Ajout d'une couche de dalles OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Création du groupe de markers pour le clustering
var markers = L.markerClusterGroup();

function load_data() {
  var xhr = new XMLHttpRequest();

  xhr.onload = function() {
    var data = JSON.parse(this.responseText);
    markers.clearLayers();

    for (let n = 0; n < data.length; n++) {
      var marker = L.marker([data[n].lat, data[n].lon])
        .bindPopup('Station ' + data[n].name)
        .on('click', function(e) {
          OnMarkerClick(e, data[n].idstation);
        });
      markers.addLayer(marker);
    }

    map.addLayer(markers);
  };

  xhr.open('GET', '/location', true);
  xhr.send();
}

function suppression(e,id_supp) {
  //suppresion de la station de la liste
  var hide = document.getElementById('stations-selec').value
  var liste_stations = hide.split('-')
  var new_hide=''

  for (let i = 1; i < liste_stations.length; i++) {
		if (liste_stations[i]!=id_supp){
			new_hide=new_hide+'-'+liste_stations[i];
  }};
  document.getElementById('stations-selec').value=new_hide;
  document.getElementById(id_supp).remove();
  //Récupération des dates de début et fin
  var date_debut = document.getElementById('date-debut').value;
  var date_fin = document.getElementById('date-fin').value;
	
  var image = document.querySelector('#image'),
	  titre = document.querySelector('#titre');

  var r = new XMLHttpRequest();
	
  r.onload = function() {
	var data = JSON.parse(this.responseText);
	image.src = data.img;
	image.alt = data.title;
	
	titre.innerHTML = data.title;
	};
  // si l'utilisateur avait précédemment sélectionné un type de vélo, on le récupère dans l'URL
  var urimage = image.src
  // On vérifie qu'il existe une image précédente et si oui on récupère type de vélo
  if (image.src!=''){
	urimage = urimage.split('/')[4]
	urimage=urimage.slice(0, -4);
	urimage=urimage.split('_');
	if (urimage.length>=5){
		var type =  urimage[2]
		r.open('GET','/description/'+new_hide+'/'+type+'/'+date_debut+'/'+date_fin,true);}
	else
		r.open('GET', '/description/' + new_hide+'/'+date_debut+'/'+date_fin, true);
	}
  else
    {r.open('GET', '/description/' +new_hide+'/'+date_debut+'/'+date_fin, true);}
 r.send();
}

function OnMarkerClick(e,idstation) {
	
  //Chargement de la liste des stations déjà sélectionnée pour vérifier si idstation a déjà été sélectionnée
  var hide = document.getElementById('stations-selec').value
  var liste_stations = hide.split('-')
  if (!liste_stations.includes(idstation)){
	//Récupération des dates de début et fin
	var date_debut = document.getElementById('date-debut').value;
	var date_fin = document.getElementById('date-fin').value;
	
	var image = document.querySelector('#image'),
		titre = document.querySelector('#titre');

	var r = new XMLHttpRequest();
	
	//Creation d'un bouton pour la station qui permettra de supprimer son tracé 
	var paragraphe = document.getElementById('liste_stations');
	var bouton = document.createElement('button');
	bouton.innerHTML = idstation;
	bouton.id=idstation;
	bouton.addEventListener('click', function(event) {
		suppression(event, idstation);
	});
	paragraphe.appendChild(bouton);
	
	//Ajout de la nouvelle station à la liste de celles précédement sélectionnée
	document.getElementById('stations-selec').value=hide+'-'+idstation;
	
	r.onload = function() {
		var data = JSON.parse(this.responseText);
		image.src = data.img;
		image.alt = data.title;
		titre.innerHTML = data.title;
	};
	// si l'utilisateur avait précédemment sélectionné un type de vélo, on le récupère dans l'URL
	var urlimage = image.src
	// On vérifie qu'il existe une image précédente et si oui on récupère type de vélo
	if (image.src!=''){
		urimage = urlimage.split('/')[4]
		urlimage=urlimage.slice(0, -4);
		urlimage=urlimage.split('_');
		if (urlimage.length>=5){
			var type =  urlimage[2]
			r.open('GET','/description/'+hide+'-'+idstation+'/'+type+'/'+date_debut+'/'+date_fin,true);}
		else
			r.open('GET', '/description/' + hide+'-'+idstation+'/'+date_debut+'/'+date_fin, true);
	}
	else
		r.open('GET', '/description/' + hide+'-'+idstation+'/'+date_debut+'/'+date_fin, true);
	
   r.send();
  }
  else {return}
}

function OnClickMenu () {

  //Récupération des dates de début et fin
  var date_debut = document.getElementById('date-debut').value;
  var date_fin = document.getElementById('date-fin').value;
  
  // objet pour l'envoi d'une requête Ajax
  var xhr = new XMLHttpRequest();
  var select = document.getElementById('graphe');
  var type = select.value;
  
  // Le numéro du lieu est récupéré via l'url courant
  var urlimage = document.getElementById('image').src
  urlimage = urlimage.split('/')[4];
  urlimage=urlimage.slice(0, -4);
  var idstation = urlimage.split('_')[1]
  // fonction appelée lorsque la réponse à la requête (description d'un lieu insolite) sera arrivée
  xhr.onload = function() {

    // transformation des données renvoyées par le serveur
    // responseText est du type string, data est un objet
	
    var data = JSON.parse(this.responseText);

    // affichage dans la zone 'description' du nom (reprise dans le popup)
    // et de la description récupérée par l'appel au serveur
    document.getElementById('image').src=data.img;
	document.getElementById('titre').innerHTML=data.title;
  };


  // Envoi de la requête Ajax pour la récupération de la description du lieu de numéro idnum
  xhr.open('GET','/description/'+idstation+'/'+type+'/'+date_debut+'/'+date_fin,true);
  xhr.send();
}

function onDateChange() {
  
  //Récupération des dates de début et fin
  var date_debut = document.getElementById('date-debut').value;
  var date_fin = document.getElementById('date-fin').value;
  
  if (date_debut<=date_fin){
  //objet pour l'envoi d'une requête Ajax
  var xhr = new XMLHttpRequest();
  
  //fonction appelée lorsque la réponse à la requête (description d'un lieu insolite) sera arrivée
  xhr.onload = function() {

    //transformation des données renvoyées par le serveur
    //responseText est du type string, data est un objet
	
    var data = JSON.parse(this.responseText);

    //affichage dans la zone 'description' du nom (reprise dans le popup)
    //et de la description récupérée par l'appel au serveur
    document.getElementById('image').src=data.img;
	//document.getElementById('text').style.display="none";
	document.getElementById('titre').innerHTML=data.title;
	document.getElementById('text').innerHTML=''
  };

  //Le numéro du lieu est récupéré via l'url courant
  var urlimage = document.getElementById('image').src
  urlimage= urlimage.split('/')[4];
  urlimage=urlimage.slice(0, -4);
  urlimage=urlimage.split('_')
  var idstation = urlimage[1]
  
  //Envoi de la requête Ajax pour la récupération du graphe des dispo de la station de numéro idstation
  // on distingue le cas où un type de vélo était donné précédemment et la cas où sans type de vélo
  if (urlimage.length>=5)
    {var type =  urlimage[2]
     xhr.open('GET','/description/'+idstation+'/'+type+'/'+date_debut+'/'+date_fin,true);}
  else {
     xhr.open('GET','/description/'+idstation+'/'+date_debut+'/'+date_fin,true);}
  xhr.send();}
  else
  {document.getElementById('text').innerHTML='Erreur plage impossible'}
}

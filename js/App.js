class App {

constructor(){

//Dom element
this.$map = $('#map');
this.$info = $('#info');
this.$regist =$('#register');
this.$lat = $('#lat');
this.$long = $('#long');
this.$date_debut = $("#date_debut");
this.$date_fin = $("#date_fin");
this.$name = $("#title");
this.$check = $(".son");
this.$error = $(".errors");
this.$logo = $("#logo");
this.valider = $("#fini");
this.$inputType = $('.filtre input[type="checkbox"]');
this.$looking = $('.name');
this.$admin = $('#administrateur');
this.$client = $('#client');
this.$searchname = $("#searchname");
this.$searchdated = $("#searchdated");

this.currentSelected = null;

//tableau
this.error = [];
this.markers = [];


this.map = null;
this.main = null;

this.readMarker();
this.iniPickers();

}

iniPickers(){

    var options = {
    dayNames : ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
    dayNamesMin : ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"],
    monthNames : ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"],
    monthNamesShort : ["Jan", "Fev", "Mar", "Avr", "Mai", "Jui", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"],
    firstDay: 1,
    minDate: new Date(),
    dateFormat: "dd/mm/yy"
    };

    this.$date_debut.datepicker( options );
    this.$date_fin.datepicker( options );
}


initMap(){

    this.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -34.397, lng: 150.644},
      zoom: 8   
  });

  var that = this;
  google.maps.event.addListener(this.map, "click", function (e) {
    var position = e.latLng;
    that.$lat.val(position.lat);
    that.$long.val(position.lng);
    
  });
      
  this.main();
}


centerOnGeolocation(){

    var that = this; // on sauvegarde le contexte "this" dans la variable
    navigator
    .geolocation
    .getCurrentPosition(function( position){// Ici le "this" appartien a la function (plus celui de App)
      
        var pos = {
            lat : position.coords.latitude,
            lng : position.coords.longitude,  
        }
         that.map.setCenter(pos);
     });
  }
addMarker(position , title , date_debut,date_fin, types, logo, subscribe=false){
    var image = {
        url: logo,
        scaledSize: new google.maps.Size(50, 50)
    };
    var that = this;
    var marker = new google.maps.Marker({
        position: position,
        map: that.map,
        title:title,
        date_debut :date_debut,
        date_fin : date_fin,
        draggable:true,  
        icon:image,
        types: types,
        subscribe: subscribe
      });
      
      this.markers.push(marker);
     
      return marker;

}



addInfos(content , marker) {
    var infowindow = new google.maps.InfoWindow({
      content:  content
    });
 
    var that = this;
 
    marker.addListener("click", function(){
        that.currentSelected = this;
        
     infowindow.open( that.map, marker);
  });
 
}

checkErrors(){

    this.error = [];

     if(this.$name.val().length > 60){
        this.error['name'] = " Nom trop long caracté au dessus de 60 caractére ";
     }
     if(this.$name.val() == ""){
        this.error['name'] = " Nom non renseignier ";
     }

     if(this.$lat.val()  == ""){
        //  console.log(this.$lat, this.$lat.val());
        this.error ['lat']= " latitude non renseignier ";
            
        }
        
        if(this.$long.val()  == ""){
        this.error ['long'] = " longitude non renseignier ";
            
        }

        if(this.$date_debut.val()  == ""){
            this.error ['date_debut' ] = " Date de debut d'évenement non renseignier  ";

        }
            if(this.$date_fin.val()  == ""){
                this.error ['date_fin'] = " Date de fin d'évenement non renseignier  ";
            }

            if( $('.son:checked').length == 0 ){
                this.error ['type']= " veuillez selectionner  une musique  ";
            }
   
           
            var filename = $('#logo').val();
            if ( /\.(png)$/i.test(filename) === false ) {
                this.error ['fichier'] = " veuillez selectionner une image  png  ";
            }

            return(Object.keys(this.error).length > 0) ; 
      
}


posteErrors(){
     var div = "";
       for(var key in this.error){
            div += "<p>"+ this.error[key] + "</p>";
       }
        $(".errors").html(div);
   }

    
   saveMarker(){ 
    var noteString = JSON.stringify(this.markers);
    localStorage.setItem("marqueur", noteString);  
}

pushMarker(marker){
    this.markers.push(marker);
}



readMarker(){
    
             var notesString = localStorage.getItem("marqueur");
    
             // verifier si le storage est vide
             if (notesString == null){
                 return;
             }
    
    
             var arraymarker =  JSON.parse( notesString);
             for(var noteObjet of arraymarker){
    
                


                var position = noteObjet.position;
                var title = noteObjet.title;
                var date_debut =noteObjet.date_debut;
                var date_fin =noteObjet.date_fin;
                var marker = new Marker ( position , title , date_debut,date_fin);
                this.pushMarker(marker);
             }
}

setSearch(visTab, invisTab) {
    for(var marker of visTab) {
        marker.setVisible(true);
    }
    for(var marker of invisTab) {
        marker.setVisible(false);
    }
}

searchFestivalOrDated() {
            var visible = [];
            var invisible = [];

            var even = new RegExp(this.$searchname.val());

            var dated = new RegExp(this.$searchdated.val());

            for(var marker of this.markers){

                if ( even.test(marker.title)) {
                    visible.push(marker);
                    // marker.setVisible(true);
                } else {
                    invisible.push(marker);
                }

                if(dated.test(marker.date_debut)){
                    visible.push(marker);
                } else {
                    invisible.push(marker);
                }


                
                if(even.test(marker.title) && dated.test(marker.date_debut)){
                    visible.push(marker);
                } else {
                    invisible.push(marker);
                }

                }

        

            this.setSearch(visible, invisible);
}
    
loadMarker() {
    var that = this;
    $.ajax({
        url: "http://localhost/TP_api/API/festival",
        method: "get",
        dataType: "json",
        success: function( data ){ console.log(data);
            for(var marker of data) {
                var pos = {
                    lat: parseFloat(marker.latitude),
                    lng: parseFloat(marker.longitude)
                };
                var mapmarker = that.addMarker(pos , marker.title , marker.date_debut,marker.date_fin, marker.type_musique, marker.logo, "false"); 

                var content = "<button id='part'> Participer </button>";
                content += "<br />";
                content += "<div>"+ marker.title + "</div>";
                content += "<br />";
                content += "<div>"+marker.date_debut + "</div>";
                content += "<div>"+ marker.date_fin + "</div>";
                content+= "<p> Type de musique :</p>";
                content+= "<p> "+ marker.type_musique +" :</p>";

            that.addInfos( content, mapmarker);

            }
   
        },
        error: function( data ){
            console.log( data );
        }
    });
}
  

}

// function: loadMarker (requete ajax) vers http://localhost/TP_api/API/festival
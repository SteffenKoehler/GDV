var rentApp = (function(window, document, $, L, undefined) {

  'use strict';

  /******************************** 
  //  
  //    init variables
  //
  *********************************/

  var featureSupport = {
      // only smartphones
      isSmartphone: /android.*mobile|mobile.*android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      // tablets and smartphones
      isMobile: typeof window.orientation !== 'undefined'
    },
    // caching selectors
    ui = {
      $slider: $('#slider'),
      $salaryOutput: $('.slider-output').find('span'),
      $currentRoomSize: $('.currentSize').find('.val'),
      $tooltip: $('#tooltip'),
      $tooltipheadline: $('#tooltip').find('.headline'),
      $tooltipqm: $('#tooltip').find('.qm'),
      $tooltipbezirk: $('#tooltip').find('.bezirk'),
      $tooltipRentPrice: $('#tooltip').find('.rent-price'),
    },
    hashValues = getHashValues(),
    currentRoomCount = hashValues.rooms || config.startRoom,
    currentSalary = hashValues.salary || config.startSalary,
    map = {},
    topoLayer = {},
    lastLayer = {};

  /******************************** 
  //  
  //    map functions
  //
  *********************************/

  function initMap() {

    map = new L.Map('map', {
      center: [48.157154, 	11.546124],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: 'center'
    });

    map.options.maxZoom = 30;
    map.options.minZoom = 12;

    var osmUrl='http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png';
    var osmAttrib='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});
    map.addLayer(osm);

      //loadAjax({url : 'data/labels.json', callback : addLabels});
    loadAjax({url : 'data/berlin-zipcodes-data.topojson', callback : addTopoJson });
    loadAjax({url : 'data/hochschule.json', callback : addHochschuleMarker });
  }

  function getZoomByWindowSize() {
    var mapZoom = 11,
      screenWidth = window.innerWidth;

    if (featureSupport.isSmartphone || screenWidth < 700) {
      mapZoom = 9;
    } else if (screenWidth < 1100) {
      mapZoom = 10;
    } else if (screenWidth > 2000) {
      mapZoom = 12;
    }

    return mapZoom;
  }

  function loadAjax(params) {
    $.ajax({
      url: params.url,
      dataType: 'json'
    }).done(params.callback);
  }

  // add plz polygons that are stored in data/berlin-plz-topo.json
  function addTopoJson(topoJSON) {
    topoLayer = new L.TopoJSON();
    topoLayer.addData(topoJSON);
    topoLayer.eachLayer(function(layer) {
      layer = resetLayerStyles(layer);
      layer.on({
        'mouseover': enterPolygon,
        'mouseout': leavePolygon,
        'mousemove': setTooltipPosistion,

        // we use this for mobile devices
        'click': clickPolygon
      });
    });
    topoLayer.addTo(map);
    updateMap();
  }

  function resetLayerStyles(layer) {
    return layer.setStyle({
      'color': '#fff',
      'weight': 1,
      'opacity': .75,
      'fillOpacity': .7
    });
  }

  // add labels that are stored in data/labels.json
  function addLabels(labels) {
    labels.forEach(function(label, i) {
      var myIcon = L.divIcon({
        className: 'map-label',
        html: label[0]
      });
      L.marker([label[1], label[2]], {
        icon: myIcon
      }).addTo(map);
    });
  }

  // resets the last clicked polyon and highlights the clicked one
  function clickPolygon(e) {
    if (lastLayer.options) {
      resetLayerStyles(lastLayer);
    }
    lastLayer = e.target;
    enterPolygon(e);
  }

  // set polygon style and update tooltip if user enters a polygon
  function enterPolygon(evt) {
    var layer = evt.target,
        name = layer.feature.properties.name;


    // only update layer and tooltip if we have valid data
    if (name ) {
      updateTooltip({ layer:layer, evt : evt })

      layer.setStyle({
        'color': '#fff',
        'weight': 3,
        'opacity': 1,
      });
    }
  }

  // reset layer style if user leaves the polygon
  function leavePolygon(e) {
    var layer = e.target;
    ui.$tooltip.css('display', 'none');
    layer.setStyle({
      'color': '#fff',
      'weight': 1,
      'opacity': .75,
    });
  }

  // redraws the map and updates salary values
  function updateMap() {

    currentSalary = ~~ui.$slider.val();
    ui.$salaryOutput.text(formatNumber(currentSalary));

    topoLayer.eachLayer(function(layer) {

      var properties = layer.feature.properties,
      //  rent = properties.randomRent * config.roomQms[currentRoomCount],
        percentage = Math.random() * 100,
        color = getColorByPercentage(percentage);

      layer.setStyle({
        'fillColor': color
      });
    });

        //setSalaryLabelPosition();
  }


  /******************************** 
  //  
  //    tooltip functions
  //
  *********************************/


  // sets tooltip content and its position
  function updateTooltip(params){
    var qms = config.roomQms[currentRoomCount],
        feature = params.layer.feature,
        properties = feature.properties;

      // set tooltip content
      ui.$tooltipheadline.html('<strong>' + properties.name + ' </strong>');
      //ui.$tooltipqm.text(qms);
      ui.$tooltipbezirk.text(properties.bezirk);
      //ui.$tooltipRentPrice.text(properties.randomRent);

      ui.$tooltip.show();
      ui.$tooltip.css('border-left', ('4px solid ' + params.layer.options.fillColor));

      setTooltipPosistion(params.evt);
  }

  function setTooltipPosistion(evt) {
    var pos = evt.containerPoint;
    ui.$tooltip.css({
      top: (pos.y - 25) + 'px',
      left: (pos.x + 25) + 'px'
    });
  }


  /******************************** 
  //  
  //    slider and general ui functions
  //
  *********************************/

  // initializes the nouislider (http://refreshless.com/nouislider/)
  function initSlider() {
    ui.$slider.noUiSlider({
      range: [config.minSalary, config.maxSalary],
      start: [currentSalary],
      step: 50,
      handles: 1,
      direction: 'rtl',
      orientation: 'vertical',
      slide: updateMap,
    }).change(function() {
      updateHash();
      // set salary label to the correct position if the user clicks on the bar
          //setTimeout(setSalaryLabelPosition, 250);
    });
  } 

  // sets the salary label next to the current slider position
        /*function setSalaryLabelPosition() {

          if (!featureSupport.isSmartphone) {
            var handleOffset = $('.noUi-handle').offset(),
              sidebarOffset = $('.sidebar').offset();

            $('.slider-output').css({
              top: (handleOffset.top - sidebarOffset.top) + 'px'
            });
          }
          $('.slider-output').show();
        }*/

  // activates the clicked room button and redraws the map
  function handleRoomBtn() {
    var $this = $(this),
      isActive = $this.hasClass('active');

    if(isActive){
      return false;
    }

    currentRoomCount = $this.attr('data-room');
    $('.room-btn').removeClass('active');
    $this.addClass('active');
    ui.$currentRoomSize.text(config.roomQms[currentRoomCount]);
    updateMap();
    updateHash();
  }

  // toggle info modal
  function handleInfoBtn() {
    $('.info').toggleClass('active');
  }

  function resize() {
    var appHeight = window.innerHeight - $('.header').outerHeight();
    $('.sidebar').css('max-height', (appHeight - 20) + 'px');
    $('.app').css('height', appHeight + 'px');
    $('.info').css('max-height', (appHeight - 40) + 'px');

    map.invalidateSize();
    map.setZoom(getZoomByWindowSize());
  }

  function bindEvents() {
    $('.room-btn').on('click', resetSelectedMarkers);
    $('.icon-info').on('click', handleInfoBtn);
    $('.info').find('.close').on('click', handleInfoBtn);
    $(window).on('resize', resize);
  }

  // set the chosen button active
  function initRoomButtons() {
    $('.room-btn[data-room=' + currentRoomCount + ']').addClass('active');
  }


  /******************************** 
  //  
  //    hash functions for deeplinking
  //
  *********************************/


  // update hash url which contains the number of rooms and the chosen salary
  function updateHash() {
    window.location.hash = currentRoomCount + '-' + currentSalary;
  }

  // returns the current hash values (room count and salary)
  function getHashValues() {
    var hash = window.location.hash,
      hashVals = {};

    if (hash) {
      var values = hash.match(/\d+/g);
      if (values) {
        var roomVal = values[0],
          salaryVal = values[1];
        // clean up hash values to avoid errors
        if (roomVal < 1 || roomVal > 4 || isNaN(roomVal)) {
          roomVal = 4;
        }
        if (salaryVal < config.minSalary || salaryVal > config.maxSalary || isNaN(salaryVal)) {
          salaryVal = config.startSalary;
        }
        hashVals = {
          currentRoomCount: roomVal,
          salary: salaryVal
        };
      }
    }

    return hashVals;
  }

  /******************************** 
  //  
  //    helper functions
  //
  *********************************/

  // returns number in german number format
  function formatNumber(number) {
    return number.toLocaleString('de-DE');
  }

  // returns a color for a certain percentage. change the color values in config.js  
  function getColorByPercentage(perc) {
    var color = config.colors[0];
    if (perc > 66) {
      color = config.colors[4];
    } else if (perc > 50) {
      color = config.colors[3];
    } else if (perc > 33) {
      color = config.colors[2];
    } else if (perc > 25) {
      color = config.colors[1];
    } else if (~~perc === 0) {
      color = '#cccccc';
    }

    return color;
  }

  function addWohnheimMarker(marker) {
    //clear wohnheim marker to avoid continuous map adding
      if(wohnheimMarker.length > 0){
        for (var idx in wohnheimMarker){
          map.removeLayer(wohnheimMarker[idx]);
        }
      }

      marker.forEach(function(label, i) {

          var wonheimIcon = L.icon({
              iconUrl: 'img/wohnheime.png',

              iconSize:     [50, 50], // size of the icon
              iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
              popupAnchor:  [2, -90] // point from which the popup should open relative to the iconAnchor
          });


          var wohnheim = label.Wohnheim;
          var strasse = label.Straße;
          var marker = L.marker([label.Latitude, label.Longitude],
              {icon: wonheimIcon,
                  bounceOnAdd: true,
                  bounceOnAddOptions: {duration: 500, height: 100}})
              .bindPopup("<b>" + wohnheim +"</b><br>" + strasse);
          marker.addTo(map);

          wohnheimMarker.push(marker);
      })
  }

    function addParkMarker(marker) {
        //clear wohnheim marker to avoid continuous map adding
        if(parkMarker.length > 0){
            for (var idx in parkMarker){
                map.removeLayer(parkMarker[idx]);
            }
        }

        marker.forEach(function(label, i) {
            var parkIcon = L.icon({
                iconUrl: 'img/parksMarker.png',

                iconSize:     [25, 40], // size of the icon
                iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
                popupAnchor:  [-9, -90] // point from which the popup should open relative to the iconAnchor
            });

            var parkName = label.Name;
            var marker = L.marker([label.Latitude, label.Longitude],
                {icon: parkIcon,
                    bounceOnAdd: true,
                    bounceOnAddOptions: {duration: 500, height: 100}})
                .bindPopup("<b>" + parkName +"</b>");
            marker.addTo(map);

            parkMarker.push(marker);
        })
    }




  function addHochschuleMarker(marker) {
      marker.forEach(function(hochschule, i) {
          if(!hochschule){
              return;
          }
          var wohnheim = hochschule.Hochschule;
          var strasse = hochschule.Straße;
          var marker = L.marker([hochschule.Latitude, hochschule.Longitude])
              .bindPopup("<b>" + wohnheim +"</b><br>" + strasse)
              .on({
                'click': onHochschuleClick
              });

          marker.addTo(map);

          hochschulMarker.push(marker);
      });

  }

  function onHochschuleClick(markerClicked) {
    //Entfernen aller Marker die nicht dem geklilckten marker entsprechen
    for(var i=0;i<hochschulMarker.length;i++){
      if(hochschulMarker[i] != markerClicked.target){
        map.removeLayer(hochschulMarker[i]);
      }
    }
      map.setView(markerClicked.latlng, 15);
      setTimeout(function () {
          loadAjax({url : 'data/wohnheime.json', callback : addWohnheimMarker });
      }, 300);

      setTimeout(function () {
          loadAjax({url : 'data/parks.json', callback : addParkMarker });
      }, 300);

  }


  function resetSelectedMarkers() {
      map.remove();
      initMap();
  }

  /******************************** 
  //  
  //    app entry point
  //
  *********************************/

  function init() {
      initMap();
      initSlider();
      initRoomButtons();
      bindEvents();
      updateHash();
      resize();
      ui.$currentRoomSize.text(config.roomQms[currentRoomCount]);
  }

  return {
    init: init
  }

}(window, document, jQuery, L));

var hochschulMarker = [];
var wohnheimMarker = [];
var parkMarker = [];
rentApp.init();
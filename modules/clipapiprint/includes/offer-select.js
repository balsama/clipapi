//Initialize the selected array
var selected = [];
//Get coupons that were previously selected - stored as a string
var prevSelected = $.cookie('selected');

if ((prevSelected != '') && (prevSelected != null)) {
  //Split them into an array (we have to rebuild the selected array because there is no built-in way to store arrays as cookies)
  prevSelected = prevSelected.split(',');
  //foreach previously selected coupon, add it into the selected array
  for(var i=0;i < prevSelected.length;i++) {
    selected.push(prevSelected[i]);
  }
}

$(document).ready(function() {
  //Lightbox for the print link
  $("a.iframe").fancybox({
    centerOnScroll: true,
    showCloseButton: false
  });
  //And another simple inline option for other content
  $("a.inline").fancybox({
    centerOnScroll: true,
    width: 570,
    autoDimensions: false
  });

  /**
   * If the user has a cookie that contains previously selected offers, we:
   * 1) Convert the cookie string into an array (stored in selected[])
   * 2) Add the selected class to any of the offers in the array
   * 3) Set the count and price in the sidebar
   * 4) Call updateSidebar() function which loads each of the selected offers in the sidebar
   *
   * If the user doesn't have a previously selected cookie, we just load empty text into the sidebar
   */
  if ((prevSelected != '') && (prevSelected != null)) {
    for(var i=0;i < prevSelected.length;i++) {
      //Add the selected class to any offers previously selected
      $('#page').find('.offer-id-'+prevSelected[i]).each(function() {
        $(this).addClass('views-row-selected');
        $(this).removeClass('views-row-not-selected');
        $(this).children('.offer-inner').children('.offer-toggle').text('Selected');
      });
    }
    //Set the count and price in the sidebar
    $('#savings #coupon-count span.dyn').text(selected.length);
    $('#savings #savings-amount span.dyn').load('/savings?curSelected='+selected);

    updateSidebar();
  }
  else {
    $('#selected-offers').load('/selected/empty');
  }

  /**
   * When a user clicks on an offer, we:
   * 1) Determine the Offer ID
   * 2) If the offer ID is not in the selected[] array already, we add it
   * 3) If it is already in the array, we remove it
   * 4) Set the updated count and price in the sidebar (based on the updated selected[] array
   * 5) Set a cookie containing the updated selected[] array
   * 6) Call the updateClasses() function which adds or removes the "selected" class from offers
   * 7) Call the updateSidebar() function which loads each of the selected offers into the sidebar
   */
  $('.view-active-offers .views-row').click(function() {
    //Set var offerID to the clicked offer's url code
    var offerID = $(this).attr('rel');
    //If it's not in the "selected" array already add it
    if (jQuery.inArray( offerID, selected) == -1) {
      selected.push(offerID);
    }
    //If it is already in the array, delete it
    else {
      var pos = jQuery.inArray( offerID, selected);
      selected.splice( jQuery.inArray(offerID, selected), 1);
    }

    //Set the updated count in the sidebar
    $('#savings #coupon-count span.dyn').text(selected.length);
    $('#savings #savings-amount span.dyn').load('/savings?curSelected='+selected);

    //Update the cookie (stored as a string, not an array)
    $.cookie('selected', selected, { path: '/' });

    //Toggle the selected class
    updateClasses(offerID);

    //Update the sidebar
    updateSidebar();
  });//END .views-row click function

  $('a.print-link').click(function(e) {
    e.preventDefault();
    ci_CheckInstall();
  });


});//END docready

function GetDeviceID(deviceId) {
  if (deviceId == 0) {
    $(document).ready(function() {
      ci_downloadFFSilent();
    });
  }
  else {
    $('#PrintToken').load('/clipapiprint/GetPrintToken/' + deviceId + '?selected=' + selected, function() {
      var PrintToken = $('#PrintToken').text();
      $('#ccprint').attr('href', 'http://clip.pdn.coupons.com/cos20/PrintManager.aspx?PID=16721&PrintCartToken=' + PrintToken + '&PostBackURL=http%3A%2F%2Fcoupons-dev');
      $("#ccprint").trigger('click');
    });
  }
}

/**
 * updateSidebar() function
 *
 * This function:
 * 1) loads the selected offers into the sidebar (/selected/[offer ids] path is a view with an URL param argument)
 * 2) Binds a click event to the remove links in the sidebar so we can trigger jquery actions from them.
 *    On click of a remove link, the removeFromSidebar() function is called and the offer ID is passed as a param
 * 3) Updates the print link to include the current selected offers
 *
 * If the selected[] array is empty, we just load the empty text into the sidebar
 */
function updateSidebar() {
  //Stop auto-resizing so we can animate it once the .load() is complete
  var sidebarHeightOriginal = $('#selected-offers').height();
  $('#selected-offers').css('height', sidebarHeightOriginal);

  if (selected != '') {
    $('#selected-offers').load('/selected/'+selected, function() {
      $('.sidebar-remove').bind('click', function() {
        var offerID = $(this).attr('rel');
        removeFromSidebar(offerID);
      });
      //Animate the height
      $(this).wrapInner('<div/>');
      var newheight = $('div:first',this).height();
      $(this).animate( {height: newheight} );
    });
  }
  else {
    $('#selected-offers').load('/selected/empty', function() {
      //Animate the height
      $(this).wrapInner('<div/>');
      var newheight = $('div:first',this).height();
      $(this).animate( {height: newheight} );
    });
  }
};

/**
 * removeFromSidebar() function
 *
 * This function is called when a user clicks on the remove link for an offer in the sidebar.
 *
 * 1) Removes the selected offer from the selected[] array
 * 2) Updates the selected cookie accordingly
 * 3) Calls updateSidebar() which reloads the sidebar content and reattaches the bind
 * 4) Calls updateClassed() (and passes the offerID into it as a param) which removes the 'selected' class from the offer in the grid
 */
function removeFromSidebar(offerID) {
  selected.splice( jQuery.inArray(offerID, selected), 1);
  $.cookie('selected', selected, { path: '/' });
  //Set the count and price in the sidebar
  $('#savings #coupon-count span.dyn').text(selected.length);
  $('#savings #savings-amount span.dyn').load('/savings?curSelected='+selected);
  updateSidebar();
  updateClasses(offerID);
};

/**
 * updateClasses() function
 *
 * This function accepts an offerID param, finds offers on the page that match the offerID passed and adds the selected class if
 * the element doesn't already have it and removes it if it does.
 */
function updateClasses(offerID) {
  $('.offer-id-'+offerID).each(function() {
    var classes = $(this).attr('class');
    if (classes.indexOf("views-row-selected") >= 0) {
      $(this).removeClass('views-row-selected');
      $(this).addClass('views-row-not-selected');
      $(this).children('.offer-inner').children('.offer-toggle').text('Select This Offer');
    }
    //else add it
    else {
      $(this).addClass('views-row-selected');
      $(this).removeClass('views-row-not-selected');
      $(this).children('.offer-inner').children('.offer-toggle').text('Selected');
    }
  });
};

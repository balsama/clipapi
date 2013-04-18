//Initialize the selected array
var selected = [];
//Get coupons that were previously selected - stored as a string
var prevSelected = $.cookie('clip-sc');

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
    $.cookie('clip-sc', selected, { path: '/' });

    //Toggle the selected class
    updateClasses(offerID);

    //Update the sidebar
    updateSidebar();
  });//END .views-row click function

  $('a.print-link').click(function(e) {
    e.preventDefault();
    ci_CheckInstall();
    $('body').css('cursor', 'wait');
  });
  //modalCustom('Unable to Print Coupon', 'One or more coupons could not be printed because it has expired or has exceeded the maximum number of allowed prints!', '<p>The effected coupons have been removed from your selected coupons list. Any remaning coupons will be printed now.</p>', 'max', 'dError');
});//END docready

/**
 * Callback function triggered by ci_CheckInstall()
 *
 * @param string deviceId
 *   The Device ID provided by the ci_CHeckInstall function.
 *
 * If Device ID is '0', triggers ci_downloadFFSilent which starts the Coupons
 * Inc software download/install process.
 *
 * If Device ID is not '0', obtains print token. If there is no overlap between
 * selected offers and GetUserRestrictions result, trigger call to PrintManager
 * with print token which triggers print job.
 */
function ReceiveDeviceID(deviceId) {
  if (selected.length == 0) {
    modalCustom('Select Some Coupons', 'You must add at least one coupon to your queue before trying to print.', '', 'warn', 'dError');
    $('body').css('cursor', 'auto');
    return;
  }
  if (deviceId == 0) {
    $(document).ready(function() {
      // @break - Download Software
      modalCustom('Unable to Print Coupons', 'You must install the Coupon Printer before you can print coupons.', '', 'download');
      $('body').css('cursor', 'auto');
    });
  }
  else {
    $('#Restrictions').load('/clipapiprint/GetUserRestrictions/' + deviceId, function() {
      var Restrictions = $('#Restrictions').text();
      $('#PrintToken').load('/clipapiprint/GetPrintToken/' + deviceId + '?selected=' + selected, function() {
        // Compare the restricted list with the current selected
        var RestrictedList = list2array(Restrictions);
        var SelectedList = selected; // selected is already an array

        // @break - Restricted Coupon
        if (findRestrictions(RestrictedList, SelectedList)) {
          modalCustom('Unable to Print Coupon', 'One or more coupons could not be printed because the maximum number of allowed prints has been reached.', '<p>The affected coupons will be removed from your selected coupons list. Any remaning coupons will be printed now.</p>', 'max', 'dError', RestrictedList);
        }

        // Print!
        else {
          var PrintToken = $('#PrintToken').text();
          var url = $(location).attr('host');
          var PrintLink = 'http://insight.coupons.com/COS20/PrintManager.aspx?PID=16721&PrintCartToken=' + PrintToken + '&PostBackURL=http%3A%2F%2F' + url + '/print-results';
          $('#coupon-print').attr('src', PrintLink);

          // State
          setTimeout(getIframeUrl, 7000);
        }
      });
    });
  }
}

/**
 * Repeatedly Atempts to get the current URL of the #coupon-print iframe. This
 * iframe is initialy loaded with coupons.com. When a print request is sent, it
 * is directed to the coupons.com print manager which in turn directs to the
 * local callback URL upon completion. The function will recursively call
 * itself until it gets a response. Note that no response will be given until
 * the redirect back to the local callback URL is completed (Due to XSS
 * precautions.
 */
function getIframeUrl() {
  removeAllOffers();
  $('#coupon-print').load(function() {
    var addr = document.getElementById("coupon-print").contentWindow.location.href;
    if ((addr == '') || (addr == null)) {
      setTimeout(getIframeUrl, 1000);
    }
    else {
      processResponse(addr);
      return addr;
    }
  });
}

/**
 * Depending on the status code, displays a success or failure message.
 * Called after return URL is loaded in the hidden ifram after a print request.
 *
 * @param string url
 *   URL which contains ci_status param. Loaded as return URL from print
 *   manager
 */
function processResponse(url) {
  var status = getURLParameter('ci_status', url);
    if (status == '0') {
    // Success
    modalCustom('Congratulations', 'Your coupons have printed successfully.', '', 'success', 'dSuccess');
  }
  else {
    modalCustom('Unable to Print Coupons', 'An error has occurred while trying to print your coupons.', '<p>Please review our coupon printing FAQs</p>', 'fail', 'dError');
  }
  $('body').css('cursor', 'auto');
}

/**
 * Helper function to parse URL parameters out of a URL privded as a string.
 */
function getURLParameter(name, url) {
  return decodeURI(
    (RegExp(name + '=' + '(.+?)(&|$)').exec(url)||[,null])[1]
  );
}

/**
 * Compares two arrays.
 *
 * @param array list1
 *   The first array to compare
 * @param array list2
 *   The second array to compare
 *
 * @return boolean
 *   TRUE if one or more identical values are present in both provided arrays
 *   FALSE if no identical values are present in both provided arrays
 */
function findRestrictions(list1, list2) {
  var restricted = new Boolean();
  restricted = 0;
  var lookup = {};
  for (var j in list2) {
    lookup[list2[j]] = list2[j];
  }
  for (var i in list1) {
    if (typeof lookup[list1[i]] != 'undefined') {
      restricted = 1;
      //return 'found ' + list1[i] + ' in both lists';
    }
  }
  return restricted;
}

/**
 * Converts a comma seperated list of strings into an array
 *
 * @param string cslist
 *   A comma seperated list of strings (NOTE: Strings cannot contain commas)
 * @return array
 *   An array containing each of the strings
 */
function list2array(cslist) {
  var ListArray = cslist.split(',');
  return ListArray;
}

/**
 * Removes all offers from a users queue and updates the sidebar and classes
 */
function removeAllOffers() {
  var removeList = $.cookie('clip-sc');
  if ((removeList != '') && (removeList != null)) {
    removeListArray = removeList.split(',');
    for(var i=0;i < removeListArray.length;i++) {
      updateClasses(removeListArray[i]);
    }
  }
  $.cookie('clip-sc', '', { path: '/' });
  selected = [];
  $('#selected-offers').load('/selected/empty');
  $('#savings #savings-amount span.dyn').load('/savings?curSelected=');
  $('#savings #coupon-count span.dyn').text(selected.length);
  updateSidebar();
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
  var pos = jQuery.inArray(offerID, selected);
  if (pos != -1) {
    selected.splice(jQuery.inArray(offerID, selected), 1);
    $.cookie('clip-sc', selected, { path: '/' });
    //Set the count and price in the sidebar
    updateSidebar();
    updateClasses(offerID);
  }
  $('#savings #coupon-count span.dyn').text(selected.length);
  $('#savings #savings-amount span.dyn').load('/savings?curSelected='+selected);
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

/**
 * Generates a custom Jquery modal dialog.
 *
 * @param string dTitle
 *   Title of the JQ UI Dialog
 * @param string dContents
 *   Contents of the Dialog
 * @param string dConfig
 *   If passed, will look for additional configuration items of the same name
 *   merge into the default config.
 */
function modalCustom(dTitle, dContentTop, dContentBottom, dConfig, dClass, dOptions) {
  var config = {
    width: 525,
    height: 'auto',
    title: dTitle,
    modal: true,
    dialogClass: dClass
  };
  var custom = {};
  // Download config
  if (dConfig == 'download') {
    custom = {
      buttons: {
        'Install the Coupon Printer': function() {
          $(this).dialog('close').remove();
          downloadSoftware();
          return false;
        },
        'Cancel': function() {
          $(this).dialog('close').remove();
          $('body').css('cursor', 'auto');
          return false;
        }
      }
    };
  }
  // Generic warning
  if (dConfig == 'warn') {
    custom = {
      buttons: {
        'OK': function() {
          $(this).dialog('close').remove();
          return false;
        },
      }
    };
  }

  // User Print Max
  if (dConfig == 'max') {
    custom = {
      buttons: {
        'Print Remaining': function() {
          $(this).dialog('close').remove();
          removeMultiple(dOptions);
          ci_CheckInstall();
          return false;
        },
        'Cancel': function() {
          $(this).dialog('close').remove();
          $('body').css('cursor', 'auto');
          return false;
        }
      }
    };
  }

  // Print Success
  if (dConfig == 'success') {
    custom = {
      buttons: {
        'Close': function() {
          $(this).dialog('close').remove();
          return false;
        }
      }
    };
  }

  // Print Fail
  if (dConfig == 'fail') {
    custom = {
      buttons: {
        'View Coupon Printing FAQs': function() {
          $(this).dialog('close').remove();
          document.location.href = '/frequently-asked-questions';
          return false;
        },
        'Close': function() {
          $(this).dialog('close').remove();
          return false;
        }
      }
    };
  }
  $.extend(config, custom);
  $('<div><div class="top">' + dContentTop + '</div><div class="bottom">' + dContentBottom + '</div><div class="button-push"></div></div>').dialog(config);
  $('.ui-dialog a').blur();
}

/**
 * Calls the ci_downloadFFSilent function which is provided in the JS returned
 * from the GetInstallScript web mothod. This function initiates a file
 * download from the broswer.
 */
function downloadSoftware() {
  ci_downloadFFSilent();
  $('body').css('cursor', 'auto');
}

/**
 * Removes mutiple offer IDs from the sidebar
 *
 * @param array list
 *   Array of offer IDs to remove
 */
function removeMultiple(list) {
  for (var i=0;i < list.length;i++) {
    var pos = jQuery.inArray(list[i], selected);
    if (pos != -1) {
      selected.splice(jQuery.inArray(list[i], selected), 1);
      $.cookie('clip-sc', selected, { path: '/' });
      updateClasses(list[i])
    }
  }
  $('#savings #coupon-count span.dyn').text(selected.length);
  $('#savings #savings-amount span.dyn').load('/savings?curSelected='+selected);
  updateSidebar();
}

<?php
function savings() {
 
  if (strstr($_GET['curSelected'], ',')) {
    $selected_each = explode(",", $_GET['curSelected']);
    $count = '0';
    foreach ($selected_each as $offer_id) {
      $prices[] = db_result(db_query("SELECT field_amount_value FROM {content_type_offer} WHERE field_url_code_value = '$offer_id'"));
    }
    $savings = 0;
    foreach ($prices as $price) {
      $savings = ($savings + $price);
    }
  }
  elseif ($_GET['curSelected'] == '') {
    $savings = '0.00';
  }
  else {
    $id = $_GET['curSelected'];
    $savings = db_result(db_query("SELECT field_amount_value FROM {content_type_offer} WHERE field_url_code_value = '$id'"));
  }
  
  $content = $savings;
  
  print number_format($content, 2);
}
?>
<?php

function clipapi_encode($vInputText) {
  $vLongKey = variable_get('clipapi_keylong', '');
  $vShortKey = variable_get('clipapi_keyshort', '');
  $vPID = variable_get('clipapi_pid', 'prod');

  $decodeX = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._!%@$&";
  $dxLength = 70;

  $vob[0] = (int)substr($vPID, strlen($vPID) - 2, 2);
  $vob[1] = (int)substr($vPID, strlen($vPID) - 4, 2);

  for ($i = 0; $i < 256; $i++) $encodeModulo[$i] = -1;
  for ($i = 0; $i < $dxLength; $i++) {
    $encodeModulo[(int)ord(substr($decodeX,$i, 1))] = $i;
  }

  if (strlen($vInputText) < 15)  {
    $diff = 15 - strlen($vInputText);
    for ($i = 0; $i < $diff; $i++) {
      $vInputText = $vInputText . " ";
    }
  }
  $vInputText = $vInputText.$vPID;
  if (strlen($vInputText) < 20){
    $vInputText = $vInputText . " couponsincproduction";
    $vInputText = substr($vInputText, 0, 20);
  }
  $q = 0;
  $mw = 0;
  $j = strlen($vInputText);
  $k = strlen($vShortKey);
  $eString = "";

  $s2Array = array();
  $s3Array = array();
  $SumArray = array();

  for ($i = 0; $i < $k; $i++) {
    $s2Array[$i] = 2 * $encodeModulo[(int)ord(substr($vShortKey, $i, 1))];
    $s3Array[$i] = $vob[$i % 2];
    $SumArray[$i] = $s2Array[$i] + $s3Array[$i];
  }
  for ($i = $k; $i < $k*2; $i++){
    $s2Array[$i] = 2 * $encodeModulo[(int)ord(substr($vShortKey, $i-$k, 1))];
    $s3Array[$i] = $vob[$i % 2];
    $SumArray[$i] = $s2Array[$i] + $s3Array[$i];
  }
  $k = $k * 2;
  for ($i = 0; $i < $j; $i++) {
    try  {
      $ToEncode = substr($vInputText,$i, 1);
      $mb = (int)ord($ToEncode);
      if ($mb < 256) {
        $s1 = $encodeModulo[$mb];
        if ($s1 >= 0) {
          $mw++;
          $q = ($q + $s1 + $SumArray[$mw % $k]) % $dxLength;
          $eString = $eString.substr($vLongKey, $q, 1);
        }
        else {
          $eString = $eString . $ToEncode;	// non-referenced chars passed through without change
        }
      }
      else {
        $eString = $eString . $ToEncode;	// non-referenced chars passed through without change
      }
    }
    catch (Exception $ex) {
      throw $ex;
    }
  }
  return $eString;
}

function clipapi_decode($vInputText) {
  $vLongKey = variable_get('clipapi_keylong', '');
  $vShortKey = variable_get('clipapi_keyshort', '');
  $vPID = variable_get('clipapi_pid', 'prod');

  $decodeX = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._!%@$&";
  $dxLength = 70;

  $vob[0] = (int)substr($vPID, strlen($vPID) - 2, 2);
  $vob[1] = (int)substr($vPID, strlen($vPID) - 4, 2);
  for ($i = 0; $i < 256; $i++) {
    $encodeModulo[$i] = -1;
    $decodeModulo[$i] = -1;
  }
  for ($i = 0; $i < $dxLength; $i++) {
    $encodeModulo[ord(substr($decodeX, $i, 1))] = $i;
    $decodeModulo[ord(substr($vLongKey,$i, 1))] = $i;
  }
  $eString = "";
  $k = strlen($vShortKey);
  for ($i = 0; $i < $k; $i++) {
    $s2Array[$i] = 2 * $encodeModulo[ord(substr($vShortKey,$i, 1))];
    $s3Array[$i] = $vob[$i % 2];
    $SumArray[$i] = $s2Array[$i] + $s3Array[$i];
  }
  for ($i = $k; $i < $k * 2; $i++) {
    $s2Array[$i] = 2 * $encodeModulo[ord(substr($vShortKey,$i - $k, 1))];
    $s3Array[$i] = $vob[$i % 2];
    $SumArray[$i] = $s2Array[$i] + $s3Array[$i];
  }
  $k = $k * 2;
  $encThis = 0;
  $encLast = 0;
  $myDecode = 0;
  $mw = 0; //skeyVal = 0, pidVal = 0,
  for ($i = 0; $i < strlen($vInputText); $i++) {
    $toDecode = substr($vInputText,$i, 1);
    $mb = ord($toDecode);
    if ($mb < 256) {
      $encThis = $decodeModulo[$mb];

      if ($encThis >= 0) {
        $mw++;
        $myDecode = (40 * $dxLength + $encThis - $encLast - $SumArray[$mw % $k]) % $dxLength;
        $eString .= substr($decodeX,$myDecode, 1);
        $encLast = $encThis;
      }
      else {
        $eString .= $toDecode;	// non-referenced chars passed through without change
      }
    }
    else {
      $eString .= $toDecode;	// non-referenced chars passed through without change
    }
  }

  if(substr($eString, strlen($eString)-strlen($vPID), strlen($vPID)) == $vPID) {
    return trim(substr($eString, 0, strlen($eString)-strlen($vPID)));
  }
  else {
    return $eString;
  }
}
?>

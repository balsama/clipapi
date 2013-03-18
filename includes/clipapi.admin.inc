<?php

function clipapi_admin() {
  $form['clipapi_environment'] = array(
    '#type' => 'select',
    '#title' => t('Environment'),
    '#required' => TRUE,
    '#options' => array(
      'prod' => t('Production'),
      'dev' => t('Development'),
    ),
    '#default_value' => variable_get('clipapi_environment', 'dev'),
    '#description' => '<p>Production will target the <code>insight.coupons.com</code> domain while Development will use <code>clip.pdn.coupons.com</code>.',
  );

  $form['clipapi_keylong'] = array(
    '#type' => 'textfield',
    '#title' => t('Long Key'),
    '#required' => TRUE,
    '#size' => 89,
    '#default_value' => variable_get('clipapi_keylong', ''),
  );

  $form['clipapi_keyshort'] = array(
    '#type' => 'textfield',
    '#title' => t('Short Key'),
    '#required' => TRUE,
    '#size' => 16,
    '#default_value' => variable_get('clipapi_keyshort', ''),
  );

  $form['clipapi_pid'] = array(
    '#type' => 'textfield',
    '#title' => t('PID'),
    '#required' => TRUE,
    '#size' => 16,
    '#default_value' => variable_get('clipapi_pid', ''),
  );

  $form['clipapi_partner_token'] = array(
    '#type' => 'textfield',
    '#title' => t('Partner Token'),
    '#required' => TRUE,
    '#default_value' => variable_get('clipapi_partner_token', ''),
  );

  return system_settings_form($form);
}


<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Index extends CI_Controller {

	public function __construct(){
		parent::__construct();
		$this->load->helper('url');

		setcookie('ckfinder_baseUrl','/upload/');
	}

	public function index()
	{
		$this->load->model('cell_cfg');

		//get page config JSON from DB
		$floor_params_arr = $this->cell_cfg->getCellCFG('page_json_cfg');
		$floor_params = $floor_params_arr[0]['cfg_value'];

		//get page templates' JSON from DB
		$floor_tpls_arr = $this->cell_cfg->getCellCFG('tpls');
		$floor_tpls = $floor_tpls_arr[0]['cfg_value'];

		$data = array();
		$data['floor_params'] = $floor_params;
		$data['floor_tpls'] = $floor_tpls;

		$this->load->view('mobHomeMNG_cfg',$data);
	}
}

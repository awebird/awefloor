<?php 
class cell_cfg extends CI_Model{  
	function __construct()
    {
        parent::__construct();
		$this->load->database();
    }

	public function getCellCFG($cfg_key){
		$this->db->where('cfg_key',$cfg_key);
		$this->db->from('awefloor_cfg');
		
		$cell_cfg_info = $this->db->get();
	    return $cell_cfg_info->result_array();
	}
}
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="<?php echo base_url('resource/FlexiJsonEditor/jsoneditor.css');?>" rel="stylesheet" type="text/css">
  <style>
  	.json-editor { 
  	  margin-left: 10px;
  	  padding: 0px;
  	}
    .json-editor .value { 
    background-color: #ECF3C3;
    width: 250px;
    }
    .json-editor .property { 
      width: 120px;
      display:none;
    }
    .property_desc {
      display: inline-block;
      width:65px;
      background-image:-webkit-gradient(linear, 0 0, 0 100%, from(rgb(255, 255, 255)), to(rgb(238, 238, 238)));
      border: 1px solid grey;
      -webkit-border-radius: 5px;
      -moz-border-radius: 5px;
      border-radius: 5px;
      padding: 3px;
      margin-right: 2px;
    }
    .bird_eye{
      display: inline-block;
      width:30px;
      height:20px;
    }
    .full_pic{
      display: block;
    }
  </style>
  <script>
  localStorage.clear();
  </script>
</head>
<body>
<div class="page">
  <div class="fixed-empty"></div>

  <div style="color:blue;">请使用Chrome(谷歌)、Firefox等现代浏览器</div>
  <div id="editor" class="json-editor" style="width:58%;float:left;"></div>
  <div id="viewer" style="width:40%;position:fixed; right:15px;">
      <input id='cfg_preview' type="button" value="保存配置并预览"/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <input id='cfg_apply' type="button" value="！应用到现网"/>
      <iframe id="cell_home" name="cell_home" style="width:100%;height:450px;" src="<?php echo base_url('../index.html?mod=cfg');?>"></iframe>
  </div>
  <div class="clear"></div>
  <pre id="json" style="background-color: #eaeaea; width:500px;display:none;"></pre>
  </div>
</div>
<div class="clear"></div>
<script src="<?php echo base_url('resource/jquery-1.8.3.min.js');?>"></script>
<script src="<?php echo base_url('resource/FlexiJsonEditor/jquery.jsoneditor.modify.js');?>"></script>
<script src="<?php echo base_url('resource/ckfinder/ckfinder.js');?>"></script>
<script>
  var img_seq=0;
	var json_init = <?php echo $floor_params;?>;
  var total_floor=json_init.floors.length;
  var tpls = <?php echo $floor_tpls;?>;
  var json_api = JSON.stringify(json_init);
  $('#json').html(JSON.stringify(json_init));
  var opt = { change: function(json_updated) { $('#json').html(JSON.stringify(json_updated,null,4));json_api=JSON.stringify(json_updated); } };
	$('#editor').jsonEditor(json_init, opt );
  
  $('#cfg_preview').click(function(event) {
    localStorage.clear();
    $.ajax({
        url:'../cell/index.php?act=mobile&op=setHomePageCFG&mod=cfg',
        type:"post",
        data:{homepage_json: json_api},
        dataType:"json",
        success:function(){
          alert('保存成功');
          window.cell_home.location.reload();
        }
   });
  });

  $('#cfg_apply').click(function(event) {
    localStorage.clear();
    if(confirm('请先预览，确认要将修改后的配置应用到现网环境！')){
      $.ajax({
          url:'../cell/index.php?act=mobile&op=setHomePageCFG',
          type:"post",
          data:{homepage_json: json_api},
          dataType:"json",
          success:function(){
            alert('应用成功');
            window.cell_home.location.reload();
          }
      });
    }
  });

  $('.bird_eye').live('mouseover mouseout', function(event) {
    if (event.type == 'mouseover') {
      $(this).after('<img class=\"full_pic\" src=\"'+$(this).attr('src')+'\" />');
    }else{
      $('.full_pic').remove();
    }
  });

  //The following scripts are for calling CKFinder PopUp
  function BrowseServer( startupPath, functionData )
  {
    // You can use the "CKFinder" class to render CKFinder in a page:
    var finder = new CKFinder();

    // The path for the installation of CKFinder (default = "/ckfinder/").
    finder.basePath = 'resource/ckfinder/';

    //Startup path in a form: "Type:/path/to/directory/"
    finder.startupPath = startupPath;

    // Name of a function which is called when a file is selected in CKFinder.
    finder.selectActionFunction = SetFileField;

    // Additional data to be passed to the selectActionFunction in a second argument.
    // We'll use this feature to pass the Id of a field that will be updated.
    finder.selectActionData = functionData;

    // Name of a function which is called when a thumbnail is selected in CKFinder.
    finder.selectThumbnailActionFunction = ShowThumbnails;

    // Launch CKFinder
    finder.popup();
  }

  // This is a sample function which is called when a file is selected in CKFinder.
  function SetFileField( fileUrl, data )
  {
    document.getElementById( data["selectActionData"] ).value = '"'+fileUrl.split('cell/mall/')[1]+'"';
    //add ldp 和jsoneditor配合
    //document.getElementById( data["selectActionData"] ).setAttribute("title",'"'+fileUrl+'"');
    //alert(data["selectActionData"]);
    $('#'+data["selectActionData"]).trigger('change');
    //图片鸟瞰图更新
    var reg = new RegExp('"',"g");
    var new_img_url = $('#'+data["selectActionData"]).val().replace(reg, "");
    new_img_url='../'+new_img_url;
    $('#'+data["selectActionData"]).siblings('.bird_eye').attr('src', new_img_url);
  }

  // This is a sample function which is called when a thumbnail is selected in CKFinder.
  function ShowThumbnails( fileUrl, data )
  {
    // this = CKFinderAPI
    var sFileName = this.getSelectedFile().name;
    document.getElementById( 'thumbnails' ).innerHTML +=
        '<div class="thumb">' +
          '<img src="' + fileUrl + '" />' +
          '<div class="caption">' +
            '<a href="' + data["fileUrl"] + '" target="_blank">' + sFileName + '</a> (' + data["fileSize"] + 'KB)' +
          '</div>' +
        '</div>';

    document.getElementById( 'preview' ).style.display = "";
    // It is not required to return any value.
    // When false is returned, CKFinder will not close automatically.
    return false;
  }
</script>
</body>
</html>

let dtor=Math.PI/180.0;
let earth_radius=6371.0;
let earth_scale=earth_radius*1.0;
let delta_time=0.0;
let fecha=[];
let JD=[];

let camera;

let Shader01;
let Shader02;
let timeSlider;
let modelSlider;
let sizeX=1250;
let sizeY=625;
let update_texture=1;
let lock_camera=0;
let ocZoom=1.0;
let ocCnt=0;
let cam_cpy_opt_0=[];
let cam_cpy_opt_2=[];
let m2Zoom=930;

let delta_window_x=5;
let delta_window_y=5;

let show_controls=1;
let show_group_timedate=1;
let show_group_timecontrol=1;
let auto_stop_time=1;
let show_seam=0;
let show_sunmoon=1;

let sizeX1;
let sizeY1;

let sxw;
let syw;

let tipo=1;
let gcont=0;
let ecl_gamma_value=0;

let dtt1=0;
de406_func();

function preload() {

  if (tipo==1) img01=loadImage('/images/earthmap_day_2k.jpg');
  //if (tipo==1) img01=loadImage('/images/starmap_4k_2.jpg');
  if (tipo==2) img01=loadImage('/images/earthmap_white_01.jpg');
  img02=loadImage('/images/earthmap_night_2k_2.jpg');
  img03=loadImage('/images/right-arrow-icon-7580_32.png')
  if (tipo==1) Shader01=loadShader('/js/shaders/shader01.vert','/js/shaders/shader01.frag');
  if (tipo==2) Shader01=loadShader('/js/shaders/shader01.vert','/js/shaders/shader03.frag');
  Shader02=loadShader('/js/shaders/shader01.vert','/js/shaders/shader04.frag');


   cam_cpy_opt_2=[0,-500,500];
   sizeX=windowWidth-delta_window_x;
   sizeY=windowHeight-delta_window_y;

   sizeX1=sizeX;
   sizeY1=sizeY;
   sxw=sizeX;
   syw=sizeY;
}

function setup() {
  
  fecha=get_current_date();
  JD=calc_jd(fecha);
  fecha=calc_fecha(JD);
  cc=createCanvas(sizeX,sizeY,WEBGL);

  camera = createCamera();
   camera.perspective(0.75, sizeX/sizeY, 1, 10000);
   camera.setPosition(0,0,500);
  camera.lookAt(0,0,0);

  int_text01=createGraphics(sizeX1,sizeY1,WEBGL);
  int_text01.noStroke();
  int_text02=createGraphics(sizeX1,sizeY1,WEBGL);
  int_text02.noStroke();

  int_text02.background(0);
  int_text02.rect(sizeX1,sizeY1,sizeX1,sizeY1);

time_control();
update_controls();
  
}

function draw() {
  
  gcont++;
  //if (gcont%2==0) return;

  background(0);
  noStroke();

  if (lock_camera==0) {
    if (modelSlider.value()!=1) {
      if (mouseIsPressed && mouseButton === RIGHT) {
      
      } else {
        orbitControl(1,1,ocZoom);
      }
    }
  }
  if (ocCnt!=0 && lock_camera==0) {ocCnt--;} else {ocZoom=1.0;}
  
  if (timeSlider.value()!=0) {
    JD+=0.0005*timeSlider.value()*timeSliderShift.value()/2.0;
    fecha=calc_fecha(JD);
    time_control_update_time();
  }

  if (0) {

    
    if (gcont>600*4*1.5/1.0) {
      gcont=0;
      fecha[2]=Math.round(1900+200*Math.random());
      JD=calc_jd(fecha);
      nef();
      console.log(ecl_gamma_value); 
      JD-=4.0/24.0; 

      if (modelSlider.value()==0) {
        cam_cpy_opt_0=[camera.eyeX,camera.eyeY,camera.eyeZ];
        cam_dist_0=Math.sqrt(cam_cpy_opt_0[0]*cam_cpy_opt_0[0]+
                             cam_cpy_opt_0[1]*cam_cpy_opt_0[1]+
                             cam_cpy_opt_0[2]*cam_cpy_opt_0[2]);
      }
      if (modelSlider.value()==2) {
        cam_cpy_opt_2=[camera.eyeX,camera.eyeY,camera.eyeZ];
      }

      modelSlider.value(Math.round(Math.random()*2));
      //modelSlider.value(0);

      if (modelSlider.value()==0) {
        cam_cpy_opt_0[1]=-600*ecl_gamma_value;
        var cam_dist_01=Math.sqrt(cam_cpy_opt_0[0]*cam_cpy_opt_0[0]+
                                  cam_cpy_opt_0[1]*cam_cpy_opt_0[1]+
                                  cam_cpy_opt_0[2]*cam_cpy_opt_0[2]);
        cam_cpy_opt_0[0]=cam_cpy_opt_0[0]/cam_dist_01*cam_dist_0;
        cam_cpy_opt_0[1]=cam_cpy_opt_0[1]/cam_dist_01*cam_dist_0;
        cam_cpy_opt_0[2]=cam_cpy_opt_0[2]/cam_dist_01*cam_dist_0;
        camera.setPosition(cam_cpy_opt_0[0],cam_cpy_opt_0[1],cam_cpy_opt_0[2]);
        camera.lookAt(0,0,0);
      }

      if (modelSlider.value()==2) {
        //cam_cpy_opt_2[1]=-300;
        cam_cpy_opt_2=[0,-500,500];
        camera.setPosition(cam_cpy_opt_2[0],cam_cpy_opt_2[1],cam_cpy_opt_2[2]);
        camera.lookAt(0,0,0);
      }

      msv01();
      msv02();
      
    }

    JD+=0.0005/4.0*2.0/1.5*1.0;
    fecha=calc_fecha(JD);
    time_control_update_time();
    
  }
  
  if (update_texture==1 /*|| 1*/) {
    sun_pos=calc_sun_pos_de406(JD);
    moon_pos=calc_moon_pos_de406(JD);

      int_text01.shader(Shader01);
      Shader01.setUniform("tex01", img01);
      Shader01.setUniform("tex02",img02);
    Shader01.setUniform("tex03",img03);
    Shader01.setUniform("tex04",int_text02);
    Shader01.setUniform("sun_p",[sun_pos.x,sun_pos.y,sun_pos.z]);
    Shader01.setUniform("moon_p",[moon_pos.x,moon_pos.y,moon_pos.z]);
    Shader01.setUniform("angles",[angleUSlider.value()/180*Math.PI,
                                  angleVSlider.value()/180*Math.PI,
                                  angleWSlider.value()/180*Math.PI]);
    Shader01.setUniform("ilumination",iluSlider.value());
    Shader01.setUniform("lockSun",lockSunSlider.value());
    Shader01.setUniform("eclDraw",eclSlider.value());
    Shader01.setUniform("show_sunmoon",show_sunmoon);

    int_text01.rect(0,0,sizeX1,sizeY1);

    if (auto_stop_time==1) {
      update_texture=0.0;
    }
  }
  
  texture(int_text01);

  if (modelSlider.value()==0) {

    if (show_seam==1) {
      stroke(255);
      strokeWeight(3);
      n_points=50;
      rads=150;
      for (let i=0;i<n_points;i++) {
        ang1=i*Math.PI/n_points+Math.PI/2.0;
        ang2=(i+1)*Math.PI/n_points+Math.PI/2.0;
        xs1=rads*Math.cos(ang1);
        ys1=rads*Math.sin(ang1);
        xs2=rads*Math.cos(ang2);
        ys2=rads*Math.sin(ang2);
        line(0, ys1, xs1, 0, ys2, xs2)
      }
      noStroke();
    }

    rotateY(Math.PI);
    sphere(150,50,50);
  }

  if (modelSlider.value()==1) {
    rect(-sizeX/2.0,-sizeY/2.0,sizeX,sizeY);
  }
  

  if (modelSlider.value()==2) {
    pointCount=1000;
    insideRadius=0.0*sizeY/2.0;
    outsideRadius=sizeY/2.0;
    centerX=0;
    centerY=0;
    centerZ=-100;
    let angle = 0.0;
    let angleStep = Math.PI / pointCount;
    let deltaAngle=-Math.PI/2.0;

    if (show_seam==1) {
      stroke(255);
      strokeWeight(1);
      line(0,centerZ,0,0,centerZ,-outsideRadius);
      noStroke();
    }

    textureMode(NORMAL);
    beginShape(TRIANGLE_STRIP);
    texture(int_text01);
    for (let i = 0; i <= pointCount; i += 1) {
      // Specify a point on the outside circle
      let pointX = centerX + cos(angle+deltaAngle) * outsideRadius;
      let pointY = centerY + sin(angle+deltaAngle) * outsideRadius;
      vertex(pointX,centerZ,pointY, 1-angle/(2*Math.PI),1);
      angle += angleStep;

      // Specify a point on the inside circle
      pointX = centerX + cos(angle+deltaAngle) * insideRadius;
      pointY = centerY + sin(angle+deltaAngle) * insideRadius;
      vertex(pointX,centerZ,pointY,1-angle/(2*Math.PI),0);
      angle += angleStep;
    }

    endShape();
  }
  
  //noLoop()
}

function calc_complete_eclipse() {

  for (var i=0;i<500;i++) {

    var delta_jd=i/500.0*0.2-0.1;
    //console.log(i,delta_jd);
    sun_pos=calc_sun_pos_de406(JD+delta_jd);
    moon_pos=calc_moon_pos_de406(JD+delta_jd);

    int_text02.shader(Shader02);
    Shader02.setUniform("tex01",int_text02);
    Shader02.setUniform("sun_p",[sun_pos.x,sun_pos.y,sun_pos.z]);
    Shader02.setUniform("moon_p",[moon_pos.x,moon_pos.y,moon_pos.z]);
    Shader02.setUniform("angles",[angleUSlider.value()/180*Math.PI,
                                  angleVSlider.value()/180*Math.PI,
                                  angleWSlider.value()/180*Math.PI]);
    Shader02.setUniform("ilumination",iluSlider.value());
    Shader02.setUniform("lockSun",0.0);
    Shader02.setUniform("show_sunmoon",show_sunmoon);
    if (i==0) {
      Shader02.setUniform("borra",1.0);
    } else {
      Shader02.setUniform("borra",0.0);
    }

    int_text02.rect(0,0,sizeX1,sizeY1);

  }

}

function time_control_update_time() {

  JD=calc_jd(fecha);
  if (JD>2488433.5) JD=2488433.5; //2100
  if (JD<2415020.5) JD=2415020.5; //1900
  fecha=calc_fecha(JD);

  ct_day.html((fecha[0]).toFixed(0).padStart(2,"0"));
  ct_month.html((fecha[1]).toFixed(0).padStart(2,"0"));
  ct_year.html((fecha[2]).toFixed(0).padStart(4,"0"));
  ct_hour.html((fecha[3]).toFixed(0).padStart(2,"0")+":");
  ct_min.html((fecha[4]).toFixed(0).padStart(2,"0"));
  update_texture=1.0;

}

function update_controls() {

  if (show_group_timedate==1) {
    ct_day.show();
    ct_month.show();
    ct_year.show();
    ct_hour.show();
    ct_min.show();
    ct_utc.show();
  }

  if (show_group_timedate==0) {
    ct_day.hide();
    ct_month.hide();
    ct_year.hide();
    ct_hour.hide();
    ct_min.hide();
    ct_utc.hide();
  }

  if (show_group_timecontrol==1) {
    ct_tst.show();
    timeSlider.show();
    timeSliderShift.show();
    timelock_button.show();
    now_button.show();
    prev_eclipse.show();
    next_eclipse.show();
    ct_ecl.show();
    eclSlider.show();
  }

  if (show_group_timecontrol==0) {
    ct_tst.hide();
    timeSlider.hide();
    timeSliderShift.hide();
    timelock_button.hide();
    now_button.hide();
    prev_eclipse.hide();
    next_eclipse.hide();
    ct_ecl.hide();
    eclSlider.hide();
  }

  if (show_controls==1) {
    ct_mst.show();
    modelSlider.show();
    ct_a3st.show();
    angleUSlider.show();
    angleVSlider.show();
    angleWSlider.show();
    iluSlider.show();
    lockSunSlider.show();
    seam_button.show();
    sunmoon_button.show();
  }

  if (show_controls==0) {
    ct_mst.hide();
    modelSlider.hide();
    ct_a3st.hide();
    angleUSlider.hide();
    angleVSlider.hide();
    angleWSlider.hide();
    iluSlider.hide();
    lockSunSlider.hide();
    seam_button.hide();
    sunmoon_button.hide();
  }

}

function cam_can_move() { lock_camera=0;ocCnt=10;ocZoom=0.1}
function cam_can_not_move() {lock_camera=1;}

function time_control() {

  var ct_x=20;
  var ct_y=-35;
  var dct_y=90;

  ct_day=createElement('h5',(fecha[0]).toFixed(0).padStart(2,"0"));
  ct_day.style('color','white');
  ct_day.style('font-size','40px');
  ct_day.position(ct_x,ct_y);
  ct_day.mouseOver(cam_can_not_move);
  ct_day.mouseOut(cam_can_move);
  if (show_group_timedate==1) {ct_day.show();} else {ct_day.hide();}
  ct_day.mouseWheel( function(event) {

    if (event.deltaY>0) { fecha[0]-=1; } else { fecha[0]+=1; }
    time_control_update_time();

  });

  ct_x+=50;
  ct_month=createElement('h5',(fecha[1]).toFixed(0).padStart(2,"0"));
  ct_month.style('color','white');
  ct_month.style('font-size','40px');
  ct_month.position(ct_x,ct_y);
  ct_month.mouseOver(cam_can_not_move);
  ct_month.mouseOut(cam_can_move);
  if (show_group_timedate==1) {ct_month.show();} else {ct_month.hide();}
  ct_month.mouseWheel( function(event) {

    if (event.deltaY>0) { fecha[1]-=1; } else { fecha[1]+=1; }
    if (fecha[1]>12) {fecha[1]=1;fecha[2]++;}
    if (fecha[1]<1) {fecha[1]=12;fecha[2]--;}
    time_control_update_time();

  });

  ct_x+=50;
  ct_year=createElement('h5',(fecha[2]).toFixed(0).padStart(4,"0"));
  ct_year.style('color','white');
  ct_year.style('font-size','40px');
  ct_year.position(ct_x,ct_y);
  ct_year.mouseOver(cam_can_not_move);
  ct_year.mouseOut(cam_can_move);
  if (show_group_timedate==1) {ct_year.show();} else {ct_year.hide();}
  ct_year.mouseWheel( function(event) {

    if (event.deltaY>0) { fecha[2]-=1; } else { fecha[2]+=1; }
    //if (fecha[2]>2400) fecha[2]=2400;
    //if (fecha[2]<1600) fecha[2]=1600;
    time_control_update_time();

  });

  ct_x+=100;
  ct_hour=createElement('h5',(fecha[3]).toFixed(0).padStart(2,"0")+":");
  ct_hour.style('color','white');
  ct_hour.style('font-size','40px');
  ct_hour.position(ct_x,ct_y);
  ct_hour.mouseOver(cam_can_not_move);
  ct_hour.mouseOut(cam_can_move);
  if (show_group_timedate==1) {ct_hour.show();} else {ct_hour.hide();}
  ct_hour.mouseWheel( function(event) {

    if (event.deltaY>0) { fecha[3]-=1; } else { fecha[3]+=1; }
    time_control_update_time();

  });

  ct_x+=55;
  ct_min=createElement('h5',(fecha[4]).toFixed(0).padStart(2,"0"));
  ct_min.style('color','white');
  ct_min.style('font-size','40px');
  ct_min.position(ct_x,ct_y);
  ct_min.mouseOver(cam_can_not_move);
  ct_min.mouseOut(cam_can_move);
  if (show_group_timedate==1) {ct_min.show();} else {ct_min.hide();}
  ct_min.mouseWheel( function(event) {

    if (event.deltaY>0) { fecha[4]-=1; } else { fecha[4]+=1; }
    time_control_update_time();

  });

  ct_x+=50;
  ct_utc=createElement('h5',"UTC");
  ct_utc.style('color','white');
  ct_utc.style('font-size','20px');
  ct_utc.position(ct_x-5,ct_y+40);
  ct_utc.mouseOver(cam_can_not_move);
  ct_utc.mouseOut(cam_can_move);
  if (show_group_timedate==1) {ct_utc.show();} else {ct_utc.hide();}
  ct_utc.mouseWheel( function(event) {
    
    if (event.deltaY>0) { sen=-1.0; } else { sen=1.0; }

    var JD1=JD*1.0;
    var ot01=fase_lunar(0, sen, JD1);
    JD1=ot01[1];
    JD=JD1*1.0;

    fecha=calc_fecha(JD);
    time_control_update_time();

  });

  var ct_x=-40;
  var ct_y=20;

  ct_tst=createElement('h5',"TIME CONTROL");
  ct_tst.style('color','white');
  ct_tst.style('font-size','16px');
  ct_tst.position(ct_x+65,ct_y+40);
  if (show_controls==1) {ct_tst.show();} else {ct_tst.hide();}

  ct_x+=60;
  timeSlider = createSlider(-4, 4, 0, 1);
  timeSlider.position(ct_x, ct_y+dct_y);
  timeSlider.size(130);
  timeSlider.mouseOver(cam_can_not_move);
  timeSlider.mouseOut(cam_can_move);
  if (show_controls==1) {timeSlider.show();} else {timeSlider.hide();}
  timeSlider.mouseClicked(function() {
    time_control_update_time();
    if (auto_stop_time==1) {
      timeSlider.value(0);
    } else {
      if (timeSlider.value()==0) {update_texture=0;} else {update_texture=1;}
    }
  });

  timeSliderShift = createSlider(0.25, 16, 2, 0.1);
  timeSliderShift.position(ct_x+150, ct_y+dct_y);
  timeSliderShift.size(60);
  timeSliderShift.mouseOver(cam_can_not_move);
  timeSliderShift.mouseOut(cam_can_move);
  if (show_controls==1) {timeSliderShift.show();} else {timeSliderShift.hide();}
  timeSliderShift.doubleClicked(function() {
    time_control_update_time();
    timeSliderShift.value(2);
  });

  timelock_button = createButton('A','white');
  timelock_button.position(ct_x+225,ct_y+dct_y);
  if (show_controls==1) {timelock_button.show();} else {timelock_button.hide();}
  timelock_button.mousePressed( function() {

    if (auto_stop_time==1) {
      auto_stop_time=0;
      timelock_button.html("M");
    } else {
      auto_stop_time=1;
      timelock_button.html("A");
    }

  });

  var ct_x=22;
  var ct_y=55;

  now_button = createButton(' NOW! ','white');
  now_button.position(ct_x,ct_y+dct_y);
  if (show_controls==1) {now_button.show();} else {now_button.hide();}
  now_button.mousePressed( function() {

    fecha=get_current_date();
    JD=calc_jd(fecha);
    fecha=calc_fecha(JD);
    time_control_update_time();

  });

  ct_x+=60;
  prev_eclipse = createButton('<','white');
  prev_eclipse.position(ct_x,ct_y+dct_y);
  if (show_controls==1) {prev_eclipse.show();} else {prev_eclipse.hide();}
  prev_eclipse.mousePressed( function() {

    var JD1=JD*1.0;
    for (var i=0;i<10;i++) {
      var ot01=fase_lunar(0, -1, JD1);
      JD1=ot01[1];
      if (ot01[0]==1.0) break;
    }
    
    JD=ot01[1];
    fecha=calc_fecha(JD);
    calc_complete_eclipse();
    time_control_update_time();

  });

  ct_x+=90;
  next_eclipse = createButton('>','white');
  next_eclipse.position(ct_x,ct_y+dct_y);
  if (show_controls==1) {next_eclipse.show();} else {next_eclipse.hide();}
  next_eclipse.mousePressed( nef=() => {

    var JD1=JD*1.0;
    for (var i=0;i<10;i++) {
      var ot01=fase_lunar(0, 1, JD1);
      JD1=ot01[1];
      if (ot01[0]==1.0) break;
    }
    
    JD=ot01[1];
    fecha=calc_fecha(JD);
    ecl_gamma_value=ot01[2];
    calc_complete_eclipse();
    time_control_update_time();

  });

  var ct_x=45;
  var ct_y=85;

  ct_ecl=createElement('h5',"ECLIPSE");
  ct_ecl.style('color','white');
  ct_ecl.style('font-size','14px');
  ct_ecl.position(ct_x+65,ct_y+40);
  if (show_controls==1) {ct_ecl.show();} else {ct_ecl.hide();}

  eclSlider = createSlider(0.0, 1.0, 1.0, 0.1);
  eclSlider.position(ct_x+150+10, ct_y+dct_y-30);
  eclSlider.size(65);
  eclSlider.mouseOver(cam_can_not_move);
  eclSlider.mouseOut(cam_can_move);
  if (show_controls==1) {eclSlider.show();} else {eclSlider.hide();}
  eclSlider.input(function() {
    time_control_update_time();
  });


  ct_x=25;
  ct_y=165;
  ct_mst=createElement('h5',"PROJECTION");
  ct_mst.style('color','white');
  ct_mst.style('font-size','16px');
  ct_mst.position(ct_x,ct_y);
  if (show_controls==1) {ct_mst.show();} else {ct_mst.hide();}

  ct_x=140;
  ct_y=100;
  seam_button = createButton('S','white');
  seam_button.position(ct_x,ct_y+dct_y);
  seam_button.style('background-color', 'grey');
  if (show_controls==1) {seam_button.show();} else {seam_button.hide();}
  seam_button.mousePressed( function() {

    if (show_seam==1) {
      show_seam=0;
      seam_button.style('background-color', 'grey');
    } else {
      show_seam=1;
      seam_button.style('background-color', 'white');
    }

  });

  ct_x=120;
  ct_y=210;
  sunmoon_button = createButton('S&M','white');
  sunmoon_button.position(ct_x,ct_y+dct_y);
  sunmoon_button.style('background-color', 'white');
  if (show_controls==1) {sunmoon_button.show();} else {sunmoon_button.hide();}
  sunmoon_button.mousePressed( function() {

    if (show_sunmoon==1) {
      show_sunmoon=0;
      sunmoon_button.style('background-color', 'grey');
    } else {
      show_sunmoon=1;
      sunmoon_button.style('background-color', 'white');
    }

  });

  ct_x=188;
  ct_y=102;
  modelSlider = createSlider(0, 2, 0, 1);
  modelSlider.position(ct_x, ct_y+dct_y);
  modelSlider.size(80);
  modelSlider.mouseOver(cam_can_not_move);
  modelSlider.mouseOut(cam_can_move);
  if (show_controls==1) {modelSlider.show();} else {modelSlider.hide();}
  modelSlider.mousePressed( msv01=() => {

    if (modelSlider.value()==0) {
      cam_cpy_opt_0=[camera.eyeX,camera.eyeY,camera.eyeZ];
    }
    if (modelSlider.value()==2) {
      cam_cpy_opt_2=[camera.eyeX,camera.eyeY,camera.eyeZ];
    }
  });
  modelSlider.mouseReleased( msv02=() => {

    if (modelSlider.value()==0) {
      camera.setPosition(cam_cpy_opt_0[0],cam_cpy_opt_0[1],cam_cpy_opt_0[2]);
      camera.lookAt(0,0,0);
    }
    if (modelSlider.value()==1) {
      //camera.setPosition(0,0,m2Zoom);
      camera.setPosition(0,0,m2Zoom*sizeY/syw);
      camera.lookAt(0,0,0);
    }
    if (modelSlider.value()==2) {
      camera.setPosition(cam_cpy_opt_2[0],cam_cpy_opt_2[1],cam_cpy_opt_2[2]);
      camera.lookAt(0,0,0);
    }
  });

  var ct_x=-82;
  var ct_y=320;

  ct_a3st=createElement('h5',    " <br><br> Lock Sun <br><br> Ilumination <br><br> &Delta;W <br><br> &Delta;V <br><br> &Delta;U <br><br> MP ZOOM");
  ct_a3st.style('color','white');
  ct_a3st.style('font-size','16px');
  ct_a3st.position(ct_x+105,ct_y-115);
  if (show_controls==1) {ct_a3st.show();} else {ct_a3st.hide();}

  ct_x+=190;
  angleUSlider = createSlider(-180,180, 0, 1);
  angleUSlider.position(ct_x, ct_y+dct_y+6);
  angleUSlider.size(160);
  angleUSlider.mouseOver(cam_can_not_move);
  angleUSlider.mouseOut(cam_can_move);
   angleUSlider.attribute('disabled', '');
  if (show_controls==1) {angleUSlider.show();} else {angleUSlider.hide();}
  angleUSlider.input(function() {  
    time_control_update_time();
  });
  angleUSlider.doubleClicked(function() {  
    angleUSlider.value(0);
    time_control_update_time();
  });

  angleVSlider = createSlider(-180,180, 0, 1);
  angleVSlider.position(ct_x, ct_y+dct_y-30);
  angleVSlider.size(160);
  angleVSlider.mouseOver(cam_can_not_move);
  angleVSlider.mouseOut(cam_can_move);
   angleVSlider.attribute('disabled', '');
  if (show_controls==1) {angleVSlider.show();} else {angleVSlider.hide();}
  angleVSlider.input(function() {  
    time_control_update_time();
  });
  angleVSlider.doubleClicked(function() {  
    angleVSlider.value(0);
    time_control_update_time();
  });

  angleWSlider = createSlider(-90,90, 0, 1);
  angleWSlider.position(ct_x, ct_y+dct_y-65);
  angleWSlider.size(160);
  angleWSlider.mouseOver(cam_can_not_move);
  angleWSlider.mouseOut(cam_can_move);
   angleWSlider.attribute('disabled', '');
  if (show_controls==1) {angleWSlider.show();} else {angleWSlider.hide();}
  angleWSlider.input(function() {  
    time_control_update_time();
  });
  angleWSlider.doubleClicked(function() {  
    angleWSlider.value(0);
    time_control_update_time();
  });

  m2ZoomSlider = createSlider(700,1100, 950, 1);
  m2ZoomSlider.position(ct_x, ct_y+dct_y+41);
  m2ZoomSlider.size(160);
  m2ZoomSlider.mouseOver(cam_can_not_move);
  m2ZoomSlider.mouseOut(cam_can_move);
  if (show_controls==1) {m2ZoomSlider.show();} else {m2ZoomSlider.hide();}
  m2ZoomSlider.input(function() {

    m2Zoom=m2ZoomSlider.value();
    if (modelSlider.value()==1) {
      camera.setPosition(0,0,m2Zoom);
      camera.lookAt(0,0,0);
    }

    time_control_update_time();
  });
  m2ZoomSlider.doubleClicked(function() {  
    m2ZoomSlider.value(950);
    if (modelSlider.value()==1) {
      camera.setPosition(0,0,m2Zoom);
      camera.lookAt(0,0,0);
    }
    time_control_update_time();
  });

  /*
  //ct_x+=190;
  angle4Slider = createSlider(-0.3,0.3, 0, 0.01);
  angle4Slider.position(ct_x, ct_y+dct_y+50);
  angle4Slider.size(160);
  angle4Slider.mouseOver(cam_can_not_move);
  angle4Slider.mouseOut(cam_can_move);
  if (show_controls==1) {angle4Slider.show();} else {angle4Slider.hide();}
  angle4Slider.input(function() {  
    dtt1=angle4Slider.value();
    calc_complete_eclipse();
    time_control_update_time();
  });
  angle4Slider.doubleClicked(function() {  
    angle4Slider.value(0);
    calc_complete_eclipse();
    time_control_update_time();
  });
  */

  iluSlider = createSlider(0,1, 1, 1);
  iluSlider.position(ct_x+80, ct_y+dct_y-110);
  iluSlider.size(80);
  iluSlider.mouseOver(cam_can_not_move);
  iluSlider.mouseOut(cam_can_move);
  if (show_controls==1) {iluSlider.show();} else {iluSlider.hide();}
  iluSlider.input(function() {  
    time_control_update_time();
  });
  iluSlider.doubleClicked(function() {  
    iluSlider.value(0);
    time_control_update_time();
  });

  lockSunSlider = createSlider(0,1, 1, 1);
  lockSunSlider.position(ct_x+80, ct_y+dct_y-146);
  lockSunSlider.size(80);
  lockSunSlider.mouseOver(cam_can_not_move);
  lockSunSlider.mouseOut(cam_can_move);
  if (show_controls==1) {lockSunSlider.show();} else {lockSunSlider.hide();}
  lockSunSlider.input(function() {  
    time_control_update_time();
  });


  iluSlider.position(ct_x+80, ct_y+dct_y-110);
  iluSlider.size(80);
  iluSlider.mouseOver(cam_can_not_move);
  iluSlider.mouseOut(cam_can_move);
  if (show_controls==1) {iluSlider.show();} else {iluSlider.hide();}
  iluSlider.input(function() {  
    time_control_update_time();
  });


  ct_x=22;ct_y=0;
  showdate_button = createButton('HIDE DATE','white');
  showdate_button.position(ct_x,ct_y);
  showdate_button.style("font-family", "monospace");
  showdate_button.style("font-size", "11px");
  showdate_button.mousePressed( function() {
    if (show_group_timedate==1) {
      show_group_timedate=0;
      showdate_button.html("SHOW DATE");
    } else {
      show_group_timedate=1;
      showdate_button.html("HIDE DATE");
    }
    update_controls();
  });

  ct_x=92;ct_y=0;
  showtimecontrols_button = createButton('HIDE TC','white');
  showtimecontrols_button.position(ct_x,ct_y);
  showtimecontrols_button.style("font-family", "monospace");
  showtimecontrols_button.style("font-size", "11px");
  showtimecontrols_button.mousePressed( function() {
    if (show_group_timecontrol==1) {
      show_group_timecontrol=0;
      showtimecontrols_button.html("SHOW TC");
    } else {
      show_group_timecontrol=1;
      showtimecontrols_button.html("HIDE TC");
    }
    update_controls();
  });

  ct_x=150;ct_y=0;
  showcontrols_button = createButton('HIDE CONTROLS','white');
  showcontrols_button.position(ct_x,ct_y);
  showcontrols_button.style("font-family", "monospace");
  showcontrols_button.style("font-size", "11px");
  showcontrols_button.mousePressed( function() {
    if (show_controls==1) {
      show_controls=0;
      showcontrols_button.html("SHOW CONTROLS");
    } else {
      show_controls=1;
      showcontrols_button.html("HIDE CONTROLS");
    }
    update_controls();
  });
  
}


function windowResized() { 

  sizeX=windowWidth-delta_window_x;
  sizeY=windowHeight-delta_window_y;
  resizeCanvas(sizeX,sizeY);
  var aspect=sizeX/sizeY;
  //var newZ=2*windowWidth/Math.tan(0.75);
  camera.perspective(0.75, aspect, 1, 10000);
  camera.setPosition(0,0,500);
  camera.lookAt(0,0,0); 
  //sizeX1=sizeX;
  //sizeY1=sizeY;

  

  camera.perspective(0.75, aspect, 1, 10000);
  camera.setPosition(0,0,m2Zoom*sizeY/syw);
  camera.lookAt(0,0,0);

  

  time_control_update_time();


} 


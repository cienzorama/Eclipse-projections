
function get406ephemeris(jd_c,id_c,precession_correction_option) {

    var dtor=Math.PI/180.0;
    var ld=de406_data.length;
    var ta=de406_data[0][1];
    var tb=de406_data[ld-1][1];
    var dtab=tb-ta;
    var m=dtab/(ld*1.0);

    //Compute approximate index from Julian date
    var ind=Math.floor((jd_c-ta)/m);

    //Search exact index from Julian date
    var index=-1;
    for (var i=ind-5;i<=ind+5;i++) {

        if (i<0 || i>=ld) continue;
        
        if (jd_c>=de406_data[i][1] && jd_c<=de406_data[i][2]) {
            index=i;
            break;
        }

    }

    var PCtemp=de406_data[index];

    var Mjd_TDB=jd_c - 2400000.5;
    var t1 = PCtemp[1]-2400000.5;
    dt = Mjd_TDB - t1;

    var px,py,pz,vx,vy,vz;

    //Earth-Moon Barycenter-----------
    if (id_c==3 || id_c==4) {
        if (0<=dt && dt<=32) {
            j=0;
            Mjd0 = t1;
        } else if (32<dt && dt<=64) {
            j=1;
            Mjd0 = t1+32*j;
        }
        //207   216   225   234
        var cx=[];var cy=[];var cz=[];
        var ct=27*j;
        for (var i=0;i<9;i++) {
            cx.push(PCtemp[207+i+ct]);
            cy.push(PCtemp[216+i+ct]);
            cz.push(PCtemp[225+i+ct]);
        }
        [px_e,py_e,pz_e,vx_e,vy_e,vz_e]=Cheb3D(Mjd_TDB, 9, Mjd0, Mjd0+32, cx, cy, cz);
    }
    //-------------------------------

    //Moon---------------------------
    if (id_c==4 || id_c==3) {
        if (0<=dt && dt<=8) {
            j=0;
            Mjd0 = t1;
        } else if (8<dt && dt<=16) {
            j=1;
            Mjd0 = t1+8*j;
        } else if (16<dt && dt<=24) {
            j=2;
            Mjd0 = t1+8*j;
        } else if (24<dt && dt<=32) {
            j=3;
            Mjd0 = t1+8*j;
        } else if(32<dt && dt<=40) {
            j=4;
            Mjd0 = t1+8*j;
        } else if(40<dt && dt<=48) {
            j=5;
            Mjd0 = t1+8*j;
        } else if(48<dt && dt<=56) {
            j=6;
            Mjd0 = t1+8*j;
        } else if(56<dt && dt<=64) {
            j=7;
            Mjd0 = t1+8*j;
        }
        //381   394   407   420
        var cx=[];var cy=[];var cz=[];
        var ct=39*j;
        for (var i=0;i<13;i++) {
            cx.push(PCtemp[381+i+ct]);
            cy.push(PCtemp[394+i+ct]);
            cz.push(PCtemp[407+i+ct]);
        }
        [px_m,py_m,pz_m,vx_m,vy_m,vz_m]=Cheb3D(Mjd_TDB, 13, Mjd0, Mjd0+8, cx, cy, cz);
    }
    //-------------------------------

    //Earth and Moon from EMB--------
    if (id_c==3 || id_c==4) {

        var EMRAT = 81.3005600000000044;
        var EMRAT1 = 1.0/(1.0+EMRAT); 

        px_e=px_e-EMRAT1*px_m;
        py_e=py_e-EMRAT1*py_m;
        pz_e=pz_e-EMRAT1*pz_m;
        vx_e=vx_e-EMRAT1*vx_m;
        vy_e=vy_e-EMRAT1*vy_m;
        vz_e=vz_e-EMRAT1*vz_m;

        px_m+=px_e;
        py_m+=py_e;
        pz_m+=pz_e;
        vx_m+=vx_e;
        vy_m+=vy_e;
        vz_m+=vz_e;

        if (id_c==3) {
            px=px_e*1.0;py=py_e*1.0;pz=pz_e*1.0;vx=vx_e*1.0;vy=vy_e*1.0;vz=vz_e*1.0;
        } else {
            px=px_m*1.0;py=py_m*1.0;pz=pz_m*1.0;vx=vx_m*1.0;vy=vy_m*1.0;vz=vz_m*1.0;
        }
    }
    //------------------------------

    //Sun---------------------------
    if (1) {
        j=0;
        Mjd0 = t1;
        //693   705   717   729
        var cx=[];var cy=[];var cz=[];
        var ct=0;
        for (var i=0;i<12;i++) {
            cx.push(PCtemp[693+i+ct]);
            cy.push(PCtemp[705+i+ct]);
            cz.push(PCtemp[717+i+ct]);
        }
        [px_s,py_s,pz_s,vx_s,vy_s,vz_s]=Cheb3D(Mjd_TDB, 12, Mjd0, Mjd0+64, cx, cy, cz);
    }
    
    if (id_c==0) {
        px=px_s*1.0;py=py_s*1.0;pz=pz_s*1.0;vx=vx_s*1.0;vy=vy_s*1.0;vz=vz_s*1.0;
    }
    //-----------------------------

    //Mercury----------------------
    if (id_c==1) {
        if (0<=dt && dt<=16) {
            j=0;
            Mjd0 = t1;
        } else if(16<dt && dt<=32) {
            j=1;
            Mjd0 = t1+16*j;
        } else if (32<dt && dt<=48) {
            j=2;
            Mjd0 = t1+16*j;
        } else if(48<dt && dt<=64) {
            j=3;
            Mjd0 = t1+16*j;
        }

        //3    17    31    45
        var cx=[];var cy=[];var cz=[];
        var ct=42*j;
        for (var i=0;i<14;i++) {
            cx.push(PCtemp[3+i+ct]);
            cy.push(PCtemp[17+i+ct]);
            cz.push(PCtemp[31+i+ct]);
        }
        [px,py,pz,vx,vy,vz]=Cheb3D(Mjd_TDB, 14, Mjd0, Mjd0+16, cx, cy, cz);
    }
    //----------------------------

    //Venus-----------------------
    if (id_c==2) {
        j=0;
        Mjd0 = t1;
        //171   183   195   207
        var cx=[];var cy=[];var cz=[];
        var ct=0;
        for (var i=0;i<12;i++) {
            cx.push(PCtemp[171+i+ct]);
            cy.push(PCtemp[183+i+ct]);
            cz.push(PCtemp[195+i+ct]);
        }
        [px,py,pz,vx,vy,vz]=Cheb3D(Mjd_TDB, 12, Mjd0, Mjd0+64, cx, cy, cz);
    }
    //----------------------------

    //Mars------------------------
    if (id_c==5) {
        j=0;
        Mjd0 = t1;
        //261   271   281   291
        var cx=[];var cy=[];var cz=[];
        var ct=0;
        for (var i=0;i<10;i++) {
            cx.push(PCtemp[261+i+ct]);
            cy.push(PCtemp[271+i+ct]);
            cz.push(PCtemp[281+i+ct]);
        }
        [px,py,pz,vx,vy,vz]=Cheb3D(Mjd_TDB, 10, Mjd0, Mjd0+64, cx, cy, cz);
    }
    //-----------------------------

    //Jupiter----------------------
    if (id_c==6) {
        j=0;
        Mjd0 = t1;
        //291   297   303   309
        var cx=[];var cy=[];var cz=[];
        var ct=0;
        for (var i=0;i<6;i++) {
            cx.push(PCtemp[291+i+ct]);
            cy.push(PCtemp[297+i+ct]);
            cz.push(PCtemp[303+i+ct]);
        }
        [px,py,pz,vx,vy,vz]=Cheb3D(Mjd_TDB, 6, Mjd0, Mjd0+64, cx, cy, cz);
    }
    //-----------------------------

    //Saturn-----------------------
    if (id_c==7) {
        j=0;
        Mjd0 = t1;
        //309   315   321   327
        var cx=[];var cy=[];var cz=[];
        var ct=0;
        for (var i=0;i<6;i++) {
            cx.push(PCtemp[309+i+ct]);
            cy.push(PCtemp[315+i+ct]);
            cz.push(PCtemp[321+i+ct]);
        }
        [px,py,pz,vx,vy,vz]=Cheb3D(Mjd_TDB, 6, Mjd0, Mjd0+64, cx, cy, cz);
    }
    //-----------------------------

    //Uranus-----------------------
    if (id_c==8) {
        j=0;
        Mjd0 = t1;
        //327   333   339   345
        var cx=[];var cy=[];var cz=[];
        var ct=0;
        for (var i=0;i<6;i++) {
            cx.push(PCtemp[327+i+ct]);
            cy.push(PCtemp[333+i+ct]);
            cz.push(PCtemp[339+i+ct]);
        }
        [px,py,pz,vx,vy,vz]=Cheb3D(Mjd_TDB, 6, Mjd0, Mjd0+64, cx, cy, cz);
    }
    //-----------------------------

    //Neptune----------------------
    if (id_c==9) {
        j=0;
        Mjd0 = t1;
        //345   351   357   363
        var cx=[];var cy=[];var cz=[];
        var ct=0;
        for (var i=0;i<6;i++) {
            cx.push(PCtemp[345+i+ct]);
            cy.push(PCtemp[351+i+ct]);
            cz.push(PCtemp[357+i+ct]);
        }
        [px,py,pz,vx,vy,vz]=Cheb3D(Mjd_TDB, 6, Mjd0, Mjd0+64, cx, cy, cz);
    }
    //------------------------------

    //Pluto-------------------------
    if (id_c==10) {
        j=0;
        Mjd0 = t1;
        //363   369   375   381
        var cx=[];var cy=[];var cz=[];
        var ct=0;
        for (var i=0;i<6;i++) {
            cx.push(PCtemp[363+i+ct]);
            cy.push(PCtemp[369+i+ct]);
            cz.push(PCtemp[375+i+ct]);
        }
        [px,py,pz,vx,vy,vz]=Cheb3D(Mjd_TDB, 6, Mjd0, Mjd0+64, cx, cy, cz);
    }
    //-------------------------------

    //Center objects on Sun
    px-=px_s;
    py-=py_s;
    pz-=pz_s;
    vx-=vx_s;
    vy-=vy_s;
    vz-=vz_s;

    //Ecuatorial to ecliptic conversion for J2000
    var px_ecl,py_ecl,pz_ecl,vx_ecl,vy_ecl,vz_ecl;
    var ecl=23.4392794166667*dtor;
    var cos_ecl=Math.cos(ecl);
    var sin_ecl=Math.sin(ecl);

    px_ecl=px*1.0;
    py_ecl=py*cos_ecl+pz*sin_ecl;
    pz_ecl=-py*sin_ecl+pz*cos_ecl;
    
    vx_ecl=vx*1.0;
    vy_ecl=vy*cos_ecl+vz*sin_ecl;
    vz_ecl=-vy*sin_ecl+vz*cos_ecl;

    //Precession correction from j2000 to Epoch 
    //Jay H. Lieske, 1979 & Jean Meeus, Atronomical Algorithms, pag. 134
    if (precession_correction_option==1) {

        var tt=(jd_c-2451545.0)/36525.0
        var tt2=tt*tt;
        var tt3=tt2*tt;

        var ang_s=(2306.2181*tt+0.30188*tt2+0.017998*tt3)/3600.0*dtor;
        var ang_z=(2306.2181*tt+1.09468*tt2+0.018203*tt3)/3600.0*dtor;
        var ang_o=(2004.3109*tt-0.42665*tt2-0.041833*tt3)/3600.0*dtor;

        var cos_ang_s=Math.cos(ang_s); var sin_ang_s=Math.sin(ang_s);
        var cos_ang_z=Math.cos(ang_z); var sin_ang_z=Math.sin(ang_z);
        var cos_ang_o=Math.cos(ang_o); var sin_ang_o=Math.sin(ang_o);
        
        var a11=+cos_ang_z*cos_ang_o*cos_ang_s-sin_ang_z*sin_ang_s;
        var a12=-cos_ang_z*cos_ang_o*sin_ang_s-sin_ang_z*cos_ang_s;
        var a13=-cos_ang_z*sin_ang_o;

        var a21=+sin_ang_z*cos_ang_o*cos_ang_s+cos_ang_z*sin_ang_s;
        var a22=-sin_ang_z*cos_ang_o*sin_ang_s+cos_ang_z*cos_ang_s;
        var a23=-sin_ang_z*sin_ang_o;

        var a31=+sin_ang_o*cos_ang_s;
        var a32=-sin_ang_o*sin_ang_s;
        var a33=+cos_ang_o;

        var px_ecl1=a11*px_ecl+a12*py_ecl+a13*pz_ecl;
        var py_ecl1=a21*px_ecl+a22*py_ecl+a23*pz_ecl;
        var pz_ecl1=a31*px_ecl+a32*py_ecl+a33*pz_ecl;

        var vx_ecl1=a11*vx_ecl+a12*vy_ecl+a13*vz_ecl;
        var vy_ecl1=a21*vx_ecl+a22*vy_ecl+a23*vz_ecl;
        var vz_ecl1=a31*vx_ecl+a32*vy_ecl+a33*vz_ecl;

        px_ecl=px_ecl1*1.0;py_ecl=py_ecl1*1.0;pz_ecl=pz_ecl1*1.0;
        vx_ecl=vx_ecl1*1.0;vy_ecl=vy_ecl1*1.0;vz_ecl=vz_ecl1*1.0;

    }
    
    return [px_ecl,py_ecl,pz_ecl,vx_ecl,vy_ecl,vz_ecl];
}

//Compute position and velocity from Chebysheb polynomials
function Cheb3D(t,N,Ta,Tb,Cx,Cy,Cz) {

    var tau = (2*t-Ta-Tb)/(Tb-Ta);
    var tau_2=2*tau;

    var f1x,f1y,f1z,f2x,f2y,f2z;
    var old_f1x,old_f1y,old_f1z;

    var fv1x,fv1y,fv1z,fv2x,fv2y,fv2z;
    var old_fv1x,old_fv1y,old_fv1z;

    f1x=0;f1y=0;f1z=0;f2x=0;f2y=0;f2z=0;
    old_f1x=0;old_f1y=0;old_f1z=0;
    fv1x=0;fv1y=0;fv1z=0;fv2x=0;fv2y=0;fv2z=0;
    old_fv1x=0;old_fv1y=0;old_fv1z;

    for (var i=N-1;i>=1;i--) {

        old_f1x=f1x*1.0;old_f1y=f1y*1.0;old_f1z=f1z*1.0;
        old_fv1x=fv1x*1.0;old_fv1y=fv1y*1.0;old_fv1z=fv1z*1.0;

        fv1x=tau_2*fv1x-fv2x+2*f1x;fv1y=tau_2*fv1y-fv2y+2*f1y;fv1z=tau_2*fv1z-fv2z+2*f1z;
        f1x=tau_2*f1x-f2x+Cx[i];f1y=tau_2*f1y-f2y+Cy[i];f1z=tau_2*f1z-f2z+Cz[i];

        fv2x=old_fv1x*1.0;fv2y=old_fv1y*1.0;fv2z=old_fv1z*1.0;
        f2x=old_f1x*1.0;f2y=old_f1y*1.0;f2z=old_f1z*1.0;

    }

    var px=tau*f1x-f2x+Cx[0];var py=tau*f1y-f2y+Cy[0];var pz=tau*f1z-f2z+Cz[0];
    var vx=tau*fv1x-fv2x+f1x;var vy=tau*fv1y-fv2y+f1y;var vz=tau*fv1z-fv2z+f1z;

    var TT=Math.abs(Ta-Tb);
    var sv=1/TT/86400*2;
    vx=vx*sv;vy=vy*sv;vz=vz*sv;
    
    return [px,py,pz,vx,vy,vz];

}
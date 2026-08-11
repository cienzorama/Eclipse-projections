//Obteción de la fecha actual en UTC
//desde el sistema.
//Por defecto carga la fechay la hora actual.
function get_current_date() {

    var d=new Date();
    var fecha = new Array(6);

    fecha[0]=d.getUTCDate();
    fecha[1]=d.getUTCMonth()+1;
    fecha[2]=d.getUTCFullYear();
    fecha[3]=d.getUTCHours();
    fecha[4]=d.getUTCMinutes();
    fecha[5]=d.getUTCSeconds();

    //Fecha y hora de prueba
    /*
    fecha[0]=1;
    fecha[1]=1;
    fecha[2]=2100;
    fecha[3]=10;
    fecha[4]=0;
    */
    
    return fecha;
}

//Obtiene el dia juliano (de efemerides)
//a partir de la fecha y la hora
function calc_jd(fecha) {

    var dia=fecha[0];
    var mes=fecha[1];
    var ano=fecha[2];
    var hora=fecha[3];
    var minuto=fecha[4];
    var segundo=fecha[5];

    var ano1=ano;
    if (mes==1 || mes==2) {
        mes=mes+12;
        ano=ano-1;
    }

    var a=Math.floor(ano/100.0);
    var b=2-a+Math.floor(a/4.0);
    var dia1=dia+hora/24.0+(minuto + segundo/60.0)/1440.0;
    var jd=Math.floor(365.25*(ano+4716))+Math.floor(30.6001*(mes+1))+dia1+b-1524.5;

    return jd;

}


//Cálculo de la fecha y la hora
//a partir del día juliano (de efemérides)
function calc_fecha(jd) {

    jd1=0.5+jd;
    z=Math.floor(jd1);
    f=jd1-z;
    alfa=Math.floor((z-1867216.25)/36524.25);
    a=z+1+alfa-Math.floor(alfa/4.0);
    b=a+1524;
    c=Math.floor((b-122.1)/365.25);
    d=Math.floor(365.25*c);
    e=Math.floor((b-d)/30.6001);
    var dia=b-d-Math.floor(30.6001*e)+f;
    var mes=0;
    var ano=0;

    if (e<14) {mes=e-1;} else {mes=e-13;}
    if (mes>2) {ano=c-4716;} else {ano=c-4715;}
    //----

    var hora=(dia*24) % 24;
    var minuto=(dia*24*60) % 60;
    var segundo=(dia*24*60*60) % 60; 

    dia=Math.floor(dia);
    hora=Math.floor(hora);
    minuto=Math.floor(minuto);
    //segundo=Math.floor(segundo);

    var fecha1=[];

    fecha1[0]=dia;
    fecha1[1]=mes;
    fecha1[2]=ano;
    fecha1[3]=hora;
    fecha1[4]=minuto;
    fecha1[5]=segundo;

    return fecha1;

}

function calc_gmst(jd) {

    var j1=jd*1.0;
    var t1 = (j1 -2451545.0)/36525.0; 
    var fecha1=calc_fecha(jd);
    var hh=fecha1[3]*1.0;
    var mm=fecha1[4]*1.0;
    var ss=fecha1[5]*1.0;
    fecha1[3]=0;fecha1[4]=0;fecha1[5]=0;

    var j0=calc_jd(fecha1);
    var j = (j0 - 2451545)/36525.0;
    var g0=100.46061837 + 36000.770053608*j + 0.000387933*j*j - j*j*j/38710000.0;     

    if (g0>360) {
        g0=g0-Math.floor(g0/360.0)*360.0;     
    } else {
        g0 = g0 - (Math.floor(g0/360.0) - 1.0)*360.0;
    }

    var ut=hh+mm/60.0+ss/3600.0-0.0*0.1;
	ut=ut+dtt1+0.1;
    var gst = g0 + 360.98564724*ut/24.0;

    gst=gst*dtor;
    return gst;

}


//de406_func();

//Cálculo de la posición geocéntrica del Sol
// respecto al primer meridiano y al plano 
//del ecuador terrestre basado en el modelo de
// efemerides DE406
//(falta corrección del tiempo-luz ~ +8.25m)
function calc_sun_pos_de406(jd) {

    var d2k=(jd-2451543.5);
	var ecl = 23.4393 - 3.563E-7 * d2k;
    ecl=ecl*dtor;

    var rp1=1.0/earth_radius*earth_scale;
    var ppe=get406ephemeris(jd,3,1);
    
    var xh_p1=-1.0*ppe[0];
    var yh_p1=-1.0*ppe[1];
    var zh_p1=-1.0*ppe[2];

    //Transformación del plano de la eclíptica
    //al ecuador terrestre
    var cos_ecl=Math.cos(ecl);
    var sin_ecl=Math.sin(ecl);
    var xg_p1 = xh_p1
    var yg_p1 = yh_p1 * cos_ecl - zh_p1 * sin_ecl;
    var zg_p1 = yh_p1 * sin_ecl + zh_p1 * cos_ecl;

    //Cálculo del tiempo sidéreo medio de Greenwich
    var GMST=-calc_gmst(jd);

    //Rotación respecto del primer meridiano
    var cos_GMST=Math.cos(GMST);
    var sin_GMST=Math.sin(GMST);
    var xe_p1=xg_p1*cos_GMST-yg_p1*sin_GMST;
    var ye_p1=xg_p1*sin_GMST+yg_p1*cos_GMST;
    var ze_p1=zg_p1;

    //Escalado
    xe_p1*=rp1;ye_p1*=rp1;ze_p1*=rp1;
    
    //sun_xyz=new BABYLON.Vector3(xe_p1,ze_p1,ye_p1);
    return createVector(xe_p1,ye_p1,ze_p1);;

}

//Cálculo de la posición geocéntrica de La Luna
// respecto al primer meridiano y al plano 
//del ecuador terrestre basado en el modelo de
//efemérides DE406
//(falta corrección del tiempo-luz ~ +1.3s)
function calc_moon_pos_de406(jd) {

	//jd-=72/3600.0/24.0;
	jd-=0.00005;
    var d2k=(jd-2451543.5);
    var ecl = 23.4393 - 3.563E-7 * d2k;
    ecl=ecl*dtor;

    var rp1=1.0/earth_radius*earth_scale;
    var ppe=get406ephemeris(jd,3,1);
    var ppm=get406ephemeris(jd,4,1);

    var xh_p1=ppm[0]-ppe[0];
    var yh_p1=ppm[1]-ppe[1];
    var zh_p1=ppm[2]-ppe[2];

    //Transformación del plano de la eclíptica
    //al ecuador terrestre
    var cos_ecl=Math.cos(ecl);
    var sin_ecl=Math.sin(ecl);
    var xg_p1 = xh_p1
    var yg_p1 = yh_p1 * cos_ecl - zh_p1 * sin_ecl;
    var zg_p1 = yh_p1 * sin_ecl + zh_p1 * cos_ecl;

    //Cálculo del tiempo sidéreo medio de Greenwich
    var GMST=-calc_gmst(jd);

    //Rotación respecto del primer meridiano
    var cos_GMST=Math.cos(GMST);
    var sin_GMST=Math.sin(GMST);
    var xe_p1=xg_p1*cos_GMST-yg_p1*sin_GMST;
    var ye_p1=xg_p1*sin_GMST+yg_p1*cos_GMST;
    var ze_p1=zg_p1;

    xe_p1*=rp1;ye_p1*=rp1;ze_p1*=rp1;

    //moon_xyz=new BABYLON.Vector3(xe_p1,ze_p1,ye_p1);
    return createVector(xe_p1,ye_p1,ze_p1);;

}

//*Cálculo del momento de una fase lunar determinada*
// Luna Nueva -> fase=0
// Cuarto creciente -> fase=0.25
// Luna LLena -> fase=0.5
// Cuarto menguante -> fase=0.75
// hacia el futuro sen>0, hacia el pasado sen<0
//
// En el caso de calcular la Luna Nueva y Luna LLena se determina 
// si existe un eclipse solar o lunar
// (Astronomical Algorithms, Jean Meeus, chapter 49 & 54)
function fase_lunar(fase, sen, jd) {

	var k,T;
	var M,M_prime,F,omega,W,E;
	var corr;
	var a_1,a_2,a_3,a_4,a_5,a_6,a_7,a_8;
	var a_9,a_10,a_11,a_12,a_13,a_14;
	var JDE,deltaJD;
	var ano0;
	var TT,TTT,TTTT;

    T=(jd-2451550.09766)/36525.0;
    var k0=T*1236.8530872148394;
    //k0=(jd-2451545.0)/29.530588861;
    //ano0=FECHA[2]+(FECHA[1]+FECHA[0]/30.5)/12.0;
    //var k0=(ano0-2000)*12.3685;
	//T=k0/1236.85;
    var k0f=Math.floor(k0); 
    var dk=(k0-k0f);

    if (fase==0.25) {
        if (dk>=0 && dk<0.25) {if (sen>0) {k=k0f+0.25;} else {k=k0f;}}
        if (dk>=0.25 && dk<0.5) {if (sen>0) {k=k0f+0.5;} else {k=k0f+0.25;}}
        if (dk>=0.5 && dk<0.75) {if (sen>0) {k=k0f+0.75;} else {k=k0f+0.5;}}
        if (dk>=0.75 && dk<1) {if (sen>0) {k=k0f+1;} else {k=k0f+0.75;}}

        JDE = 2451550.09766 + (29.530588861 * k) + (0.00015437 * T*T) - (0.000000150 * T*T*T) + (0.00000000073 * T*T*T*T);

        DJD=JDE-jd;
        if (Math.abs(DJD)<1 && sen>0) k=k+0.25;
        if (Math.abs(DJD)<1 && sen<0) k=k-0.25;
        JDE = 2451550.09766 + (29.530588861 * k) + (0.00015437 * T*T) - (0.000000150 * T*T*T) + (0.00000000073 * T*T*T*T);
    }

    if (fase==0) {

        if (sen>0) k=k0f+1;
        if (sen<0) k=k0f-1;

        JDE = 2451550.09766 + (29.530588861 * k) + (0.00015437 * T*T) - (0.000000150 * T*T*T) + (0.00000000073 * T*T*T*T);

        DJD=JDE-jd;
        if (Math.abs(DJD)<1 && sen>0) k=k+1;
        if (Math.abs(DJD)<1 && sen<0) k=k-1;
        if (Math.abs(DJD)>33 && sen<0) k=k+1;
        JDE = 2451550.09766 + (29.530588861 * k) + (0.00015437 * T*T) - (0.000000150 * T*T*T) + (0.00000000073 * T*T*T*T);

    }

	if (fase==0.5) {

        if (sen>0) k=k0f+0.5;
        if (sen<0) k=k0f-0.5;

        JDE = 2451550.09766 + (29.530588861 * k) + (0.00015437 * T*T) - (0.000000150 * T*T*T) + (0.00000000073 * T*T*T*T);

        DJD=JDE-jd;
        if (Math.abs(DJD)<1 && sen>0) k=k+1;
        if (Math.abs(DJD)<1 && sen<0) k=k-1;
        if (Math.abs(DJD)>33 && sen<0) k=k+1;
        JDE = 2451550.09766 + (29.530588861 * k) + (0.00015437 * T*T) - (0.000000150 * T*T*T) + (0.00000000073 * T*T*T*T);

    }

	var JDE1=JDE*1.0;
	var JDE2=jd*1.0;

    T=(JDE-2451545.0)/36525.0;
	T=k/1236.85;
	JDE = 2451550.09766 + (29.530588861 * k) + (0.00015437 * T*T) - (0.000000150 * T*T*T) + (0.00000000073 * T*T*T*T);


	TT=T*T;
	TTT=T*T*T;
	TTTT=T*T*T*T;

	M = 2.5534 + (29.10535670 * k) - (0.0000014 * TT) - (0.00000011 * TTT);M*=dtor;
	M_prime = 201.5643 + (385.81693528 * k) + (0.0107582 * TT) + (0.00001238 * TTT) - (0.000000058 * TTTT);M_prime*=dtor;

	F = 160.7108 + (390.67050284 * k) - (0.0016118 * TT) - (0.00000227 * TTT) + (0.000000011 *TTTT);F*=dtor;
	omega = 124.7746 - (1.56375588 * k) + (0.0020672 * TT) + (0.00000215 * TTT);omega*=dtor;

	a_1 = 299.77 + (0.107408 * k) - (0.009173 * TT);a_1*=dtor;
	a_2 = 251.88 + (0.016321 * k);   a_2*=dtor;
	a_3 = 251.83 + (26.651886 * k);  a_3*=dtor;
	a_4 = 349.42 + (36.412478 * k);  a_4*=dtor;
	a_5 = 84.66 + (18.206239 * k);   a_5*=dtor;
	a_6 = 141.74 + (53.303771 * k);  a_6*=dtor;
	a_7 = 207.14 + (2.453732 * k);   a_7*=dtor;
	a_8 = 154.84 + (7.306860 * k);   a_8*=dtor;
	a_9 = 34.52 + (27.261239 * k);   a_9*=dtor;
	a_10 = 207.19 + (0.121824 * k);  a_10*=dtor;
	a_11 = 291.34 + (1.844379 * k);  a_11*=dtor;
	a_12 = 161.72 + (24.198154 * k); a_12*=dtor;
	a_13 = 239.56 + (25.513099 * k); a_13*=dtor;
	a_14 = 331.55 + (3.592518 * k);  a_14*=dtor;

	E = 1 - (0.002516*T) - (0.0000074 * TT);

	var fkf=k-Math.floor(k);

	if (fkf==0) {
		corr =  - 0.40720 * Math.sin(M_prime);
		corr+=  + 0.17241 * E * Math.sin(M);
		corr+=  + 0.01608 * Math.sin(2*M_prime);
		corr+=  + 0.01039 * Math.sin(2*F);
		corr+=  + 0.00739 * E * Math.sin(M_prime - M);
		corr+=  - 0.00514 * E * Math.sin(M_prime + M);
		corr+=  + 0.00208 * E*E* Math.sin(2*M);
		corr+=  - 0.00111 * Math.sin(M_prime - 2*F);
		corr+=  - 0.00057 * Math.sin(M_prime + 2*F);
		corr+=  + 0.00056 * E * Math.sin((2*M_prime) + M);
		corr+=  - 0.00042 * Math.sin(3*M_prime);
		corr+=  + 0.00042 * E * Math.sin(M + 2*F);
		corr+=  + 0.00038 * E * Math.sin(M - 2*F);
		corr+=  - 0.00024 * E * Math.sin(2*M_prime - M);
		corr+=  - 0.00017 * Math.sin(omega);
		corr+=  - 0.00007 * Math.sin(M_prime + 2*M);
		corr+=  + 0.00004 * Math.sin((2*M_prime)-(2*F));
		corr+=  + 0.00004 * Math.sin(3*M);
		corr+=  + 0.00003 * Math.sin(M_prime + M - 2*F);
		corr+=  + 0.00003 * Math.sin((2*M_prime) + 2*F);
		corr+=  - 0.00003 * Math.sin(M_prime + M + 2*F);
		corr+=  + 0.00003 * Math.sin(M_prime - M + 2*F);
		corr+=  - 0.00002 * Math.sin(M_prime - M - 2*F);
		corr+=  - 0.00002 * Math.sin(3*M_prime + M);
		corr+=  + 0.00002 * Math.sin(4*M_prime);
	}

	if (fkf==0.5)  {
		corr =  - 0.40614 * Math.sin(M_prime);
		corr+=  + 0.17302 * E * Math.sin(M);
		corr+=  + 0.01614 * Math.sin(2*M_prime);
		corr+=  + 0.01043 * Math.sin(2*F);
		corr+=  + 0.00734 * E * Math.sin(M_prime - M);
		corr+=  - 0.00515 * E * Math.sin(M_prime + M);
		corr+=  + 0.00209 * E*E* Math.sin(2*M);
		corr+=  - 0.00111 * Math.sin(M_prime - 2*F);
		corr+=  - 0.00057 * Math.sin(M_prime + 2*F);
		corr+=  + 0.00056 * E * Math.sin(2*M_prime + M);
		corr+=  - 0.00042 * Math.sin(3*M_prime);
		corr+=  + 0.00042 * E * Math.sin(M + 2*F);
		corr+=  + 0.00038 * E * Math.sin(M - 2*F);
		corr+=  - 0.00024 * E * Math.sin(2*M_prime - M);
		corr+=  - 0.00017 * Math.sin(omega);
		corr+=  - 0.00007 * Math.sin(M_prime + 2*M);
		corr+=  + 0.00004 * Math.sin((2*M_prime)-2*F);
		corr+=  + 0.00004 * Math.sin(3*M);
		corr+=  + 0.00003 * Math.sin(M_prime + M - 2*F);
		corr+=  + 0.00003 * Math.sin((2*M_prime) + 2*F);
		corr+=  - 0.00003 * Math.sin(M_prime + M + 2*F);
		corr+=  + 0.00003 * Math.sin(M_prime - M + 2*F);
		corr+=  - 0.00002 * Math.sin(M_prime - M - 2*F);
		corr+=  - 0.00002 * Math.sin(3*M_prime + M);
		corr+=  + 0.00002 * Math.sin(4*M_prime);
	}

	if (fkf==0.25 || fkf==0.75) {
		corr =  - 0.62801 * Math.sin(M_prime);
		corr+=  + 0.17172 * E* Math.sin(M);
		corr+=  - 0.01183 * E * Math.sin(M_prime + M);
		corr+=  + 0.00862 * Math.sin(2*M_prime);
		corr+=  + 0.00804 * Math.sin(2*F);
		corr+=  + 0.00454 * E * Math.sin(M_prime - M);
		corr+=  + 0.00204 * E*E* Math.sin(2*M);
		corr+=  - 0.00108 * Math.sin(M_prime - 2*F);
		corr+=  - 0.00070 * Math.sin(M_prime + 2*F);
		corr+=  - 0.00040 * Math.sin(3*M_prime);
		corr+=  - 0.00034 * E * Math.sin(2*M_prime - M);
		corr+=  + 0.00032 * E * Math.sin(M + 2*F);
		corr+=  + 0.00032 * E * Math.sin(M - 2*F);
		corr+=  - 0.00028 * E*E* Math.sin(M_prime + 2*M);
		corr+=  + 0.00027 * E * Math.sin(2*M_prime + M);
		corr+=  - 0.00017 * Math.sin(omega);
		corr+=  - 0.00005 * Math.sin(M_prime - M - 2*F);
		corr+=  + 0.00004 * Math.sin((2*M_prime) + 2*F);
		corr+=  - 0.00004 * Math.sin(M_prime + M + 2*F);
		corr+=  + 0.00004 * Math.sin(M_prime - (2*M));
		corr+=  + 0.00003 * Math.sin(M_prime + M - 2*F);
		corr+=  + 0.00003 * Math.sin(3*M);
		corr+=  + 0.00002 * Math.sin(2*M_prime - 2*F);
		corr+=  + 0.00002 * Math.sin(M_prime - M + 2*F);
		corr+= - 0.00002 * Math.sin(3*M_prime + M);

		W = 0.00306 - 0.00038 * E * Math.cos(M);
		W+= 0.00026 * Math.cos(M_prime) - 0.00002 * Math.cos(M_prime - M);
		W+= 0.00002 * Math.cos(M_prime + M) + 0.00002 * Math.cos(2*F);

		if (fkf==0.25) {
			corr+= W;
		}
		if (fkf==0.75) {
			corr-= W;
		}
	}


	corr+= + 0.000325 * Math.sin (a_1);
	corr+= + 0.000165 * Math.sin (a_2);
	corr+= + 0.000164 * Math.sin (a_3);
	corr+= + 0.000126 * Math.sin (a_4);
	corr+= + 0.000110 * Math.sin (a_5);
	corr+= + 0.000062 * Math.sin (a_6);
	corr+= + 0.000060 * Math.sin (a_7);
	corr+= + 0.000056 * Math.sin (a_8);
	corr+= + 0.000047 * Math.sin (a_9);
	corr+= + 0.000042 * Math.sin (a_10);
	corr+= + 0.000040 * Math.sin (a_11);
	corr+= + 0.000037 * Math.sin (a_12);
	corr+= + 0.000035 * Math.sin (a_13);
	corr+= + 0.000023 * Math.sin (a_14);

    JDE = JDE + corr;

	jd=JDE*1.0;

	if (fase==0.25) return;
	
	//Determiación si en la fase luna nueva o luna llena existe un eclipse
	//en función del parámetro gamma

	var fecha_e=calc_fecha(JDE);
	ano0=fecha_e[2]+(fecha_e[1]-1+(fecha_e[0]-1)/30.417)/12.0;
	k1=(ano0-2000)*12.3685;
	k=Math.round(k1);

	if (fase==0.5 && sen>0) {k=Math.floor(k1);k=k+0.5;}
	if (fase==0.5 && sen<0) {k=Math.round(k1);k=k-0.5;}

	T=k/1236.85;
	JDE = 2451550.09766 + (29.530588861 * k) + (0.00015437 * T*T) - (0.000000150 * T*T*T) + (0.00000000073 * T*T*T*T);

	TT=T*T;
	TTT=T*T*T;
	TTTT=T*T*T*T;

	//T=(JDE-2451545.0)/36525.0;

	M = 2.5534 + (29.10535670 * k) - (0.0000014 * TT) - (0.00000011 * TTT);M*=dtor;
	M_prime = 201.5643 + (385.81693528 * k) + (0.0107582 * TT) + (0.00001238 * TTT) - (0.000000058 * TTTT);M_prime*=dtor;

	F = 160.7108 + (390.67050284 * k) - (0.0016118 * TT) - (0.00000227 * TTT) + (0.000000011 *TTTT);
	omega = 124.7746 - (1.56375588 * k) + (0.0020672 * TT) + (0.00000215 * TTT);omega*=dtor;

	E = 1 - (0.002516*T) - (0.0000074 * TT);

	F=F-0.02665*Math.sin(omega);F=F*dtor;
	var A1=299.77+0.107408*k-0.009173*TT; A1=A1*dtor;


	//En el caso de eclipses solares
	if (fase==0) {
		corr = -0.4075 * Math.sin(M_prime);
		corr+= +0.1721 * E * Math.sin(M);
	}
	//En el caso de eclipse lunares
	if (fase==0.5) {
		corr = -0.4065 * Math.sin(M_prime);
		corr+= +0.1727 * E * Math.sin(M);
	}
	corr+= +0.0161 * Math.sin(2*M_prime);
	corr+= -0.0097 * Math.sin(2*F);
	corr+= +0.0073 * E * Math.sin(M_prime-M);
	corr+= -0.0050 * E * Math.sin(M_prime+M);
	corr+= -0.0023 * Math.sin(M_prime-2*F);
	corr+= +0.0021 * E * Math.sin(2*M);
	corr+= +0.0012 * Math.sin(M_prime+2*F);
	corr+= +0.0006 * E * Math.sin(2*M_prime+M);
	corr+= -0.0004 * Math.sin(3*M_prime);
	corr+= -0.0003 * E * Math.sin(M-2*F);
	corr+= +0.0003 * Math.sin(A1);
	corr+= -0.0002 * E * Math.sin(M-2*F);
	corr+= -0.0002 * E * Math.sin(2*M_prime-M);
	corr+= -0.0002 * Math.sin(omega);

	JDE+=corr;

	var P,Q;
	P = +0.2070 * E * Math.sin(M);
	P+= +0.0024 * E * Math.sin(2*M);
	P+= -0.0392 * Math.sin(M_prime);
	P+= +0.0116 * Math.sin(2*M_prime);
	P+= -0.0073 * E * Math.sin(M_prime+M);
	P+= +0.0067 * E * Math.sin(M_prime-M);
	P+= +0.0018 * Math.sin(2*F);

	Q = +5.2207;
	Q+= -0.0048 * E * Math.cos(M);
	Q+= +0.0020 * E * Math.cos(2*M);
	Q+= -0.3299 * Math.cos(M_prime);
	Q+= -0.0060 * E * Math.cos(M_prime+M);
	Q+= +0.0041 * E * Math.cos(M_prime-M);

	var W = Math.abs(Math.cos(F));
	var gamma = (P*Math.cos(F)+Q*Math.sin(F))*(1-0.0048*W);
	var u = 0.0059 + 0.0046*E*Math.cos(M)-0.0182*Math.cos(M_prime)+0.0004*Math.cos(2*M_prime)-0.0005*Math.cos(M+M_prime);

	jd=JDE*1.0;

    //En caso de eclipse solar
	var exist_eclipse;
	if (fase==0) {

		exist_eclipse=0.0;
		if (Math.abs(gamma)<1.5433+u) exist_eclipse=1.0;

	}

	//En caso de eclipse lunar
	if (fase==0.5) {

		exist_eclipse=1.0;
		var pe=(1.5573+u-Math.abs(gamma))/0.5450;
		var ue=(1.0128-u-Math.abs(gamma))/0.5450;

		if (ue<0 && pe<0 ) exist_eclipse=0.0;
		if (pe<0) exist_eclipse=0.0;
	}

	//console.log("gamma: ",Math.abs(gamma), 1.5433+u); 

	return [exist_eclipse,jd,gamma];
}
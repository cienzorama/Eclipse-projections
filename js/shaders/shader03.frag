precision highp float;

varying vec2 pos;
uniform sampler2D tex01;
uniform sampler2D tex02;
uniform sampler2D tex03;
uniform vec3 sun_p;
uniform vec3 moon_p;
uniform vec3 angles;
uniform float ilumination;
uniform float lockSun;
uniform float show_sunmoon;

#define pi 3.141592653589793
#define pi2 6.283185307179586

#define sun_radius 696340.0
#define moon_radius 1737.4
#define earth_radius 6371.0
#define sun_mass 1.9891e30
#define moon_mass 7.349e22
#define sun_semiaxis 149597870700.0
#define moon_semiaxis 384400000.0
#define G 6.67e-11

#define normal_tidal_acc 1.0

vec3 jet_colormap(float t) {
    return clamp(vec3(1.5)-abs(4.0*vec3(t)+vec3(-3,-2,-1)), vec3(0), vec3(1));
}
vec3 jet_colormap2(float t) {
    return vec3(clamp(2.0-abs(2.0*t-2.0),0.0,1.0),
                clamp(2.0-abs(2.0*t),0.0,1.0),
                clamp(2.0-abs(2.0*t+2.0),0.0,1.0));
}

void main() {

    vec2 uv=pos;
    uv.y=1.0-uv.y;
    //uv.x+=0.5;
    //if (uv.x>1.0) uv.x-=1.0;

    // Proyección
    float angle1=angles.x;
    float angle2=angles.y;
    float angle3=angles.z;
    vec2 latlon0=vec2(-(-0.5+uv.y)*pi,-(0.5-uv.x)*pi2);
    vec3 topo0=vec3(cos(latlon0.y)*cos(latlon0.x), sin(latlon0.y)*cos(latlon0.x),sin(latlon0.x));
    float cos_a1=cos(angle1); float sin_a1=sin(angle1);
    float cos_a2=cos(angle2); float sin_a2=sin(angle2);
    float cos_a3=cos(angle3); float sin_a3=sin(angle3);
    mat3 rotX=mat3(1.0,       0.0,         0.0    ,
                   0.0,      cos_a1,      -sin_a1 ,
                   0.0,      sin_a1,       cos_a1);
    mat3 rotZ=mat3(cos_a2,  -sin_a2,         0.0  ,
                   sin_a2,   cos_a2,         0.0  ,
                   0.0,       0.0,           1.0 );
    mat3 rotY=mat3(cos_a3,    0.0,        -sin_a3 ,
                   0.0,       1.0,           0.0  ,
                   sin_a3,    0.0,         cos_a3);                       
    vec3 topo1=rotY*rotX*rotZ*topo0;
    vec2 latlon1=vec2( asin(topo1.z), atan(topo1.y,topo1.x));
    uv.y=-latlon1.x/pi+0.5;
    uv.x=latlon1.y/pi2+0.5;
    //

    vec3 sunXYZ_n=normalize(sun_p);
    vec2 sun_latlon=vec2( asin(sunXYZ_n.z), atan(sunXYZ_n.y,sunXYZ_n.x));
    vec3 moonXYZ_n=normalize(moon_p);
    vec2 moon_latlon=vec2( asin(moonXYZ_n.z), atan(moonXYZ_n.y,moonXYZ_n.x));
    if (lockSun==1.0) {
        uv.x+=sun_latlon.y/pi/2.0;
        //uv.x+=moon_latlon.y/pi/2.0;
        uv=mod(uv,1.0);
    }

    float lat=-(-0.5+uv.y)*pi;
    float lon=-(0.5-uv.x)*pi2;

    float cos_lat=cos(lat);
    vec3 topoXYZ=vec3(earth_radius*cos(lon)*cos_lat, earth_radius*sin(lon)*cos_lat,earth_radius*sin(lat));
    vec3 topoXYZ_n=normalize(topoXYZ);
    
    vec3 topoSunXYZ=sun_p-topoXYZ;
    float topoSunDist=length(topoSunXYZ);
    vec3 topoSunXYZ_n=normalize(topoSunXYZ);
    float topoDotSun=dot(topoXYZ_n,topoSunXYZ_n);
    if (topoDotSun<0.0) topoDotSun=0.0;

    float sunShadow;
    if (topoDotSun>0.0) { sunShadow=0.375;} else {sunShadow=0.275;}
    vec4 total=sunShadow*texture2D(tex01,uv);

    if (ilumination==0.0) total=0.375*texture2D(tex01,uv);

    float sun_val=4000000.0/10.0;
    float n_acc=0.0;

    float sunDist=length(sun_p)*1000.0;
    vec3 sun_acc=G*sun_mass/(sunDist*sunDist)*sunXYZ_n;
    vec3 topo_sun_acc=G*sun_mass/(topoSunDist*topoSunDist*1.0e6)*topoSunXYZ_n;
    vec3 sun_tidal_acc=sun_acc-topo_sun_acc;
    float sun_tidal_z=dot(sun_tidal_acc,-1.0*topoXYZ_n);
    if (normal_tidal_acc==1.0) {
        n_acc=sun_val*sun_tidal_z;
    } else {
        vec3 sun_tidal_t=sun_tidal_acc-sun_tidal_z*topoXYZ_n;
        float sun_tidal_tm=length(sun_tidal_t);
        n_acc=-sun_val*sun_tidal_tm+0.3;
    }
    
    vec3 topoMoonXYZ=moon_p-topoXYZ;
    float topoMoonDist=length(topoMoonXYZ);
    vec3 topoMoonXYZ_n=normalize(topoMoonXYZ);

    float moonDist=length(moon_p)*1000.0;
    vec3 moon_acc=G*moon_mass/(moonDist*moonDist)*moonXYZ_n;
    vec3 topo_moon_acc=G*moon_mass/(topoMoonDist*topoMoonDist*1.0e6)*topoMoonXYZ_n;
    vec3 moon_tidal_acc=moon_acc-topo_moon_acc;
    float moon_tidal_z=dot(moon_tidal_acc,-1.0*topoXYZ_n);
    if (normal_tidal_acc==1.0) {
        n_acc+=sun_val*moon_tidal_z;
    } else {
        vec3 moon_tidal_t=moon_tidal_acc-moon_tidal_z*topoXYZ_n;
        float moon_tidal_tm=length(moon_tidal_t);
        n_acc+=-sun_val*moon_tidal_tm+0.3;
    }

    //n_acc+=cos_lat*cos_lat*0.033693*8.0;  <-- aceleración centrífuga
    n_acc+=0.25;
    n_acc=clamp(n_acc,-1.0,1.0);

    total=total+0.6*vec4(0.4*jet_colormap2(n_acc),1.0);

    //
    n_acc-=0.25;
    n_acc=(n_acc+1.0)/2.0;
    float sdelta=0.0025;
    for (float i=0.0;i<21.0;i++) {
        if (n_acc<i/20.0+sdelta && n_acc>i/20.0-sdelta) {
            total=total-vec4(0.1,0.1,0.1,1.0);
        }
    }
    if (n_acc<0.5+sdelta && n_acc>0.5-sdelta) {
        total=total-vec4(0.1,0.1,0.1,1.0);
    }
    //

    //
    float sll=0.0;
    if (lockSun==1.0) sll=sun_latlon.y/pi/2.0;

    float nx=40.0;
    float ny=20.0;
    float deform=1.0/cos(lat)*0.0+1.0;
    float xx=floor((uv.x-sll)*nx+0.5)/nx;
    float yy=floor(uv.y*ny+0.5)/ny;
    float dxx=xx-uv.x+sll;
    float dyy=(yy-uv.y)*0.5*deform;
    float ds1=sqrt(dxx*dxx+dyy*dyy);
    if (ds1<0.006125*deform*8.0) {   

        vec3 tidal_acc=sun_tidal_acc+moon_tidal_acc;

        float sin_lon=sin(lon);
        float cos_lon=cos(lon);
        float sin_lat=sin(lat);

        vec3 v_lon=normalize(vec3(-sin_lon*cos_lat, cos_lon*cos_lat,0));
        vec3 v_lat=normalize(vec3(-cos_lon*sin_lat, -sin_lon*sin_lat,cos_lat));
        float tidal_lon=dot(tidal_acc,v_lon);
        float tidal_lat=-1.0*dot(tidal_acc,v_lat);
        float b=atan(tidal_lat,tidal_lon);
        float tll=1.0+1000000.0*sqrt(tidal_lat*tidal_lat+tidal_lon*tidal_lon);

        float cos_b=cos(b);float sin_b=sin(b);
        float dxx2=dxx*cos_b+dyy*sin_b;
        float dyy2=dxx*sin_b-dyy*cos_b;

        vec2 uva=vec2(dxx2,dyy2)*100.0*tll+0.5;
        if (ds1<0.006125*deform*0.3*8.0) total=total-0.15*texture2D(tex03,uva);
    }
    
    //

    if (show_sunmoon==1.0) {

        float moonRelDist=(1.0/(moonDist/moon_semiaxis)-1.0)*4.0+1.0;
        float sunRelDist=1.0/(sunDist/sun_semiaxis);

        float sin_lat=sin(lat);
        float delta_lon=sun_latlon.y-lon;
        float d_sun=acos(cos(sun_latlon.x)*cos_lat*cos(delta_lon) + sin(sun_latlon.x)*sin_lat);
        float dds=pow(0.02/d_sun,3.4);
        if (d_sun<0.08*sunRelDist) total=total+vec4(dds,dds,0.0,1.0);

        delta_lon=moon_latlon.y-lon;
        float d_moon=acos(cos(moon_latlon.x)*cos_lat*cos(delta_lon) + sin(moon_latlon.x)*sin_lat);
        //float ddm=pow(0.02/d_moon,3.4);
        float ddm=1.0;
        

        if (d_moon<0.03*moonRelDist) {

            float cos_s_lat=cos(sun_latlon.x);
            float sin_s_lat=sin(sun_latlon.x);
            float cos_m_lat=cos(moon_latlon.x);
            float sin_m_lat=sin(moon_latlon.x);

            float delta_lon2=moon_latlon.y-sun_latlon.y;
            
            float bear=atan(sin(delta_lon2)*cos_s_lat, 
                            cos_m_lat*sin_s_lat
                            -sin_m_lat*cos_s_lat*cos(delta_lon2));
                            
            float delta_lon31=(moon_latlon.y-lon);
            float delta_lat31=(moon_latlon.x-lat);

            bear+=pi/2.0;
            float cos_bear=cos(bear);
            float sin_bear=sin(bear);
            float delta_lon3=delta_lon31*cos_bear+delta_lat31*sin_bear;
            float delta_lat=delta_lon31*sin_bear-delta_lat31*cos_bear;

            float SunMoonAngle=acos(cos_s_lat*cos_m_lat*cos(delta_lon2) 
                                    +sin_s_lat*sin_m_lat);
            
            if (delta_lon3-0.03*moonRelDist*sin(SunMoonAngle-pi/2.0)*cos(delta_lat*30.0)>0.0) {
                total=total-vec4(ddm*0.1,ddm*0.1,ddm*0.1,1.0);
            } else {
                total=total+vec4(ddm,ddm,ddm,1.0);
            }
        }

        if (d_moon>=0.03*moonRelDist && d_moon<0.08) {
            ddm=pow(0.02/d_moon,3.4);
            total=total+vec4(ddm,ddm,ddm,1.0);
        }
    }

    total=clamp(total,0.0,1.0);
    gl_FragColor = vec4(total.r,total.g,total.b,1.0);
    
}
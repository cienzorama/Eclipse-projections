precision mediump float;

varying vec2 pos;
uniform sampler2D tex01;
uniform sampler2D tex02;
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
#define G 6.67e-11

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
    mat3 rotX=mat3(1.0,       0.0,         0.0    ,
                   0.0,  cos(angle1), -sin(angle1),
                   0.0,  sin(angle1), cos(angle1));
    mat3 rotZ=mat3(cos(angle2),-sin(angle2),  0.0 ,
                   sin(angle2),  cos(angle2),  0.0 ,
                        0.0,         0.0,     1.0);
    mat3 rotY=mat3(cos(angle3),  0.0  ,-sin(angle3),
                       0.0    ,  1.0  ,     0.0    ,
                   sin(angle3),  0.0 , cos(angle3));                       
    vec3 topo1=rotY*rotX*rotZ*topo0;
    vec2 latlon1=vec2( asin(topo1.z), atan(topo1.y,topo1.x));
    uv.y=-latlon1.x/pi+0.5;
    uv.x=latlon1.y/pi2+0.5;
    //

    vec3 sunXYZ_n=normalize(sun_p);
    vec2 sun_latlon=vec2( asin(sunXYZ_n.z), atan(sunXYZ_n.y,sunXYZ_n.x));
    if (lockSun==1.0) {
        uv.x+=sun_latlon.y/pi/2.0;
        uv=mod(uv,1.0);
    }

    vec3 moonXYZ_n=normalize(moon_p);
    vec2 moon_latlon=vec2( asin(moonXYZ_n.z), atan(moonXYZ_n.y,moonXYZ_n.x));

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
    vec3 sun_tidal_t=sun_tidal_acc-sun_tidal_z*topoXYZ_n;
    float sun_tidal_tm=length(sun_tidal_t);
    
    n_acc=sun_val*sun_tidal_z;
    
    vec3 topoMoonXYZ=moon_p-topoXYZ;
    float topoMoonDist=length(topoMoonXYZ);
    vec3 topoMoonXYZ_n=normalize(topoMoonXYZ);

    float moonDist=length(moon_p)*1000.0;
    vec3 moon_acc=G*moon_mass/(moonDist*moonDist)*moonXYZ_n;
    vec3 topo_moon_acc=G*moon_mass/(topoMoonDist*topoMoonDist*1.0e6)*topoMoonXYZ_n;
    vec3 moon_tidal_acc=moon_acc-topo_moon_acc;
    float moon_tidal_z=dot(moon_tidal_acc,-1.0*topoXYZ_n);
    vec3 moon_tidal_t=moon_tidal_acc-moon_tidal_z*topoXYZ_n;
    float moon_tidal_tm=length(moon_tidal_t);

    n_acc+=sun_val*moon_tidal_z;

    //n_acc+=cos_lat*cos_lat*0.033693*8.0;
    n_acc+=0.25;
    n_acc=clamp(n_acc,-1.0,1.0);

    //total=total+0.6*vec4(0.4*jet_colormap((0.9*n_acc+1.0)/2.0),1.0);
    total=total+0.6*vec4(0.4*jet_colormap2(n_acc),1.0);

    //
    n_acc=(n_acc+1.0)/2.0;
    float sdelta=0.0025;
    for (float i=0.0;i<21.0;i++) {
        if (n_acc<i/20.0+sdelta && n_acc>i/20.0-sdelta) {
            total=total-vec4(0.1,0.1,0.1,1.0);
        }
    }
    float vv=0.5;
    if (n_acc<vv+sdelta && n_acc>vv-sdelta) {
        total=total-vec4(0.05,0.05,0.05,1.0);
    }
    //

    if (show_sunmoon==1.0) {

        float sin_lat=sin(lat);
        float delta_lon=sun_latlon.y-lon;
        float d_sun=acos(cos(sun_latlon.x)*cos_lat*cos(delta_lon) + sin(sun_latlon.x)*sin_lat);
        float dds=pow(0.02/d_sun,3.4);
        if (d_sun<0.08) total=total+vec4(dds,dds,0.0,1.0);

        delta_lon=moon_latlon.y-lon;
        float d_moon=acos(cos(moon_latlon.x)*cos_lat*cos(delta_lon) + sin(moon_latlon.x)*sin_lat);
        float ddm=pow(0.02/d_moon,3.4);
        if (d_moon<0.08) total=total+vec4(ddm,ddm,ddm,1.0);
    }

    total=clamp(total,0.0,1.0);
    gl_FragColor = vec4(total.r,total.g,total.b,1.0);
    
}
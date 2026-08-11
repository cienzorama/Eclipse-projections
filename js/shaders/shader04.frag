precision mediump float;

varying vec2 pos;
uniform sampler2D tex01;
uniform vec3 sun_p;
uniform vec3 moon_p;
uniform vec3 angles;
uniform float ilumination;
uniform float lockSun;
uniform float show_sunmoon;
uniform float borra;

#define pi 3.141592653589793
#define pi2 6.283185307179586

#define sun_radius 696340.0
#define moon_radius 1737.4
#define earth_radius 6371.0
#define earth_radius_e 6378.0
#define earth_radius_p 6357.0

void main() {

    vec2 uv=pos;
    uv.y=1.0-uv.y;
    //uv.y=uv.y;
    //uv.x+=0.5;
    //if (uv.x>1.0) uv.x-=1.0;

    // Proyección
    if (borra==1.0) {
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
    vec2 latlon1=vec2( atan(topo1.z,length(vec2(topo1.x,topo1.y))), atan(topo1.y,topo1.x));
    uv.y=-latlon1.x/pi+0.5;
    uv.x=latlon1.y/pi2+0.5;
    }
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
    vec3 topoXYZ=vec3(earth_radius_e*cos(lon)*cos_lat, earth_radius_e*sin(lon)*cos_lat,earth_radius_p*sin(lat));
    vec3 topoXYZ_n=normalize(topoXYZ);
    
    vec3 topoSunXYZ=sun_p-topoXYZ;
    float topoSunDist=length(topoSunXYZ);
    float topoSunSize=atan(sun_radius,topoSunDist);
    vec3 topoSunXYZ_n=normalize(topoSunXYZ);
    float topoDotSun=dot(topoXYZ_n,topoSunXYZ_n);
    if (topoDotSun<0.0) topoDotSun=0.0;

    vec3 topoMoonXYZ=moon_p-topoXYZ;
    float topoMoonDist=length(topoMoonXYZ);
    float topoMoonSize=atan(moon_radius,topoMoonDist);
    vec3 topoMoonXYZ_n=normalize(topoMoonXYZ);
    float topoDotMoon=dot(topoXYZ_n,topoMoonXYZ_n);
    if (topoDotMoon<0.0) topoDotMoon=0.0;

    vec4 total=texture2D(tex01,uv);
    if (borra==1.0) {
        total=0.0*texture2D(tex01,uv);
    }

    float crs=length(cross(topoMoonXYZ_n,topoSunXYZ_n));
    float dts=dot(topoMoonXYZ_n,topoSunXYZ_n);
    float SunMoonAngle=atan(crs,dts);

    float occ=1.0-(SunMoonAngle/(topoSunSize+topoMoonSize));
    if (occ<0.0) occ=0.0;
    occ=floor(occ*10.0)/10.0;
    
    if (SunMoonAngle<topoSunSize+topoMoonSize && topoDotSun>0.0 && total.r<1.0 && total.g>=0.0) {
        if (total.g<=occ && total.r<0.99) total=vec4(occ,occ,0.0,1.0);
    }

    if (SunMoonAngle<abs(topoSunSize-topoMoonSize) && topoDotSun>0.0) total=vec4(1.0,0.0,0.0,1.0);

    total=clamp(total,0.0,1.0);
    gl_FragColor = vec4(total.r,total.g,total.b,1.0);
    
}
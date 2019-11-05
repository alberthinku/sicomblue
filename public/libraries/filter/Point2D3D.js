const Point2D = function (x, y) { this.x = x; this.y = y; };
const Point3D = function (x, y, z) { this.x = x; this.y = y; this.z = z; };
const Point3Ds = function (verts) {
    let count = verts.length;
    let point3Ds = [];
    let point;
    for (let index = 0; index < count; index++) {
        point = new Point3D(verts[index].x, verts[index].y, verts[index].z);
        point3Ds.push(point);
    }
    // this.verts = point3Ds;
    return (point3Ds);
};

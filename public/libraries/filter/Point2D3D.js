const Point2D = function (x, y) { this.x = x; this.y = y; };
const Point3D = function (x, y, z) { this.x = x; this.y = y; this.z = z; };
const Point3Ds = function (verts) {
    let count = verts.length;
    let point3Ds = [];
    for (let index = 0; index < count; index++) {
        let point = new Point3D(verts.x, verts.y, verts.z);
        point3Ds.push(point);
    }
    return (point3Ds);
};
